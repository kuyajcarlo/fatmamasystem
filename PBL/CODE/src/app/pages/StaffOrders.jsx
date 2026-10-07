import { useState } from 'react';
import { Search, ChevronDown, Trash2 } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { toast } from 'sonner';
const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'cancelled'];
const STATUS_STYLES = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};
export default function StaffOrders() {
    const { orders, updateOrderStatus, removeOrder } = useOrders();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const filtered = orders.filter((o) => {
        const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.customer.toLowerCase().includes(search.toLowerCase()) ||
            o.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });
    const handleStatus = (id, status) => {
        updateOrderStatus(id, status);
        toast.success(`Order ${id} marked as ${status}`);
    };
    return (<div className="p-6">
      <div className="mb-6">
        <h1 className="mb-1">Order Management</h1>
        <p className="text-gray-500">View and update order statuses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {['all', ...STATUS_OPTIONS].map((s) => (<button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filterStatus === s
                ? 'bg-[#2C5F4F] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {s === 'all' ? 'All Orders' : s}
          </button>))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
          <input type="text" placeholder="Search by order ID, customer name, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]"/>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (<div className="bg-white rounded-lg shadow-sm text-center py-14 text-gray-400">
            No orders found.
          </div>) : (filtered.map((order) => (<div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header row */}
              <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 font-mono text-sm">{order.id}</span>
                    <span className="font-medium text-gray-700">{order.customer}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{order.date} · {order.paymentMethod.toUpperCase()}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-[#D4A843]">₱ {order.finalTotal.toLocaleString()}</span>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`}/>
                </div>
              </button>

              {/* Expanded detail */}
              {expandedId === order.id && (<div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                  <div className="grid sm:grid-cols-2 gap-6 mb-5">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Delivery Info</p>
                      <p className="text-sm text-gray-700">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                      <p className="text-sm text-gray-500">{order.phone}</p>
                      <p className="text-sm text-gray-500 mt-1">{order.address}, {order.city}, {order.province} {order.zipCode}</p>
                      {order.notes && <p className="text-sm text-gray-500 mt-1 italic">Note: {order.notes}</p>}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items Ordered</p>
                      <ul className="space-y-1">
                        {order.items.map((item) => (<li key={item.id} className="text-sm text-gray-700 flex justify-between">
                            <span>{item.name} ×{item.quantity}</span>
                            <span className="text-gray-500">₱{item.price * item.quantity}</span>
                          </li>))}
                      </ul>
                      <div className="border-t mt-2 pt-2 flex justify-between text-sm font-semibold">
                        <span>Total</span>
                        <span className="text-[#D4A843]">₱ {order.finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status update */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-600 mr-1">Update status:</span>
                    {STATUS_OPTIONS.map((s) => (<button key={s} onClick={() => handleStatus(order.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${order.status === s
                        ? STATUS_STYLES[s] + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                        {s}
                      </button>))}
                    {(order.status === 'completed' || order.status === 'cancelled') && (<button onClick={() => {
                        removeOrder(order.id);
                        toast.success(`Order ${order.id} removed`);
                    }} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors">
                        <Trash2 className="w-3.5 h-3.5"/>
                        Remove Order
                      </button>)}
                  </div>
                </div>)}
            </div>)))}
      </div>

    </div>);
}
