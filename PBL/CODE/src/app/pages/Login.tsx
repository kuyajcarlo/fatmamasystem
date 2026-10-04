import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { usePrivacy } from '../context/PrivacyContext';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { hasConsented, setShowConsentModal } = usePrivacy();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check for admin credentials
    if (email === 'admin@fatmama.ph' && password === 'admin123') {
      login({ email, name: 'Admin', role: 'admin' });
      toast.success('Welcome back, Admin!');
      navigate('/admin');
      return;
    }

    // Check for staff credentials in local storage
    try {
      const rawStaff = localStorage.getItem('mama-co-staff-accounts');
      if (rawStaff) {
        const staffAccounts = JSON.parse(rawStaff);
        const staffUser = staffAccounts.find((s: any) => s.email === email && s.password === password && s.status === 'active');
        if (staffUser) {
          login({ email, name: staffUser.name, role: 'staff' });
          toast.success(`Welcome back, ${staffUser.name}!`);
          navigate('/staff');
          return;
        }
      }
    } catch (e) {
      console.error('Error checking staff accounts:', e);
    }

    // Check for test user credentials
    if (email === 'user@fatmama.ph' && password === 'user123') {
      login({ email, name: 'Test User', role: 'user' });
      toast.success('Welcome back, Test User!');
      navigate('/');

      // Show privacy modal if not consented
      if (!hasConsented) {
        setTimeout(() => {
          setShowConsentModal(true);
        }, 500);
      }
      return;
    }

    // For any other email/password, create a user account
    login({ email, name: email.split('@')[0], role: 'user' });
    toast.success('Welcome back!');
    navigate('/');

    // Show privacy modal if not consented
    if (!hasConsented) {
      setTimeout(() => {
        setShowConsentModal(true);
      }, 500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-400px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#D4A843] p-3 rounded-full">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Test Credentials */}
        <div className="mt-6 space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-semibold mb-2">Test Accounts:</p>
            <div className="space-y-1 text-sm text-blue-700">
              <p><strong>Admin:</strong> admin@fatmama.ph / admin123</p>
              <p><strong>User:</strong> user@fatmama.ph / user123</p>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#D4A843] focus:ring-[#D4A843] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-[#D4A843] hover:text-[#D4A843]">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-[#D4A843] hover:bg-[#B8923A] text-white py-3 rounded-md transition-colors font-medium"
            >
              Sign In
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
    </div>
  );
}
