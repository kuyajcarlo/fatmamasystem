import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey = 'sb_secret_rxuJ7_YrwhLWlxH19ipXSg_oZBk0wOX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log("=== Checking Supabase Database Tables ===");
  const tables = ['customers', 'staff_accounts', 'orders', 'inquiries', 'cake_requests', 'products', 'inventory'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`❌ Table [${table}]:`, error.message);
    } else {
      console.log(`✅ Table [${table}]: ${data.length} records found`);
    }
  }
}

testDatabase();
