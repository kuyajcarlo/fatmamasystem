import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const CakeDesignContext = createContext(undefined);
const LOCAL_STORAGE_KEY = 'mama-co-cake-designs';

function getLocalCakeDesigns() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocalCakeDesigns(items) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export function CakeDesignProvider({ children }) {
    const [requests, setRequests] = useState(() => getLocalCakeDesigns());
    
    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            if (!supabase) return;
            const { data, error } = await supabase.from('cake_requests').select('*').order('date', { ascending: false });
            if (!error && data) {
                // Map DB schema to frontend expectation
                const mapped = data.map(r => ({
                    id: r.id,
                    userEmail: r.user_email,
                    userName: r.user_name,
                    customerEmail: r.user_email,
                    customerName: r.user_name,
                    occasion: r.occasion,
                    flavor: r.flavor,
                    size: r.size,
                    sizeName: r.size,
                    message: r.message,
                    specialInstructions: r.special_instructions,
                    referenceImage: r.reference_image,
                    imageUrl: r.reference_image,
                    submittedAt: r.date,
                    status: r.status,
                    approvedPrice: r.price,
                    basePrice: r.price,
                    reviewNote: r.admin_notes,
                    ordered: r.status === 'ordered'
                }));

                const local = getLocalCakeDesigns();
                const ids = new Set(mapped.map(m => m.id));
                const merged = [...mapped, ...local.filter(l => !ids.has(l.id))];
                setRequests(merged);
                saveLocalCakeDesigns(merged);
            }
        } catch (error) {
            console.error('Error fetching cake requests:', error);
        }
    };

    const submitRequest = async (data) => {
        const id = `CDR-${Date.now().toString().slice(-6)}`;
        const now = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
        
        const newReq = {
            ...data,
            id,
            customerEmail: data.customerEmail || data.userEmail,
            customerName: data.customerName || data.userName,
            userEmail: data.customerEmail || data.userEmail,
            userName: data.customerName || data.userName,
            sizeName: data.sizeName || data.size,
            size: data.sizeName || data.size,
            imageUrl: data.imageUrl || data.referenceImage,
            referenceImage: data.imageUrl || data.referenceImage,
            basePrice: data.basePrice || data.price || 450,
            submittedAt: now,
            status: 'pending',
            ordered: false,
        };

        // Always update local state immediately so user sees it in their profile
        setRequests((prev) => {
            const next = [newReq, ...prev];
            saveLocalCakeDesigns(next);
            return next;
        });

        if (supabase) {
            try {
                const dbReq = {
                    id,
                    user_email: newReq.customerEmail,
                    user_name: newReq.customerName,
                    occasion: newReq.occasion,
                    flavor: newReq.flavor,
                    size: newReq.sizeName,
                    message: newReq.text || newReq.message || '',
                    reference_image: newReq.imageUrl || '',
                    special_instructions: newReq.decorations || newReq.specialInstructions || '',
                    date: now,
                    status: 'pending',
                    price: newReq.basePrice
                };
                await supabase.from('cake_requests').insert([dbReq]);
            } catch (error) {
                console.warn('Note: Cake request saved locally');
            }
        }

        return id;
    };

    const reviewRequest = async (id, status, opts = {}) => {
        const now = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
        
        setRequests((prev) => {
            const next = prev.map((r) => r.id === id ? { 
                ...r, 
                status, 
                approvedPrice: opts.approvedPrice ?? r.approvedPrice, 
                reviewNote: opts.reviewNote ?? r.reviewNote, 
                reviewedBy: opts.reviewedBy ?? r.reviewedBy, 
                reviewedAt: now 
            } : r);
            saveLocalCakeDesigns(next);
            return next;
        });

        if (supabase) {
            try {
                await supabase.from('cake_requests').update({ 
                    status, 
                    price: opts.approvedPrice,
                    admin_notes: opts.reviewNote 
                }).eq('id', id);
            } catch (error) {
                console.warn('Note: Review saved locally');
            }
        }
    };

    const markOrdered = async (id) => {
        setRequests((prev) => {
            const next = prev.map((r) => (r.id === id ? { ...r, ordered: true, status: 'ordered' } : r));
            saveLocalCakeDesigns(next);
            return next;
        });

        if (supabase) {
            try {
                await supabase.from('cake_requests').update({ status: 'ordered' }).eq('id', id);
            } catch (error) {
                console.warn('Note: Status marked ordered locally');
            }
        }
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
