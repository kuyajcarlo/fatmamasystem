import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const OrderContext = createContext(undefined);
const LOCAL_STORAGE_KEY = 'mama-co-orders';

function getLocalOrders() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocalOrders(items) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export function OrderProvider({ children }) {
    const [orders, setOrders] = useState(() => getLocalOrders());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            if (!supabase) return;
            const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
            if (!error && data) {
                // Map remote schema to frontend model
                const mapped = data.map(o => ({
                    id: o.id,
                    customer: o.user_name || o.customer || 'Customer',
                    user_name: o.user_name || o.customer || 'Customer',
                    email: o.user_email || o.email,
                    user_email: o.user_email || o.email,
                    phone: o.phone || '',
                    // older orders had a map link glued to the address text; strip it
                    address: String(o.delivery_address || o.address || '').replace(/\s*\|\s*Map pin:.*$/, ''),
                    lat: o.delivery_lat ?? null,
                    lng: o.delivery_lng ?? null,
                    city: o.city || '',
                    province: o.province || '',
                    zipCode: o.zipCode || '',
                    notes: o.notes || '',
                    items: Array.isArray(o.items) ? o.items : [],
                    total: Number(o.total) || 0,
                    deliveryFee: Number(o.deliveryFee) || 50,
                    finalTotal: Number(o.total) || 0,
                    paymentMethod: o.paymentMethod || 'cod',
                    status: o.status || 'pending',
                    date: o.date || new Date().toISOString(),
                }));

                const local = getLocalOrders();
                const ids = new Set(mapped.map(m => m.id));
                const merged = [...mapped, ...local.filter(l => !ids.has(l.id))];
                setOrders(merged);
                saveLocalOrders(merged);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const addOrder = async (orderData) => {
        const id = `ORD-${Date.now().toString().slice(-6)}`;
        const customerName = orderData.customer || orderData.userName || `${orderData.firstName || ''} ${orderData.lastName || ''}`.trim() || 'Customer';
        const customerEmail = orderData.email || orderData.userEmail || '';
        const now = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

        const fullOrder = {
            id,
            customer: customerName,
            user_name: customerName,
            email: customerEmail,
            user_email: customerEmail,
            phone: orderData.phone || '',
            address: orderData.address || '',
            city: orderData.city || '',
            province: orderData.province || '',
            zipCode: orderData.zipCode || '',
            lat: orderData.lat || null,
            lng: orderData.lng || null,
            delivery_address: `${orderData.address || ''}, ${orderData.city || ''}, ${orderData.province || ''} ${orderData.zipCode || ''}`.trim(),
            notes: orderData.notes || '',
            items: orderData.items || [],
            total: orderData.total || 0,
            deliveryFee: orderData.deliveryFee || 50,
            finalTotal: orderData.finalTotal || ((orderData.total || 0) + (orderData.deliveryFee || 50)),
            paymentMethod: orderData.paymentMethod || 'cod',
            status: 'pending',
            date: now,
        };

        // Always save locally immediately
        setOrders((prev) => {
            const next = [fullOrder, ...prev];
            saveLocalOrders(next);
            return next;
        });

        if (supabase) {
            try {
                const dbOrder = {
                    id,
                    user_email: customerEmail,
                    user_name: customerName,
                    date: new Date().toISOString(),
                    status: 'pending',
                    total: fullOrder.finalTotal,
                    delivery_address: fullOrder.delivery_address,
                    delivery_lat: fullOrder.lat,
                    delivery_lng: fullOrder.lng,
                    items: fullOrder.items
                };
                let { error } = await supabase.from('orders').insert([dbOrder]);
                if (error && error.code === 'PGRST204') {
                    // delivery_lat / delivery_lng columns not created yet (run address_book.sql) -> still save the order
                    const { delivery_lat, delivery_lng, ...basic } = dbOrder;
                    ({ error } = await supabase.from('orders').insert([basic]));
                }
                if (error) throw error;
            } catch (error) {
                console.error('Order NOT saved to Supabase:', error);
                toast.warning('Order saved on this device only — could not reach the database.');
            }
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        setOrders((prev) => {
            const next = prev.map((o) => o.id === orderId ? { ...o, status } : o);
            saveLocalOrders(next);
            return next;
        });

        if (supabase) {
            try {
                await supabase.from('orders').update({ status }).eq('id', orderId);
            } catch (error) {
                console.warn('Note: Order status updated locally');
            }
        }
    };

    const removeOrder = async (orderId) => {
        setOrders((prev) => {
            const next = prev.filter((o) => o.id !== orderId);
            saveLocalOrders(next);
            return next;
        });

        if (supabase) {
            try {
                await supabase.from('orders').delete().eq('id', orderId);
            } catch (error) {
                console.warn('Note: Order removed locally');
            }
        }
    };

    const getOrderById = (orderId) => {
        return orders.find((order) => order.id === orderId);
    };

    return (
        <OrderContext.Provider value={{
            orders,
            addOrder,
            updateOrderStatus,
            removeOrder,
            getOrderById,
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
}
