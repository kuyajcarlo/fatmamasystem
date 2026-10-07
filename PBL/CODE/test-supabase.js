import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey = 'sb_secret_rxuJ7_YrwhLWlxH19ipXSg_oZBk0wOX';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAll() {
  console.log("=== Testing products SELECT ===");
  const anonKey = 'sb_publishable_Soxt3yvHmjXw9NVw27GaXg_MGMOY0hR';
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: aData, error: aErr } = await anonClient.from('products').select('*');
  console.log('Anon products select:', aErr ? aErr.message : `OK (${aData.length} items)`);

  const serviceKey = 'sb_secret_rxuJ7_YrwhLWlxH19ipXSg_oZBk0wOX';
  const serviceClient = createClient(supabaseUrl, serviceKey);
  const { data: sData, error: sErr } = await serviceClient.from('products').select('*');
  console.log('Service products select:', sErr ? sErr.message : `OK (${sData.length} items)`);
}

testAll();
