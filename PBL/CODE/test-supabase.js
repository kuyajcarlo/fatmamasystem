import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey = 'sb_secret_rxuJ7_YrwhLWlxH19ipXSg_oZBk0wOX';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing Products Table...");
  const { data: pData, error: pErr } = await supabase.from('products').select('*');
  console.log("Products Data:", pData);
  console.log("Products Error:", pErr);
  
  console.log("\nTesting Inventory Table...");
  const { data: iData, error: iErr } = await supabase.from('inventory').select('*');
  console.log("Inventory Data:", iData);
  console.log("Inventory Error:", iErr);
}

test();
