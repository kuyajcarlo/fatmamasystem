import { useState, useMemo, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, ShoppingBag, MessageSquare, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useOrders } from '../context/OrderContext';
import { useInquiries, type Inquiry } from '../context/InquiryContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  status: 'active' | 'inactive';
}

const STATUS_STYLES: Record<Inquiry['status'], string> = {
  new:     'bg-amber-100 text-amber-700',
  read:    'bg-blue-100 text-blue-700',
  replied: 'bg-green-100 text-green-700',
  closed:  'bg-gray-100 text-gray-500',
};

export default function AdminCustomers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'customers' | 'inquiries'>(
    searchParams.get('tab') === 'inquiries' ? 'inquiries' : 'customers'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInquiry, setExpandedInquiry] = useState<string | null>(null);
  const { orders } = useOrders();
  const { inquiries, updateInquiryStatus } = useInquiries();

  // Sync tab state when URL param changes (e.g. sidebar link click)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'inquiries') setActiveTab('inquiries');
    else if (tabParam === 'customers') setActiveTab('customers');
  }, [searchParams]);

  // Generate customer data from orders
  const customers: Customer[] = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      if (!customerMap.has(order.email)) {
        customerMap.set(order.email, {
          id: `CUST-${customerMap.size + 1}`.padStart(8, '0'),
          name: order.customer,
          email: order.email,
          phone: order.phone,
          location: order.city,
          totalOrders: 0,
          totalSpent: 0,
          joinDate: order.date.split(' ')[0],
          status: 'active',
        });
      }

      const customer = customerMap.get(order.email)!;
      customer.totalOrders += 1;
      customer.totalSpent += order.finalTotal;
    });

    return Array.from(customerMap.values());
  }, [orders]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const filteredInquiries = inquiries.filter(inq =>
    inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inq.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const newInquiryCount = inquiries.filter(i => i.status === 'new').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2">Customer List</h1>
        <p className="text-gray-600">Manage and view customer information</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm mb-2">Total Customers</p>
          <p className="text-3xl font-bold text-[#2C5F4F]">{customers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm mb-2">Active Customers</p>
          <p className="text-3xl font-bold text-green-600">
            {customers.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-blue-600">
            {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-[#D4A843]">
            ₱ {customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('customers'); setSearchQuery(''); setSearchParams({}); }}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'customers'
              ? 'bg-white border border-b-white border-gray-200 text-[#2C5F4F] -mb-px'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Customers
        </button>
        <button
          onClick={() => { setActiveTab('inquiries'); setSearchQuery(''); setSearchParams({ tab: 'inquiries' }); }}
          className={`relative px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'bg-white border border-b-white border-gray-200 text-[#2C5F4F] -mb-px'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Inquiries
          {newInquiryCount > 0 && (
            <span className="bg-[#D4A843] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {newInquiryCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={
              activeTab === 'customers'
                ? 'Search customers by name, email, phone, or ID...'
                : 'Search inquiries by name, email, or ID...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]"
          />
        </div>
      </div>

      {/* Customers Table */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Customer ID</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Name</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Contact</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Location</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Orders</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Total Spent</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Join Date</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-sm">{customer.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4A843] text-white flex items-center justify-center font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {customer.location}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{customer.totalOrders}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-[#D4A843]">
                      ₱ {customer.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{customer.joinDate}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No customers found</p>
            </div>
          )}
        </div>
      )}

      {/* Inquiries Section */}
      {activeTab === 'inquiries' && (
        <div className="space-y-3">
          {filteredInquiries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm text-center py-16">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No inquiries yet</p>
              <p className="text-gray-400 text-sm mt-1">Customer inquiries will appear here once submitted.</p>
            </div>
          ) : (
            filteredInquiries.map((inq) => (
              <div key={inq.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Inquiry header row */}
                <button
                  onClick={() => {
                    setExpandedInquiry(expandedInquiry === inq.id ? null : inq.id);
                    if (inq.status === 'new') updateInquiryStatus(inq.id, 'read');
                  }}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#2C5F4F] text-white flex items-center justify-center font-bold shrink-0">
                    {inq.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{inq.name}</span>
                      <span className="text-gray-400 text-xs font-mono">{inq.id}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm text-gray-500">{inq.email}</span>
                      {inq.phone && (
                        <span className="text-sm text-gray-400">{inq.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:block">{inq.date}</span>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[inq.status]}`}>
                      {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${expandedInquiry === inq.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Expanded message + actions */}
                {expandedInquiry === inq.id && (
                  <div className="border-t border-gray-100 px-6 py-5 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Message</p>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{inq.message}</p>

                    <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-500 mr-2">Mark as:</span>
                      {(['new', 'read', 'replied', 'closed'] as Inquiry['status'][]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateInquiryStatus(inq.id, s)}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                            inq.status === s
                              ? STATUS_STYLES[s] + ' ring-2 ring-offset-1 ring-current'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
