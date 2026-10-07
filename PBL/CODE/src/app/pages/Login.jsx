import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { usePrivacy } from '../context/PrivacyContext';
import { toast } from 'sonner';
import { LogIn, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useSubmitLock } from '../hooks/useSubmitLock';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [withLock, loading] = useSubmitLock(async (task) => task());
    const navigate = useNavigate();
    const { login } = useAuth();
    const { hasConsented, setShowConsentModal } = usePrivacy();

    const handleLoginWithRole = (targetRole) => {
        if (targetRole === 'admin') {
            navigate('/admin');
        } else if (targetRole === 'staff') {
            navigate('/staff');
        } else {
            navigate('/');
            if (!hasConsented) {
                setTimeout(() => setShowConsentModal(true), 500);
            }
        }
    };

    const handleQuickLogin = (quickEmail, quickPassword) => withLock(async () => {
        setEmail(quickEmail);
        setPassword(quickPassword);
        const result = await login(quickEmail, quickPassword);
        if (result.success) {
            toast.success(`Logged in as ${result.role || 'user'}!`);
            handleLoginWithRole(result.role);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        return withLock(async () => {
            const result = await login(email, password);
            if (result.success) {
                toast.success('Welcome back!');
                const userRole = result.role || (result.user && result.user.role);
                handleLoginWithRole(userRole);
            }
        });
    };

    return (<div className="min-h-[calc(100vh-400px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#D4A843] p-3 rounded-full">
              <LogIn className="w-8 h-8 text-white"/>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Quick Testing Accounts Section */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs">
          <p className="font-semibold text-amber-900 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            Quick Test Accounts (Click to log in):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@fatmama.ph', 'admin123')}
              className="px-2 py-1.5 bg-emerald-700 text-white rounded font-medium hover:bg-emerald-800 transition text-center"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff@fatmama.ph', 'staff123')}
              className="px-2 py-1.5 bg-[#2C5F4F] text-white rounded font-medium hover:bg-[#1f4437] transition text-center"
            >
              💼 Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@fatmama.ph', 'customer123')}
              className="px-2 py-1.5 bg-[#D4A843] text-white rounded font-medium hover:bg-[#b8923a] transition text-center"
            >
              👤 Customer
            </button>
          </div>
          <p className="mt-2 text-amber-800 text-[11px]">
            Default Passwords: <code>admin123</code> / <code>staff123</code> / <code>customer123</code>
          </p>
        </div>

        <form className="bg-white p-8 rounded-lg shadow-md space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none text-sm" placeholder="your@email.com"/>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none text-sm" placeholder="••••••••"/>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="w-full bg-[#D4A843] hover:bg-[#B8923A] text-white py-3 rounded-md transition-colors font-medium disabled:opacity-50 text-sm">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-[#D4A843] hover:text-[#D4A843]">
                Sign up
              </Link>
            </p>
          </div>
        </form>

        <div className="text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>);
}
