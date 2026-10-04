import { Download, TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminSales() {
  // Mock data
  const monthlySales = [
    { month: 'Jan', revenue: 18500, orders: 52, profit: 5550 },
    { month: 'Feb', revenue: 22300, orders: 67, profit: 6690 },
    { month: 'Mar', revenue: 19800, orders: 58, profit: 5940 },
    { month: 'Apr', revenue: 26100, orders: 78, profit: 7830 },
    { month: 'May', revenue: 38730, orders: 87, profit: 11619 },
  ];

  const categoryData = [
    { name: 'Cakes', value: 45200, percentage: 36 },
    { name: 'Cheesecakes', value: 53789, percentage: 43 },
    { name: 'Filipino Desserts', value: 26441, percentage: 21 },
  ];

  const COLORS = ['#D4A843', '#2C5F4F', '#8B7355'];

  const topSellingProducts = [
    { name: 'BG8 Biscoff Cheesecake', sales: 67, revenue: 30083 },
    { name: 'BG6 Blueberry Cheesecake', sales: 54, revenue: 23706 },
    { name: 'BG9 Chocolate Moist Decadent Cake', sales: 89, revenue: 22161 },
    { name: 'BG2 Jr Chocolate Moist Decadent Cake', sales: 76, revenue: 13604 },
    { name: 'HG1 Halo Halo', sales: 45, revenue: 5805 },
  ];

  const totalRevenue = monthlySales.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = monthlySales.reduce((sum, m) => sum + m.orders, 0);
  const totalProfit = monthlySales.reduce((sum, m) => sum + m.profit, 0);
  const avgOrderValue = Math.round(totalRevenue / totalOrders);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="mb-2">Sales Reports</h1>
          <p className="text-gray-600">View detailed sales analytics and performance metrics</p>
        </div>
        <button className="bg-[#D4A843] hover:bg-[#B8923A] text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-[#2C5F4F]">₱ {totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-2">+12.5% from last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Orders</h3>
          <p className="text-3xl font-bold text-[#2C5F4F]">{totalOrders}</p>
          <p className="text-sm text-blue-600 mt-2">+8.2% from last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Profit</h3>
          <p className="text-3xl font-bold text-[#2C5F4F]">₱ {totalProfit.toLocaleString()}</p>
          <p className="text-sm text-purple-600 mt-2">+10.3% from last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Avg. Order Value</h3>
          <p className="text-3xl font-bold text-[#2C5F4F]">₱ {avgOrderValue}</p>
          <p className="text-sm text-orange-600 mt-2">+4.7% from last period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="mb-6">Revenue & Orders Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySales}>
              <CartesianGrid key="line-grid" strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis key="line-xaxis" dataKey="month" stroke="#6b7280" />
              <YAxis key="line-yaxis" stroke="#6b7280" />
              <Tooltip
                key="line-tooltip"
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #D4A843',
                  borderRadius: '8px',
                }}
              />
              <Line
                key="revenue-line"
                type="monotone"
                dataKey="revenue"
                stroke="#D4A843"
                strokeWidth={3}
                dot={{ fill: '#D4A843', r: 5 }}
              />
              <Line
                key="orders-line"
                type="monotone"
                dataKey="orders"
                stroke="#2C5F4F"
                strokeWidth={3}
                dot={{ fill: '#2C5F4F', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#D4A843]"></div>
              <span className="text-sm text-gray-600">Revenue (₱)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#2C5F4F]"></div>
              <span className="text-sm text-gray-600">Orders</span>
            </div>
          </div>
        </div>

        {/* Category Sales Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="mb-6">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                key="category-pie"
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                key="pie-tooltip"
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #D4A843',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  ></div>
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ₱ {category.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="mb-6">Top Selling Products</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topSellingProducts}>
            <CartesianGrid key="bar-grid" strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis key="bar-xaxis" dataKey="name" stroke="#6b7280" angle={-15} textAnchor="end" height={100} />
            <YAxis key="bar-yaxis" stroke="#6b7280" />
            <Tooltip
              key="bar-tooltip"
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #D4A843',
                borderRadius: '8px',
              }}
            />
            <Bar key="revenue-bar" dataKey="revenue" fill="#D4A843" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
