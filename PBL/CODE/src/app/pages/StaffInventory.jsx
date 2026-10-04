import { useState, useEffect } from 'react';
import { Search, Package, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { INITIAL_INVENTORY } from '../../lib/fallbackData';

const STATUS_STYLES = {
    'in-stock': 'text-green-700 bg-green-100',
    'low-stock': 'text-yellow-700 bg-yellow-100',
    'out-of-stock': 'text-red-700 bg-red-100',
};

export default function StaffInventory() {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
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
        } finally {
            setLoading(false);
        }
    };

    const filtered = inventory.filter((item) => {
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase()) ||
            item.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || item.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const lowCount = inventory.filter((i) => i.status === 'low-stock').length;
    const outCount = inventory.filter((i) => i.status === 'out-of-stock').length;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="mb-1 text-2xl font-bold">Inventory</h1>
                    <p className="text-gray-500">View current stock levels — contact admin to make changes</p>
                </div>
                <button onClick={fetchInventory} disabled={loading} className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {outCount > 0 && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-800">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <span><strong>{outCount}</strong> item{outCount > 1 ? 's are' : ' is'} out of stock. Please notify admin.</span>
                </div>
            )}
            {lowCount > 0 && (
                <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4 text-sm text-yellow-800">
                    <TrendingDown className="w-5 h-5 text-yellow-500 shrink-0" />
                    <span><strong>{lowCount}</strong> item{lowCount > 1 ? 's are' : ' is'} running low. Consider restocking soon.</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="w-5 h-5 text-[#2C5F4F]" />
                        <p className="text-sm text-gray-500">Total Items</p>
                    </div>
                    <p className="text-3xl font-bold text-[#2C5F4F]">{loading ? '-' : inventory.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-gray-500">Low Stock</p>
                    </div>
                    <p className="text-3xl font-bold text-yellow-600">{loading ? '-' : lowCount}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <p className="text-sm text-gray-500">Out of Stock</p>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{loading ? '-' : outCount}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-5">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'in-stock', label: 'In Stock' },
                    { key: 'low-stock', label: 'Low Stock' },
                    { key: 'out-of-stock', label: 'Out of Stock' },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilterStatus(f.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === f.key
                            ? 'bg-[#2C5F4F] text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mb-5 border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="py-3 px-6 text-sm font-medium text-gray-500">Item</th>
                                <th className="py-3 px-6 text-sm font-medium text-gray-500">Category</th>
                                <th className="py-3 px-6 text-sm font-medium text-gray-500">Stock Level</th>
                                <th className="py-3 px-6 text-sm font-medium text-gray-500">Min / Max</th>
                                <th className="py-3 px-6 text-sm font-medium text-gray-500">Supplier</th>
                                <th className="py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-gray-500">Loading inventory data from Supabase...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="text-center py-12">
                                            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-400">No items found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => {
                                    const pct = (item.current_stock / item.max_stock) * 100;
                                    const barColor = pct >= 50 ? 'bg-green-500' : pct >= 25 ? 'bg-yellow-500' : 'bg-red-500';
                                    return (
                                        <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <p className="font-medium text-sm">{item.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{item.id.slice(0, 8)}...</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${item.category === 'Ingredients' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 min-w-[140px]">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium">{item.current_stock} {item.unit}</span>
                                                    <span className="text-gray-400 text-xs">{Math.round(pct)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500">
                                                {item.min_stock} / {item.max_stock} {item.unit}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500">{item.supplier || '-'}</td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[item.status]}`}>
                                                    {item.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
