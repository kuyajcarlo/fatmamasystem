import { createContext, useContext, useEffect, useState } from 'react';

const CART_KEY = 'fatmama-cart';
const loadCart = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
};
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    // the cart is kept in the browser, so a refresh or a closed tab does not empty it
    const [items, setItems] = useState(loadCart);
    useEffect(() => {
        try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* storage full / blocked */ }
    }, [items]);
    const addItem = (item) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.id === item.id);
            if (existingItem) {
                return prevItems.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };
    const removeItem = (id) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };
    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        setItems((prevItems) => prevItems.map((item) => item.id === id ? { ...item, quantity } : item));
    };
    const clearCart = () => {
        setItems([]);
    };
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return (<CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice,
        }}>
      {children}
    </CartContext.Provider>);
}
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
