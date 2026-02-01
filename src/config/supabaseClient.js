import { createClient } from '@supabase/supabase-js';
import { config } from './unifiedConfig.js';

/**
 * Supabase Client for MockBank API
 * Uses anon key for regular operations
 */
export const supabase = createClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: false, // Server-side, no session persistence
        },
    }
);
