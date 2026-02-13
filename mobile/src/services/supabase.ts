import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extras = Constants.expoConfig?.extra ?? {};

const supabaseUrl = typeof extras.supabaseUrl === 'string' ? extras.supabaseUrl : '';
const supabaseAnonKey = typeof extras.supabaseAnonKey === 'string' ? extras.supabaseAnonKey : '';

console.log('[Supabase] Initializing with URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('[Supabase] Initializing with Anon Key:', supabaseAnonKey ? 'SET' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing URL or anon key in Expo config extras.');
}

const storageWrapper = {
    getItem: async (key: string) => {
        const value = await AsyncStorage.getItem(key);
        // Special logging for auth tokens and verifiers
        if (key.includes('auth')) {
            console.log(`[Storage] GET ${key}:`, value ? 'EXISTS' : 'MISSING');
        }
        return value;
    },
    setItem: async (key: string, value: string) => {
        if (key.includes('auth')) {
            console.log(`[Storage] SET ${key}`);
        }
        return await AsyncStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
        if (key.includes('auth')) {
            console.log(`[Storage] REMOVE ${key}`);
        }
        return await AsyncStorage.removeItem(key);
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'myrights-auth',
        storage: storageWrapper as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
    },
});