import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Alert } from 'react-native';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Custom error handler for Supabase calls to ensure UI feedback.
 */
export async function handleSupabaseCall<T>(
  call: () => Promise<{ data: T | null; error: any }>,
  errorContext: string
): Promise<T | null> {
  try {
    const { data, error } = await call();
    if (error) {
      console.error(`Supabase Error (${errorContext}):`, error);
      Alert.alert('System Error', `${errorContext}: ${error.message}`);
      return null;
    }
    return data;
  } catch (err: any) {
    console.error(`Unexpected Error (${errorContext}):`, err);
    Alert.alert('Connection Error', `Failed to reach servers during ${errorContext}.`);
    return null;
  }
}
