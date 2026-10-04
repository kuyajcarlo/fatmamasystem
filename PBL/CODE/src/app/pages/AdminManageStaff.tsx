import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, UserCheck, UserX, Users, X } from 'lucide-react';
import { toast } from 'sonner';

interface StaffAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const STORAGE_KEY = 'mama-co-staff-accounts';

const DEFAULT_STAFF: StaffAccount[] = [
  {
    id: 'STAFF-001',
    name: 'Staff',
    email: 'staff@fatmama.ph',
    password: 'staff123',
    status: 'active',
    createdAt: '2026-01-01',
  },
];

function loadStaff(): StaffAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STAFF;
  }
}

function saveStaff(list: StaffAccount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

interface ModalState {
  name: string;
  email: string;
  password: string;
  errors: { name?: string; email?: string; password?: string };
}

export default function AdminManageStaff() {
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modal, setModal] = useState<ModalState>({ name: '', email: '', password: '', errors: {} });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setStaff(loadStaff());
  }, []);

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = () => {
    setModal({ name: '', email: '', password: '', errors: {} });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const validateModal = () => {
    const errs: ModalState['errors'] = {};
    if (!modal.name.trim()) errs.name = 'Name is required';
    if (!modal.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modal.email.trim())) {
      errs.email = 'Enter a valid email';
    } else if (staff.some((s) => s.email.toLowerCase() === modal.email.trim().toLowerCase())) {
      errs.email = 'Email already in use';
    }
    if (!modal.password) {
      errs.password = 'Password is required';
    } else if (modal.password.length < 6) {
      errs.password = 'Minimum 6 characters';
    }
    return errs;
  };

  const handleAdd = () => {
    const errs = validateModal();
    if (Object.keys(errs).length) {
      setModal((m) => ({ ...m, errors: errs }));
      return;
    }
    const maxNum = staff.reduce((max, s) => {
      const m = s.id.match(/^STAFF-(\d+)$/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);
    const nextId = `STAFF-${String(maxNum + 1).padStart(3, '0')}`;
    const newStaff: StaffAccount = {
      id: nextId,
      name: modal.name.trim(),
      email: modal.email.trim().toLowerCase(),
      password: modal.password,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...staff, newStaff];
    setStaff(updated);
    saveStaff(updated);
    toast.success(`Staff account created for ${newStaff.name}`);
    closeModal();
  };

  const toggleStatus = (id: string) => {
    const updated = staff.map((s) =>
      s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    ) as StaffAccount[];
    setStaff(updated);
    saveStaff(updated);
    const target = updated.find((s) => s.id === id);
    toast.success(`${target?.name} marked as ${target?.status}`);
  };

  const handleDelete = (id: string) => {
    const target = staff.find((s) => s.id === id);
    const updated = staff.filter((s) => s.id !== id);
    setStaff(updated);
    saveStaff(updated);
    setDeleteConfirm(null);
    toast.success(`${target?.name}'s account removed`);
  };

  const activeCount = staff.filter((s) => s.status === 'active').length;
  const inactiveCount = staff.filter((s) => s.status === 'inactive').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-1">Manage Staff</h1>
        <p className="text-gray-500">Add, remove, or manage staff account access</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#2C5F4F]" />
            <p className="text-sm text-gray-500">Total Staff</p>
          </div>
          <p className="text-3xl font-bold text-[#2C5F4F]">{staff.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-5 h-5 text-green-500" />
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <p className="text-3xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <UserX className="w-5 h-5 text-gray-400" />
            <p className="text-sm text-gray-500">Inactive</p>
          </div>
          <p className="text-3xl font-bold text-gray-500">{inactiveCount}</p>
        </div>
      </div>

      {/* Actions bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]"
          />
        </div>
        <button
          onClick={openModal}
          className="bg-[#D4A843] hover:bg-[#B8923A] text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Staff
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Staff ID</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Created</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-mono text-gray-500">{s.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#2C5F4F] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{s.email}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{s.createdAt}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(s.id)}
                        title={s.status === 'active' ? 'Deactivate' : 'Activate'}
                        className={`p-2 rounded-lg transition-colors ${
                          s.status === 'active'
                            ? 'text-yellow-600 hover:bg-yellow-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {s.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(s.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-14">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No staff accounts found</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="text-lg font-bold text-[#2C5F4F]">Add Staff Account</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={modal.name}
                  onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] ${modal.errors.name ? 'border-red-400' : 'border-gray-300'}`}
                />
                {modal.errors.name && <p className="text-red-500 text-xs mt-1">{modal.errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. maria@fatmama.ph"
                  value={modal.email}
                  onChange={(e) => setModal((m) => ({ ...m, email: e.target.value }))}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] ${modal.errors.email ? 'border-red-400' : 'border-gray-300'}`}
                />
                {modal.errors.email && <p className="text-red-500 text-xs mt-1">{modal.errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={modal.password}
                  onChange={(e) => setModal((m) => ({ ...m, password: e.target.value }))}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5F4F] ${modal.errors.password ? 'border-red-400' : 'border-gray-300'}`}
                />
                {modal.errors.password && <p className="text-red-500 text-xs mt-1">{modal.errors.password}</p>}
              </div>
            </div>

            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <button onClick={closeModal} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleAdd} className="px-5 py-2 rounded-lg bg-[#D4A843] hover:bg-[#B8923A] text-white font-medium transition-colors">
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-2">Remove Staff Account?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete <strong>{staff.find((s) => s.id === deleteConfirm)?.name}</strong>'s account. They will no longer be able to log in.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
