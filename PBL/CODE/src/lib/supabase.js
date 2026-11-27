import { createClient } from '@supabase/supabase-js';

// Browser code must ONLY ever use the publishable (anon) key. Publishable keys are
// designed to be public; access is controlled by Row Level Security in Supabase.
// Never put a secret / service-role key in any VITE_* variable or in this file —
// everything here is bundled into the website that visitors download.
const DEFAULT_SUPABASE_URL = 'https://eyummeftwbyytltkcnty.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_Soxt3yvHmjXw9NVw27GaXg_MGMOY0hR';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidEnvUrl = typeof envUrl === 'string' && envUrl.startsWith('https://') && !envUrl.includes('...');
const isValidEnvKey =
    typeof envKey === 'string' &&
    envKey.length > 20 &&
    !envKey.includes('...') &&
    !envKey.toLowerCase().includes('your publishable key');

const supabaseUrl = isValidEnvUrl ? envUrl : DEFAULT_SUPABASE_URL;
const supabaseKey = isValidEnvKey ? envKey : DEFAULT_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
