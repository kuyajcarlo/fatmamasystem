import { Shield, ExternalLink } from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import { Link } from 'react-router';

export default function PrivacyConsentModal() {
  const { showConsentModal, acceptConsent, declineConsent, setShowConsentModal } = usePrivacy();

  if (!showConsentModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white bg-opacity-95 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#2C5F4F] text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Data Privacy Notice</h2>
              <p className="text-sm text-gray-200 mt-1">Please review our data collection practices</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-2">Welcome to Mama & Co.!</h3>
            <p className="text-gray-700">
              We value your privacy and are committed to protecting your personal information.
              Before you proceed with placing orders, please review how we collect and use your data.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-[#2C5F4F]">Information We Collect:</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Personal information (name, email, phone number)</li>
              <li>Delivery address and location details</li>
              <li>Order history and preferences</li>
              <li>Payment method information</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-[#2C5F4F]">How We Use Your Data:</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Process and deliver your orders</li>
              <li>Send order confirmations and updates</li>
              <li>Improve our products and services</li>
              <li>Communicate promotional offers (with your consent)</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-[#2C5F4F]">Your Rights:</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Access and review your personal data</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>File a complaint with data protection authorities</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> If you choose not to accept, you can still browse our website
              and view our products, but you will not be able to place orders or add items to your cart.
            </p>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            <p>
              By accepting, you acknowledge that you have read and understood our data privacy practices
              and consent to the collection and use of your personal information as described above.
            </p>
          </div>

          <div className="mt-4">
            <Link
              to="/privacy-policy"
              onClick={() => {
                setShowConsentModal(false);
              }}
              className="text-sm text-[#D4A843] hover:text-[#B8923A] flex items-center gap-1 justify-center"
            >
              View Full Privacy Policy
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row gap-3">
          <button
            onClick={declineConsent}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Decline - Browse Only
          </button>
          <button
            onClick={acceptConsent}
            className="flex-1 px-6 py-3 bg-[#D4A843] hover:bg-[#B8923A] text-white rounded-lg transition-colors font-medium"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
