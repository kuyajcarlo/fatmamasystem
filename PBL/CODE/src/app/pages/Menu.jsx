import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePrivacy } from '../context/PrivacyContext';
import { useProducts } from '../context/ProductContext';
import { ShoppingCart, X, Plus, Minus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import biscoffPie from '../../imports/image-5.png';
import blueberryCheesecake from '../../imports/image-8.png';
import haloHalo from '../../imports/image-7.png';
import maisConYelo from '../../imports/image-6.png';
const SILOG_CHOICES = [
    {
        title: 'Choice A — Rice',
        options: [
            { label: 'Plain Rice' },
            { label: 'Garlic Rice', addon: 5 },
            { label: 'Soy Garlic Fried Rice', addon: 5 },
        ],
    },
    {
        title: 'Choice B — Egg',
        options: [
            { label: 'Scrambled Egg' },
            { label: 'Sunny Side Up (Malasado)' },
            { label: 'Well Done' },
        ],
    },
];
const IMAGE_MAP = {
    B05: blueberryCheesecake,
    B08: biscoffPie,
    H01: haloHalo,
    H02: maisConYelo,
};
const CATEGORY_META = {
    'All Day Breakfast': { id: 'breakfast', code: '01', order: 0, subtitle: 'Filipino silog favorites served any time of day' },
    'Cakes & Pastries': { id: 'cakes', code: '02', order: 1, subtitle: 'Decadent cakes and creamy cheesecakes for every occasion' },
    'Con Yelo Series': { id: 'con-yelo', code: '03', order: 2, subtitle: 'Refreshing Filipino shaved ice desserts' },
    'Milk Coffee': { id: 'milk-coffee', code: '05', order: 3, subtitle: 'Smooth, creamy coffee blends' },
    'Non Coffee': { id: 'non-coffee', code: '06', order: 4, subtitle: 'Milky, fruity, and matcha drinks' },
    'Soda Pop': { id: 'soda-pop', code: '07', order: 5, subtitle: 'Sparkling fruit soda refreshers' },
    'Side/s': { id: 'sides', code: '08', order: 6, subtitle: 'Crispy bites to complete your meal' },
    'Extra/s': { id: 'extras', code: '09', order: 7, subtitle: 'Add-ons to customize your order' },
    'Beverage': { id: 'beverage', code: '10', order: 8, subtitle: 'Cool lemonades and iced teas' },
    'Other/s': { id: 'others', code: '11', order: 9, subtitle: 'Candles and cake toppers for celebrations' },
    'Dessert': { id: 'dessert', code: '12', order: 10, subtitle: 'Sweet classic Filipino treats' },
};
export default function Menu() {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const { addItem } = useCart();
    const { isLoggedIn } = useAuth();
    const { hasConsented, setShowConsentModal } = usePrivacy();
    const { products } = useProducts();
    const navigate = useNavigate();
    const tabsRef = useRef(null);
    const categories = useMemo(() => {
        const active = products.filter((p) => p.status === 'active');
        return Object.entries(CATEGORY_META)
            .sort((a, b) => a[1].order - b[1].order)
            .map(([title, meta]) => ({
            id: meta.id,
            code: meta.code,
            title,
            subtitle: meta.subtitle,
            items: active
                .filter((p) => p.category === title)
                .map((p) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                price: p.price,
                from: p.from,
                popular: p.popular,
                description: p.description,
                image: IMAGE_MAP[p.code],
                choiceGroups: title === 'All Day Breakfast' ? SILOG_CHOICES : undefined,
            })),
        }))
            .filter((cat) => cat.items.length > 0);
    }, [products]);
    const [activeCategory, setActiveCategory] = useState(() => categories[0]?.id ?? '');
    // Product modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [notes, setNotes] = useState('');
    const [qty, setQty] = useState(1);
    const [selectedChoices, setSelectedChoices] = useState([]);
    useEffect(() => {
        if (category) {
            const match = categories.find((c) => c.id === category);
            if (match)
                setActiveCategory(match.id);
        }
    }, [category]);
    useEffect(() => {
        const container = tabsRef.current;
        if (!container)
            return;
        const activeBtn = container.querySelector('[data-active="true"]');
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [activeCategory]);
    // Lock body scroll when modal open
    useEffect(() => {
        if (selectedProduct) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [selectedProduct]);
    const openProduct = (item) => {
        setSelectedProduct(item);
        setNotes('');
        setQty(1);
        setSelectedChoices((item.choiceGroups || []).map(() => 0));
    };
    const closeProduct = () => setSelectedProduct(null);
    const handleAddToCart = () => {
        if (!hasConsented) {
            setShowConsentModal(true);
            toast.error('Please accept our data privacy policy to place orders');
            return;
        }
        if (!isLoggedIn) {
            toast.error('Please log in to add items to cart', {
                action: { label: 'Log In', onClick: () => navigate('/account?redirect=products') },
            });
            return;
        }
        const item = selectedProduct;
        const addonTotal = (item.choiceGroups || []).reduce((sum, g, gi) => sum + (g.options[selectedChoices[gi] ?? 0]?.addon ?? 0), 0);
        const finalPrice = item.price + addonTotal;
        const choicesSummary = (item.choiceGroups || [])
            .map((g, gi) => `${g.title}: ${g.options[selectedChoices[gi] ?? 0].label}`)
            .join(' | ');
        const fullNotes = [choicesSummary, notes.trim()].filter(Boolean).join('\n');
        const cartId = fullNotes ? `${item.id}-${Date.now()}` : item.id;
        for (let i = 0; i < qty; i++) {
            addItem({ id: cartId, name: item.name, price: finalPrice, image: item.image, notes: fullNotes || undefined });
        }
        toast.success(`${qty > 1 ? `${qty}× ` : ''}${item.name} added to cart!`);
        closeProduct();
    };
    const formatPrice = (item) => `${item.from ? 'from ' : ''}₱ ${item.price % 1 === 0 ? item.price : item.price.toFixed(2)}`;
    const ProductCard = ({ item }) => (<button onClick={() => openProduct(item)} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 flex flex-col text-left w-full group">
      <div className="aspect-[4/3] overflow-hidden relative">
        {item.image ? (<img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>) : (<div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2C5F4F] to-[#1F4437] text-center px-3">
            {item.code && (<span className="text-[#D4A843] text-sm font-semibold tracking-widest mb-1">{item.code}</span>)}
            <span className="text-white text-lg leading-tight">{item.name}</span>
          </div>)}
        {item.popular && (<span className="absolute top-2 left-2 bg-[#D4A843] text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
            Popular
          </span>)}
        {/* hover overlay hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-[#2C5F4F] text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            View Details
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-bold mb-1 leading-snug">
          {item.code ? `${item.code} ` : ''}{item.name}
        </h3>
        {item.description && <p className="text-gray-500 text-xs mb-2 line-clamp-2">{item.description}</p>}
        <p className="text-[#D4A843] font-bold text-lg mt-auto">{formatPrice(item)}</p>
      </div>
    </button>);
    return (<div>
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1643944471768-2d2eac3afb6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)' }}>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl text-white mb-4 font-bold">Our Products</h1>
          <p className="text-white text-xl">Freshly made daily with the finest ingredients</p>
        </div>
      </section>

      {/* Category tab bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={tabsRef} className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {categories.map((cat) => (<button key={cat.id} data-active={activeCategory === cat.id ? 'true' : 'false'} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full border transition-colors ${activeCategory === cat.id
                ? 'bg-[#2C5F4F] text-white border-[#2C5F4F]'
                : 'border-[#2C5F4F]/20 text-[#2C5F4F] hover:bg-[#2C5F4F] hover:text-white'}`}>
                {cat.title}
              </button>))}
          </div>
        </div>
      </div>

      {/* Active category panel */}
      {categories.filter((cat) => cat.id === activeCategory).map((cat) => (<section key={cat.id} className="py-16 bg-gray-50 min-h-[60vh]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <span className="text-[#D4A843] text-sm font-semibold tracking-widest">*{cat.code}</span>
              <h2 className="text-4xl font-bold mb-2 text-[#2C5F4F]">{cat.title}</h2>
              <p className="text-gray-600">{cat.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {cat.items.map((item) => (<ProductCard key={item.id} item={item}/>))}
            </div>
          </div>
        </section>))}

      {/* Product Detail Modal */}
      {selectedProduct && (<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={closeProduct}/>

          {/* Modal */}
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Close button */}
            <button onClick={closeProduct} className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors">
              <X className="w-5 h-5"/>
            </button>

            {/* Image / placeholder */}
            <div className="aspect-[16/9] w-full shrink-0 overflow-hidden">
              {selectedProduct.image ? (<img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2C5F4F] to-[#1F4437] text-center px-6">
                  {selectedProduct.code && (<span className="text-[#D4A843] text-sm font-semibold tracking-widest mb-2">{selectedProduct.code}</span>)}
                  <span className="text-white text-3xl font-bold leading-tight">{selectedProduct.name}</span>
                </div>)}
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 pt-5 pb-2">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-2">
                {selectedProduct.popular && (<span className="bg-[#D4A843] text-white text-xs font-semibold px-2.5 py-1 rounded-full">Popular</span>)}
                {selectedProduct.code && (<span className="bg-gray-100 text-gray-500 text-xs font-mono px-2.5 py-1 rounded-full">{selectedProduct.code}</span>)}
              </div>

              {/* Name & price */}
              <h2 className="text-2xl font-bold text-[#2C5F4F] mb-1 leading-snug">{selectedProduct.name}</h2>
              <p className="text-[#D4A843] text-2xl font-bold mb-3">{formatPrice(selectedProduct)}</p>

              {/* Description */}
              {selectedProduct.description && (<p className="text-gray-600 text-sm mb-4 leading-relaxed">{selectedProduct.description}</p>)}

              {/* Choice groups */}
              {(selectedProduct.choiceGroups || []).map((group, gi) => (<div key={gi} className="mb-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="font-semibold text-gray-800 text-sm">{group.title}</h3>
                    <span className="text-xs text-[#2C5F4F] bg-[#2C5F4F]/10 px-2.5 py-0.5 rounded-full font-medium">Required</span>
                  </div>
                  <div className="space-y-2">
                    {group.options.map((opt, oi) => {
                    const isSelected = (selectedChoices[gi] ?? 0) === oi;
                    return (<button key={oi} type="button" onClick={() => setSelectedChoices((prev) => { const n = [...prev]; n[gi] = oi; return n; })} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-[#2C5F4F] bg-[#2C5F4F]/5' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-[#2C5F4F]' : 'border-gray-300'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-[#2C5F4F]"/>}
                            </div>
                            <span className={`text-sm ${isSelected ? 'text-[#2C5F4F] font-medium' : 'text-gray-700'}`}>{opt.label}</span>
                          </div>
                          {opt.addon
                            ? <span className="text-sm font-semibold text-gray-600">+₱{opt.addon}</span>
                            : <span className="text-xs text-gray-400">Included</span>}
                        </button>);
                })}
                  </div>
                </div>))}

              {/* Allergen / notes */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500"/>
                  <label className="text-sm font-semibold text-gray-700">Special Instructions / Allergen Notes</label>
                </div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="e.g. No eggs, less sugar, nut allergy, extra spicy..." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D4A843] resize-none"/>
                <p className="text-xs text-gray-400 mt-1">
                  Let us know about any allergies or dietary requirements. Our team will do their best to accommodate.
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-semibold text-gray-700">Quantity</span>
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-1.5">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-[#2C5F4F] hover:text-[#1F4437] disabled:opacity-40 transition-colors" disabled={qty <= 1}>
                    <Minus className="w-4 h-4"/>
                  </button>
                  <span className="w-6 text-center font-bold text-[#2C5F4F]">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="text-[#2C5F4F] hover:text-[#1F4437] transition-colors">
                    <Plus className="w-4 h-4"/>
                  </button>
                </div>
                <span className="ml-auto text-sm text-gray-500">
                  Subtotal: <span className="font-bold text-[#2C5F4F]">
                    {(() => {
                const addon = (selectedProduct.choiceGroups || []).reduce((s, g, gi) => s + (g.options[selectedChoices[gi] ?? 0]?.addon ?? 0), 0);
                const total = (selectedProduct.price + addon) * qty;
                return `₱ ${total % 1 === 0 ? total : total.toFixed(2)}`;
            })()}
                  </span>
                </span>
              </div>
            </div>

            {/* Add to Cart — large sticky footer button */}
            <div className="px-6 py-4 border-t bg-white">
              <button onClick={handleAddToCart} className="w-full bg-[#D4A843] hover:bg-[#B8923A] active:bg-[#A07830] text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg">
                <ShoppingCart className="w-6 h-6"/>
                Add to Cart
                {qty > 1 && <span className="opacity-80 font-normal text-base">({qty} items)</span>}
              </button>
            </div>
          </div>
        </div>)}
    </div>);
}
