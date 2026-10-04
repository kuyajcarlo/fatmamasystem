import { useState } from 'react';
import { Search, AlertTriangle, TrendingDown, Package, Plus, Minus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
const emptyForm = {
    name: '',
    category: 'Ingredients',
    supplier: '',
    unit: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
};
export default function AdminInventory() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});
    const [inventory, setInventory] = useState([
        { id: 'INV-001', name: 'Chocolate Cake Mix', category: 'Ingredients', currentStock: 45, minStock: 20, maxStock: 100, unit: 'kg', lastRestocked: '2026-05-10', supplier: "Baker's Choice", status: 'in-stock' },
        { id: 'INV-002', name: 'Cream Cheese', category: 'Ingredients', currentStock: 12, minStock: 15, maxStock: 50, unit: 'kg', lastRestocked: '2026-05-12', supplier: 'Dairy Fresh', status: 'low-stock' },
        { id: 'INV-003', name: 'Blueberry Filling', category: 'Ingredients', currentStock: 28, minStock: 10, maxStock: 40, unit: 'kg', lastRestocked: '2026-05-14', supplier: 'Fruit Delight Co.', status: 'in-stock' },
        { id: 'INV-004', name: 'Biscoff Cookie Crumbs', category: 'Ingredients', currentStock: 8, minStock: 12, maxStock: 30, unit: 'kg', lastRestocked: '2026-05-08', supplier: 'Cookie Haven', status: 'low-stock' },
        { id: 'INV-005', name: 'Cake Boxes (8 inch)', category: 'Packaging', currentStock: 150, minStock: 50, maxStock: 300, unit: 'pcs', lastRestocked: '2026-05-15', supplier: 'Pack Pro', status: 'in-stock' },
        { id: 'INV-006', name: 'Plastic Spoons', category: 'Packaging', currentStock: 0, minStock: 100, maxStock: 500, unit: 'pcs', lastRestocked: '2026-04-28', supplier: 'Utensil Plus', status: 'out-of-stock' },
        { id: 'INV-007', name: 'Vanilla Extract', category: 'Ingredients', currentStock: 5, minStock: 8, maxStock: 20, unit: 'L', lastRestocked: '2026-05-11', supplier: 'Flavor World', status: 'low-stock' },
        { id: 'INV-008', name: 'Food Coloring Set', category: 'Ingredients', currentStock: 25, minStock: 10, maxStock: 40, unit: 'sets', lastRestocked: '2026-05-13', supplier: 'Color Magic', status: 'in-stock' },
    ]);
    const determineStatus = (currentStock, minStock) => {
        if (currentStock === 0)
            return 'out-of-stock';
        if (currentStock < minStock)
            return 'low-stock';
        return 'in-stock';
    };
    const increaseStock = (id) => {
        setInventory(prev => prev.map(item => {
            if (item.id !== id)
                return item;
            const newStock = Math.min(item.currentStock + 1, item.maxStock);
            if (newStock === item.currentStock) {
                toast.warning(`Cannot exceed max stock of ${item.maxStock} ${item.unit}`);
                return item;
            }
            toast.success(`Added 1 ${item.unit} to ${item.name}`);
            return { ...item, currentStock: newStock, status: determineStatus(newStock, item.minStock), lastRestocked: new Date().toISOString().split('T')[0] };
        }));
    };
    const decreaseStock = (id) => {
        setInventory(prev => prev.map(item => {
            if (item.id !== id)
                return item;
            const newStock = Math.max(item.currentStock - 1, 0);
            if (newStock === item.currentStock) {
                toast.warning('Stock is already at 0');
                return item;
            }
            const newStatus = determineStatus(newStock, item.minStock);
            if (newStatus === 'low-stock')
                toast.warning(`${item.name} is now low on stock!`);
            else if (newStatus === 'out-of-stock')
                toast.error(`${item.name} is now out of stock!`);
            else
                toast.info(`Removed 1 ${item.unit} from ${item.name}`);
            return { ...item, currentStock: newStock, status: newStatus };
        }));
    };
    const deleteItem = (id) => {
        const item = inventory.find(i => i.id === id);
        setInventory(prev => prev.filter(i => i.id !== id));
        toast.success(`${item?.name} removed from inventory`);
    };
    const validateForm = () => {
        const errors = {};
        if (!form.name.trim())
            errors.name = 'Item name is required';
        if (!form.supplier.trim())
            errors.supplier = 'Supplier is required';
        if (!form.unit.trim())
            errors.unit = 'Unit is required';
        if (!form.currentStock || isNaN(Number(form.currentStock)) || Number(form.currentStock) < 0)
            errors.currentStock = 'Enter a valid starting stock';
        if (!form.minStock || isNaN(Number(form.minStock)) || Number(form.minStock) < 0)
            errors.minStock = 'Enter a valid min stock';
        if (!form.maxStock || isNaN(Number(form.maxStock)) || Number(form.maxStock) <= 0)
            errors.maxStock = 'Enter a valid max stock';
        if (Number(form.minStock) >= Number(form.maxStock))
            errors.maxStock = 'Max stock must be greater than min stock';
        if (Number(form.currentStock) > Number(form.maxStock))
            errors.currentStock = 'Starting stock cannot exceed max stock';
        return errors;
    };
    const handleAddItem = () => {
        const errors = validateForm();
        if (Object.keys(errors).length) {
            setFormErrors(errors);
            return;
        }
        const current = Number(form.currentStock);
        const min = Number(form.minStock);
        const max = Number(form.maxStock);
        const newItem = {
            id: `INV-${String(inventory.length + 1).padStart(3, '0')}`,
            name: form.name.trim(),
            category: form.category,
            supplier: form.supplier.trim(),
            unit: form.unit.trim(),
            currentStock: current,
            minStock: min,
            maxStock: max,
            lastRestocked: new Date().toISOString().split('T')[0],
            status: determineStatus(current, min),
        };
        setInventory(prev => [...prev, newItem]);
        toast.success(`${newItem.name} added to inventory`);
        setShowModal(false);
        setForm(emptyForm);
        setFormErrors({});
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
            item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        return matchesSearch && matchesStatus;
    });
    const getStatusColor = (status) => {
        if (status === 'in-stock')
            return 'text-green-700 bg-green-100';
        if (status === 'low-stock')
            return 'text-yellow-700 bg-yellow-100';
        if (status === 'out-of-stock')
            return 'text-red-700 bg-red-100';
        return 'text-gray-700 bg-gray-100';
    };
    const getStockBarColor = (pct) => {
        if (pct >= 50)
            return 'bg-green-500';
        if (pct >= 25)
            return 'bg-yellow-500';
        return 'bg-red-500';
    };
    const statusCounts = {
        all: inventory.length,
        'in-stock': inventory.filter(i => i.status === 'in-stock').length,
        'low-stock': inventory.filter(i => i.status === 'low-stock').length,
        'out-of-stock': inventory.filter(i => i.status === 'out-of-stock').length,
    };
    const field = (id, label, node) => (<div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {node}
      {formErrors[id] && <p className="text-red-500 text-xs mt-1">{formErrors[id]}</p>}
    </div>);
    const inputCls = (id) => `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] ${formErrors[id] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;
    return (<div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-1">Inventory Tracker</h1>
          <p className="text-gray-600">Monitor and manage your stock levels</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#D4A843] hover:bg-[#B8923A] text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4"/>
          Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
            { label: 'Total Items', value: statusCounts.all, color: 'text-[#2C5F4F]', bg: 'bg-blue-100', icon: <Package className="w-6 h-6 text-blue-600"/> },
            { label: 'In Stock', value: statusCounts['in-stock'], color: 'text-green-600', bg: 'bg-green-100', icon: <Package className="w-6 h-6 text-green-600"/> },
            { label: 'Low Stock', value: statusCounts['low-stock'], color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <TrendingDown className="w-6 h-6 text-yellow-600"/> },
            { label: 'Out of Stock', value: statusCounts['out-of-stock'], color: 'text-red-600', bg: 'bg-red-100', icon: <AlertTriangle className="w-6 h-6 text-red-600"/> },
        ].map((s) => (<div key={s.label} className="bg-white rounded-lg shadow-sm p-6">
            <div className={`${s.bg} p-3 rounded-lg w-fit mb-2`}>{s.icon}</div>
            <p className="text-gray-600 text-sm mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
            { key: 'all', label: 'All Items', active: 'bg-[#D4A843] text-white shadow-md' },
            { key: 'in-stock', label: 'In Stock', active: 'bg-green-500 text-white shadow-md' },
            { key: 'low-stock', label: 'Low Stock', active: 'bg-yellow-500 text-white shadow-md' },
            { key: 'out-of-stock', label: 'Out of Stock', active: 'bg-red-500 text-white shadow-md' },
        ].map((f) => (<button key={f.key} onClick={() => setFilterStatus(f.key)} className={`px-4 py-2 rounded-lg transition-all ${filterStatus === f.key ? f.active : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            {f.label}
          </button>))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
          <input type="text" placeholder="Search by name, ID, category, or supplier..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]"/>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Item ID</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Name</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Category</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Stock Level</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Min / Max</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Supplier</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Last Restocked</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => {
            const pct = (item.currentStock / item.maxStock) * 100;
            return (<tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-sm">{item.id}</td>
                    <td className="py-4 px-6 font-medium">{item.name}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${item.category === 'Ingredients' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1.5 min-w-[120px]">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.currentStock} {item.unit}</span>
                          <span className="text-xs text-gray-500">{Math.round(pct)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${getStockBarColor(pct)}`} style={{ width: `${pct}%` }}/>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {item.minStock} / {item.maxStock} {item.unit}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.supplier}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.lastRestocked}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <button onClick={() => increaseStock(item.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title={`Add stock (Max: ${item.maxStock})`}>
                          <Plus className="w-4 h-4"/>
                        </button>
                        <button onClick={() => decreaseStock(item.id)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Remove stock">
                          <Minus className="w-4 h-4"/>
                        </button>
                        <button onClick={() => deleteItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete item">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (<div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-500 font-medium">No inventory items found</p>
          </div>)}
      </div>

      {/* Add Item Modal */}
      {showModal && (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-[#2C5F4F]">Add Inventory Item</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">

              {/* Category */}
              {field('category', 'Category', <div className="grid grid-cols-2 gap-3">
                  {['Ingredients', 'Packaging'].map((cat) => (<button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })} className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${form.category === cat
                        ? 'border-[#D4A843] bg-amber-50 text-[#2C5F4F]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {cat}
                    </button>))}
                </div>)}

              {/* Name */}
              {field('name', 'Item Name *', <input type="text" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormErrors(p => ({ ...p, name: undefined })); }} placeholder={form.category === 'Ingredients' ? 'e.g. All-Purpose Flour' : 'e.g. Cake Box (6 inch)'} className={inputCls('name')}/>)}

              {/* Supplier */}
              {field('supplier', 'Supplier *', <input type="text" value={form.supplier} onChange={(e) => { setForm({ ...form, supplier: e.target.value }); setFormErrors(p => ({ ...p, supplier: undefined })); }} placeholder="e.g. Baker's Choice" className={inputCls('supplier')}/>)}

              {/* Unit */}
              {field('unit', 'Unit *', <input type="text" value={form.unit} onChange={(e) => { setForm({ ...form, unit: e.target.value }); setFormErrors(p => ({ ...p, unit: undefined })); }} placeholder="e.g. kg, pcs, L, sets, boxes" className={inputCls('unit')}/>)}

              {/* Stock numbers */}
              <div className="grid grid-cols-3 gap-3">
                {field('currentStock', 'Starting Stock *', <input type="number" min="0" value={form.currentStock} onChange={(e) => { setForm({ ...form, currentStock: e.target.value }); setFormErrors(p => ({ ...p, currentStock: undefined })); }} placeholder="0" className={inputCls('currentStock')}/>)}
                {field('minStock', 'Min Stock *', <input type="number" min="0" value={form.minStock} onChange={(e) => { setForm({ ...form, minStock: e.target.value }); setFormErrors(p => ({ ...p, minStock: undefined, maxStock: undefined })); }} placeholder="0" className={inputCls('minStock')}/>)}
                {field('maxStock', 'Max Stock *', <input type="number" min="1" value={form.maxStock} onChange={(e) => { setForm({ ...form, maxStock: e.target.value }); setFormErrors(p => ({ ...p, maxStock: undefined })); }} placeholder="100" className={inputCls('maxStock')}/>)}
              </div>

              <p className="text-xs text-gray-400">
                The item will be flagged as <strong>Low Stock</strong> when current stock drops below the minimum, and <strong>Out of Stock</strong> at zero.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4 border-t">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm">
                Cancel
              </button>
              <button onClick={handleAddItem} className="flex-1 py-2.5 bg-[#D4A843] hover:bg-[#B8923A] text-white rounded-lg font-medium text-sm transition-colors">
                Add Item
              </button>
            </div>
          </div>
        </div>)}

      <Toaster position="top-right" richColors/>
    </div>);
}
