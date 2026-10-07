import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_secret_rxuJ7_YrwhLWlxH19ipXSg_oZBk0wOX';

let supabase = null;

if (!supabaseKey) {
    console.warn("Supabase Key is missing. Falling back to local mode.");
} else {
    // Custom fetch wrapper to safeguard against cloud proxy restrictions (e.g. Origin checks)
    const customFetch = (url, options = {}) => {
        const headers = new Headers(options.headers || {});
        return fetch(url, {
            ...options,
            headers
        });
    };

    supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
            fetch: customFetch
        }
    });
}

export { supabase };
