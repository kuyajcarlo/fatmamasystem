import { useState } from 'react';
import { Sparkles, Upload, RefreshCw, Send, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCakeDesign } from '../context/CakeDesignContext';
const defaultCakeImage = 'https://images.unsplash.com/photo-1613323885373-6e91a09b598b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const cakeSizes = [
    { id: 'small', name: 'Small', inches: '6"', serves: 'Serves 8–10', price: 450, layerPrice: 75 },
    { id: 'medium', name: 'Medium', inches: '8"', serves: 'Serves 12–15', price: 650, layerPrice: 100 },
    { id: 'large', name: 'Large', inches: '10"', serves: 'Serves 20–25', price: 850, layerPrice: 150 },
    { id: 'xl', name: 'XL', inches: '12"', serves: 'Serves 30–35', price: 1100, layerPrice: 200 },
];
// extra cost per additional layer beyond 1, keyed by sizeId
const layerOptions = [
    { value: '1', label: '1 Layer' },
    { value: '2', label: '2 Layers' },
    { value: '3', label: '3 Layers' },
    { value: '4', label: '4 Layers' },
];
const cakeToppers = [
    { id: 'none', name: 'None', description: 'No topper' },
    { id: 'flowers', name: 'Flowers', description: 'Fresh or sugar flowers' },
    { id: 'candles', name: 'Candles', description: 'Classic birthday candles' },
    { id: 'figurines', name: 'Fondant Figurines', description: 'Custom fondant art' },
    { id: 'fruit', name: 'Fresh Fruit', description: 'Seasonal fresh fruit' },
    { id: 'macarons', name: 'Macarons', description: 'Colorful macaron stack' },
    { id: 'gold-leaf', name: 'Gold Leaf', description: 'Luxe edible gold' },
    { id: 'sprinkles', name: 'Sprinkles', description: 'Fun colorful sprinkles' },
    { id: 'other', name: 'Other', description: "Describe your own topper" },
];
const cakeColors = [
    { name: 'Pink', value: '#FFB6C1' },
    { name: 'Blue', value: '#87CEEB' },
    { name: 'Purple', value: '#DDA0DD' },
    { name: 'Green', value: '#90EE90' },
    { name: 'Yellow', value: '#FFD700' },
    { name: 'Orange', value: '#FFA07A' },
    { name: 'Red', value: '#FF6B6B' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Brown', value: '#D2691E' },
];
function calcPrice(sizeId, layers) {
    const size = cakeSizes.find((s) => s.id === sizeId);
    const extraLayers = Math.max(0, parseInt(layers) - 1);
    return size.price + extraLayers * size.layerPrice;
}
export default function Design() {
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();
    const { submitRequest } = useCakeDesign();
    const [submitted, setSubmitted] = useState(false);
    const [cakeImage, setCakeImage] = useState(defaultCakeImage);
    const [isGenerating, setIsGenerating] = useState(false);
    const [customization, setCustomization] = useState({
        text: '',
        sizeId: 'medium',
        flavor: 'Vanilla',
        frosting: 'Buttercream',
        layers: '2',
        topper: 'none',
        otherTopper: '',
        color: '#FFB6C1',
        occasion: 'Birthday',
        decorations: '',
    });
    const selectedSize = cakeSizes.find((s) => s.id === customization.sizeId);
    const totalPrice = calcPrice(customization.sizeId, customization.layers);
    const extraLayers = Math.max(0, parseInt(customization.layers) - 1);
    const layerSurcharge = extraLayers * selectedSize.layerPrice;
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCakeImage(reader.result);
                toast.success('Image uploaded successfully!');
            };
            reader.readAsDataURL(file);
        }
    };
    const generateCake = () => {
        setIsGenerating(true);
        toast.info('Generating your custom cake design...');
        const cakeImages = [
            'https://images.unsplash.com/photo-1613323885373-6e91a09b598b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
            'https://images.unsplash.com/photo-1737700088028-fae0666feb83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
            'https://images.unsplash.com/photo-1613323885553-4b069992362d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
            'https://images.unsplash.com/photo-1655463598992-058bebba5fd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
        ];
        setTimeout(() => {
            setCakeImage(cakeImages[Math.floor(Math.random() * cakeImages.length)]);
            setIsGenerating(false);
            toast.success('Your custom cake design is ready!');
        }, 2000);
    };
    const handleSubmitForApproval = () => {
        if (!isLoggedIn) {
            navigate('/account?redirect=design');
            return;
        }
        const selectedTopper = cakeToppers.find((t) => t.id === customization.topper);
        const topperDisplay = customization.topper === 'other'
            ? customization.otherTopper.trim() || 'Custom Topper'
            : selectedTopper.name;
        submitRequest({
            customerEmail: user.email,
            customerName: user.name,
            sizeId: customization.sizeId,
            sizeName: `${selectedSize.name} ${selectedSize.inches}`,
            layers: customization.layers,
            flavor: customization.flavor,
            frosting: customization.frosting,
            topper: customization.topper,
            otherTopper: customization.otherTopper,
            color: customization.color,
            occasion: customization.occasion,
            text: customization.text,
            decorations: customization.decorations,
            imageUrl: cakeImage,
            basePrice: totalPrice,
        });
        setSubmitted(true);
        toast.success('Design submitted for review! Check your profile for updates.');
    };
    return (<div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#2C5F4F] to-[#1F4437] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-white"/>
          </div>
          <h1 className="text-5xl text-white mb-3 font-bold">AI Cake Designer</h1>
          <p className="text-white text-lg">Create your dream cake with AI-powered customization</p>
        </div>
      </section>

      {/* Main Design Interface */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Guest wall */}
          {!isLoggedIn && (<div className="max-w-md mx-auto text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[#2C5F4F]/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-9 h-9 text-[#2C5F4F]"/>
              </div>
              <h2 className="text-2xl font-bold text-[#2C5F4F] mb-3">Sign in to Design Your Cake</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Create an account or sign in to access our AI Cake Designer and place your custom cake order.
              </p>
              <button onClick={() => navigate('/account?redirect=design')} className="w-full bg-[#D4A843] hover:bg-[#B8923A] text-white py-3 rounded-lg font-semibold text-base transition-colors">
                Sign In / Create Account
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Already browsing?{' '}
                <button onClick={() => navigate(-1)} className="underline hover:text-gray-600">Go back</button>
              </p>
            </div>)}

          {isLoggedIn && (<div className="grid lg:grid-cols-2 gap-8">

            {/* Left — Preview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Preview</h2>

              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img src={cakeImage} alt="Cake Design" className="w-full h-full object-cover"/>
                {customization.text && (<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="text-3xl font-bold px-6 py-3 rounded-lg shadow-lg" style={{
                    color: customization.color === '#FFFFFF' ? '#333' : customization.color,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                }}>
                      {customization.text}
                    </div>
                  </div>)}
              </div>

              <div className="flex gap-2 mb-5">
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
                  <div className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                    <Upload className="w-4 h-4"/>
                    <span className="text-sm">Upload Image</span>
                  </div>
                </label>
                <button onClick={generateCake} disabled={isGenerating} className="flex-1 flex items-center justify-center gap-2 bg-[#D4A843] hover:bg-[#B8923A] disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors">
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`}/>
                  <span className="text-sm">{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
                </button>
              </div>

              {/* Live price breakdown */}
              <div className="bg-[#2C5F4F]/5 border border-[#2C5F4F]/20 rounded-lg p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Price Breakdown</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base — {selectedSize.name} {selectedSize.inches} ({selectedSize.serves})</span>
                  <span className="font-medium">₱{selectedSize.price.toLocaleString()}</span>
                </div>
                {layerSurcharge > 0 && (<div className="flex justify-between text-sm">
                    <span className="text-gray-600">+{extraLayers} extra layer{extraLayers > 1 ? 's' : ''} (₱{selectedSize.layerPrice}/layer)</span>
                    <span className="font-medium">₱{layerSurcharge.toLocaleString()}</span>
                  </div>)}
                <div className="border-t border-[#2C5F4F]/20 pt-2 flex justify-between">
                  <span className="font-semibold text-[#2C5F4F]">Total</span>
                  <span className="font-bold text-[#D4A843]">₱{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right — Options */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <h2 className="text-2xl font-bold">Customize Your Cake</h2>

              {/* Cake Text */}
              <div>
                <label className="block mb-2 font-medium text-sm">Cake Text</label>
                <input type="text" value={customization.text} onChange={(e) => setCustomization({ ...customization, text: e.target.value })} placeholder="Happy Birthday!" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none"/>
              </div>

              {/* Cake Size */}
              <div>
                <label className="block mb-2 font-medium text-sm">Cake Size</label>
                <div className="grid grid-cols-2 gap-3">
                  {cakeSizes.map((size) => (<button key={size.id} onClick={() => setCustomization({ ...customization, sizeId: size.id })} className={`p-3 rounded-lg border-2 text-left transition-all ${customization.sizeId === size.id
                    ? 'border-[#D4A843] bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm">{size.name} {size.inches}</span>
                        <span className={`text-sm font-bold ${customization.sizeId === size.id ? 'text-[#D4A843]' : 'text-[#2C5F4F]'}`}>
                          ₱{size.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{size.serves}</div>
                      <div className="text-xs text-gray-400 mt-0.5">+₱{size.layerPrice}/extra layer</div>
                    </button>))}
                </div>
              </div>

              {/* Layers */}
              <div>
                <label className="block mb-2 font-medium text-sm">
                  Layers
                  <span className="ml-2 font-normal text-gray-500">
                    {extraLayers > 0
                ? `(+₱${layerSurcharge.toLocaleString()} for ${extraLayers} extra layer${extraLayers > 1 ? 's' : ''})`
                : '(1 layer included)'}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {layerOptions.map((opt) => {
                const extra = Math.max(0, parseInt(opt.value) - 1);
                const surcharge = extra * selectedSize.layerPrice;
                return (<button key={opt.value} onClick={() => setCustomization({ ...customization, layers: opt.value })} className={`p-2.5 rounded-lg border-2 text-center transition-all ${customization.layers === opt.value
                        ? 'border-[#D4A843] bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="font-semibold text-sm">{opt.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {surcharge > 0 ? `+₱${surcharge.toLocaleString()}` : 'Included'}
                        </div>
                      </button>);
            })}
                </div>
              </div>

              {/* Flavor and Frosting */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-sm">Flavor</label>
                  <select value={customization.flavor} onChange={(e) => setCustomization({ ...customization, flavor: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none">
                    <option>Vanilla</option>
                    <option>Chocolate</option>
                    <option>Red Velvet</option>
                    <option>Lemon</option>
                    <option>Carrot</option>
                    <option>Strawberry</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-sm">Frosting</label>
                  <select value={customization.frosting} onChange={(e) => setCustomization({ ...customization, frosting: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none">
                    <option>Buttercream</option>
                    <option>Cream Cheese</option>
                    <option>Fondant</option>
                    <option>Whipped Cream</option>
                  </select>
                </div>
              </div>

              {/* Occasion */}
              <div>
                <label className="block mb-2 font-medium text-sm">Occasion</label>
                <select value={customization.occasion} onChange={(e) => setCustomization({ ...customization, occasion: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none">
                  <option>Birthday</option>
                  <option>Wedding</option>
                  <option>Anniversary</option>
                  <option>Baby Shower</option>
                  <option>Graduation</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Cake Toppers */}
              <div>
                <label className="block mb-2 font-medium text-sm">Cake Topper</label>
                <div className="grid grid-cols-2 gap-2">
                  {cakeToppers.map((topper) => (<button key={topper.id} onClick={() => setCustomization({ ...customization, topper: topper.id })} className={`p-3 rounded-lg border-2 text-left transition-all ${customization.topper === topper.id
                    ? 'border-[#D4A843] bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="font-medium text-sm">{topper.name}</div>
                      <div className="text-xs text-gray-500">{topper.description}</div>
                    </button>))}
                </div>

                {customization.topper === 'other' && (<div className="mt-3">
                    <input type="text" value={customization.otherTopper} onChange={(e) => setCustomization({ ...customization, otherTopper: e.target.value })} placeholder="e.g. Butterfly wings, Edible photo, Balloon arch..." className="w-full border border-[#D4A843] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none bg-amber-50" autoFocus/>
                    <p className="text-xs text-gray-500 mt-1">Describe your topper and our team will do their best to accommodate it.</p>
                  </div>)}
              </div>

              {/* Color Picker */}
              <div>
                <label className="block mb-2 font-medium text-sm">Primary Color</label>
                <div className="flex flex-wrap gap-2">
                  {cakeColors.map((color) => (<button key={color.value} onClick={() => setCustomization({ ...customization, color: color.value })} className={`w-10 h-10 rounded-full border-2 transition-all ${customization.color === color.value ? 'border-[#D4A843] scale-110' : 'border-gray-300'}`} style={{ backgroundColor: color.value }} title={color.name}/>))}
                </div>
              </div>

              {/* Decorations */}
              <div>
                <label className="block mb-2 font-medium text-sm">Decorations & Notes</label>
                <textarea value={customization.decorations} onChange={(e) => setCustomization({ ...customization, decorations: e.target.value })} placeholder="Add special details, dedications, or notes..." className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none resize-none"/>
              </div>

              {/* Submit for Approval Button */}
              {submitted ? (<div className="w-full bg-green-50 border border-green-200 rounded-lg py-4 px-5 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 shrink-0"/>
                  <div>
                    <p className="font-semibold text-green-800 text-sm">Design submitted for approval!</p>
                    <p className="text-green-600 text-xs mt-0.5">
                      Check{' '}
                      <button onClick={() => navigate('/profile')} className="underline font-medium">My Profile → Design Requests</button>
                      {' '}for updates.
                    </p>
                  </div>
                </div>) : (<button onClick={handleSubmitForApproval} className="w-full bg-[#D4A843] hover:bg-[#B8923A] text-white py-3 rounded-lg transition-colors font-medium text-lg flex items-center justify-center gap-2">
                  <Send className="w-5 h-5"/>
                  Submit Design for Approval — ₱{totalPrice.toLocaleString()}
                </button>)}
              <p className="text-xs text-gray-400 text-center">
                Our team will review your design and confirm feasibility before you place the order.
              </p>
            </div>
          </div>)}
        </div>
      </section>
    </div>);
}
