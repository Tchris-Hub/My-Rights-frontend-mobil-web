import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('[My Rights] Supabase configuration is missing.');
}

const storageWrapper = {
    getItem: async (key: string) => {
        const value = await AsyncStorage.getItem(key);
        if (__DEV__ && key.includes('auth')) {
            logger.debug(`[Storage] GET ${key}:`, value ? 'EXISTS' : 'MISSING');
        }
        return value;
    },
    setItem: async (key: string, value: string) => {
        if (__DEV__ && key.includes('auth')) {
            logger.debug(`[Storage] SET ${key}`);
        }
        return await AsyncStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
        if (__DEV__ && key.includes('auth')) {
            logger.debug(`[Storage] REMOVE ${key}`);
        }
        return await AsyncStorage.removeItem(key);
    },
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        storageKey: 'myrights-auth',
        storage: storageWrapper as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
    },
});
