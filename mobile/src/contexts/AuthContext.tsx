import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authClient } from '../services/auth-client';
import { authService } from '../services/auth.service';
import { localDataService } from '../services/localData.service';
import { STORAGE_KEYS, APP_CONFIG } from '../constants/config';
import { logger } from '../utils/logger';
import type { User, LoginCredentials, RegisterData } from '../types';

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
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    refreshUser: () => Promise<void>;
    acceptCurrentConsent: () => Promise<void>;
    onboardingCompleted: boolean;
    completeOnboarding: () => Promise<void>;
    isGuest: boolean;
    continueAsGuest: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    resetPasswordForEmail: (email: string) => Promise<void>;
    updateUserPassword: (password: string, token?: string) => Promise<void>;
    needsPasswordReset: boolean;
    setNeedsPasswordReset: (value: boolean) => void;
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
    const [needsPasswordReset, setNeedsPasswordReset] = useState(false);

    const isLoading = authState === 'initializing' || authState === 'authenticating' || authState === 'session-expired';
    const isAuthenticated = authState === 'authenticated' && user !== null;

    useEffect(() => {
        void AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED)
            .then((value) => setOnboardingCompleted(value === 'true'));
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

    const login = async (credentials: LoginCredentials) => {
        try {
            setAuthState('authenticating');
            setError(null);
            await authService.login(credentials);
        } catch (err: any) {
            setAuthState('unauthenticated');
            setError(err?.message || 'Login failed.');
            throw err;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            setAuthState('authenticating');
            setError(null);

            if (!data.accept_terms) {
                throw new Error('You must accept the Terms of Service and Privacy Policy.');
            }

            await localDataService.setPendingConsent({
                terms_version: APP_CONFIG.TERMS_VERSION,
                privacy_version: APP_CONFIG.PRIVACY_POLICY_VERSION,
            });

            await authService.register(data);
            setAuthState('unauthenticated');
        } catch (err: any) {
            setAuthState('unauthenticated');
            setError(err?.message || 'Registration failed.');
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
            setNeedsPasswordReset(false);
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
            setError(null);
            await authService.signInWithGoogle();
        } catch (err: any) {
            setError(err?.message || 'Google sign-in failed.');
            throw err;
        }
    };

    const resetPasswordForEmail = async (email: string) => {
        setError(null);
        try {
            await authService.requestPasswordReset(email);
        } catch (err: any) {
            setError(err?.message || 'Password reset could not be requested.');
            throw err;
        }
    };

    const updateUserPassword = async (password: string, token?: string) => {
        setError(null);
        try {
            if (!token) {
                throw new Error('The password reset link is invalid or expired.');
            }
            await authService.resetPassword(token, password);
            setNeedsPasswordReset(false);
        } catch (err: any) {
            setError(err?.message || 'Password update failed.');
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
        login,
        register,
        logout,
        clearError,
        refreshUser,
        acceptCurrentConsent,
        onboardingCompleted,
        completeOnboarding,
        isGuest,
        continueAsGuest,
        signInWithGoogle,
        resetPasswordForEmail,
        updateUserPassword,
        needsPasswordReset,
        setNeedsPasswordReset,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
