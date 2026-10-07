import { createClient } from '@supabase/supabase-js';

// Browser code must ONLY ever use the publishable (anon) key. Publishable keys are
// designed to be public; access is controlled by Row Level Security in Supabase.
// Never put a secret / service-role key in any VITE_* variable or in this file —
// everything here is bundled into the website that visitors download.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    'sb_publishable_Soxt3yvHmjXw9NVw27GaXg_MGMOY0hR';

export const supabase = createClient(supabaseUrl, supabaseKey);
