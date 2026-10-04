import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cookieAccepted = localStorage.getItem('mama-co-cookie-consent');
    if (!cookieAccepted) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('mama-co-cookie-consent', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#D4A843] shadow-xl z-40 p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="w-6 h-6 text-[#D4A843] flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">We Use Cookies & Local Storage</h3>
            <p className="text-sm text-gray-600">
              We use cookies and browser local storage to remember your login session, saved delivery addresses,
              shopping cart items, and preferences. This helps provide you with a better shopping experience.
              By continuing to use our website, you consent to our use of cookies and local storage.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAccept}
            className="bg-[#D4A843] hover:bg-[#B8923A] text-white px-6 py-2 rounded-md transition-colors whitespace-nowrap font-medium"
          >
            Accept & Continue
          </button>
          <button
            onClick={handleAccept}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
