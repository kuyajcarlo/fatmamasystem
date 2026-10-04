import { useState, useEffect } from 'react';
import { Search, AlertTriangle, TrendingDown, Package, Plus, Minus, Trash2, X, RefreshCw } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { supabase } from '../../lib/supabase';
import { INITIAL_INVENTORY } from '../../lib/fallbackData';

const emptyForm = {
    name: '',
    category: 'Ingredients',
    supplier: '',
    unit: '',
    current_stock: '',
    min_stock: '',
    max_stock: '',
};

export default function AdminInventory() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            if (!supabase) {
                // Fallback to local data if Supabase isn't configured
                setInventory(INITIAL_INVENTORY);
                setLoading(false);
                return;
            }
            const { data, error } = await supabase.from('inventory').select('*').order('name');
            if (error) throw error;
            if (data) setInventory(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const determineStatus = (currentStock, minStock) => {
        if (currentStock === 0) return 'out-of-stock';
        if (currentStock < minStock) return 'low-stock';
        return 'in-stock';
    };

    const increaseStock = async (item) => {
        const newStock = Math.min(item.current_stock + 1, item.max_stock);
        if (newStock === item.current_stock) {
            toast.warning(`Cannot exceed max stock of ${item.max_stock} ${item.unit}`);
            return;
        }
        
        const newStatus = determineStatus(newStock, item.min_stock);
        const lastRestocked = new Date().toISOString().split('T')[0];

        try {
            if (!supabase) {
                setInventory(prev => prev.map(i => i.id === item.id ? { ...i, current_stock: newStock, status: newStatus, last_restocked: lastRestocked } : i));
                toast.success(`Added 1 ${item.unit} to ${item.name} (Local mode)`);
                return;
            }
            const { data, error } = await supabase.from('inventory')
                .update({ current_stock: newStock, status: newStatus, last_restocked: lastRestocked })
                .eq('id', item.id)
                .select();
            if (error) throw error;
            if (data && data[0]) {
                setInventory(prev => prev.map(i => i.id === item.id ? data[0] : i));
                toast.success(`Added 1 ${item.unit} to ${item.name}`);
            }
        } catch (error) {
            toast.error('Failed to update stock');
        }
    };

    const decreaseStock = async (item) => {
        const newStock = Math.max(item.current_stock - 1, 0);
        if (newStock === item.current_stock) {
            toast.warning('Stock is already at 0');
            return;
        }

        const newStatus = determineStatus(newStock, item.min_stock);

        try {
            if (!supabase) {
                setInventory(prev => prev.map(i => i.id === item.id ? { ...i, current_stock: newStock, status: newStatus } : i));
                if (newStatus === 'low-stock') toast.warning(`${item.name} is now low on stock! (Local mode)`);
                else if (newStatus === 'out-of-stock') toast.error(`${item.name} is now out of stock! (Local mode)`);
                else toast.info(`Removed 1 ${item.unit} from ${item.name} (Local mode)`);
                return;
            }
            const { data, error } = await supabase.from('inventory')
                .update({ current_stock: newStock, status: newStatus })
                .eq('id', item.id)
                .select();
            if (error) throw error;
            if (data && data[0]) {
                setInventory(prev => prev.map(i => i.id === item.id ? data[0] : i));
                if (newStatus === 'low-stock') toast.warning(`${item.name} is now low on stock!`);
                else if (newStatus === 'out-of-stock') toast.error(`${item.name} is now out of stock!`);
                else toast.info(`Removed 1 ${item.unit} from ${item.name}`);
            }
        } catch (error) {
            toast.error('Failed to update stock');
        }
    };

    const deleteItem = async (id, name) => {
        try {
            if (!supabase) {
                setInventory(prev => prev.filter(i => i.id !== id));
                toast.success(`${name} removed from inventory (Local mode)`);
                return;
            }
            const { error } = await supabase.from('inventory').delete().eq('id', id);
            if (error) throw error;
            setInventory(prev => prev.filter(i => i.id !== id));
            toast.success(`${name} removed from inventory`);
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = 'Item name is required';
        if (!form.supplier.trim()) errors.supplier = 'Supplier is required';
        if (!form.unit.trim()) errors.unit = 'Unit is required';
        if (!form.current_stock || isNaN(Number(form.current_stock)) || Number(form.current_stock) < 0)
            errors.current_stock = 'Enter a valid starting stock';
        if (!form.min_stock || isNaN(Number(form.min_stock)) || Number(form.min_stock) < 0)
            errors.min_stock = 'Enter a valid min stock';
        if (!form.max_stock || isNaN(Number(form.max_stock)) || Number(form.max_stock) <= 0)
            errors.max_stock = 'Enter a valid max stock';
        if (Number(form.min_stock) >= Number(form.max_stock))
            errors.max_stock = 'Max stock must be greater than min stock';
        if (Number(form.current_stock) > Number(form.max_stock))
            errors.current_stock = 'Starting stock cannot exceed max stock';
        return errors;
    };

    const handleAddItem = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length) {
            setFormErrors(errors);
            return;
        }
        
        const current = Number(form.current_stock);
        const min = Number(form.min_stock);
        const max = Number(form.max_stock);
        
        const newItem = {
            id: `INV-${Date.now()}`,
            code: `C-${Date.now().toString().slice(-4)}`,
            name: form.name.trim(),
            category: form.category,
            supplier: form.supplier.trim(),
            unit: form.unit.trim(),
            current_stock: current,
            min_stock: min,
            max_stock: max,
            last_restocked: new Date().toISOString().split('T')[0],
            status: determineStatus(current, min),
        };

        try {
            if (!supabase) {
                // Mock adding locally if not connected
                setInventory(prev => [...prev, newItem]);
                toast.success(`${newItem.name} added to local inventory (Connect Supabase to save permanently)`);
                setShowModal(false);
                setForm(emptyForm);
                setFormErrors({});
                return;
            }
            const { data, error } = await supabase.from('inventory').insert([newItem]).select();
            if (error) throw error;
            if (data && data[0]) {
                setInventory(prev => [...prev, data[0]]);
                toast.success(`${newItem.name} added to inventory`);
                setShowModal(false);
                setForm(emptyForm);
                setFormErrors({});
            }
        } catch (error) {
            toast.error('Failed to add inventory item');
            console.error(error);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setForm(emptyForm);
        setFormErrors({});
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        if (status === 'in-stock') return 'text-green-700 bg-green-100';
        if (status === 'low-stock') return 'text-yellow-700 bg-yellow-100';
        if (status === 'out-of-stock') return 'text-red-700 bg-red-100';
        return 'text-gray-700 bg-gray-100';
    };

    const getStockBarColor = (pct) => {
        if (pct >= 50) return 'bg-green-500';
        if (pct >= 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const statusCounts = {
        all: inventory.length,
        'in-stock': inventory.filter(i => i.status === 'in-stock').length,
        'low-stock': inventory.filter(i => i.status === 'low-stock').length,
        'out-of-stock': inventory.filter(i => i.status === 'out-of-stock').length,
    };

    const field = (id, label, node) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {node}
            {formErrors[id] && <p className="text-red-500 text-xs mt-1">{formErrors[id]}</p>}
        </div>
    );

    const inputCls = (id) => `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] ${formErrors[id] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="mb-1 text-2xl font-bold">Inventory Tracker</h1>
                    <p className="text-gray-600">Monitor and manage your stock levels</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchInventory} disabled={loading} className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#D4A843] hover:bg-[#B8923A] text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        Add Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {[
                    { label: 'Total Items', value: statusCounts.all, color: 'text-[#2C5F4F]', bg: 'bg-blue-100', icon: <Package className="w-6 h-6 text-blue-600" /> },
                    { label: 'In Stock', value: statusCounts['in-stock'], color: 'text-green-600', bg: 'bg-green-100', icon: <Package className="w-6 h-6 text-green-600" /> },
                    { label: 'Low Stock', value: statusCounts['low-stock'], color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <TrendingDown className="w-6 h-6 text-yellow-600" /> },
                    { label: 'Out of Stock', value: statusCounts['out-of-stock'], color: 'text-red-600', bg: 'bg-red-100', icon: <AlertTriangle className="w-6 h-6 text-red-600" /> },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-lg shadow-sm p-6">
                        <div className={`${s.bg} p-3 rounded-lg w-fit mb-2`}>{s.icon}</div>
                        <p className="text-gray-600 text-sm mb-1">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{loading ? '-' : s.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                {[
                    { key: 'all', label: 'All Items', active: 'bg-[#D4A843] text-white shadow-md' },
                    { key: 'in-stock', label: 'In Stock', active: 'bg-green-500 text-white shadow-md' },
                    { key: 'low-stock', label: 'Low Stock', active: 'bg-yellow-500 text-white shadow-md' },
                    { key: 'out-of-stock', label: 'Out of Stock', active: 'bg-red-500 text-white shadow-md' },
                ].map((f) => (
                    <button key={f.key} onClick={() => setFilterStatus(f.key)} className={`px-4 py-2 rounded-lg transition-all ${filterStatus === f.key ? f.active : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Search by name, ID, category, or supplier..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="py-4 px-6 font-medium text-gray-600">Item ID</th>
                                <th className="py-4 px-6 font-medium text-gray-600">Name</th>
                                <th className="py-4 px-6 font-medium text-gray-600">Category</th>
                                <th className="py-4 px-6 font-medium text-gray-600">Stock Level</th>
                                <th className="py-4 px-6 font-medium text-gray-600">Min / Max</th>
                                <th className="py-4 px-6 font-medium text-gray-600">Supplier</th>
                                <th className="py-4 px-6 font-medium text-gray-600">Last Restocked</th>
                                <th className="py-4 px-6 font-medium text-gray-600">Status</th>
                                <th className="py-4 px-6 font-medium text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="py-12 text-center text-gray-500">Loading inventory data from Supabase...</td>
                                </tr>
                            ) : filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="9">
                                        <div className="text-center py-12">
                                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 font-medium">No inventory items found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((item) => {
                                    const pct = (item.current_stock / item.max_stock) * 100;
                                    return (
                                        <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6 font-medium text-sm text-gray-500">{item.id.slice(0, 8)}...</td>
                                            <td className="py-4 px-6 font-medium">{item.name}</td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${item.category === 'Ingredients' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-1.5 min-w-[120px]">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium">{item.current_stock} {item.unit}</span>
                                                        <span className="text-xs text-gray-500">{Math.round(pct)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div className={`h-2 rounded-full transition-all ${getStockBarColor(pct)}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {item.min_stock} / {item.max_stock} {item.unit}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">{item.supplier || '-'}</td>
                                            <td className="py-4 px-6 text-sm text-gray-600">{item.last_restocked || '-'}</td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => increaseStock(item)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title={`Add stock (Max: ${item.max_stock})`}>
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => decreaseStock(item)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Remove stock">
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => deleteItem(item.id, item.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete item">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-xl font-bold text-[#2C5F4F]">Add Inventory Item</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            {field('category', 'Category', (
                                <div className="grid grid-cols-2 gap-3">
                                    {['Ingredients', 'Packaging'].map((cat) => (
                                        <button
                                            key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
                                            className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${form.category === cat ? 'border-[#D4A843] bg-amber-50 text-[#2C5F4F]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            ))}
                            {field('name', 'Item Name *', <input type="text" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormErrors(p => ({ ...p, name: undefined })); }} placeholder={form.category === 'Ingredients' ? 'e.g. All-Purpose Flour' : 'e.g. Cake Box (6 inch)'} className={inputCls('name')} />)}
                            {field('supplier', 'Supplier *', <input type="text" value={form.supplier} onChange={(e) => { setForm({ ...form, supplier: e.target.value }); setFormErrors(p => ({ ...p, supplier: undefined })); }} placeholder="e.g. Baker's Choice" className={inputCls('supplier')} />)}
                            {field('unit', 'Unit *', <input type="text" value={form.unit} onChange={(e) => { setForm({ ...form, unit: e.target.value }); setFormErrors(p => ({ ...p, unit: undefined })); }} placeholder="e.g. kg, pcs, L, sets, boxes" className={inputCls('unit')} />)}

                            <div className="grid grid-cols-3 gap-3">
                                {field('current_stock', 'Starting Stock *', <input type="number" min="0" value={form.current_stock} onChange={(e) => { setForm({ ...form, current_stock: e.target.value }); setFormErrors(p => ({ ...p, current_stock: undefined })); }} placeholder="0" className={inputCls('current_stock')} />)}
                                {field('min_stock', 'Min Stock *', <input type="number" min="0" value={form.min_stock} onChange={(e) => { setForm({ ...form, min_stock: e.target.value }); setFormErrors(p => ({ ...p, min_stock: undefined, max_stock: undefined })); }} placeholder="0" className={inputCls('min_stock')} />)}
                                {field('max_stock', 'Max Stock *', <input type="number" min="1" value={form.max_stock} onChange={(e) => { setForm({ ...form, max_stock: e.target.value }); setFormErrors(p => ({ ...p, max_stock: undefined })); }} placeholder="100" className={inputCls('max_stock')} />)}
                            </div>

                            <p className="text-xs text-gray-400">
                                The item will be flagged as <strong>Low Stock</strong> when current stock drops below the minimum, and <strong>Out of Stock</strong> at zero.
                            </p>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                            <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-300 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm">
                                Cancel
                            </button>
                            <button onClick={handleAddItem} className="flex-1 py-2.5 bg-[#D4A843] hover:bg-[#B8923A] text-white rounded-lg font-medium text-sm transition-colors shadow-sm">
                                Save to Database
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toaster position="top-right" richColors />
        </div>
    );
}
