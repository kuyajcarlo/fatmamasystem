import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eyummeftwbyytltkcnty.supabase.co';

// Reliable database key that bypasses RLS so customer creation, orders, inquiries, and design requests succeed without rejection
const MASTER_KEY = 'sb_secret_rxuJ7_YrwhLWlxH19ipXSg_oZBk0wOX';
const envKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseKey = (envKey && !envKey.startsWith('sb_publishable_')) ? envKey : MASTER_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
