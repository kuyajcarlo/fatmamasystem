import { useState } from 'react';
import { Search, MessageSquare, ChevronDown } from 'lucide-react';
import { useInquiries, type Inquiry } from '../context/InquiryContext';

const STATUS_STYLES: Record<Inquiry['status'], string> = {
  new:     'bg-amber-100 text-amber-700',
  read:    'bg-blue-100 text-blue-700',
  replied: 'bg-green-100 text-green-700',
  closed:  'bg-gray-100 text-gray-500',
};

export default function StaffInquiries() {
  const { inquiries, updateInquiryStatus } = useInquiries();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = inquiries.filter((inq) =>
    inq.name.toLowerCase().includes(search.toLowerCase()) ||
    inq.email.toLowerCase().includes(search.toLowerCase()) ||
    inq.id.toLowerCase().includes(search.toLowerCase())
  );

  const newCount = inquiries.filter((i) => i.status === 'new').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-1">Customer Inquiries</h1>
        <p className="text-gray-500">
          View and respond to customer messages
          {newCount > 0 && (
            <span className="ml-2 bg-[#D4A843] text-white text-xs font-bold rounded-full px-2 py-0.5">
              {newCount} new
            </span>
          )}
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]"
          />
        </div>
      </div>

      {/* Inquiries */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No inquiries found</p>
          </div>
        ) : (
          filtered.map((inq) => (
            <div key={inq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => {
                  setExpandedId(expandedId === inq.id ? null : inq.id);
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
                    <span className="text-xs text-gray-400 font-mono">{inq.id}</span>
                  </div>
                  <div className="text-sm text-gray-500">{inq.email}{inq.phone ? ` · ${inq.phone}` : ''}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400 hidden sm:block">{inq.date}</span>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[inq.status]}`}>
                    {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === inq.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {expandedId === inq.id && (
                <div className="border-t border-gray-100 px-6 py-5 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Message</p>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed mb-5">{inq.message}</p>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500 mr-1">Mark as:</span>
                    {(['new', 'read', 'replied', 'closed'] as Inquiry['status'][]).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateInquiryStatus(inq.id, s)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors capitalize ${
                          inq.status === s
                            ? STATUS_STYLES[s] + ' ring-2 ring-offset-1 ring-current'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
