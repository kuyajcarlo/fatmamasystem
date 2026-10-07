import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyummeftwbyytltkcnty.supabase.co';
// Using the service role key only from this secure backend script to push the data
const supabaseKey = 'sb_secret_rxuJ7_YrwhLWlxH19ipXSg_oZBk0wOX';
const supabase = createClient(supabaseUrl, supabaseKey);

const ALL_PRODUCTS = [
    // All Day Breakfast
    { id: 'a01', code: 'A01', name: 'Tapsilog', category: 'All Day Breakfast', price: 179, status: 'active', popular: false, "from": false },
    { id: 'a02', code: 'A02', name: 'Spicy Tapsilog', category: 'All Day Breakfast', price: 179, status: 'active', popular: false, "from": false },
    { id: 'a03', code: 'A03', name: 'Tocilog', category: 'All Day Breakfast', price: 169, status: 'active', popular: false, "from": false },
    { id: 'a04', code: 'A04', name: 'Bangsilog (Half)', category: 'All Day Breakfast', price: 189, status: 'active', popular: false, "from": true },
    { id: 'a05', code: 'A05', name: 'Porksilog', category: 'All Day Breakfast', price: 169, status: 'active', popular: false, "from": false },
    { id: 'a06', code: 'A06', name: 'Spamsilog', category: 'All Day Breakfast', price: 189, status: 'active', popular: false, "from": false },
    { id: 'a07', code: 'A07', name: 'Longsilog', category: 'All Day Breakfast', price: 159, status: 'active', popular: false, "from": false },
    { id: 'a08', code: 'A08', name: 'Chicken Longsilog', category: 'All Day Breakfast', price: 159, status: 'active', popular: false, "from": false },
    { id: 'a10', code: 'A10', name: 'Hotsilog (Tj Jumbo)', category: 'All Day Breakfast', price: 169, status: 'active', popular: false, "from": false },
    { id: 'a11', code: 'A11', name: 'Cornsilog', category: 'All Day Breakfast', price: 159, status: 'active', popular: false, "from": false },
    { id: 'a12', code: 'A12', name: 'Chili Garlic Cornsilog', category: 'All Day Breakfast', price: 169, status: 'active', popular: false, "from": false },
    { id: 'a13', code: 'A13', name: 'Hungarian Silog', category: 'All Day Breakfast', price: 179, status: 'active', popular: false, "from": false },
    
    // Cakes & Pastries
    { id: 'b01', code: 'B01', name: 'Chocolate Moist Decadent Cake', category: 'Cakes & Pastries', price: 288, status: 'active', popular: true, "from": false },
    { id: 'b02', code: 'B02', name: 'Jr Chocolate Moist Decadent Cake', category: 'Cakes & Pastries', price: 149, status: 'active', popular: true, "from": false },
    { id: 'b05', code: 'B05', name: 'Blueberry Cheesecake', category: 'Cakes & Pastries', price: 429, status: 'active', popular: true, description: '5" velvety, rich, and creamy cheesecake topped with blueberries and whipped cream', "from": false },
    { id: 'b06', code: 'B06', name: 'Strawberry Cheesecake', category: 'Cakes & Pastries', price: 429, status: 'active', popular: false, "from": false },
    { id: 'b07', code: 'B07', name: 'Peach Mango Cheesecake', category: 'Cakes & Pastries', price: 429, status: 'active', popular: false, "from": false },
    { id: 'b08', code: 'B08', name: 'Biscoff Cheesecake', category: 'Cakes & Pastries', price: 449, status: 'active', popular: false, "from": false },
    { id: 'b09', code: 'B09', name: 'Nutella Cheesecake', category: 'Cakes & Pastries', price: 449, status: 'active', popular: false, "from": false },
    { id: 'b10', code: 'B10', name: 'Ferrero Rocher Cheesecake', category: 'Cakes & Pastries', price: 479, status: 'active', popular: false, "from": false },
    { id: 'b12', code: 'B12', name: 'Burnt Basque Cheesecake', category: 'Cakes & Pastries', price: 429, status: 'active', popular: false, "from": false },
    { id: 'b13', code: 'B13', name: 'Fruity Burnt Basque Cheesecake', category: 'Cakes & Pastries', price: 449, status: 'active', popular: false, "from": false },
    { id: 'b14', code: 'B14', name: 'Decadent Burnt Basque Cheesecake', category: 'Cakes & Pastries', price: 449, status: 'active', popular: false, "from": true },
    
    // Con Yelo Series
    { id: 'h01', code: 'H01', name: 'Halo Halo', category: 'Con Yelo Series', price: 129, status: 'active', popular: true, "from": false },
    { id: 'h02', code: 'H02', name: 'Mais Con Yelo', category: 'Con Yelo Series', price: 119, status: 'active', popular: false, "from": false },
    { id: 'h03', code: 'H03', name: 'Banana Con Yelo', category: 'Con Yelo Series', price: 119, status: 'active', popular: true, "from": false },
    
    // Milk Coffee
    { id: 'c01', code: 'C01', name: 'Brown Sugar Milk Coffee', category: 'Milk Coffee', price: 109, status: 'active', popular: false, "from": false },
    { id: 'c02', code: 'C02', name: 'Vanilla Milk Coffee', category: 'Milk Coffee', price: 119, status: 'active', popular: false, "from": false },
    { id: 'c03', code: 'C03', name: 'Hazelnut Milk Coffee', category: 'Milk Coffee', price: 109, status: 'active', popular: false, "from": false },
    { id: 'c04', code: 'C04', name: 'Caramel Milk Coffee', category: 'Milk Coffee', price: 119, status: 'active', popular: false, "from": false },
    { id: 'c05', code: 'C05', name: 'White Chocolate Milk Coffee', category: 'Milk Coffee', price: 109, status: 'active', popular: false, "from": false },
    { id: 'c06', code: 'C06', name: 'Chocolate Milk Coffee', category: 'Milk Coffee', price: 119, status: 'active', popular: false, "from": false },
    { id: 'c07', code: 'C07', name: 'Caramel Macchiatto Milk Coffee', category: 'Milk Coffee', price: 109, status: 'active', popular: false, "from": false },
    { id: 'c08', code: 'C08', name: 'Choco Hazelnut Milk Coffee', category: 'Milk Coffee', price: 109, status: 'active', popular: false, "from": false },
    
    // Non Coffee
    { id: 'd1', code: 'D1', name: 'Strawberry Milk', category: 'Non Coffee', price: 139, status: 'active', popular: false, description: '16oz', "from": false },
    { id: 'd2', code: 'D2', name: 'Creamy Strawberry Milk with Matcha Foam', category: 'Non Coffee', price: 159, status: 'active', popular: false, description: '16oz', "from": false },
    { id: 'd3', code: 'D3', name: 'Ube Milk', category: 'Non Coffee', price: 139, status: 'active', popular: false, description: 'Ube Latte 16oz', "from": false },
    { id: 'd4', code: 'D4', name: 'Ube Milk with Coconut Foam', category: 'Non Coffee', price: 149, status: 'active', popular: false, "from": false },
    { id: 'd5', code: 'D5', name: 'Matcha Milk', category: 'Non Coffee', price: 149, status: 'active', popular: false, description: '16oz', "from": false },
    
    // Soda Pop
    { id: 'f01', code: 'F01', name: 'Lychee Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active', popular: false, "from": false },
    { id: 'f02', code: 'F02', name: 'Green Apple Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active', popular: false, "from": false },
    { id: 'f03', code: 'F03', name: 'Honey Peach Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active', popular: false, "from": false },
    { id: 'f04', code: 'F04', name: 'Kiwi Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active', popular: false, "from": false },
    { id: 'f05', code: 'F05', name: 'Strawberry Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active', popular: false, "from": false },
    { id: 'f06', code: 'F06', name: 'Blueberry Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active', popular: false, "from": false },
    { id: 'f07', code: 'F07', name: 'Mango Fruit Soda Pop', category: 'Soda Pop', price: 109, status: 'active', popular: false, "from": false },
    
    // Side/s & Extra/s
    { id: 'k01', code: 'K01', name: 'Fries 100g', category: 'Side/s', price: 60, status: 'active', popular: true, "from": false },
    { id: 'k02', code: 'K02', name: 'Hashbrown (1pc)', category: 'Side/s', price: 60, status: 'active', popular: false, "from": false },
    { id: 'e01', code: 'E01', name: 'Extra Plain Rice', category: 'Extra/s', price: 30, status: 'active', popular: false, "from": false },
    { id: 'e02', code: 'E02', name: 'Extra Soy Garlic Fried Rice', category: 'Extra/s', price: 35, status: 'active', popular: false, "from": false },
    { id: 'e03', code: 'E03', name: 'Extra Egg', category: 'Extra/s', price: 30, status: 'active', popular: false, "from": false },
    { id: 'e04', code: 'E04', name: 'Extra Chili Garlic Sauce', category: 'Extra/s', price: 30, status: 'active', popular: false, "from": false },
    { id: 'e05', code: 'E05', name: 'Extra Spiced Vinegar', category: 'Extra/s', price: 30, status: 'active', popular: false, "from": false },
    { id: 'e07', code: 'E07', name: 'Salted Egg Salad', category: 'Extra/s', price: 55, status: 'active', popular: false, "from": false },
    
    // Beverage & Other/s & Dessert
    { id: 'g01', code: 'G01', name: 'Cucumber Lemonade', category: 'Beverage', price: 55, status: 'active', popular: false, "from": false },
    { id: 'g02', code: 'G02', name: 'Lychee Lemonade', category: 'Beverage', price: 55, status: 'active', popular: false, "from": false },
    { id: 'g03', code: 'G03', name: 'Red Iced Tea', category: 'Beverage', price: 55, status: 'active', popular: false, "from": false },
    { id: 'j01', code: 'J01', name: 'Candle Blue', category: 'Other/s', price: 9, status: 'active', popular: false, "from": false },
    { id: 'j02', code: 'J02', name: 'Candle Red', category: 'Other/s', price: 9, status: 'active', popular: false, "from": false },
    { id: 'j03', code: 'J03', name: 'Candle Yellow', category: 'Other/s', price: 9, status: 'active', popular: false, "from": false },
    { id: 'j04', code: 'J04', name: 'Candle Pink', category: 'Other/s', price: 9, status: 'active', popular: false, "from": false },
    { id: 'j05', code: 'J05', name: 'Candle White', category: 'Other/s', price: 9, status: 'active', popular: false, "from": false },
    { id: 'j06', code: 'J06', name: 'Happy Birthday Topper', category: 'Other/s', price: 20, status: 'active', popular: false, "from": false },
    { id: 'des-turon', code: 'D-TUR', name: 'Turon De Banana', category: 'Dessert', price: 119, status: 'active', popular: false, "from": false },
    { id: 'des-leche', code: 'D-LEC', name: 'Leche Flan', category: 'Dessert', price: 169, status: 'active', popular: false, "from": false }
];

