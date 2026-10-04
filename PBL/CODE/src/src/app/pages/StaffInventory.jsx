import { useState } from 'react';
import { Search, Package, TrendingDown, AlertTriangle } from 'lucide-react';
const defaultInventory = [
    { id: 'INV-001', name: 'Chocolate Cake Mix', category: 'Ingredients', currentStock: 45, minStock: 20, maxStock: 100, unit: 'kg', lastRestocked: '2026-05-10', supplier: "Baker's Choice", status: 'in-stock' },
    { id: 'INV-002', name: 'Cream Cheese', category: 'Ingredients', currentStock: 12, minStock: 15, maxStock: 50, unit: 'kg', lastRestocked: '2026-05-12', supplier: 'Dairy Fresh', status: 'low-stock' },
    { id: 'INV-003', name: 'Blueberry Filling', category: 'Ingredients', currentStock: 28, minStock: 10, maxStock: 40, unit: 'kg', lastRestocked: '2026-05-14', supplier: 'Fruit Delight Co.', status: 'in-stock' },
    { id: 'INV-004', name: 'Biscoff Cookie Crumbs', category: 'Ingredients', currentStock: 8, minStock: 12, maxStock: 30, unit: 'kg', lastRestocked: '2026-05-08', supplier: 'Cookie Haven', status: 'low-stock' },
    { id: 'INV-005', name: 'Cake Boxes (8 inch)', category: 'Packaging', currentStock: 150, minStock: 50, maxStock: 300, unit: 'pcs', lastRestocked: '2026-05-15', supplier: 'Pack Pro', status: 'in-stock' },
    { id: 'INV-006', name: 'Plastic Spoons', category: 'Packaging', currentStock: 0, minStock: 100, maxStock: 500, unit: 'pcs', lastRestocked: '2026-04-28', supplier: 'Utensil Plus', status: 'out-of-stock' },
    { id: 'INV-007', name: 'Vanilla Extract', category: 'Ingredients', currentStock: 5, minStock: 8, maxStock: 20, unit: 'L', lastRestocked: '2026-05-11', supplier: 'Flavor World', status: 'low-stock' },
    { id: 'INV-008', name: 'Food Coloring Set', category: 'Ingredients', currentStock: 25, minStock: 10, maxStock: 40, unit: 'sets', lastRestocked: '2026-05-13', supplier: 'Color Magic', status: 'in-stock' },
];
const STATUS_STYLES = {
    'in-stock': 'text-green-700 bg-green-100',
    'low-stock': 'text-yellow-700 bg-yellow-100',
    'out-of-stock': 'text-red-700 bg-red-100',
};
export default function StaffInventory() {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const filtered = defaultInventory.filter((item) => {
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase()) ||
            item.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || item.status === filterStatus;
        return matchSearch && matchStatus;
    });
    const lowCount = defaultInventory.filter((i) => i.status === 'low-stock').length;
    const outCount = defaultInventory.filter((i) => i.status === 'out-of-stock').length;
    return (<div className="p-6">
      <div className="mb-6">
        <h1 className="mb-1">Inventory</h1>
        <p className="text-gray-500">View current stock levels — contact admin to make changes</p>
      </div>

      {/* Alert banners */}
      {outCount > 0 && (<div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0"/>
          <span><strong>{outCount}</strong> item{outCount > 1 ? 's are' : ' is'} out of stock. Please notify admin.</span>
        </div>)}
      {lowCount > 0 && (<div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4 text-sm text-yellow-800">
          <TrendingDown className="w-5 h-5 text-yellow-500 shrink-0"/>
          <span><strong>{lowCount}</strong> item{lowCount > 1 ? 's are' : ' is'} running low. Consider restocking soon.</span>
        </div>)}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-[#2C5F4F]"/>
            <p className="text-sm text-gray-500">Total Items</p>
          </div>
          <p className="text-3xl font-bold text-[#2C5F4F]">{defaultInventory.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-5 h-5 text-yellow-500"/>
            <p className="text-sm text-gray-500">Low Stock</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{lowCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-500"/>
            <p className="text-sm text-gray-500">Out of Stock</p>
          </div>
          <p className="text-3xl font-bold text-red-600">{outCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
            { key: 'all', label: 'All' },
            { key: 'in-stock', label: 'In Stock' },
            { key: 'low-stock', label: 'Low Stock' },
            { key: 'out-of-stock', label: 'Out of Stock' },
        ].map((f) => (<button key={f.key} onClick={() => setFilterStatus(f.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === f.key
                ? 'bg-[#2C5F4F] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {f.label}
          </button>))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
          <input type="text" placeholder="Search by name, ID, or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]"/>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Item</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Stock Level</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Min / Max</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Supplier</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
            const pct = (item.currentStock / item.maxStock) * 100;
            const barColor = pct >= 50 ? 'bg-green-500' : pct >= 25 ? 'bg-yellow-500' : 'bg-red-500';
            return (<tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{item.id}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${item.category === 'Ingredients' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 min-w-[140px]">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.currentStock} {item.unit}</span>
                        <span className="text-gray-400 text-xs">{Math.round(pct)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }}/>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {item.minStock} / {item.maxStock} {item.unit}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{item.supplier}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[item.status]}`}>
                        {item.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (<div className="text-center py-12">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-400">No items found</p>
          </div>)}
      </div>
    </div>);
}
