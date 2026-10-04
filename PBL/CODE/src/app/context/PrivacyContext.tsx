import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PrivacyContextType {
  hasConsented: boolean;
  acceptConsent: () => void;
  declineConsent: () => void;
  showConsentModal: boolean;
  setShowConsentModal: (show: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hasConsented, setHasConsented] = useState<boolean>(() => {
    const savedConsent = localStorage.getItem('mama-co-privacy-consent');
    return savedConsent === 'true';
  });
  const [showConsentModal, setShowConsentModal] = useState<boolean>(!hasConsented);

  useEffect(() => {
    localStorage.setItem('mama-co-privacy-consent', hasConsented.toString());
  }, [hasConsented]);

  const acceptConsent = () => {
    setHasConsented(true);
    setShowConsentModal(false);
  };

  const declineConsent = () => {
    setHasConsented(false);
    setShowConsentModal(false);
  };

  return (
    <PrivacyContext.Provider
      value={{
        hasConsented,
        acceptConsent,
        declineConsent,
        showConsentModal,
        setShowConsentModal,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
