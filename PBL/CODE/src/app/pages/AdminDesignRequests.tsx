import { useState } from 'react';
import { useCakeDesign, CakeDesignRequest } from '../context/CakeDesignContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Search, ChevronDown, X } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:  <Clock className="w-3.5 h-3.5" />,
  approved: <CheckCircle className="w-3.5 h-3.5" />,
  rejected: <XCircle className="w-3.5 h-3.5" />,
};

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({
  request,
  onClose,
  onApprove,
  onReject,
}: {
  request: CakeDesignRequest;
  onClose: () => void;
  onApprove: (price: number, note: string) => void;
  onReject: (note: string) => void;
}) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [price, setPrice] = useState(String(request.basePrice));
  const [note, setNote] = useState('');

  const colorName = [
    { name: 'Pink', value: '#FFB6C1' }, { name: 'Blue', value: '#87CEEB' },
    { name: 'Purple', value: '#DDA0DD' }, { name: 'Green', value: '#90EE90' },
    { name: 'Yellow', value: '#FFD700' }, { name: 'Orange', value: '#FFA07A' },
    { name: 'Red', value: '#FF6B6B' }, { name: 'White', value: '#FFFFFF' },
    { name: 'Brown', value: '#D2691E' },
  ].find((c) => c.value === request.color)?.name ?? request.color;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Design Request <span className="text-[#2C5F4F] font-mono">{request.id}</span></h2>
            <p className="text-sm text-gray-500">Submitted by {request.customerName} · {request.submittedAt}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Cake image */}
          {request.imageUrl && (
            <img src={request.imageUrl} alt="Cake design" className="w-full h-56 object-cover rounded-xl" />
          )}

          {/* Details grid */}
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              ['Customer', request.customerName],
              ['Email', request.customerEmail],
              ['Size', request.sizeName],
              ['Layers', `${request.layers} layer${Number(request.layers) > 1 ? 's' : ''}`],
              ['Flavor', request.flavor],
              ['Frosting', request.frosting],
              ['Topper', request.topper === 'other' ? request.otherTopper || 'Custom' : request.topper],
              ['Occasion', request.occasion],
              ['Color', colorName],
              ['Cake Text', request.text || '—'],
              ['Base Price', `₱${request.basePrice.toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label}>
                <span className="text-gray-500 font-medium">{label}: </span>
                <span className="text-gray-800">{value}</span>
              </div>
            ))}
            {request.decorations && (
              <div className="sm:col-span-2">
                <span className="text-gray-500 font-medium">Notes: </span>
                <span className="text-gray-800">{request.decorations}</span>
              </div>
            )}
          </div>

          {/* Color swatch */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Primary Color:</span>
            <span className="w-6 h-6 rounded-full border border-gray-300 inline-block" style={{ backgroundColor: request.color }} />
            <span className="text-gray-700">{colorName}</span>
          </div>

          {/* Already reviewed */}
          {request.status !== 'pending' && (
            <div className={`p-4 rounded-lg border ${request.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-sm font-semibold capitalize mb-1 text-gray-700">
                {request.status === 'approved' ? '✓ Approved' : '✕ Rejected'} by {request.reviewedBy} · {request.reviewedAt}
              </p>
              {request.status === 'approved' && request.approvedPrice !== undefined && (
                <p className="text-sm text-gray-600">Final price set: <strong>₱{request.approvedPrice.toLocaleString()}</strong></p>
              )}
              {request.reviewNote && <p className="text-sm text-gray-600 mt-1">Note: {request.reviewNote}</p>}
            </div>
          )}

          {/* Action picker */}
          {request.status === 'pending' && (
            <div className="space-y-4 border-t pt-5">
              <p className="text-sm font-semibold text-gray-700">Your Decision</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAction('approve')}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    action === 'approve' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => setAction('reject')}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    action === 'reject' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-red-300'
                  }`}
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>

              {action === 'approve' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmed Price (₱)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                      placeholder="e.g. 850"
                    />
                    <p className="text-xs text-gray-400 mt-1">Adjust from base ₱{request.basePrice.toLocaleString()} if needed.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note to Customer (optional)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="e.g. Fondant figurine will be simplified to sugar flowers."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm resize-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const p = Number(price);
                      if (!p || p <= 0) { toast.error('Enter a valid price'); return; }
                      onApprove(p, note);
                    }}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Confirm Approval
                  </button>
                </div>
              )}

              {action === 'reject' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="e.g. The requested design is beyond our current capabilities."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none"
                    />
                  </div>
                  <button
                    onClick={() => onReject(note)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Confirm Rejection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDesignRequests() {
  const { requests, reviewRequest } = useCakeDesign();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CakeDesignRequest | null>(null);

  const filtered = requests.filter((r) => {
    const matchFilter = filter === 'all' || r.status === filter;
    const matchSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerEmail.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  const handleApprove = (id: string, approvedPrice: number, reviewNote: string) => {
    reviewRequest(id, 'approved', { approvedPrice, reviewNote, reviewedBy: user?.name || 'Staff' });
    toast.success('Design approved — customer will be notified');
    setSelected(null);
  };

  const handleReject = (id: string, reviewNote: string) => {
    reviewRequest(id, 'rejected', { reviewNote, reviewedBy: user?.name || 'Staff' });
    toast.success('Design rejected — customer will be notified');
    setSelected(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-1">Cake Design Requests</h1>
        <p className="text-gray-500">Review and approve custom cake designs before customers order</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => {
          const colors: Record<string, string> = {
            all: 'bg-[#2C5F4F] text-white',
            pending: 'bg-yellow-500 text-white',
            approved: 'bg-green-600 text-white',
            rejected: 'bg-red-500 text-white',
          };
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`p-4 rounded-xl transition-all shadow-sm text-left ${
                filter === s ? colors[s] + ' shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <p className="text-2xl font-bold">{counts[s]}</p>
              <p className="text-sm capitalize">{s === 'all' ? 'All Requests' : s}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by request ID, customer name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] text-sm"
          />
        </div>
      </div>

      {/* Request cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm text-center py-14 text-gray-400">
            No design requests found.
          </div>
        ) : (
          filtered.map((req) => (
            <button
              key={req.id}
              onClick={() => setSelected(req)}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left overflow-hidden"
            >
              <div className="flex gap-4 p-4">
                {req.imageUrl && (
                  <img
                    src={req.imageUrl}
                    alt="Cake"
                    className="w-20 h-20 rounded-lg object-cover shrink-0 border border-gray-100"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="font-semibold text-sm font-mono text-gray-500">{req.id}</span>
                      <span className="ml-2 font-medium text-gray-800">{req.customerName}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLES[req.status]}`}>
                      {STATUS_ICONS[req.status]}
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {req.sizeName} · {req.layers}L · {req.flavor} · {req.frosting}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {req.occasion} · Submitted {req.submittedAt} · Base ₱{req.basePrice.toLocaleString()}
                    {req.status === 'approved' && req.approvedPrice !== undefined && (
                      <span className="text-green-600 font-medium"> → Approved ₱{req.approvedPrice.toLocaleString()}</span>
                    )}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-300 self-center shrink-0 -rotate-90" />
              </div>
            </button>
          ))
        )}
      </div>

      {selected && (
        <ReviewModal
          request={selected}
          onClose={() => setSelected(null)}
          onApprove={(price, note) => handleApprove(selected.id, price, note)}
          onReject={(note) => handleReject(selected.id, note)}
        />
      )}
    </div>
  );
}
