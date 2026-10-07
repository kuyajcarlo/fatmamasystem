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
            if (error) {
                console.error('Could not load cake_requests from Supabase:', error);
                return;
            }
            if (data) {
                // Map DB schema to frontend expectation
                const mapped = data.map(r => ({
                    id: r.id,
                    userEmail: r.user_email || '',
                    userName: r.user_name || 'Customer',
                    customerEmail: r.user_email || '',
                    customerName: r.user_name || 'Customer',
                    occasion: r.occasion,
                    flavor: r.flavor,
                    size: r.size,
                    sizeName: r.size || '',
                    message: r.message,
                    specialInstructions: r.special_instructions,
                    referenceImage: r.reference_image,
                    imageUrl: r.reference_image,
                    submittedAt: r.date,
                    status: r.status || 'pending',
                    approvedPrice: (r.status === 'approved' || r.status === 'ordered') && r.price != null ? Number(r.price) : undefined,
                    basePrice: Number(r.price) || 0,
                    reviewNote: r.admin_notes,
                    ordered: r.status === 'ordered',
                    layers: r.layers || 1,
                    frosting: r.frosting || '',
                    topper: String(r.topper || '').startsWith('other:') ? 'other' : (r.topper || 'none'),
                    otherTopper: String(r.topper || '').startsWith('other:') ? String(r.topper).slice(6) : '',
                    color: r.color_code || '',
                    text: r.message || '',
                    decorations: r.special_instructions || ''
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
                    date: new Date().toISOString(),
                    status: 'pending',
                    price: newReq.basePrice
                };
                const fullReq = {
                    ...dbReq,
                    layers: Number(newReq.layers) || 1,
                    frosting: newReq.frosting || '',
                    topper: newReq.topper === 'other' ? `other:${newReq.otherTopper || ''}` : (newReq.topper || ''),
                    color_code: newReq.color || ''
                };
                let { error } = await supabase.from('cake_requests').insert([fullReq]);
                if (error && error.code === 'PGRST204') {
                    // table is missing one of the extra columns -> save the core fields instead of losing the request
                    ({ error } = await supabase.from('cake_requests').insert([dbReq]));
                }
                if (error) throw error;
            } catch (error) {
                console.error('Cake request NOT saved to Supabase:', error);
                toast.warning('Saved on this device only — could not reach the database.');
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
                const { error } = await supabase.from('cake_requests').update({ 
                    status, 
                    price: opts.approvedPrice,
                    admin_notes: opts.reviewNote 
                }).eq('id', id);
                if (error) throw error;
            } catch (error) {
                console.error('Review NOT saved to Supabase:', error);
                toast.warning('Decision saved on this device only — could not reach the database.');
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
                const { error } = await supabase.from('cake_requests').update({ status: 'ordered' }).eq('id', id);
                if (error) throw error;
            } catch (error) {
                console.error('Ordered status NOT saved to Supabase:', error);
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
