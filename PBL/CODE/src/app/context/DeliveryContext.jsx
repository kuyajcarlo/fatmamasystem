import { createContext, useContext, useState, useEffect } from 'react';
const DeliveryContext = createContext(undefined);
export function DeliveryProvider({ children }) {
    const [savedDeliveryInfo, setSavedDeliveryInfo] = useState(() => {
        // Load delivery info from localStorage on initialization
        const saved = localStorage.getItem('mama-co-delivery-info');
        return saved ? JSON.parse(saved) : null;
    });
    // Save delivery info to localStorage whenever it changes
    useEffect(() => {
        if (savedDeliveryInfo) {
            localStorage.setItem('mama-co-delivery-info', JSON.stringify(savedDeliveryInfo));
        }
        else {
            localStorage.removeItem('mama-co-delivery-info');
        }
    }, [savedDeliveryInfo]);
    const saveDeliveryInfo = (info) => {
        setSavedDeliveryInfo(info);
    };
    const clearDeliveryInfo = () => {
        setSavedDeliveryInfo(null);
    };
    return (<DeliveryContext.Provider value={{
            savedDeliveryInfo,
            saveDeliveryInfo,
            clearDeliveryInfo,
        }}>
      {children}
    </DeliveryContext.Provider>);
}
export function useDelivery() {
    const context = useContext(DeliveryContext);
    if (!context) {
        throw new Error('useDelivery must be used within a DeliveryProvider');
    }
    return context;
}
