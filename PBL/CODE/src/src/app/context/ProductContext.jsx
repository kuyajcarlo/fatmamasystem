import { createContext, useContext, useState } from 'react';
const INITIAL_PRODUCTS = [
    // All Day Breakfast
    { id: 'a01', code: 'A01', name: 'Tapsilog', category: 'All Day Breakfast', price: 179, status: 'active' },
    { id: 'a02', code: 'A02', name: 'Spicy Tapsilog', category: 'All Day Breakfast', price: 179, status: 'active' },
    { id: 'a03', code: 'A03', name: 'Tocilog', category: 'All Day Breakfast', price: 169, status: 'active' },
    { id: 'a04', code: 'A04', name: 'Bangsilog (Half)', category: 'All Day Breakfast', price: 189, status: 'active', from: true },
    { id: 'a05', code: 'A05', name: 'Porksilog', category: 'All Day Breakfast', price: 169, status: 'active' },
    { id: 'a06', code: 'A06', name: 'Spamsilog', category: 'All Day Breakfast', price: 189, status: 'active' },
    { id: 'a07', code: 'A07', name: 'Longsilog', category: 'All Day Breakfast', price: 159, status: 'active' },
    { id: 'a10', code: 'A10', name: 'Hotsilog (Tj Jumbo)', category: 'All Day Breakfast', price: 169, status: 'active' },
    { id: 'a08', code: 'A08', name: 'Chicken Longsilog', category: 'All Day Breakfast', price: 159, status: 'active' },
    { id: 'a11', code: 'A11', name: 'Cornsilog', category: 'All Day Breakfast', price: 159, status: 'active' },
    { id: 'a12', code: 'A12', name: 'Chili Garlic Cornsilog', category: 'All Day Breakfast', price: 169, status: 'active' },
    { id: 'a13', code: 'A13', name: 'Hungarian Silog', category: 'All Day Breakfast', price: 179.1, status: 'active' },
    // Cakes & Pastries
    { id: 'b01', code: 'B01', name: 'Chocolate Moist Decadent Cake', category: 'Cakes & Pastries', price: 288, status: 'active', popular: true },
    { id: 'b02', code: 'B02', name: 'Jr Chocolate Moist Decadent Cake', category: 'Cakes & Pastries', price: 149, status: 'active', popular: true },
    { id: 'b05', code: 'B05', name: 'Blueberry Cheesecake', category: 'Cakes & Pastries', price: 429, status: 'active', popular: true, description: '5" velvety, rich, and creamy cheesecake topped with blueberries and whipped cream' },
    { id: 'b06', code: 'B06', name: 'Strawberry Cheesecake', category: 'Cakes & Pastries', price: 429, status: 'active' },
    { id: 'b07', code: 'B07', name: 'Peach Mango Cheesecake', category: 'Cakes & Pastries', price: 429, status: 'active' },
    { id: 'b08', code: 'B08', name: 'Biscoff Cheesecake', category: 'Cakes & Pastries', price: 449, status: 'active' },
    { id: 'b09', code: 'B09', name: 'Nutella Cheesecake', category: 'Cakes & Pastries', price: 449, status: 'active' },
    { id: 'b10', code: 'B10', name: 'Ferrero Rocher Cheesecake', category: 'Cakes & Pastries', price: 479, status: 'active' },
    { id: 'b12', code: 'B12', name: 'Burnt Basque Cheesecake', category: 'Cakes & Pastries', price: 429, status: 'active' },
    { id: 'b13', code: 'B13', name: 'Fruity Burnt Basque Cheesecake', category: 'Cakes & Pastries', price: 449, status: 'active' },
    { id: 'b14', code: 'B14', name: 'Decadent Burnt Basque Cheesecake', category: 'Cakes & Pastries', price: 449, status: 'active', from: true },
    // Con Yelo Series
    { id: 'h01', code: 'H01', name: 'Halo Halo', category: 'Con Yelo Series', price: 129, status: 'active', popular: true },
    { id: 'h02', code: 'H02', name: 'Mais Con Yelo', category: 'Con Yelo Series', price: 119, status: 'active' },
    { id: 'h03', code: 'H03', name: 'Banana Con Yelo', category: 'Con Yelo Series', price: 119, status: 'active', popular: true },
    // Milk Coffee
    { id: 'c02', code: 'C02', name: 'Vanilla Milk Coffee', category: 'Milk Coffee', price: 119, status: 'active' },
    { id: 'c04', code: 'C04', name: 'Caramel Milk Coffee', category: 'Milk Coffee', price: 119, status: 'active' },
    { id: 'c06', code: 'C06', name: 'Chocolate Milk Coffee', category: 'Milk Coffee', price: 119, status: 'active' },
    { id: 'c01', code: 'C01', name: 'Brown Sugar Milk Coffee', category: 'Milk Coffee', price: 109, status: 'active' },
    { id: 'c03', code: 'C03', name: 'Hazelnut Milk Coffee', category: 'Milk Coffee', price: 109, status: 'active' },
    { id: 'c05', code: 'C05', name: 'White Chocolate Milk Coffee', category: 'Milk Coffee', price: 109, status: 'active' },
    { id: 'c07', code: 'C07', name: 'Caramel Macchiatto Milk Coffee', category: 'Milk Coffee', price: 109, status: 'active' },
    { id: 'c08', code: 'C08', name: 'Choco Hazelnut Milk Coffee', category: 'Milk Coffee', price: 109, status: 'active' },
    // Non Coffee
    { id: 'd1', code: 'D1', name: 'Strawberry Milk', category: 'Non Coffee', price: 139, status: 'active', description: '16oz' },
    { id: 'd2', code: 'D2', name: 'Creamy Strawberry Milk with Matcha Foam', category: 'Non Coffee', price: 159, status: 'active', description: '16oz' },
    { id: 'd3', code: 'D3', name: 'Ube Milk', category: 'Non Coffee', price: 139, status: 'active', description: 'Ube Latte 16oz' },
    { id: 'd4', code: 'D4', name: 'Ube Milk with Coconut Foam', category: 'Non Coffee', price: 149, status: 'active' },
    { id: 'd5', code: 'D5', name: 'Matcha Milk', category: 'Non Coffee', price: 149, status: 'active', description: '16oz' },
    // Soda Pop
    { id: 'f01', code: 'F01', name: 'Lychee Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active' },
    { id: 'f02', code: 'F02', name: 'Green Apple Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active' },
    { id: 'f03', code: 'F03', name: 'Honey Peach Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active' },
    { id: 'f04', code: 'F04', name: 'Kiwi Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active' },
    { id: 'f05', code: 'F05', name: 'Strawberry Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active' },
    { id: 'f06', code: 'F06', name: 'Blueberry Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active' },
    { id: 'f07', code: 'F07', name: 'Mango Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active' },
    // Side/s
    { id: 'k01', code: 'K01', name: 'Fries 100g', category: 'Side/s', price: 60, status: 'active', popular: true },
    { id: 'k02', code: 'K02', name: 'Hashbrown (1pc)', category: 'Side/s', price: 60, status: 'active' },
    // Extra/s
    { id: 'e01', code: 'E01', name: 'Extra Plain Rice', category: 'Extra/s', price: 30, status: 'active' },
    { id: 'e02', code: 'E02', name: 'Extra Soy Garlic Fried Rice', category: 'Extra/s', price: 35, status: 'active' },
    { id: 'e03', code: 'E03', name: 'Extra Egg', category: 'Extra/s', price: 30, status: 'active' },
    { id: 'e04', code: 'E04', name: 'Extra Chili Garlic Sauce', category: 'Extra/s', price: 30, status: 'active' },
    { id: 'e05', code: 'E05', name: 'Extra Spiced Vinegar', category: 'Extra/s', price: 30, status: 'active' },
    { id: 'e07', code: 'E07', name: 'Salted Egg Salad', category: 'Extra/s', price: 55, status: 'active' },
    // Beverage
    { id: 'g01', code: 'G01', name: 'Cucumber Lemonade', category: 'Beverage', price: 55, status: 'active' },
    { id: 'g02', code: 'G02', name: 'Lychee Lemonade', category: 'Beverage', price: 55, status: 'active' },
    { id: 'g03', code: 'G03', name: 'Red Iced Tea', category: 'Beverage', price: 55, status: 'active' },
    // Other/s
    { id: 'j01', code: 'J01', name: 'Candle Blue', category: 'Other/s', price: 9, status: 'active' },
    { id: 'j02', code: 'J02', name: 'Candle Red', category: 'Other/s', price: 9, status: 'active' },
    { id: 'j03', code: 'J03', name: 'Candle Yellow', category: 'Other/s', price: 9, status: 'active' },
    { id: 'j04', code: 'J04', name: 'Candle Pink', category: 'Other/s', price: 9, status: 'active' },
    { id: 'j05', code: 'J05', name: 'Candle White', category: 'Other/s', price: 9, status: 'active' },
    { id: 'j06', code: 'J06', name: 'Happy Birthday Topper', category: 'Other/s', price: 20, status: 'active' },
    // Dessert
    { id: 'des-turon', code: '', name: 'Turon De Banana', category: 'Dessert', price: 119, status: 'active' },
    { id: 'des-leche', code: '', name: 'Leche Flan', category: 'Dessert', price: 169, status: 'active' },
];
const LS_KEY = 'mama-co-products';
function load() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
    }
    catch {
        return INITIAL_PRODUCTS;
    }
}
function save(products) {
    localStorage.setItem(LS_KEY, JSON.stringify(products));
}
const ProductContext = createContext(undefined);
export function ProductProvider({ children }) {
    const [products, setProducts] = useState(load);
    const addProduct = (p) => {
        const newProduct = { ...p, id: `prod-${Date.now()}` };
        setProducts((prev) => {
            const next = [...prev, newProduct];
            save(next);
            return next;
        });
    };
    const updateProduct = (id, updates) => {
        setProducts((prev) => {
            const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
            save(next);
            return next;
        });
    };
    const deleteProduct = (id) => {
        setProducts((prev) => {
            const next = prev.filter((p) => p.id !== id);
            save(next);
            return next;
        });
    };
    return (<ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>);
}
export function useProducts() {
    const ctx = useContext(ProductContext);
    if (!ctx)
        throw new Error('useProducts must be used within a ProductProvider');
    return ctx;
}
