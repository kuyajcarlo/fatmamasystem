import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { INITIAL_PRODUCTS } from '../../lib/fallbackData';

const ProductContext = createContext(undefined);

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            if (!supabase) {
                // Fallback to initial local data if Supabase isn't configured yet
                setProducts(INITIAL_PRODUCTS);
                setLoading(false);
                return;
            }
            const { data, error } = await supabase.from('products').select('*');
            if (error) throw error;
            if (data) setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products from database');
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (p) => {
        try {
            const newProduct = { ...p, id: `prod-${Date.now()}` };
            if (!supabase) {
                setProducts((prev) => [...prev, newProduct]);
                toast.success('Product added successfully (Local mode)');
                return;
            }
            const { data, error } = await supabase.from('products').insert([newProduct]).select();
            if (error) throw error;
            if (data && data[0]) {
                setProducts((prev) => [...prev, data[0]]);
                toast.success('Product added successfully');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('Failed to add product');
        }
    };

    const updateProduct = async (id, updates) => {
        try {
            if (!supabase) {
                setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
                toast.success('Product updated successfully (Local mode)');
                return;
            }
            const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
            if (error) throw error;
            if (data && data[0]) {
                setProducts((prev) => prev.map((p) => (p.id === id ? data[0] : p)));
                toast.success('Product updated successfully');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product');
        }
    };

    const deleteProduct = async (id) => {
        try {
            if (!supabase) {
                setProducts((prev) => prev.filter((p) => p.id !== id));
                toast.success('Product deleted successfully (Local mode)');
                return;
            }
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            setProducts((prev) => prev.filter((p) => p.id !== id));
            toast.success('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loading }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const ctx = useContext(ProductContext);
    if (!ctx) throw new Error('useProducts must be used within a ProductProvider');
    return ctx;
}
