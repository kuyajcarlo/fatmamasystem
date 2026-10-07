import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const InquiryContext = createContext(undefined);
const LOCAL_STORAGE_KEY = 'mama-co-inquiries';

function getLocalInquiries() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocalInquiries(items) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export function InquiryProvider({ children }) {
    const [inquiries, setInquiries] = useState(() => getLocalInquiries());

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            if (!supabase) return;
            const { data, error } = await supabase.from('inquiries').select('*').order('date', { ascending: false });
            if (!error && data) {
                // Merge remote inquiries with any local entries
                const local = getLocalInquiries();
                const ids = new Set(data.map(d => d.id));
                const merged = [...data, ...local.filter(l => !ids.has(l.id))];
                setInquiries(merged);
                saveLocalInquiries(merged);
            }
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        }
    };

    const addInquiry = async (data) => {
        const newInquiry = {
            id: `INQ-${Date.now().toString().slice(-6)}`,
            name: data.name,
            email: data.email,
            subject: data.subject || (data.message ? data.message.slice(0, 30) + '...' : 'General Inquiry'),
            message: data.message,
            date: new Date().toISOString(),
            status: 'new'
        };

        // Always update state & local storage immediately so it appears on tracker
        setInquiries((prev) => {
            const next = [newInquiry, ...prev];
            saveLocalInquiries(next);
            return next;
        });

        if (supabase) {
            try {
                const { data: result, error } = await supabase.from('inquiries').insert([newInquiry]).select();
                if (!error && result?.[0]) {
                    setInquiries((prev) => {
                        const next = prev.map(i => i.id === newInquiry.id ? result[0] : i);
                        saveLocalInquiries(next);
                        return next;
                    });
                }
            } catch (error) {
                console.warn('Note: Inquiry stored locally');
            }
        }
    };

    const updateInquiryStatus = async (id, status) => {
        setInquiries((prev) => {
            const next = prev.map((inq) => (inq.id === id ? { ...inq, status } : inq));
            saveLocalInquiries(next);
            return next;
        });

        if (supabase) {
            try {
                await supabase.from('inquiries').update({ status }).eq('id', id);
            } catch (error) {
                console.warn('Note: Status updated locally');
            }
        }
    };

    return (
        <InquiryContext.Provider value={{ inquiries, addInquiry, updateInquiryStatus }}>
            {children}
        </InquiryContext.Provider>
    );
}

export function useInquiries() {
    const context = useContext(InquiryContext);
    if (!context) throw new Error('useInquiries must be used within an InquiryProvider');
    return context;
}
