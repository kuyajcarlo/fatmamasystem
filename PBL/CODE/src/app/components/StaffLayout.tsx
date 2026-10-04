import { useState } from 'react';
import { Outlet, Link, Navigate, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  MessageSquare,
  Archive,
  LogOut,
  Menu,
  X,
  Home,
  Package,
  CircleUserRound,
  Cake,
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import logoImage from '../../imports/Gemini_Generated_Image_p60lg7p60lg7p60l-removebg-preview__1_.png';

export default function StaffLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/account');
  };

  if (!isStaff && !isAdmin) {
    return <Navigate to="/account" replace />;
  }

  const navItems = [
    { path: '/staff',            icon: LayoutDashboard, label: 'Dashboard'        },
    { path: '/staff/orders',     icon: ShoppingCart,    label: 'Orders'           },
    { path: '/staff/inquiries',  icon: MessageSquare,   label: 'Inquiries'        },
    { path: '/staff/products',   icon: Package,         label: 'Manage Products'  },
    { path: '/staff/inventory',  icon: Archive,         label: 'Inventory'        },
    { path: '/staff/designs',    icon: Cake,            label: 'Design Requests'  },
    { path: '/staff/profile',    icon: CircleUserRound, label: 'My Profile'       },
  ];

  const isActive = (path: string) => {
    if (path === '/staff') return location.pathname === '/staff';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-[#1F4437] sticky top-0 z-50 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:text-[#D4A843] transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <img src={logoImage} alt="Fat Mama" className="h-12 w-auto object-contain" />
              <div>
                <h1 className="text-white text-xl font-bold">Staff Panel</h1>
                <p className="text-emerald-300 text-xs">Fat Mama Ph</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/" className="text-white hover:text-[#D4A843] transition-colors flex items-center gap-2">
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Site</span>
              </Link>
              <div className="border-l border-emerald-600 h-6" />
              <Link
                to="/staff/profile"
                className="text-emerald-200 text-sm hidden sm:block hover:text-[#D4A843] transition-colors"
              >
                {user?.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-white hover:text-[#D4A843] transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-[81px] left-0 h-[calc(100vh-81px)]
          bg-white border-r border-gray-200 shadow-lg z-40
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64
        `}>
          {/* Role badge */}
          <div className="mx-4 mt-4 mb-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-700 font-semibold uppercase tracking-wide">
            Staff Access
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-[#2C5F4F] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#2C5F4F]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <div className="px-4 pt-4 border-t mx-4 mt-2">
              <Link
                to="/admin"
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#2C5F4F] transition-colors"
              >
                ← Switch to Admin Panel
              </Link>
            </div>
          )}
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 min-h-[calc(100vh-81px)]">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
