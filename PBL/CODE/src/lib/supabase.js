import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eyummeftwbyytltkcnty.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Soxt3yvHmjXw9NVw27GaXg_MGMOY0hR';

let supabase = null;

if (!supabaseAnonKey) {
    console.warn("Supabase Anon Key is missing. Falling back to local mode.");
} else if (supabaseAnonKey.startsWith('sb_secret_')) {
    console.error("CRITICAL SECURITY ERROR: You are using the 'sb_secret_' key (Service Role). Supabase blocks this in the browser to protect your database. You MUST use the 'anon public' key instead. Falling back to local mode to prevent crash.");
} else {
    // Custom fetch wrapper to safeguard against cloud proxy restrictions (e.g. Origin checks)
    const customFetch = (url, options = {}) => {
        const headers = new Headers(options.headers || {});
        return fetch(url, {
            ...options,
            headers
        });
    };

    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            fetch: customFetch
        }
    });
}

export { supabase };
