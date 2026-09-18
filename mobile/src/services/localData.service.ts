import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Clears local account-scoped data.
 *
 * This is deliberately separate from auth-session storage: Supabase Auth owns
 * its session lifecycle, while the app owns cached legal/chat/profile data.
 * Never clear onboarding or theme preferences during account switching.
 */
export const localDataService = {
    async clearUserScopedData(): Promise<void> {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_DATA,
            STORAGE_KEYS.CHAT_HISTORY,
            STORAGE_KEYS.IS_GUEST,
            STORAGE_KEYS.ACTIVE_USER_ID,
        ]);
    },

    async getActiveUserId(): Promise<string | null> {
        return AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    },

    async setActiveUserId(userId: string): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
    },
};
