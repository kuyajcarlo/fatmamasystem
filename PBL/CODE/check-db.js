import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey = 'sb_secret_rxuJ7_YrwhLWlxH19ipXSg_oZBk0wOX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: pData, error: pErr } = await supabase.from('products').select('*');
  console.log("Products in DB:", pData?.length, "Error:", pErr);
  
  const { data: iData, error: iErr } = await supabase.from('inventory').select('*');
  console.log("Inventory in DB:", iData?.length, "Error:", iErr);
}
check();
