export const INITIAL_PRODUCTS = [
  { id: 'a01', code: 'A01', name: 'Tapsilog', category: 'All Day Breakfast', price: 179, status: 'active' },
  { id: 'b05', code: 'B05', name: 'Blueberry Cheesecake', category: 'Cakes & Pastries', price: 429, status: 'active', popular: true },
  { id: 'h01', code: 'H01', name: 'Halo Halo', category: 'Con Yelo Series', price: 129, status: 'active', popular: true }
];

export const INITIAL_INVENTORY = [
  { id: 'INV-001', name: 'Chocolate Cake Mix', category: 'Ingredients', current_stock: 45, min_stock: 20, max_stock: 100, unit: 'kg', last_restocked: '2026-05-10', supplier: "Baker's Choice", status: 'in-stock' },
  { id: 'INV-002', name: 'Cream Cheese', category: 'Ingredients', current_stock: 12, min_stock: 15, max_stock: 50, unit: 'kg', last_restocked: '2026-05-12', supplier: 'Dairy Fresh', status: 'low-stock' },
  { id: 'INV-006', name: 'Plastic Spoons', category: 'Packaging', current_stock: 0, min_stock: 100, max_stock: 500, unit: 'pcs', last_restocked: '2026-04-28', supplier: 'Utensil Plus', status: 'out-of-stock' }
];
