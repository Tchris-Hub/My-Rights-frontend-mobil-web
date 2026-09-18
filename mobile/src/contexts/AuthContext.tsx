/**
 * Authentication Context
 * Supabase Auth is the client identity/session source of truth.
 *
 * Authorization is never granted by this context: protected data/actions must
 * be enforced by Supabase RLS and server-side Edge Function checks.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import { authService } from '../services/auth.service';
import { supabase } from '../services/supabase';
import { STORAGE_KEYS } from '../constants/config';
import { logger } from '../utils/logger';
import type { User, LoginCredentials, RegisterData } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    refreshUser: () => Promise<void>;
    onboardingCompleted: boolean;
    completeOnboarding: () => Promise<void>;
    isGuest: boolean;
    continueAsGuest: () => void;
    signInWithGoogle: (redirectPath?: string) => Promise<void>;
    resetPasswordForEmail: (email: string) => Promise<void>;
    updateUserPassword: (password: string) => Promise<void>;
    needsPasswordReset: boolean;
    setNeedsPasswordReset: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [needsPasswordReset, setNeedsPasswordReset] = useState(false);

    const isAuthenticated = user !== null;

    const getRedirectUri = (path: string = '') => {
        return makeRedirectUri({
            scheme: 'myrights',
            path,
            preferLocalhost: false,
        });
    };

    useEffect(() => {
        let mounted = true;

        const syncAuthenticatedUser = async () => {
            try {
                const profile = await authService.getCurrentUser();
                if (!mounted) return;

                if (profile) {
                    await AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
                    setUser(profile);
                    setIsGuest(false);
                } else {
                    setUser(null);
                }
            } catch (err) {
                logger.error('Failed to load authenticated profile:', err);
                if (mounted) {
                    setUser(null);
                }
            }
        };

        const initializeAuth = async () => {
            try {
                setIsLoading(true);

                const [onboardingStatus, guestStatus, sessionResult] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED),
                    AsyncStorage.getItem(STORAGE_KEYS.IS_GUEST),
                    supabase.auth.getSession(),
                ]);

                if (!mounted) return;

                setOnboardingCompleted(onboardingStatus === 'true');

                const session = sessionResult.data.session;
                if (session?.user) {
                    setIsGuest(false);
                    await syncAuthenticatedUser();
                } else {
                    setUser(null);
                    setIsGuest(guestStatus === 'true');
                }
            } catch (err) {
                logger.error('Failed to initialize auth:', err);
                if (mounted) {
                    setUser(null);
                    setIsGuest(false);
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            logger.debug('Auth event:', event);

            // Supabase advises against awaiting additional Supabase calls directly
            // inside this callback. Defer profile synchronization to the next tick.
            setTimeout(() => {
                if (!mounted) return;

                if (session?.user) {
                    void syncAuthenticatedUser();
                } else {
                    setUser(null);
                    setNeedsPasswordReset(false);
                    setIsGuest(false);
                    void AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
                }

                if (event === 'PASSWORD_RECOVERY') {
                    setNeedsPasswordReset(true);
                }
            }, 0);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            setError(null);
            await authService.login(credentials);
        } catch (err: any) {
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        try {
            setIsLoading(true);
            setError(null);
            await authService.register(data);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await authService.logout();
            await AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
            setUser(null);
            setIsGuest(false);
            setNeedsPasswordReset(false);
        } catch (err: any) {
            setError(err.message || 'Logout failed');
            logger.error('Logout error:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            const profile = await authService.getCurrentUser();
            setUser(profile);
            if (profile) {
                setIsGuest(false);
                await AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
            }
        } catch (err: any) {
            setError(err.message || 'Unable to refresh account.');
            throw err;
        }
    };

    const clearError = () => setError(null);

    const completeOnboarding = async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
        setOnboardingCompleted(true);
    };

    const continueAsGuest = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            throw new Error('Sign out of the current account before continuing as a guest.');
        }

        await AsyncStorage.setItem(STORAGE_KEYS.IS_GUEST, 'true');
        setUser(null);
        setIsGuest(true);
    };

    const signInWithGoogle = async (redirectPath: string = 'home') => {
        try {
            setError(null);
            const redirectTo = getRedirectUri(redirectPath);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
            throw err;
        }
    };

    const resetPasswordForEmail = async (email: string) => {
        setError(null);
        const redirectTo = getRedirectUri('reset-password');
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
        if (error) {
            setError(error.message);
            throw error;
        }
    };

    const updateUserPassword = async (password: string) => {
        await authService.changePassword(password);
        setNeedsPasswordReset(false);
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        register,
        logout,
        clearError,
        refreshUser,
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
