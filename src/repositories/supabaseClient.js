import { createClient } from '@supabase/supabase-js';
import { config } from '../config/unifiedConfig.js';

if (!config.supabase.url || !config.supabase.anonKey) {
    console.warn('⚠️ Supabase credentials missing in config');
}

// We use the ANON key for client-on-behalf operations, or SERVICE_ROLE for admin tasks
// For this API acting as a backend, we might want SERVICE_ROLE if we are bypassing RLS,
// OR we forward the user's JWT.
// For simplicity in "easy to use" mode, we'll start with Anon but recommend Service Role for backend logic.
export const supabase = createClient(
    config.supabase.url || '',
    config.supabase.anonKey || ''
);
