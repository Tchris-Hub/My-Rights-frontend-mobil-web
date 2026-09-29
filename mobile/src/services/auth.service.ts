import { authClient } from './auth-client';
import { apiRequest } from './api';
import { APP_CONFIG } from '../constants/config';
import type { User } from '../types';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const validateEmail = (email: string): string => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new Error('Enter a valid email address.');
    }
    return normalizedEmail;
};

function mapUser(user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    phone_number?: string | null;
    is_active?: boolean;
    emailVerified: boolean;
    is_superuser?: boolean;
    createdAt: Date | string;
}): User {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image ?? null,
        phone_number: user.phone_number ?? null,
        is_active: user.is_active ?? true,
        emailVerified: user.emailVerified,
        is_superuser: user.is_superuser ?? false,
        createdAt: new Date(user.createdAt).toISOString(),
    };
}

export const authService = {
    async requestMagicLink(email: string): Promise<void> {
        const normalizedEmail = validateEmail(email);
        const displayName = normalizedEmail.split('@')[0];

        const result = await authClient.signIn.magicLink({
            email: normalizedEmail,
            name: displayName,
            callbackURL: '/',
            newUserCallbackURL: '/',
            errorCallbackURL: '/auth-error',
        });

        if (result.error) {
            throw new Error('We could not send the sign-in link. Please try again.');
        }
    },

    async logout(): Promise<void> {
        const result = await authClient.signOut();
        if (result.error) {
            throw new Error(result.error.message || 'Logout failed.');
        }
    },

    async getCurrentUser(): Promise<User | null> {
        const result = await apiRequest<User>('/api/users/me');
        return result ? mapUser(result) : null;
    },

    async updateProfile(data: Partial<User>): Promise<User | null> {
        const result = await apiRequest<User>('/api/users/me', {
            method: 'PATCH',
            body: JSON.stringify({
                name: typeof data.name === 'string' ? data.name.trim() : undefined,
                phone_number: typeof data.phone_number === 'string' ? data.phone_number.trim() : undefined,
            }),
        });
        return mapUser(result);
    },

    async getSession() {
        return authClient.getSession();
    },

    async getAccountType(): Promise<'unset' | 'client' | 'legal_professional'> {
        const result = await apiRequest<{ account_type: 'unset' | 'client' | 'legal_professional' }>('/api/account/type');
        return result.account_type;
    },

    async setAccountType(account_type: 'client' | 'legal_professional'): Promise<void> {
        await apiRequest('/api/account/type', {
            method: 'PUT',
            body: JSON.stringify({ account_type }),
        });
    },

    async recordCurrentConsent(): Promise<void> {
        await apiRequest('/api/consent', {
            method: 'POST',
            body: JSON.stringify({
                terms_version: APP_CONFIG.TERMS_VERSION,
                privacy_version: APP_CONFIG.PRIVACY_POLICY_VERSION,
            }),
        });
    },

    async getConsents(): Promise<Array<{ terms_version: string; privacy_version: string; accepted_at: string }>> {
        return apiRequest<Array<{ terms_version: string; privacy_version: string; accepted_at: string }>>('/api/consent');
    },

    async hasCurrentConsent(): Promise<boolean> {
        try {
            const consents = await apiRequest<Array<{
                terms_version: string;
                privacy_version: string;
            }>>('/api/consent');

            return consents.some(
                (item) =>
                    item.terms_version === APP_CONFIG.TERMS_VERSION &&
                    item.privacy_version === APP_CONFIG.PRIVACY_POLICY_VERSION,
            );
        } catch {
            return false;
        }
    },

    async signInWithGoogle(): Promise<void> {
        const result = await authClient.signIn.social({
            provider: 'google',
            callbackURL: '/',
        });

        if (result.error) {
            throw new Error(result.error.message || 'Google sign-in failed.');
        }
    },
};