const FULL_INVENTORY = [
    { id: 'INV-001', code: 'C-0001', name: 'Chocolate Cake Mix', category: 'Ingredients', current_stock: 45, min_stock: 20, max_stock: 100, unit: 'kg', last_restocked: '2026-05-10', supplier: "Baker's Choice", status: 'in-stock' },
    { id: 'INV-002', code: 'C-0002', name: 'Cream Cheese', category: 'Ingredients', current_stock: 12, min_stock: 15, max_stock: 50, unit: 'kg', last_restocked: '2026-05-12', supplier: 'Dairy Fresh', status: 'low-stock' },
    { id: 'INV-003', code: 'C-0003', name: 'Blueberry Filling', category: 'Ingredients', current_stock: 28, min_stock: 10, max_stock: 40, unit: 'kg', last_restocked: '2026-05-14', supplier: 'Fruit Delight Co.', status: 'in-stock' },
    { id: 'INV-004', code: 'C-0004', name: 'Biscoff Cookie Crumbs', category: 'Ingredients', current_stock: 8, min_stock: 12, max_stock: 30, unit: 'kg', last_restocked: '2026-05-08', supplier: 'Cookie Haven', status: 'low-stock' },
    { id: 'INV-005', code: 'C-0005', name: 'Cake Boxes (8 inch)', category: 'Packaging', current_stock: 150, min_stock: 50, max_stock: 300, unit: 'pcs', last_restocked: '2026-05-15', supplier: 'Pack Pro', status: 'in-stock' },
    { id: 'INV-006', code: 'C-0006', name: 'Plastic Spoons', category: 'Packaging', current_stock: 0, min_stock: 100, max_stock: 500, unit: 'pcs', last_restocked: '2026-04-28', supplier: 'Utensil Plus', status: 'out-of-stock' },
    { id: 'INV-007', code: 'C-0007', name: 'Vanilla Extract', category: 'Ingredients', current_stock: 5, min_stock: 8, max_stock: 20, unit: 'L', last_restocked: '2026-05-11', supplier: 'Flavor World', status: 'low-stock' },
    { id: 'INV-008', code: 'C-0008', name: 'Food Coloring Set', category: 'Ingredients', current_stock: 25, min_stock: 10, max_stock: 40, unit: 'sets', last_restocked: '2026-05-13', supplier: 'Color Magic', status: 'in-stock' },
];

async function seedAll() {
    console.log("Seeding all 56 products...");
    const { error: pErr } = await supabase.from('products').upsert(ALL_PRODUCTS);
    if (pErr) console.error("Products error:", pErr);
    else console.log("All products seeded successfully!");

    console.log("Seeding all inventory...");
    const { error: iErr } = await supabase.from('inventory').upsert(FULL_INVENTORY);
    if (iErr) console.error("Inventory error:", iErr);
    else console.log("All inventory seeded successfully!");
}

seedAll();
