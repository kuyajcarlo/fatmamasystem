import { createContext, useContext, useState } from 'react';
const CakeDesignContext = createContext(undefined);
const LS_KEY = 'mama-co-cake-designs';
function load() {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    }
    catch {
        return [];
    }
}
function save(data) {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
}
export function CakeDesignProvider({ children }) {
    const [requests, setRequests] = useState(load);
    const submitRequest = (data) => {
        const id = `CDR-${Date.now().toString().slice(-6)}`;
        const newReq = {
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
    const reviewRequest = (id, status, opts) => {
        setRequests((prev) => {
            const next = prev.map((r) => r.id === id
                ? {
                    ...r,
                    status,
                    approvedPrice: opts.approvedPrice,
                    reviewNote: opts.reviewNote,
                    reviewedBy: opts.reviewedBy,
                    reviewedAt: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
                }
                : r);
            save(next);
            return next;
        });
    };
    const markOrdered = (id) => {
        setRequests((prev) => {
            const next = prev.map((r) => (r.id === id ? { ...r, ordered: true } : r));
            save(next);
            return next;
        });
    };
    return (<CakeDesignContext.Provider value={{ requests, submitRequest, reviewRequest, markOrdered }}>
      {children}
    </CakeDesignContext.Provider>);
}
export function useCakeDesign() {
    const ctx = useContext(CakeDesignContext);
    if (!ctx)
        throw new Error('useCakeDesign must be used within CakeDesignProvider');
    return ctx;
}
