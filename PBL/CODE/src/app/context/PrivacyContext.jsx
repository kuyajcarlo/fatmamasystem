import { createContext, useContext, useState, useEffect } from 'react';
const PrivacyContext = createContext(undefined);
export function PrivacyProvider({ children }) {
    const [hasConsented, setHasConsented] = useState(() => {
        const savedConsent = localStorage.getItem('mama-co-privacy-consent');
        return savedConsent === 'true';
    });
    const [showConsentModal, setShowConsentModal] = useState(!hasConsented);
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
    return (<PrivacyContext.Provider value={{
            hasConsented,
            acceptConsent,
            declineConsent,
            showConsentModal,
            setShowConsentModal,
        }}>
      {children}
    </PrivacyContext.Provider>);
}
export function usePrivacy() {
    const context = useContext(PrivacyContext);
    if (!context) {
        throw new Error('usePrivacy must be used within a PrivacyProvider');
    }
    return context;
}
