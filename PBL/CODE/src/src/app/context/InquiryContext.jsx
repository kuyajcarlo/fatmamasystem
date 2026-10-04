import { createContext, useContext, useState, useEffect } from 'react';
const InquiryContext = createContext(undefined);
export function InquiryProvider({ children }) {
    const [inquiries, setInquiries] = useState(() => {
        const saved = localStorage.getItem('mama-co-inquiries');
        return saved ? JSON.parse(saved) : [];
    });
    useEffect(() => {
        localStorage.setItem('mama-co-inquiries', JSON.stringify(inquiries));
    }, [inquiries]);
    const addInquiry = (data) => {
        const newInquiry = {
            ...data,
            id: `INQ-${Date.now().toString().slice(-6)}`,
            date: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }),
            status: 'new',
        };
        setInquiries((prev) => [newInquiry, ...prev]);
    };
    const updateInquiryStatus = (id, status) => {
        setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)));
    };
    return (<InquiryContext.Provider value={{ inquiries, addInquiry, updateInquiryStatus }}>
      {children}
    </InquiryContext.Provider>);
}
export function useInquiries() {
    const context = useContext(InquiryContext);
    if (!context)
        throw new Error('useInquiries must be used within an InquiryProvider');
    return context;
}
