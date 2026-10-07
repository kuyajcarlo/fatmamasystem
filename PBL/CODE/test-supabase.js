import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // set in your shell only, never commit
if (!supabaseKey) { console.error('Set SUPABASE_SECRET_KEY in your environment first.'); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAll() {
  console.log("=== Testing products SELECT ===");
  const anonKey = 'sb_publishable_Soxt3yvHmjXw9NVw27GaXg_MGMOY0hR';
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: aData, error: aErr } = await anonClient.from('products').select('*');
  console.log('Anon products select:', aErr ? aErr.message : `OK (${aData.length} items)`);

  const serviceKey = supabaseKey;
  const serviceClient = createClient(supabaseUrl, serviceKey);
  const { data: sData, error: sErr } = await serviceClient.from('products').select('*');
  console.log('Service products select:', sErr ? sErr.message : `OK (${sData.length} items)`);
}

testAll();
