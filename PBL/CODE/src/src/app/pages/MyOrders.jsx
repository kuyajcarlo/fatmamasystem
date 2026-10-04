import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Package, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
export default function MyOrders() {
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();
    const { orders: allOrders } = useOrders();
    const [expandedOrder, setExpandedOrder] = useState(null);
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/account?redirect=my-orders');
        }
    }, [isLoggedIn, navigate]);
    // Filter orders for current user
    const userOrders = allOrders.filter(order => order.email === user?.email);
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-700 bg-green-100';
            case 'pending':
                return 'text-yellow-700 bg-yellow-100';
            case 'processing':
                return 'text-blue-700 bg-blue-100';
            case 'cancelled':
                return 'text-red-700 bg-red-100';
            default:
                return 'text-gray-700 bg-gray-100';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5"/>;
            case 'pending':
            case 'processing':
                return <Clock className="w-5 h-5"/>;
            case 'cancelled':
                return <XCircle className="w-5 h-5"/>;
            default:
                return null;
        }
    };
    const getStatusMessage = (status) => {
        switch (status) {
            case 'pending':
                return 'Your order has been received and is awaiting confirmation.';
            case 'processing':
                return 'Your order is being prepared for delivery.';
            case 'completed':
                return 'Your order has been delivered. Thank you for your purchase!';
            case 'cancelled':
                return 'This order has been cancelled.';
            default:
                return '';
        }
    };
    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };
    if (!isLoggedIn) {
        return null;
    }
    return (<div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2">My Orders</h1>
          <p className="text-gray-600">Track and view your order history</p>
        </div>

        {userOrders.length === 0 ? (<div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
            <h2 className="text-2xl mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button onClick={() => navigate('/menu')} className="bg-[#D4A843] hover:bg-[#B8923A] text-white px-8 py-3 rounded-md transition-colors">
              Browse Menu
            </button>
          </div>) : (<div className="space-y-4">
            {userOrders.map((order) => (<div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleOrder(order.id)}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#D4A843]/10 p-2 rounded-lg">
                        <Package className="w-6 h-6 text-[#D4A843]"/>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Order {order.id}</h3>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                    </div>
                    {expandedOrder === order.id ? (<ChevronUp className="w-5 h-5 text-gray-400"/>) : (<ChevronDown className="w-5 h-5 text-gray-400"/>)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-xl font-bold text-[#D4A843]">₱ {order.finalTotal}</p>
                    </div>
                  </div>
                </div>

                {/* Order Details (Expandable) */}
                {expandedOrder === order.id && (<div className="border-t bg-gray-50 p-6">
                    {/* Status Message */}
                    <div className="mb-6 p-4 bg-white rounded-lg border-l-4 border-[#D4A843]">
                      <p className="text-sm text-gray-700">{getStatusMessage(order.status)}</p>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (<div key={index} className="flex justify-between items-center bg-white p-4 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-[#D4A843]">₱ {item.price * item.quantity}</p>
                          </div>))}
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Delivery Information</h4>
                      <div className="bg-white p-4 rounded-lg space-y-2 text-sm">
                        <p><strong>Address:</strong> {order.address}</p>
                        <p><strong>City:</strong> {order.city}, {order.province} {order.zipCode}</p>
                        <p><strong>Phone:</strong> {order.phone}</p>
                        {order.notes && (<p><strong>Notes:</strong> {order.notes}</p>)}
                      </div>
                    </div>

                    {/* Payment & Total */}
                    <div className="bg-white p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span>₱ {order.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Fee</span>
                          <span>₱ {order.deliveryFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method</span>
                          <span className="uppercase">{order.paymentMethod}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold text-base">
                          <span>Total</span>
                          <span className="text-[#D4A843]">₱ {order.finalTotal}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Again Button */}
                    <div className="mt-4">
                      <button onClick={() => navigate('/menu')} className="w-full bg-[#D4A843] hover:bg-[#B8923A] text-white py-3 rounded-md transition-colors">
                        Order Again
                      </button>
                    </div>
                  </div>)}
              </div>))}
          </div>)}
      </div>
    </div>);
}
