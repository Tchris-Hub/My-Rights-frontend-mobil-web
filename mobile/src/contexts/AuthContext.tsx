import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { authClient } from '../services/auth-client';
import { authService } from '../services/auth.service';
import { localDataService } from '../services/localData.service';
import { STORAGE_KEYS, APP_CONFIG } from '../constants/config';
import { logger } from '../utils/logger';
import type { User } from '../types';

type AuthState =
    | 'initializing'
    | 'unauthenticated'
    | 'authenticating'
    | 'authenticated'
    | 'session-expired'
    | 'error';

interface AuthContextType {
    user: User | null;
    authState: AuthState;
    isLoading: boolean;
    isAuthenticated: boolean;
    consentAccepted: boolean;
    error: string | null;
    requestMagicLink: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    refreshUser: () => Promise<void>;
    acceptCurrentConsent: () => Promise<void>;
    onboardingCompleted: boolean;
    completeOnboarding: () => Promise<void>;
    isGuest: boolean;
    continueAsGuest: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const sessionState = authClient.useSession();
    const [user, setUser] = useState<User | null>(null);
    const [authState, setAuthState] = useState<AuthState>('initializing');
    const [error, setError] = useState<string | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [consentAccepted, setConsentAccepted] = useState(false);

    const isLoading = authState === 'initializing' || authState === 'authenticating' || authState === 'session-expired';
    const isAuthenticated = authState === 'authenticated' && user !== null;

    useEffect(() => {
        void AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
            .then((value) => setOnboardingCompleted(value === 'true'));
    }, []);

    // Magic-link verification happens in the browser before Better Auth redirects
    // back into the native app. React Navigation sees the deep link, but that alone
    // does not guarantee that the auth session state has been rehydrated. Explicitly
    // refresh the Better Auth session when the app receives a native auth deep link.
    useEffect(() => {
        let mounted = true;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;

        const hydrateAfterAuthDeepLink = async (url: string | null) => {
            if (!url || !url.startsWith('myrights://')) return;

            const refresh = async (attempt: number): Promise<void> => {
                if (!mounted) return;

                try {
                    const session = await authClient.getSession();
                    if (session.data?.user) {
                        const profile = await authService.getCurrentUser();
                        if (profile && mounted) {
                            const hasConsent = await authService.hasCurrentConsent();
                            const pending = await localDataService.getPendingConsent();

                            if (!hasConsent && pending) {
                                await authService.recordCurrentConsent();
                                await localDataService.clearPendingConsent();
                            }

                            setUser(profile);
                            setIsGuest(false);
                            await AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
                            setConsentAccepted(hasConsent || Boolean(pending));
                            setError(null);
                            setAuthState('authenticated');
                            return;
                        }
                    }
                } catch (err) {
                    logger.error('Failed to hydrate session after auth deep link:', err);
                }

                // The browser may finish handing the session cookie back just after
                // the native deep link fires. Retry briefly instead of sending the
                // user back to the login screen on a timing race.
                if (attempt < 3 && mounted) {
                    retryTimer = setTimeout(() => {
                        void refresh(attempt + 1);
                    }, 300 * (attempt + 1));
                }
            };

            setAuthState('authenticating');
            setError(null);
            await refresh(0);
        };

        const subscription = Linking.addEventListener('url', ({ url }) => {
            void hydrateAfterAuthDeepLink(url);
        });

        void Linking.getInitialURL().then((url) => hydrateAfterAuthDeepLink(url));

        return () => {
            mounted = false;
            subscription.remove();
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const synchronize = async () => {
            if (sessionState.isPending) {
                if (mounted) setAuthState('initializing');
                return;
            }

            if (sessionState.error) {
                if (mounted) {
                    setUser(null);
                    setConsentAccepted(false);
                    setAuthState('error');
                    setError('Your session could not be verified. Please sign in again.');
                }
                return;
            }

            if (!sessionState.data?.user) {
                const guest = (await AsyncStorage.getItem(STORAGE_KEYS.IS_GUEST)) === 'true';
                if (mounted) {
                    setUser(null);
                    setConsentAccepted(false);
                    setIsGuest(guest);
                    setAuthState(guest ? 'unauthenticated' : 'unauthenticated');
                }
                return;
            }

            try {
                const profile = await authService.getCurrentUser();
                if (!mounted) return;

                if (!profile) {
                    setUser(null);
                    setConsentAccepted(false);
                    setAuthState('session-expired');
                    return;
                }

                const hasConsent = await authService.hasCurrentConsent();
                const pending = await localDataService.getPendingConsent();

                if (!hasConsent && pending) {
                    await authService.recordCurrentConsent();
                    await localDataService.clearPendingConsent();
                }

                const finalConsent = hasConsent || Boolean(pending);
                setUser(profile);
                setIsGuest(false);
                await AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
                setConsentAccepted(finalConsent);
                setAuthState('authenticated');
            } catch (err) {
                logger.error('Failed to synchronize authenticated state:', err);
                if (mounted) {
                    setError('Your account could not be loaded safely.');
                    setAuthState('error');
                }
            }
        };

        void synchronize();
        return () => {
            mounted = false;
        };
    }, [sessionState.isPending, sessionState.error, sessionState.data?.user?.id]);

    const requestMagicLink = async (email: string) => {
        try {
            setAuthState('authenticating');
            setError(null);
            await authService.requestMagicLink(email);
            setAuthState('unauthenticated');
        } catch (err: any) {
            setAuthState('unauthenticated');
            setError(err?.message || 'We could not send the sign-in link.');
            throw err;
        }
    };

    const logout = async () => {
        try {
            setAuthState('session-expired');
            setError(null);
            await authService.logout();
            await localDataService.clearUserScopedData();
            setUser(null);
            setConsentAccepted(false);
            setIsGuest(false);
            setAuthState('unauthenticated');
        } catch (err: any) {
            setError(err?.message || 'Logout failed.');
            setAuthState('error');
            throw err;
        }
    };

    const refreshUser = async () => {
        try {
            const profile = await authService.getCurrentUser();
            setUser(profile);
            if (profile) {
                setIsGuest(false);
                setAuthState('authenticated');
            }
        } catch (err: any) {
            setError(err?.message || 'Unable to refresh account.');
            throw err;
        }
    };

    const acceptCurrentConsent = async () => {
        try {
            setError(null);
            await authService.recordCurrentConsent();
            await localDataService.clearPendingConsent();
            setConsentAccepted(true);
        } catch (err: any) {
            setError(err?.message || 'Unable to record consent.');
            throw err;
        }
    };

    const clearError = () => setError(null);

    const completeOnboarding = async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
        setOnboardingCompleted(true);
    };

