import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey = 'sb_secret_rxuJ7_YrwhLWlxH19ipXSg_oZBk0wOX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log("=== Listing all customers in Supabase ===");
  const { data, error } = await supabase.from('customers').select('*');
  console.log('Customers count:', data?.length, 'Data:', data);
}

testDatabase();
