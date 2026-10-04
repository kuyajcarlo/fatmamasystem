import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { toast } from 'sonner';
const CATEGORIES = [
    'All Day Breakfast', 'Cakes & Pastries', 'Con Yelo Series', 'Milk Coffee',
    'Non Coffee', 'Soda Pop', 'Side/s', 'Extra/s', 'Beverage', 'Other/s', 'Dessert',
];
const EMPTY_FORM = {
    code: '', name: '', category: CATEGORIES[0], price: '', description: '', popular: false, from: false,
};
// ── Standalone field — defined outside the page so it never remounts on re-render ──
function FormField({ label, field, type = 'text', placeholder, form, setForm, errors, }) {
    return (<div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} placeholder={placeholder} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] text-sm ${errors[field] ? 'border-red-400' : 'border-gray-300'}`}/>
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>);
}
// ── Standalone modal — same reason ──
function ProductModal({ title, form, setForm, errors, isEdit, onClose, onSave, }) {
    const fieldProps = { form, setForm, errors };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Product Code" field="code" placeholder="e.g. A01" {...fieldProps}/>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] text-sm">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <FormField label="Product Name" field="name" placeholder="e.g. Tapsilog" {...fieldProps}/>
          <FormField label="Price (₱)" field="price" type="number" placeholder="e.g. 179" {...fieldProps}/>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Short description..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] text-sm resize-none"/>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.popular} onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))} className="rounded"/>
              Mark as Popular
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.checked }))} className="rounded"/>
              "From" price
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onSave} className="flex-1 py-2.5 bg-[#D4A843] hover:bg-[#B8923A] text-white rounded-lg text-sm font-medium transition-colors">
            {isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>);
}
// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminProducts() {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const filtered = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const validate = () => {
        const e = {};
        if (!form.name.trim())
            e.name = 'Name is required';
        if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
            e.price = 'Enter a valid price';
        setErrors(e);
        return Object.keys(e).length === 0;
    };
    const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setShowAdd(true); };
    const openEdit = (p) => {
        setForm({
            code: p.code, name: p.name, category: p.category,
            price: String(p.price), description: p.description || '',
            popular: !!p.popular, from: !!p.from,
        });
        setErrors({});
        setEditTarget(p);
    };
    const handleSave = () => {
        if (!validate())
            return;
        if (editTarget) {
            updateProduct(editTarget.id, {
                code: form.code.trim(), name: form.name.trim(), category: form.category,
                price: Number(form.price), description: form.description.trim() || undefined,
                popular: form.popular || undefined, from: form.from || undefined,
            });
            toast.success('Product updated');
            setEditTarget(null);
        }
        else {
            addProduct({
                code: form.code.trim(), name: form.name.trim(), category: form.category,
                price: Number(form.price), status: 'active',
                description: form.description.trim() || undefined,
                popular: form.popular || undefined, from: form.from || undefined,
            });
            toast.success('Product added');
            setShowAdd(false);
        }
    };
    const handleDelete = () => {
        if (!deleteTarget)
            return;
        deleteProduct(deleteTarget.id);
        toast.success(`"${deleteTarget.name}" deleted`);
        setDeleteTarget(null);
    };
    const toggleStatus = (p) => {
        updateProduct(p.id, { status: p.status === 'active' ? 'inactive' : 'active' });
        toast.success(`${p.name} marked ${p.status === 'active' ? 'inactive' : 'active'}`);
    };
    const modalProps = { form, setForm, errors, onClose: editTarget ? () => setEditTarget(null) : () => setShowAdd(false), onSave: handleSave };
    return (<div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2">Manage Products</h1>
        <p className="text-gray-600">Changes here reflect immediately on the products page</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <p className="text-gray-500 text-sm mb-1">Total Products</p>
          <p className="text-3xl font-bold text-[#2C5F4F]">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <p className="text-gray-500 text-sm mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">{products.filter((p) => p.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <p className="text-gray-500 text-sm mb-1">Inactive</p>
          <p className="text-3xl font-bold text-gray-400">{products.filter((p) => p.status === 'inactive').length}</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
          <input type="text" placeholder="Search by name, code, or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] text-sm"/>
        </div>
        <button onClick={openAdd} className="bg-[#D4A843] hover:bg-[#B8923A] text-white px-5 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
          <Plus className="w-4 h-4"/> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-5 text-sm font-medium text-gray-600">Code</th>
                <th className="text-left py-3 px-5 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-5 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-5 text-sm font-medium text-gray-600">Price</th>
                <th className="text-left py-3 px-5 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-5 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (<tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-5 text-sm font-mono text-gray-500">{p.code || '—'}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-gray-100 p-1.5 rounded-lg">
                        <Package className="w-4 h-4 text-[#2C5F4F]"/>
                      </div>
                      <div>
                        <p className="font-medium text-sm leading-tight">{p.name}</p>
                        {p.popular && <span className="text-xs text-[#D4A843] font-medium">Popular</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-sm text-gray-600">{p.category}</td>
                  <td className="py-3 px-5 text-sm font-semibold text-[#D4A843]">₱ {p.price}</td>
                  <td className="py-3 px-5">
                    <button onClick={() => toggleStatus(p)} className={`inline-flex px-3 py-1 rounded-full text-xs font-medium transition-colors ${p.status === 'active'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {p.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4"/>
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (<div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-500">No products found</p>
          </div>)}
      </div>

      {/* Add / Edit Modal */}
      {(showAdd || editTarget) && (<ProductModal title={editTarget ? 'Edit Product' : 'Add New Product'} isEdit={!!editTarget} {...modalProps}/>)}

      {/* Delete Confirm */}
      {deleteTarget && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)}/>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600"/>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Product?</h2>
            <p className="text-gray-500 text-sm mb-6">
              "<span className="font-medium text-gray-700">{deleteTarget.name}</span>" will be removed from the menu permanently.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>)}
    </div>);
}
