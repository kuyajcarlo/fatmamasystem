import { createContext, useContext, useState, useEffect } from 'react';
const OrderContext = createContext(undefined);
export function OrderProvider({ children }) {
    const [orders, setOrders] = useState(() => {
        // Load orders from localStorage on initialization
        const savedOrders = localStorage.getItem('mama-co-orders');
        return savedOrders ? JSON.parse(savedOrders) : [];
    });
    // Save orders to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('mama-co-orders', JSON.stringify(orders));
    }, [orders]);
    const addOrder = (orderData) => {
        const newOrder = {
            ...orderData,
            id: `ORD-${Date.now().toString().slice(-6)}`,
            date: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }),
            status: 'pending',
        };
        setOrders((prevOrders) => [newOrder, ...prevOrders]);
    };
    const updateOrderStatus = (orderId, status) => {
        setOrders((prevOrders) => prevOrders.map((order) => order.id === orderId ? { ...order, status } : order));
    };
    const removeOrder = (orderId) => {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
    };
    const getOrderById = (orderId) => {
        return orders.find((order) => order.id === orderId);
    };
    return (<OrderContext.Provider value={{
            orders,
            addOrder,
            updateOrderStatus,
            removeOrder,
            getOrderById,
        }}>
      {children}
    </OrderContext.Provider>);
}
export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
}
