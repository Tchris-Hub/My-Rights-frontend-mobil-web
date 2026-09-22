import { authClient } from './auth-client';
import { apiRequest } from './api';
import { APP_CONFIG } from '../constants/config';
import type { LoginCredentials, RegisterData, User } from '../types';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const validateCredentials = (email: string, password: string): void => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Enter a valid email address.');
    }
    if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
    }
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
    async register(data: RegisterData): Promise<void> {
        validateCredentials(data.email, data.password);

        if (!data.accept_terms) {
            throw new Error('You must accept the Terms of Service and Privacy Policy before creating an account.');
        }

        const result = await authClient.signUp.email({
            email: normalizeEmail(data.email),
            password: data.password,
            name: data.name.trim(),
            phone_number: data.phone_number?.trim() || undefined,
            // These are validated by the server hook and are not persisted as
            // authentication fields.
            accept_terms: true,
            terms_version: data.terms_version,
            privacy_version: data.privacy_version,
        } as Parameters<typeof authClient.signUp.email>[0]);

        if (result.error) {
            throw new Error(result.error.message || 'Registration failed.');
        }
    },

    async login(credentials: LoginCredentials): Promise<void> {
        validateCredentials(credentials.email, credentials.password);

        const result = await authClient.signIn.email({
            email: normalizeEmail(credentials.email),
            password: credentials.password,
            rememberMe: true,
        });

        if (result.error) {
            throw new Error(result.error.message || 'Login failed.');
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

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        if (!currentPassword) {
            throw new Error('Current password is required.');
        }
        if (!newPassword || newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters.');
        }

        const result = await authClient.changePassword({
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
        });

        if (result.error) {
            throw new Error(result.error.message || 'Unable to change password.');
        }
    },

    async requestPasswordReset(email: string): Promise<void> {
        const result = await authClient.requestPasswordReset({
            email: normalizeEmail(email),
            redirectTo: 'myrights://reset-password',
        });

        if (result.error) {
            // The UI still presents a generic outcome to avoid account enumeration.
            throw new Error('Password reset could not be requested. Please try again.');
        }
    },

    async resetPassword(token: string, newPassword: string): Promise<void> {
        if (!token) throw new Error('The password reset link is invalid or expired.');
        if (!newPassword || newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters.');
        }

        const result = await authClient.resetPassword({ token, newPassword });
        if (result.error) {
            throw new Error(result.error.message || 'Password reset failed.');
        }
    },

    async getSession() {
        return authClient.getSession();
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
