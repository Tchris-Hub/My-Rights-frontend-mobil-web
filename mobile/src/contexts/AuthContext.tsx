/**
 * Authentication Context
 * Refactored for 100% Supabase Auth integration.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
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
            path: path,
            preferLocalhost: false,
        });
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setIsLoading(true);

                const onboardingStatus = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
                setOnboardingCompleted(onboardingStatus === 'true');

                const guestStatus = await AsyncStorage.getItem(STORAGE_KEYS.IS_GUEST);
                setIsGuest(guestStatus === 'true');

                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const profile = await authService.getCurrentUser();
                    setUser(profile);
                }
            } catch (err) {
                logger.error('Failed to initialize auth:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            logger.log('Auth event caught:', event);
            if (session?.user) {
                const profile = await authService.getCurrentUser();
                setUser(profile);
                setIsGuest(false);
            } else {
                setUser(null);
            }

            if (event === 'PASSWORD_RECOVERY') {
                setNeedsPasswordReset(true);
            }
        });

        return () => {
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
            await authService.logout();
            await AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
            setIsGuest(false);
        } catch (err) {
            logger.error('Logout error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        const profile = await authService.getCurrentUser();
        setUser(profile);
    };

    const clearError = () => setError(null);

    const completeOnboarding = async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
        setOnboardingCompleted(true);
    };

    const continueAsGuest = async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.IS_GUEST, 'true');
        setIsGuest(true);
    };

    const signInWithGoogle = async (redirectPath: string = 'home') => {
        const redirectTo = getRedirectUri(redirectPath);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo }
        });
        if (error) setError(error.message);
    };

    const resetPasswordForEmail = async (email: string) => {
        const redirectTo = getRedirectUri('reset-password');
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
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
