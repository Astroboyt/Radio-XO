import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Helper to handle errors and provide consistent feedback.
 */
export async function handleSupabaseCall<T>(
  call: () => Promise<{ data: T | null; error: any }>,
  errorContext: string
): Promise<T | null> {
  try {
    const { data, error } = await call();
    if (error) {
      console.error(`Supabase Error (${errorContext}):`, error);
      // In web, we might use a toast library, but for now we log
      return null;
    }
    return data;
  } catch (err: any) {
    console.error(`Unexpected Error (${errorContext}):`, err);
    return null;
  }
}
