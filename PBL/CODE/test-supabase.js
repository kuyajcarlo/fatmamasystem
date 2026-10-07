import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey = 'sb_secret_rxuJ7_YrwhLWlxH19ipXSg_oZBk0wOX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAll() {
  console.log("=== FINAL VERIFICATION OF SUPABASE CONNECTION ===");
  const tables = ['customers', 'staff_accounts', 'orders', 'inquiries', 'cake_requests', 'products', 'inventory'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*');
    if (error) {
      console.log(`❌ ${t}: ${error.message}`);
    } else {
      console.log(`✅ ${t}: ${data.length} records`);
    }
  }
}

testAll();
