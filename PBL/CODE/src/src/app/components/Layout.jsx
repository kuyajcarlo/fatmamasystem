import { useState, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router';
import { ShoppingCart, User, Menu, X, ChevronDown, LogIn, UserPlus, LogOut, LayoutDashboard, Package, CircleUserRound } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartModal from './CartModal';
import Chatbot from './Chatbot';
import PrivacyConsentModal from './PrivacyConsentModal';
import CookieBanner from './CookieBanner';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import logoImage from '../../imports/Gemini_Generated_Image_p60lg7p60lg7p60l-removebg-preview__1_.png';
export default function Layout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
    const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const { totalItems } = useCart();
    const { isLoggedIn, user, logout, isAdmin, isStaff } = useAuth();
    const navigate = useNavigate();
    const menuTimeoutRef = useRef(null);
    const aboutTimeoutRef = useRef(null);
    const userTimeoutRef = useRef(null);
    const handleMenuEnter = () => {
        if (menuTimeoutRef.current) {
            clearTimeout(menuTimeoutRef.current);
        }
        setMenuDropdownOpen(true);
    };
    const handleMenuLeave = () => {
        menuTimeoutRef.current = setTimeout(() => {
            setMenuDropdownOpen(false);
        }, 50);
    };
    const handleAboutEnter = () => {
        if (aboutTimeoutRef.current) {
            clearTimeout(aboutTimeoutRef.current);
        }
        setAboutDropdownOpen(true);
    };
    const handleAboutLeave = () => {
        aboutTimeoutRef.current = setTimeout(() => {
            setAboutDropdownOpen(false);
        }, 50);
    };
    const handleUserEnter = () => {
        if (userTimeoutRef.current) {
            clearTimeout(userTimeoutRef.current);
        }
        setUserDropdownOpen(true);
    };
    const handleUserLeave = () => {
        userTimeoutRef.current = setTimeout(() => {
            setUserDropdownOpen(false);
        }, 50);
    };
    const handleLogout = () => {
        logout();
        setUserDropdownOpen(false);
        toast.success('Logged out successfully');
        navigate('/');
    };
    return (<div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#2C5F4F] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src={logoImage} alt="Mama & Co." className="h-20 w-auto object-contain"/>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-white hover:text-[#D4A843] transition-colors">
                Home
              </Link>

              {/* Products Dropdown */}
              <div className="relative" onMouseEnter={handleMenuEnter} onMouseLeave={handleMenuLeave}>
                <Link to="/products" className="text-white hover:text-[#D4A843] transition-colors flex items-center gap-1">
                  Products
                  <ChevronDown className="w-4 h-4"/>
                </Link>

                {menuDropdownOpen && (<div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md py-2 min-w-[220px] max-h-[70vh] overflow-y-auto border-2 border-[#D4A843]">
                    {[
                { slug: 'breakfast', label: 'All Day Breakfast' },
                { slug: 'cakes', label: 'Cakes & Pastries' },
                { slug: 'con-yelo', label: 'Con Yelo Series' },
                { slug: 'milk-coffee', label: 'Milk Coffee' },
                { slug: 'non-coffee', label: 'Non Coffee' },
                { slug: 'soda-pop', label: 'Soda Pop' },
                { slug: 'sides', label: 'Side/s' },
                { slug: 'extras', label: 'Extra/s' },
                { slug: 'beverage', label: 'Beverage' },
                { slug: 'others', label: 'Other/s' },
                { slug: 'dessert', label: 'Dessert' },
            ].map((cat) => (<Link key={cat.slug} to={`/products?category=${cat.slug}`} className="block px-4 py-2 text-[#2C5F4F] hover:bg-emerald-50 hover:text-[#D4A843] transition-colors">
                        {cat.label}
                      </Link>))}
                  </div>)}
              </div>

              <Link to="/design" className="text-white hover:text-[#D4A843] transition-colors">
                Design
              </Link>
              <Link to="/inquiries" className="text-white hover:text-[#D4A843] transition-colors">
                Inquiries
              </Link>

              {/* About Us Dropdown */}
              <div className="relative" onMouseEnter={handleAboutEnter} onMouseLeave={handleAboutLeave}>
                <Link to="/about/our-story" className="text-white hover:text-[#D4A843] transition-colors flex items-center gap-1">
                  About Us
                  <ChevronDown className="w-4 h-4"/>
                </Link>

                {aboutDropdownOpen && (<div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md py-2 min-w-[200px] border-2 border-[#D4A843]">
                    <Link to="/about/our-story" className="block px-4 py-2 text-[#2C5F4F] hover:bg-emerald-50 hover:text-[#D4A843] transition-colors">
                      Our Story
                    </Link>
                    <Link to="/about/our-food" className="block px-4 py-2 text-[#2C5F4F] hover:bg-emerald-50 hover:text-[#D4A843] transition-colors">
                      Our Food
                    </Link>
                    <Link to="/about/branches" className="block px-4 py-2 text-[#2C5F4F] hover:bg-emerald-50 hover:text-[#D4A843] transition-colors">
                      Branches
                    </Link>
                  </div>)}
              </div>
            </nav>

            {/* Right Icons */}
            <div className="hidden md:flex items-center gap-4">
              {/* Cart Icon */}
              <button onClick={() => setCartOpen(true)} className="text-white hover:text-[#D4A843] transition-colors relative">
                <ShoppingCart className="w-5 h-5"/>
                {totalItems > 0 && (<span className="absolute -top-2 -right-2 bg-[#D4A843] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>)}
              </button>

              {/* User Dropdown */}
              <div className="relative" onMouseEnter={handleUserEnter} onMouseLeave={handleUserLeave}>
                <button className="text-white hover:text-[#D4A843] transition-colors">
                  <User className="w-5 h-5"/>
                </button>

                {userDropdownOpen && (<div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-md py-2 min-w-[180px] border-2 border-[#D4A843]">
                    {!isLoggedIn ? (<>
                        <Link to="/account" className="w-full text-left px-4 py-2 text-[#2C5F4F] hover:bg-emerald-50 hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setUserDropdownOpen(false)}>
                          <LogIn className="w-4 h-4"/>
                          Log In
                        </Link>
                        <Link to="/account" className="w-full text-left px-4 py-2 text-[#2C5F4F] hover:bg-emerald-50 hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setUserDropdownOpen(false)}>
                          <UserPlus className="w-4 h-4"/>
                          Sign Up
                        </Link>
                      </>) : (<>
                        <div className="px-4 py-2 text-sm text-gray-600 border-b-2 border-[#D4A843]">
                          Welcome, {user?.name}!
                        </div>
                        <Link to="/profile" className="w-full text-left px-4 py-2 text-[#2C5F4F] hover:bg-emerald-50 hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setUserDropdownOpen(false)}>
                          <CircleUserRound className="w-4 h-4"/>
                          My Profile
                        </Link>
                        {!isAdmin && !isStaff && (<Link to="/my-orders" className="w-full text-left px-4 py-2 text-[#2C5F4F] hover:bg-emerald-50 hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setUserDropdownOpen(false)}>
                            <Package className="w-4 h-4"/>
                            My Orders
                          </Link>)}
                        {isStaff && (<Link to="/staff" className="w-full text-left px-4 py-2 text-[#2C5F4F] hover:bg-emerald-50 hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setUserDropdownOpen(false)}>
                            <LayoutDashboard className="w-4 h-4"/>
                            Staff Panel
                          </Link>)}
                        {isAdmin && (<Link to="/admin" className="w-full text-left px-4 py-2 text-[#2C5F4F] hover:bg-emerald-50 hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setUserDropdownOpen(false)}>
                            <LayoutDashboard className="w-4 h-4"/>
                            Admin Dashboard
                          </Link>)}
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-[#2C5F4F] hover:bg-emerald-50 hover:text-[#D4A843] transition-colors flex items-center gap-2">
                          <LogOut className="w-4 h-4"/>
                          Log Out
                        </button>
                      </>)}
                  </div>)}
              </div>
            </div>

            {/* Mobile Icons */}
            <div className="md:hidden flex items-center gap-3">
              <button onClick={() => setCartOpen(true)} className="text-white hover:text-[#D4A843] transition-colors relative">
                <ShoppingCart className="w-5 h-5"/>
                {totalItems > 0 && (<span className="absolute -top-2 -right-2 bg-[#D4A843] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>)}
              </button>

              <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (<div className="md:hidden py-4 border-t-2 border-[#D4A843]">
              <nav className="flex flex-col gap-4">
                <Link to="/" className="text-left text-white hover:text-[#D4A843] transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/products" className="text-left text-white hover:text-[#D4A843] transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Products
                </Link>

                <Link to="/design" className="text-left text-white hover:text-[#D4A843] transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Design
                </Link>
                <Link to="/inquiries" className="text-left text-white hover:text-[#D4A843] transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Inquiries
                </Link>

                {/* About Us Submenu */}
                <div className="pl-4 flex flex-col gap-2 border-l-2 border-white">
                  <span className="text-sm font-medium text-white">About Us</span>
                  <Link to="/about/our-story" className="text-left text-white hover:text-[#D4A843] transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>
                   Our Story
                  </Link>
                  <Link to="/about/our-food" className="text-left text-white hover:text-[#D4A843] transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>
                   Our Food
                  </Link>
                  <Link to="/about/branches" className="text-left text-white hover:text-[#D4A843] transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>
                    Branches
                  </Link>
                </div>

                {/* User Account Section */}
                <div className="pt-4 border-t-2 border-white">
                  {!isLoggedIn ? (<div className="flex flex-col gap-2">
                      <Link to="/account" className="text-left text-white hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <LogIn className="w-4 h-4"/>
                        Log In
                      </Link>
                      <Link to="/account" className="text-left text-white hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <UserPlus className="w-4 h-4"/>
                        Sign Up
                      </Link>
                    </div>) : (<div className="flex flex-col gap-2">
                      <div className="text-sm text-white pb-2">
                        Welcome, {user?.name}!
                      </div>
                      <Link to="/profile" className="text-left text-white hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <CircleUserRound className="w-4 h-4"/>
                        My Profile
                      </Link>
                      {!isAdmin && !isStaff && (<Link to="/my-orders" className="text-left text-white hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                          <Package className="w-4 h-4"/>
                          My Orders
                        </Link>)}
                      {isStaff && (<Link to="/staff" className="text-left text-white hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                          <LayoutDashboard className="w-4 h-4"/>
                          Staff Panel
                        </Link>)}
                      {isAdmin && (<Link to="/admin" className="text-left text-white hover:text-[#D4A843] transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                          <LayoutDashboard className="w-4 h-4"/>
                          Admin Dashboard
                        </Link>)}
                      <button onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                }} className="text-left text-white hover:text-[#D4A843] transition-colors flex items-center gap-2">
                        <LogOut className="w-4 h-4"/>
                        Log Out
                      </button>
                    </div>)}
                </div>
              </nav>
            </div>)}
        </div>
      </header>

      {/* Page Content */}
      <Outlet />

      {/* Cart Modal */}
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)}/>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors/>

      {/* AI Chatbot */}
      <Chatbot />

      {/* Privacy Consent Modal */}
      <PrivacyConsentModal />

      {/* Cookie Banner */}
      <CookieBanner />

      {/* Footer */}
      <footer className="bg-[#2C5F4F] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logoImage} alt="Mama & Co." className="h-20 w-auto object-contain"/>
          </div>
          <p className="text-gray-200">Made with love, one cake at a time.</p>
          <div className="mt-4 space-y-2">
            <p className="text-gray-300 text-sm">© 2026 Mama & Co. All rights reserved.</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>);
}
