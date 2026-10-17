import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read URL and Publishable/Anon key from Vite environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasKey: boolean;
  missingKeys: string[];
  statusMessage: string;
}

const missingKeys: string[] = [];
if (!supabaseUrl) missingKeys.push('VITE_SUPABASE_URL');
if (!supabaseKey) missingKeys.push('VITE_SUPABASE_PUBLISHABLE_KEY');

export const isSupabaseConfigured: boolean = Boolean(supabaseUrl && supabaseKey);

export const supabaseConfigStatus: SupabaseConfigStatus = {
  isConfigured: isSupabaseConfigured,
  hasUrl: Boolean(supabaseUrl),
  hasKey: Boolean(supabaseKey),
  missingKeys,
  statusMessage: isSupabaseConfigured
    ? 'Supabase client configured successfully.'
    : `Supabase environment variables missing (${missingKeys.join(', ')}). Running in demo/offline mode.`,
};

/**
 * Typed Supabase client instance.
 *
 * If VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is not defined in the environment,
 * this instance is null, ensuring the app remains fully functional in demo mode without crashing.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Helper to obtain the Supabase client safely with an explicit descriptive error
 * if accessed when credentials are not configured.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      `[FarmLink Supabase Client] Cannot execute database query: ${supabaseConfigStatus.statusMessage}`
    );
  }
  return supabase;
}
