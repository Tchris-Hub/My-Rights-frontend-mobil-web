import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('[My Rights] Supabase configuration is missing.');
}

const SECURE_CHUNK_SIZE = 1800;
const CHUNK_MARKER = '__MYRIGHTS_SECURE_CHUNKS__:';

const secureStorage = {
    async getItem(key: string): Promise<string | null> {
        const marker = await SecureStore.getItemAsync(key);

        if (!marker) {
            return null;
        }

        if (!marker.startsWith(CHUNK_MARKER)) {
            if (__DEV__ && key.includes('auth')) {
                logger.debug(`[SecureStorage] GET ${key}: EXISTS`);
            }
            return marker;
        }

        const count = Number(marker.slice(CHUNK_MARKER.length));
        if (!Number.isInteger(count) || count <= 0 || count > 64) {
            throw new Error('Secure auth storage is corrupted.');
        }

        const chunks = await Promise.all(
            Array.from({ length: count }, (_, index) =>
                SecureStore.getItemAsync(`${key}.__chunk_${index}`)
            )
        );

        if (chunks.some((chunk) => typeof chunk !== 'string')) {
            throw new Error('Secure auth storage is incomplete.');
        }

        return chunks.join('');
    },

    async setItem(key: string, value: string): Promise<void> {
        await secureStorage.removeItem(key);

        if (value.length <= SECURE_CHUNK_SIZE) {
            await SecureStore.setItemAsync(key, value);
        } else {
            const count = Math.ceil(value.length / SECURE_CHUNK_SIZE);
            if (count > 64) {
                throw new Error('Secure auth session is too large.');
            }

            await Promise.all(
                Array.from({ length: count }, (_, index) =>
                    SecureStore.setItemAsync(
                        `${key}.__chunk_${index}`,
                        value.slice(index * SECURE_CHUNK_SIZE, (index + 1) * SECURE_CHUNK_SIZE),
                    )
                )
            );

            await SecureStore.setItemAsync(key, `${CHUNK_MARKER}${count}`);
        }

        if (__DEV__ && key.includes('auth')) {
            logger.debug(`[SecureStorage] SET ${key}`);
        }
    },

    async removeItem(key: string): Promise<void> {
        const marker = await SecureStore.getItemAsync(key);

        if (marker?.startsWith(CHUNK_MARKER)) {
            const count = Number(marker.slice(CHUNK_MARKER.length));
            if (Number.isInteger(count) && count > 0 && count <= 64) {
                await Promise.all(
                    Array.from({ length: count }, (_, index) =>
                        SecureStore.deleteItemAsync(`${key}.__chunk_${index}`)
                    )
                );
            }
        }

        await SecureStore.deleteItemAsync(key);

        if (__DEV__ && key.includes('auth')) {
            logger.debug(`[SecureStorage] REMOVE ${key}`);
        }
    },
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        storageKey: 'myrights-auth',
        storage: secureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
    },
});
