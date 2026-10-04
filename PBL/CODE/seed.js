import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey = 'sb_secret_rxuJ7_YrwhLWlxH19ipXSg_oZBk0wOX';
const supabase = createClient(supabaseUrl, supabaseKey);

const INITIAL_PRODUCTS = [
    { id: 'a01', code: 'A01', name: 'Tapsilog', category: 'All Day Breakfast', price: 179, status: 'active' },
    { id: 'a02', code: 'A02', name: 'Spicy Tapsilog', category: 'All Day Breakfast', price: 179, status: 'active' },
    { id: 'b01', code: 'B01', name: 'Chocolate Moist Decadent Cake', category: 'Cakes & Pastries', price: 288, status: 'active', popular: true },
    { id: 'b05', code: 'B05', name: 'Blueberry Cheesecake', category: 'Cakes & Pastries', price: 429, status: 'active', popular: true, description: '5" velvety, rich, and creamy cheesecake' },
    { id: 'h01', code: 'H01', name: 'Halo Halo', category: 'Con Yelo Series', price: 129, status: 'active', popular: true },
    { id: 'c02', code: 'C02', name: 'Vanilla Milk Coffee', category: 'Milk Coffee', price: 119, status: 'active' },
    { id: 'd1', code: 'D1', name: 'Strawberry Milk', category: 'Non Coffee', price: 139, status: 'active', description: '16oz' },
    { id: 'k01', code: 'K01', name: 'Fries 100g', category: 'Side/s', price: 60, status: 'active', popular: true },
    { id: 'e01', code: 'E01', name: 'Extra Plain Rice', category: 'Extra/s', price: 30, status: 'active' }
];

const INITIAL_INVENTORY = [
    { id: 'INV-001', code: 'C-0001', name: 'Chocolate Cake Mix', category: 'Ingredients', current_stock: 45, min_stock: 20, max_stock: 100, unit: 'kg', last_restocked: '2026-05-10', supplier: "Baker's Choice", status: 'in-stock' },
    { id: 'INV-002', code: 'C-0002', name: 'Cream Cheese', category: 'Ingredients', current_stock: 12, min_stock: 15, max_stock: 50, unit: 'kg', last_restocked: '2026-05-12', supplier: 'Dairy Fresh', status: 'low-stock' },
    { id: 'INV-006', code: 'C-0006', name: 'Plastic Spoons', category: 'Packaging', current_stock: 0, min_stock: 100, max_stock: 500, unit: 'pcs', last_restocked: '2026-04-28', supplier: 'Utensil Plus', status: 'out-of-stock' }
];

async function seed() {
    console.log("Seeding products...");
    const { error: pErr } = await supabase.from('products').upsert(INITIAL_PRODUCTS);
    if (pErr) console.error(pErr);
    else console.log("Products seeded!");

    console.log("Seeding inventory...");
    const { error: iErr } = await supabase.from('inventory').upsert(INITIAL_INVENTORY);
    if (iErr) console.error(iErr);
    else console.log("Inventory seeded!");
}

seed();
