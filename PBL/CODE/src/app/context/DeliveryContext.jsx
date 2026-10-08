import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuth } from './AuthContext';

const DeliveryContext = createContext(undefined);

const LOCAL_INFO_KEY = 'mama-co-delivery-info';
const mirrorKey = (email) => `fatmama-addresses:${email}`;

const toModel = (r) => ({
    id: r.id,
    label: r.label || 'Home',
    address: r.street || '',
    city: r.city || '',
    province: r.province || '',
    zipCode: r.zip_code || '',
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    isDefault: !!r.is_default,
});

const readMirror = (email) => {
    try { return JSON.parse(localStorage.getItem(mirrorKey(email)) || '[]'); } catch { return []; }
};
const writeMirror = (email, list) => {
    try { localStorage.setItem(mirrorKey(email), JSON.stringify(list)); } catch {}
};

export function DeliveryProvider({ children }) {
    const { user } = useAuth();
    const email = (user?.email || '').toLowerCase();

    // Name / phone (+ a copy of the default address) are still kept on this device for quick checkout
    const [savedDeliveryInfo, setSavedDeliveryInfo] = useState(() => {
        try { const saved = localStorage.getItem(LOCAL_INFO_KEY); return saved ? JSON.parse(saved) : null; } catch { return null; }
    });
    useEffect(() => {
        if (savedDeliveryInfo) localStorage.setItem(LOCAL_INFO_KEY, JSON.stringify(savedDeliveryInfo));
        else localStorage.removeItem(LOCAL_INFO_KEY);
    }, [savedDeliveryInfo]);

    const [addresses, setAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(false);

    const applyList = useCallback((list) => {
        setAddresses(list);
        if (email) writeMirror(email, list);
    }, [email]);

    const reload = useCallback(async () => {
        if (!email) { setAddresses([]); return; }
        setAddressesLoading(true);
        try {
            const { data, error } = await supabase.from('customer_addresses').select('*').eq('customer_email', email).order('created_at', { ascending: true });
            if (error) throw error;
            let list = (data || []).map(toModel);
            // one-time move of the old "saved on this device" address into the database
            if (list.length === 0) {
                const legacy = (() => { try { return JSON.parse(localStorage.getItem(LOCAL_INFO_KEY) || 'null'); } catch { return null; } })();
                if (legacy?.address && legacy?.city) {
                    const { data: ins, error: insErr } = await supabase.from('customer_addresses').insert([{
                        customer_email: email, label: 'Home', street: legacy.address, city: legacy.city,
                        province: legacy.province || null, zip_code: legacy.zipCode || null,
                        lat: legacy.lat ?? null, lng: legacy.lng ?? null, is_default: true,
                    }]).select().single();
                    if (!insErr && ins) list = [toModel(ins)];
                }
            }
            applyList(list);
        } catch (e) {
            console.warn('Could not load addresses from Supabase, using this device copy:', e?.message || e);
            setAddresses(readMirror(email));
        } finally {
            setAddressesLoading(false);
        }
    }, [email, applyList]);

    useEffect(() => { reload(); }, [reload]);

    const defaultAddress = useMemo(() => addresses.find((a) => a.isDefault) || addresses[0] || null, [addresses]);

    // ── address book actions ─────────────────────────────────────────────
    const saveAddress = async (a) => {
        if (!email) return null;
        const existing = addresses.find((x) => x.id === a.id);
        const isDefault = !!(a.isDefault || addresses.length === 0 || existing?.isDefault);
        const row = {
            label: a.label || 'Home',
            street: String(a.address || '').trim(),
            city: a.city || null,
            province: a.province || null,
            zip_code: a.zipCode || null,
            lat: a.lat ?? null,
            lng: a.lng ?? null,
        };
        const isReal = a.id && !String(a.id).startsWith('local-');
        try {
            if (isDefault) {
                let q = supabase.from('customer_addresses').update({ is_default: false }).eq('customer_email', email).eq('is_default', true);
                if (isReal) q = q.neq('id', a.id);
                const { error: e1 } = await q;
                if (e1) throw e1;
            }
            const res = isReal
                ? await supabase.from('customer_addresses').update({ ...row, is_default: isDefault, updated_at: new Date().toISOString() }).eq('id', a.id).select().single()
                : await supabase.from('customer_addresses').insert([{ ...row, customer_email: email, is_default: isDefault }]).select().single();
            if (res.error) throw res.error;
            await reload();
            return toModel(res.data);
        } catch (e) {
            console.error('Address NOT saved to Supabase:', e);
            toast.warning('Address saved on this device only — could not reach the database.');
            const local = { id: a.id || `local-${Date.now()}`, label: row.label, address: row.street, city: a.city || '', province: a.province || '', zipCode: a.zipCode || '', lat: a.lat ?? null, lng: a.lng ?? null, isDefault };
            const next = [...addresses.filter((x) => x.id !== local.id).map((x) => (isDefault ? { ...x, isDefault: false } : x)), local];
            applyList(next);
            return local;
        }
    };

    const setDefaultAddress = async (id) => {
        try {
            const { error: e1 } = await supabase.from('customer_addresses').update({ is_default: false }).eq('customer_email', email).eq('is_default', true);
            if (e1) throw e1;
            const { error: e2 } = await supabase.from('customer_addresses').update({ is_default: true }).eq('id', id);
            if (e2) throw e2;
            await reload();
        } catch (e) {
            console.error(e);
            toast.error('Could not change the default address.');
        }
    };

    const deleteAddress = async (id) => {
        const wasDefault = addresses.find((a) => a.id === id)?.isDefault;
        try {
            if (!String(id).startsWith('local-')) {
                const { error } = await supabase.from('customer_addresses').delete().eq('id', id);
                if (error) throw error;
            }
            const rest = addresses.filter((a) => a.id !== id);
            if (wasDefault && rest.length && !String(rest[0].id).startsWith('local-')) {
                await supabase.from('customer_addresses').update({ is_default: true }).eq('id', rest[rest.length - 1].id);
            }
            await reload();
            toast.success('Address deleted');
        } catch (e) {
            console.error(e);
            toast.error('Could not delete the address.');
        }
    };

    // ── existing API (name / phone / quick-fill info kept on this device) ──
    const saveDeliveryInfo = (info) => setSavedDeliveryInfo(info);
    const clearDeliveryInfo = () => setSavedDeliveryInfo(null);

    return (<DeliveryContext.Provider value={{
            savedDeliveryInfo, saveDeliveryInfo, clearDeliveryInfo,
            addresses, defaultAddress, addressesLoading,
            saveAddress, setDefaultAddress, deleteAddress,
        }}>
      {children}
    </DeliveryContext.Provider>);
}

export function useDelivery() {
    const context = useContext(DeliveryContext);
    if (!context) throw new Error('useDelivery must be used within a DeliveryProvider');
    return context;
}
