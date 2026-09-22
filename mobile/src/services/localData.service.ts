import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Local storage is limited to non-authoritative app preferences and transient
 * account-scoped UI data. Better Auth owns authentication/session persistence
 * through SecureStore; this service never stores access or refresh tokens.
 */
export const localDataService = {
    async clearUserScopedData(): Promise<void> {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.CHAT_HISTORY,
            STORAGE_KEYS.IS_GUEST,
            STORAGE_KEYS.PENDING_CONSENT,
        ]);
    },

    async getPendingConsent(): Promise<{ terms_version: string; privacy_version: string } | null> {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CONSENT);
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw);
            if (
                parsed?.terms_version === '2026-09-18' &&
                parsed?.privacy_version === '2026-09-18'
            ) {
                return parsed;
            }
        } catch {
            // Corrupt local state is treated as absent.
        }
        return null;
    },

    async setPendingConsent(consent: { terms_version: string; privacy_version: string }): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CONSENT, JSON.stringify(consent));
    },

    async clearPendingConsent(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_CONSENT);
    },
};
