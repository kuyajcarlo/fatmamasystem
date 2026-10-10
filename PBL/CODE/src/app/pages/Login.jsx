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