    const continueAsGuest = async () => {
        const session = await authService.getSession();
        if (session.data?.user) {
            throw new Error('Sign out of the current account before continuing as a guest.');
        }

        await AsyncStorage.setItem(STORAGE_KEYS.IS_GUEST, 'true');
        setUser(null);
        setConsentAccepted(false);
        setIsGuest(true);
        setAuthState('unauthenticated');
    };

    const signInWithGoogle = async () => {
        try {
            setAuthState('authenticating');
            setError(null);

            await authService.signInWithGoogle();

            // Native Better Auth social sign-in completes the browser/deep-link
            // flow but does not drive React Navigation. Rehydrate the app state
            // explicitly so RootNavigator can switch route modes immediately.
            const profile = await authService.getCurrentUser();
            if (!profile) {
                throw new Error('Google sign-in completed, but your session could not be loaded.');
            }

            const hasConsent = await authService.hasCurrentConsent();
            const pending = await localDataService.getPendingConsent();

            if (!hasConsent && pending) {
                await authService.recordCurrentConsent();
                await localDataService.clearPendingConsent();
            }

            setUser(profile);
            setIsGuest(false);
            await AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
            setConsentAccepted(hasConsent || Boolean(pending));
            setAuthState('authenticated');
        } catch (err: any) {
            setAuthState('unauthenticated');
            setError(err?.message || 'Google sign-in failed.');
            throw err;
        }
    };

    const value: AuthContextType = {
        user,
        authState,
        isLoading,
        isAuthenticated,
        consentAccepted,
        error,
        requestMagicLink,
        logout,
        clearError,
        refreshUser,
        acceptCurrentConsent,
        onboardingCompleted,
        completeOnboarding,
        isGuest,
        continueAsGuest,
        signInWithGoogle,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
