import { useOrders } from '../context/OrderContext';
import { useInquiries } from '../context/InquiryContext';
import { ShoppingCart, MessageSquare, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function StaffDashboard() {
    const { orders, updateOrderStatus } = useOrders();
    const { inquiries } = useInquiries();
    const { user } = useAuth();
    const pending = orders.filter((o) => o.status === 'pending');
    const processing = orders.filter((o) => o.status === 'processing');
    const newInquiries = inquiries.filter((i) => i.status === 'new');
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    const statusColor = {
        pending: 'bg-yellow-100 text-yellow-700',
        processing: 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };
    return (<div className="p-6">
      <div className="mb-6">
        <h1 className="mb-1">Welcome, {user?.name}!</h1>
        <p className="text-gray-500">Here's what needs your attention today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-400">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-500"/>
            <p className="text-sm text-gray-500">Pending Orders</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{pending.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-400">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-5 h-5 text-blue-500"/>
            <p className="text-sm text-gray-500">Processing</p>
          </div>
          <p className="text-3xl font-bold text-blue-600">{processing.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-400">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500"/>
            <p className="text-sm text-gray-500">Completed Today</p>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {orders.filter((o) => o.status === 'completed').length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#D4A843]">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-[#D4A843]"/>
            <p className="text-sm text-gray-500">New Inquiries</p>
          </div>
          <p className="text-3xl font-bold text-[#D4A843]">{newInquiries.length}</p>
        </div>
      </div>

      {/* Alert if pending orders */}
      {pending.length > 0 && (<div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-6 text-sm text-yellow-800">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0"/>
          <span>You have <strong>{pending.length}</strong> pending order{pending.length > 1 ? 's' : ''} waiting to be processed.</span>
        </div>)}

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2C5F4F]">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (<div className="text-center py-12 text-gray-400">No orders yet.</div>) : (<table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm">Order ID</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm">Customer</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm">Total</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (<tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-sm font-mono text-gray-600">{order.id}</td>
                  <td className="py-3 px-6 text-sm font-medium">{order.customer}</td>
                  <td className="py-3 px-6 text-sm font-semibold text-[#D4A843]">₱ {order.finalTotal.toLocaleString()}</td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    {order.status === 'pending' && (<button onClick={() => updateOrderStatus(order.id, 'processing')} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                        Mark Processing
                      </button>)}
                    {order.status === 'processing' && (<button onClick={() => updateOrderStatus(order.id, 'completed')} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                        Mark Completed
                      </button>)}
                  </td>
                </tr>))}
            </tbody>
          </table>)}
      </div>
    </div>);
}
