import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const { orders } = useOrders();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Calculate stats from real orders
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + order.finalTotal, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  const stats = {
    totalSales,
    totalOrders,
    totalCustomers: new Set(orders.map(o => o.email)).size, // Unique customers by email
    pendingOrders,
  };

  // Get recent orders (last 6)
  const recentOrders = orders.slice(0, 6).map(order => ({
    id: order.id,
    customer: order.customer,
    items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    total: order.finalTotal,
    status: order.status,
    date: order.date,
  }));

  const topProducts = [
    { name: 'BG9 Chocolate Moist Decadent Cake', sales: 89, revenue: 22161 },
    { name: 'BG8 Biscoff Cheesecake', sales: 67, revenue: 30083 },
    { name: 'BG6 Blueberry Cheesecake', sales: 54, revenue: 23706 },
    { name: 'BG2 Jr Chocolate Moist Decadent Cake', sales: 76, revenue: 13604 },
    { name: 'HG1 Halo Halo', sales: 45, revenue: 5805 },
  ];

  const salesData = [
    { month: 'Jan', sales: 18500, orders: 52 },
    { month: 'Feb', sales: 22300, orders: 67 },
    { month: 'Mar', sales: 19800, orders: 58 },
    { month: 'Apr', sales: 26100, orders: 78 },
    { month: 'May', sales: 38730, orders: 87 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Sales</h3>
            <p className="text-3xl font-bold text-[#2C5F4F]">₱ {stats.totalSales.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-2">+12.5% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Orders</h3>
            <p className="text-3xl font-bold text-[#2C5F4F]">{stats.totalOrders}</p>
            <p className="text-sm text-blue-600 mt-2">+8.2% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Customers</h3>
            <p className="text-3xl font-bold text-[#2C5F4F]">{stats.totalCustomers}</p>
            <p className="text-sm text-purple-600 mt-2">+15.3% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Pending Orders</h3>
            <p className="text-3xl font-bold text-[#2C5F4F]">{stats.pendingOrders}</p>
            <p className="text-sm text-orange-600 mt-2">Requires attention</p>
          </div>
        </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#2C5F4F]" />
            <h2>Sales Overview</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis key="xaxis" dataKey="month" stroke="#6b7280" />
              <YAxis key="yaxis" stroke="#6b7280" />
              <Tooltip
                key="tooltip"
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #D4A843',
                  borderRadius: '8px',
                }}
              />
              <Line
                key="sales-line"
                type="monotone"
                dataKey="sales"
                stroke="#D4A843"
                strokeWidth={3}
                dot={{ fill: '#D4A843', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                key="orders-line"
                type="monotone"
                dataKey="orders"
                stroke="#2C5F4F"
                strokeWidth={3}
                dot={{ fill: '#2C5F4F', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#D4A843]"></div>
              <span className="text-sm text-gray-600">Sales (₱)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#2C5F4F]"></div>
              <span className="text-sm text-gray-600">Orders</span>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2C5F4F]" />
                <h2>Recent Orders</h2>
              </div>
              <Link to="/admin/orders" className="text-[#D4A843] hover:text-[#B8923A] transition-colors text-sm font-medium">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-sm">{order.id}</td>
                      <td className="py-4 px-4 text-sm">{order.customer}</td>
                      <td className="py-4 px-4 text-sm">{order.items}</td>
                      <td className="py-4 px-4 font-medium text-sm">₱ {order.total}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#2C5F4F]" />
              <h2>Top Products</h2>
            </div>

            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="pb-4 border-b last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-[#D4A843]">₱ {product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#D4A843] h-2 rounded-full transition-all"
                      style={{ width: `${(product.sales / 89) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/products" className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#D4A843] hover:bg-[#D4A843]/5 transition-all text-center">
            <Package className="w-6 h-6 mx-auto mb-2 text-[#2C5F4F]" />
            <p className="text-sm font-medium">Manage Products</p>
          </Link>
          <Link to="/admin/orders" className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#D4A843] hover:bg-[#D4A843]/5 transition-all text-center">
            <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-[#2C5F4F]" />
            <p className="text-sm font-medium">View All Orders</p>
          </Link>
          <Link to="/admin/customers" className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#D4A843] hover:bg-[#D4A843]/5 transition-all text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-[#2C5F4F]" />
            <p className="text-sm font-medium">Customer List</p>
          </Link>
          <Link to="/admin/sales" className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#D4A843] hover:bg-[#D4A843]/5 transition-all text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-[#2C5F4F]" />
            <p className="text-sm font-medium">Sales Reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
