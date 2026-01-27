import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extras = Constants.expoConfig?.extra ?? {};

const supabaseUrl = typeof extras.supabaseUrl === 'string' ? extras.supabaseUrl : '';
const supabaseAnonKey = typeof extras.supabaseAnonKey === 'string' ? extras.supabaseAnonKey : '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing URL or anon key in Expo config extras.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
