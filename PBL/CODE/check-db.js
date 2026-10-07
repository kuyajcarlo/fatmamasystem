import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // set in your shell only, never commit
if (!supabaseKey) { console.error('Set SUPABASE_SECRET_KEY in your environment first.'); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: pData, error: pErr } = await supabase.from('products').select('*');
  console.log("Products in DB:", pData?.length, "Error:", pErr);
  
  const { data: iData, error: iErr } = await supabase.from('inventory').select('*');
  console.log("Inventory in DB:", iData?.length, "Error:", iErr);
}
check();
