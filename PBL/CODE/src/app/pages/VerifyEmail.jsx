import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePrivacy } from '../context/PrivacyContext';
import { useSubmitLock } from '../hooks/useSubmitLock';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';

const RESEND_COOLDOWN = 60;

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const redirect = searchParams.get('redirect');
    const redirectTo = redirect ? `/${redirect.replace(/^\/+/, '')}` : '/';

    const [code, setCode] = useState('');
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
    const navigate = useNavigate();
    const { verifyEmail, resendVerification } = useAuth();
    const { hasConsented, setShowConsentModal } = usePrivacy();

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const [handleVerify, verifying] = useSubmitLock(async () => {
        if (code.length !== 6) return;
        const res = await verifyEmail(email, code);
        if (res.success) {
            navigate(redirectTo);
            if (!hasConsented) {
                setTimeout(() => setShowConsentModal(true), 500);
            }
        } else {
            setCode('');
        }
    });

    const [handleResend, resending] = useSubmitLock(async () => {
        const res = await resendVerification(email);
        if (res.success) setCooldown(RESEND_COOLDOWN);
    });

    if (!email) return <Navigate to="/signup" replace />;

    return (<div className="min-h-[calc(100vh-400px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#D4A843] p-3 rounded-full">
              <MailCheck className="w-8 h-8 text-white"/>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            We sent a 6-digit code to <span className="font-semibold text-gray-900 break-all">{email}</span>.
            Enter it below to activate your account.
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleVerify}>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={(v) => setCode(v.replace(/\D/g, ''))} autoFocus inputMode="numeric" pattern="^[0-9]*$">
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (<InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg"/>))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <button type="submit" disabled={verifying || code.length !== 6} className="w-full bg-[#D4A843] hover:bg-[#B8923A] text-white py-3 rounded-md transition-colors font-medium disabled:opacity-50">
            {verifying ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="text-center text-sm text-gray-600">
            Didn't get the email? Check your spam folder or{' '}
            <button type="button" onClick={handleResend} disabled={resending || cooldown > 0} className="font-medium text-[#D4A843] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed">
              {cooldown > 0 ? `resend code in ${cooldown}s` : resending ? 'sending...' : 'resend code'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link to="/signup" className="text-sm text-gray-600 hover:text-gray-900">
            ← Use a different email
          </Link>
        </div>
      </div>
    </div>);
}
