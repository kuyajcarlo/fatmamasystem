import { Shield, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { usePrivacy } from '../context/PrivacyContext';
import { toast } from 'sonner';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { hasConsented, acceptConsent, declineConsent } = usePrivacy();

  const handleAccept = () => {
    acceptConsent();
    toast.success('Privacy policy accepted');
    navigate('/');
  };

  const handleDecline = () => {
    declineConsent();
    toast.info('You can browse our website but cannot place orders');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#2C5F4F] hover:text-[#1F4437] mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#2C5F4F] p-3 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="mb-1">Data Privacy Policy</h1>
              <p className="text-sm text-gray-500">Last updated: May 16, 2026</p>
            </div>
          </div>

          {/* Current Status */}
          <div className={`p-4 rounded-lg mb-6 ${hasConsented ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm ${hasConsented ? 'text-green-800' : 'text-yellow-800'}`}>
              <strong>Current Status:</strong> {hasConsented ? 'You have accepted our privacy policy' : 'You have not accepted our privacy policy'}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-3">Introduction</h2>
              <p className="text-gray-700">
                At Mama & Co., we respect your privacy and are committed to protecting your personal information.
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our website
                and services.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Information We Collect</h2>
              <div className="space-y-3 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name and contact details (email, phone number)</li>
                    <li>Delivery address and location information</li>
                    <li>Account credentials (username, password)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Transaction Information:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Order history and product preferences</li>
                    <li>Payment method information</li>
                    <li>Delivery notes and special requests</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3">How We Use Your Information</h2>
              <p className="text-gray-700 mb-2">We use your personal information to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Process and deliver your orders</li>
                <li>Send order confirmations, updates, and delivery notifications</li>
                <li>Improve our products, services, and customer experience</li>
                <li>Communicate promotional offers and updates (with your consent)</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3">Data Storage and Security</h2>
              <p className="text-gray-700">
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely
                and is only accessible by authorized personnel.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Your Rights</h2>
              <p className="text-gray-700 mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Request correction of inaccurate or incomplete data</li>
                <li>Request deletion of your personal data</li>
                <li>Withdraw your consent at any time</li>
                <li>Object to processing of your data</li>
                <li>File a complaint with data protection authorities</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3">Cookies and Tracking</h2>
              <p className="text-gray-700">
                We use local storage to maintain your session and preferences. This helps us provide you with a
                better user experience by remembering your cart items and login status.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Third-Party Sharing</h2>
              <p className="text-gray-700">
                We do not sell your personal information to third parties. We may share your data with trusted
                service providers (delivery partners, payment processors) solely for the purpose of fulfilling
                your orders.
              </p>
            </div>

            <div>
              <h2 className="mb-3">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please
                contact us at:
              </p>
              <div className="mt-2 text-gray-700">
                <p>Email: privacy@fatmama.ph</p>
                <p>Phone: (02) 1234-5678</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3">
            {!hasConsented ? (
              <>
                <button
                  onClick={handleDecline}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 px-6 py-3 bg-[#D4A843] hover:bg-[#B8923A] text-white rounded-lg transition-colors font-medium"
                >
                  Accept Privacy Policy
                </button>
              </>
            ) : (
              <button
                onClick={handleDecline}
                className="w-full px-6 py-3 border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Revoke Consent
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
