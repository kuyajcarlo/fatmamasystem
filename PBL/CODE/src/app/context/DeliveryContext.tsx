import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface DeliveryInfo {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
}

interface DeliveryContextType {
  savedDeliveryInfo: DeliveryInfo | null;
  saveDeliveryInfo: (info: DeliveryInfo) => void;
  clearDeliveryInfo: () => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [savedDeliveryInfo, setSavedDeliveryInfo] = useState<DeliveryInfo | null>(() => {
    // Load delivery info from localStorage on initialization
    const saved = localStorage.getItem('mama-co-delivery-info');
    return saved ? JSON.parse(saved) : null;
  });

  // Save delivery info to localStorage whenever it changes
  useEffect(() => {
    if (savedDeliveryInfo) {
      localStorage.setItem('mama-co-delivery-info', JSON.stringify(savedDeliveryInfo));
    } else {
      localStorage.removeItem('mama-co-delivery-info');
    }
  }, [savedDeliveryInfo]);

  const saveDeliveryInfo = (info: DeliveryInfo) => {
    setSavedDeliveryInfo(info);
  };

  const clearDeliveryInfo = () => {
    setSavedDeliveryInfo(null);
  };

  return (
    <DeliveryContext.Provider
      value={{
        savedDeliveryInfo,
        saveDeliveryInfo,
        clearDeliveryInfo,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
}
