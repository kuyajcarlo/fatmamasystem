import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { usePrivacy } from '../context/PrivacyContext';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import logoImage from '../../imports/Gemini_Generated_Image_p60lg7p60lg7p60l-removebg-preview__1_.png';

type Tab = 'login' | 'signup';

interface LoginErrors { email?: string; password?: string }
interface SignupErrors { name?: string; email?: string; password?: string; confirm?: string; terms?: string }

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({});

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') ? `/${searchParams.get('redirect')}` : '/';
  const { login } = useAuth();
  const { hasConsented, setShowConsentModal } = usePrivacy();

  const showPrivacyModal = () => {
    if (!hasConsented) {
      setTimeout(() => setShowConsentModal(true), 500);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: LoginErrors = {};
    if (!loginEmail.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(loginEmail)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!loginPassword) {
      errs.password = 'Password is required';
    }
    if (Object.keys(errs).length) {
      setLoginErrors(errs);
      return;
    }
    setLoginErrors({});
    const adminPwd = localStorage.getItem('mama-co-admin-password') || 'admin123';
    if (loginEmail === 'admin@fatmama.ph' && loginPassword === adminPwd) {
      login({ email: loginEmail, name: 'Admin', role: 'admin' });
      toast.success('Welcome back, Admin!');
      navigate('/admin');
      return;
    }
    try {
      const DEFAULT_STAFF = [{ id: 'STAFF-001', name: 'Staff', email: 'staff@fatmama.ph', password: 'staff123', status: 'active', createdAt: '2026-01-01' }];
      const raw = localStorage.getItem('mama-co-staff-accounts');
      const staffAccounts: { email: string; password: string; name: string; status: string }[] =
        raw ? JSON.parse(raw) : DEFAULT_STAFF;
      const staffMatch = staffAccounts.find(
        (s) => s.email.toLowerCase() === loginEmail.toLowerCase() && s.password === loginPassword && s.status === 'active'
      );
      if (staffMatch) {
        login({ email: staffMatch.email, name: staffMatch.name, role: 'staff' });
        toast.success(`Welcome, ${staffMatch.name}!`);
        navigate('/staff');
        return;
      }
    } catch {
      // ignore parse errors
    }
    if (loginEmail === 'user@fatmama.ph' && loginPassword === 'user123') {
      login({ email: loginEmail, name: 'Test User', role: 'user' });
      toast.success('Welcome back, Test User!');
      navigate(redirectTo);
      showPrivacyModal();
      return;
    }
    // Check stored user passwords (set via profile or signup)
    const userPasswords: Record<string, string> = (() => {
      try { return JSON.parse(localStorage.getItem('mama-co-user-passwords') || '{}'); } catch { return {}; }
    })();
    const storedPwd = userPasswords[loginEmail.toLowerCase()];
    if (storedPwd && storedPwd !== loginPassword) {
      setLoginErrors({ password: 'Incorrect password' });
      return;
    }
    login({ email: loginEmail, name: loginEmail.split('@')[0], role: 'user' });
    toast.success('Welcome back!');
    navigate(redirectTo);
    showPrivacyModal();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: SignupErrors = {};
    if (!signupName.trim()) errs.name = 'Full name is required';
    if (!signupEmail.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(signupEmail)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!signupPassword) {
      errs.password = 'Password is required';
    } else if (signupPassword.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!signupConfirm) {
      errs.confirm = 'Please confirm your password';
    } else if (signupPassword && signupConfirm !== signupPassword) {
      errs.confirm = 'Passwords do not match';
    }
    if (!agreedToTerms) errs.terms = 'You must agree to the Terms and Conditions';
    if (Object.keys(errs).length) {
      setSignupErrors(errs);
      return;
    }
    setSignupErrors({});
    // Store password so the user can log in with it and change it via profile
    const pwdMap: Record<string, string> = (() => {
      try { return JSON.parse(localStorage.getItem('mama-co-user-passwords') || '{}'); } catch { return {}; }
    })();
    pwdMap[signupEmail.toLowerCase()] = signupPassword;
    localStorage.setItem('mama-co-user-passwords', JSON.stringify(pwdMap));
    login({ email: signupEmail, name: signupName, role: 'user' });
    toast.success('Account created successfully!');
    navigate(redirectTo);
    showPrivacyModal();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2C5F4F] flex-col items-center justify-center relative overflow-hidden">
        {/* decorative arches */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 800" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* bottom-left arch */}
          <path d="M-60 800 C-60 580 180 420 180 200 C180 -20 -60 -80 -60 -80" stroke="#1F4437" strokeWidth="120" strokeLinecap="round" fill="none" opacity="0.7"/>
          {/* top-right arch */}
          <path d="M560 0 C560 220 320 380 320 600 C320 820 560 880 560 880" stroke="#1F4437" strokeWidth="90" strokeLinecap="round" fill="none" opacity="0.45"/>
          {/* center accent arch */}
          <path d="M250 -40 C420 -40 540 100 540 270 C540 440 420 560 250 560" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.25"/>
          {/* small bottom-right arch */}
          <path d="M500 900 C500 720 380 640 380 460 C380 280 500 200 500 200" stroke="#D4A843" strokeWidth="60" strokeLinecap="round" fill="none" opacity="0.08"/>
        </svg>

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <img
            src={logoImage}
            alt="Mama & Co."
            className="h-36 w-auto object-contain mb-8 drop-shadow-2xl"
          />
          <p className="text-emerald-200 text-lg leading-relaxed max-w-xs">
            Handcrafted cakes & pastries made with love, one order at a time.
          </p>

          <div className="mt-10 flex flex-col gap-3 text-left w-full max-w-xs">
            {[
              'Order custom cakes & desserts',
              'Track your orders in real time',
              'Design your own cake',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#D4A843] shrink-0" />
                <span className="text-emerald-100 text-sm">{item}</span>
              </div>
            ))}
          </div>

          <Link
            to="/"
            className="mt-10 text-sm text-emerald-300 hover:text-white underline underline-offset-2 transition-colors"
          >
            Just browsing? Continue as guest
          </Link>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white px-6 py-12 sm:px-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex flex-col items-center">
          <div className="bg-[#2C5F4F] rounded-2xl p-3 mb-3">
            <img src={logoImage} alt="Mama & Co." className="h-16 w-auto object-contain" />
          </div>
          <p className="text-[#2C5F4F] font-semibold text-lg">
            Mama & Co.
          </p>
        </div>

        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-8">
            {(['login', 'signup'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? 'bg-[#2C5F4F] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#2C5F4F]">
                  Sign in to your account
                </h2>
                <p className="text-gray-500 text-sm mt-1">Enter your credentials below to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => { setLoginEmail(e.target.value); setLoginErrors((p) => ({ ...p, email: undefined })); }}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent bg-gray-50 transition ${loginErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {loginErrors.email && <p className="mt-1 text-xs text-red-500">{loginErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showLoginPwd ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => { setLoginPassword(e.target.value); setLoginErrors((p) => ({ ...p, password: undefined })); }}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent bg-gray-50 transition pr-12 ${loginErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPwd(!showLoginPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginErrors.password && <p className="mt-1 text-xs text-red-500">{loginErrors.password}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2C5F4F] hover:bg-[#1F4437] text-white font-semibold rounded-lg transition-colors mt-2"
                >
                  Sign In
                </button>
              </form>

              {/* Demo credentials */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">Demo Accounts</p>
                <div className="space-y-1 text-xs text-amber-700">
                  <p><span className="font-semibold">Admin:</span> admin@fatmama.ph / admin123</p>
                  <p><span className="font-semibold">Staff:</span> staff@fatmama.ph / staff123</p>
                  <p><span className="font-semibold">User:</span> user@fatmama.ph / user123</p>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                New here?{' '}
                <button
                  onClick={() => setActiveTab('signup')}
                  className="text-[#D4A843] font-semibold hover:underline"
                >
                  Create an account
                </button>
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <Link
                  to="/"
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Just browsing?{' '}
                  <span className="underline underline-offset-2">Continue as guest</span>
                </Link>
              </div>
            </div>
          )}

          {/* SIGNUP FORM */}
          {activeTab === 'signup' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#2C5F4F]">
                  Create your account
                </h2>
                <p className="text-gray-500 text-sm mt-1">Join Mama & Co. and start ordering today</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => { setSignupName(e.target.value); setSignupErrors((p) => ({ ...p, name: undefined })); }}
                    placeholder="Maria Santos"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent bg-gray-50 transition ${signupErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {signupErrors.name && <p className="mt-1 text-xs text-red-500">{signupErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="text"
                    value={signupEmail}
                    onChange={(e) => { setSignupEmail(e.target.value); setSignupErrors((p) => ({ ...p, email: undefined })); }}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent bg-gray-50 transition ${signupErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {signupErrors.email && <p className="mt-1 text-xs text-red-500">{signupErrors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showSignupPwd ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => { setSignupPassword(e.target.value); setSignupErrors((p) => ({ ...p, password: undefined })); }}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent bg-gray-50 transition pr-10 ${signupErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPwd(!showSignupPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSignupPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupErrors.password && <p className="mt-1 text-xs text-red-500">{signupErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
                    <div className="relative">
                      <input
                        type={showSignupConfirm ? 'text' : 'password'}
                        value={signupConfirm}
                        onChange={(e) => { setSignupConfirm(e.target.value); setSignupErrors((p) => ({ ...p, confirm: undefined })); }}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent bg-gray-50 transition pr-10 ${signupErrors.confirm ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupConfirm(!showSignupConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSignupConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupErrors.confirm && <p className="mt-1 text-xs text-red-500">{signupErrors.confirm}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => { setAgreedToTerms(e.target.checked); setSignupErrors((p) => ({ ...p, terms: undefined })); }}
                    className="mt-0.5 h-4 w-4 accent-[#D4A843] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                    I agree to the{' '}
                    <span className="text-[#D4A843] font-semibold hover:underline cursor-pointer">
                      Terms and Conditions
                    </span>
                  </label>
                </div>
                {signupErrors.terms && <p className="text-xs text-red-500 -mt-2">{signupErrors.terms}</p>}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#D4A843] hover:bg-[#B8923A] text-white font-semibold rounded-lg transition-colors"
                >
                  Create Account
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-[#D4A843] font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <Link
                  to="/"
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Just browsing?{' '}
                  <span className="underline underline-offset-2">Continue as guest</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
