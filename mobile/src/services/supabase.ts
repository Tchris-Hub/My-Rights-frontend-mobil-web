import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { logger } from '../utils/logger';

const extras = Constants.expoConfig?.extra ?? {};

const supabaseUrl = typeof extras.supabaseUrl === 'string' ? extras.supabaseUrl : '';
const supabaseAnonKey = typeof extras.supabaseAnonKey === 'string' ? extras.supabaseAnonKey : '';

logger.log('[Supabase] Initializing client...');

if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn('[Supabase] Missing URL or anon key in Expo config extras.');
}

const storageWrapper = {
    getItem: async (key: string) => {
        const value = await AsyncStorage.getItem(key);
        // Only log existence for debugging, never the value
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