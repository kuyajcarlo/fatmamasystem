import { useState } from 'react';
import { Outlet, Link, Navigate, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Users, TrendingUp, Archive, LogOut, Menu, X, Home, UserCog, CircleUserRound, Cake, } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import logoImage from '../../imports/Gemini_Generated_Image_p60lg7p60lg7p60l-removebg-preview__1_.png';
export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/account');
    };
    if (!isAdmin) {
        return <Navigate to="/account" replace/>;
    }
    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/products', icon: Package, label: 'Manage Products' },
        { path: '/admin/orders', icon: ShoppingCart, label: 'Order History' },
        { path: '/admin/customers', icon: Users, label: 'Customer List' },
        { path: '/admin/sales', icon: TrendingUp, label: 'Sales Reports' },
        { path: '/admin/inventory', icon: Archive, label: 'Inventory Tracker' },
        { path: '/admin/staff', icon: UserCog, label: 'Manage Staff' },
        { path: '/admin/designs', icon: Cake, label: 'Design Requests' },
        { path: '/admin/profile', icon: CircleUserRound, label: 'My Profile' },
    ];
    const isActive = (path) => {
        if (path === '/admin')
            return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };
    return (<div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-[#2C5F4F] sticky top-0 z-50 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white hover:text-[#D4A843] transition-colors">
                {sidebarOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
              </button>
              <img src={logoImage} alt="Mama & Co." className="h-12 w-auto object-contain"/>
              <div>
                <h1 className="text-white text-xl font-bold">Admin Panel</h1>
                <p className="text-gray-300 text-xs">Mama & Co.</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <Link to="/" className="text-white hover:text-[#D4A843] transition-colors flex items-center gap-2">
                <Home className="w-5 h-5"/>
                <span className="hidden sm:inline">Back to Site</span>
              </Link>
              <div className="border-l border-gray-400 h-6"></div>
              <Link to="/admin/profile" className="text-white text-sm hidden sm:block hover:text-[#D4A843] transition-colors">
                {user?.name}
              </Link>
              <button onClick={handleLogout} className="text-white hover:text-[#D4A843] transition-colors flex items-center gap-2">
                <LogOut className="w-5 h-5"/>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`
            fixed lg:sticky top-[81px] left-0 h-[calc(100vh-81px)]
            bg-white border-r border-gray-200 shadow-lg z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            w-64
          `}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (<Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${active
                    ? 'bg-[#D4A843] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#2C5F4F]'}
                  `}>
                  <Icon className="w-5 h-5"/>
                  <span className="font-medium">{item.label}</span>
                </Link>);
        })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (<div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>)}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-81px)]">
          <Outlet />
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors/>
    </div>);
}
