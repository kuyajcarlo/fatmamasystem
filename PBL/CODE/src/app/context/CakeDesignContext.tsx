import { createContext, useContext, useState, ReactNode } from 'react';

export type DesignStatus = 'pending' | 'approved' | 'rejected';

export interface CakeDesignRequest {
  id: string;
  submittedAt: string;
  customerEmail: string;
  customerName: string;
  // cake config
  sizeId: string;
  sizeName: string;
  layers: string;
  flavor: string;
  frosting: string;
  topper: string;
  otherTopper: string;
  color: string;
  occasion: string;
  text: string;
  decorations: string;
  imageUrl?: string;
  // computed base price at time of submission
  basePrice: number;
  // review
  status: DesignStatus;
  approvedPrice?: number;
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  // track if customer already ordered it
  ordered: boolean;
}

interface CakeDesignContextType {
  requests: CakeDesignRequest[];
  submitRequest: (data: Omit<CakeDesignRequest, 'id' | 'submittedAt' | 'status' | 'ordered'>) => string;
  reviewRequest: (id: string, status: 'approved' | 'rejected', opts: { approvedPrice?: number; reviewNote?: string; reviewedBy: string }) => void;
  markOrdered: (id: string) => void;
}

const CakeDesignContext = createContext<CakeDesignContextType | undefined>(undefined);

const LS_KEY = 'mama-co-cake-designs';

function load(): CakeDesignRequest[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function save(data: CakeDesignRequest[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function CakeDesignProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<CakeDesignRequest[]>(load);

  const submitRequest = (data: Omit<CakeDesignRequest, 'id' | 'submittedAt' | 'status' | 'ordered'>): string => {
    const id = `CDR-${Date.now().toString().slice(-6)}`;
    const newReq: CakeDesignRequest = {
      ...data,
      id,
      submittedAt: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'pending',
      ordered: false,
    };
    setRequests((prev) => {
      const next = [newReq, ...prev];
      save(next);
      return next;
    });
    return id;
  };

  const reviewRequest = (id: string, status: 'approved' | 'rejected', opts: { approvedPrice?: number; reviewNote?: string; reviewedBy: string }) => {
    setRequests((prev) => {
      const next = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              approvedPrice: opts.approvedPrice,
              reviewNote: opts.reviewNote,
              reviewedBy: opts.reviewedBy,
              reviewedAt: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
            }
          : r
      );
      save(next);
      return next;
    });
  };

  const markOrdered = (id: string) => {
    setRequests((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ordered: true } : r));
      save(next);
      return next;
    });
  };

  return (
    <CakeDesignContext.Provider value={{ requests, submitRequest, reviewRequest, markOrdered }}>
      {children}
    </CakeDesignContext.Provider>
  );
}

export function useCakeDesign() {
  const ctx = useContext(CakeDesignContext);
  if (!ctx) throw new Error('useCakeDesign must be used within CakeDesignProvider');
  return ctx;
}
