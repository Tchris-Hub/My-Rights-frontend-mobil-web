/**
 * Authentication Context
 * Manages user authentication state, tokens, and auth methods
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth.service';
import { STORAGE_KEYS } from '../constants/config';
import type { User, LoginCredentials, RegisterData, AuthTokens } from '../types';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [isGuest, setIsGuest] = useState(false);

    const isAuthenticated = user !== null;

    // Initialize auth state on app launch
    useEffect(() => {
        initializeAuth();
    }, []);

    /**
     * Initialize authentication state
     * Check for stored tokens and load user data
     */
    const initializeAuth = async () => {
        try {
            setIsLoading(true);

            // Run initialization logic
            await (async () => {
                // Check onboarding status
                const onboardingStatus = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
                setOnboardingCompleted(onboardingStatus === 'true');

                // Check guest status
                const guestStatus = await AsyncStorage.getItem(STORAGE_KEYS.IS_GUEST);
                setIsGuest(guestStatus === 'true');

                // Check for stored access token
                const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

                if (accessToken) {
                    // Try to load user data from storage first (faster)
                    const storedUserData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
                    if (storedUserData) {
                        setUser(JSON.parse(storedUserData));
                    }

                    // Then fetch fresh user data from API
                    try {
                        const userData = await authService.getCurrentUser();
                        setUser(userData);
                        await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                    } catch (error) {
                        console.error('Failed to fetch user data:', error);
                    }
                }
            })();
        } catch (error) {
            console.error('Failed to initialize auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Store authentication tokens securely
     */
    const storeTokens = async (tokens: AuthTokens) => {
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    };

    /**
     * Clear all authentication data
     */
    const clearAuthData = async () => {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
        await AsyncStorage.removeItem(STORAGE_KEYS.IS_GUEST);
        setUser(null);
        setIsGuest(false);
    };

    /**
     * Login with email and password
     */
    const login = async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            setError(null);

            // Call login API
            const tokens = await authService.login(credentials);

            // Store tokens
            await storeTokens(tokens);

            // Fetch user data
            const userData = await authService.getCurrentUser();
            setUser(userData);
            await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        } catch (err: any) {
            let errorMessage = 'Login failed. Please check your credentials.';
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                errorMessage = Array.isArray(detail)
                    ? detail.map(d => d.msg || d).join(', ')
                    : typeof detail === 'string' ? detail : errorMessage;
            }
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Register a new user account
     */
    const register = async (data: RegisterData) => {
        try {
            setIsLoading(true);
            setError(null);

            // Call register API
            const tokens = await authService.register(data);

            // Store tokens
            await storeTokens(tokens);

            // Fetch user data
            const userData = await authService.getCurrentUser();
            setUser(userData);
            await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        } catch (err: any) {
            let errorMessage = 'Registration failed. Please try again.';
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                errorMessage = Array.isArray(detail)
                    ? detail.map(d => d.msg || d).join(', ')
                    : typeof detail === 'string' ? detail : errorMessage;
            }
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Logout and clear all auth data
     */
    const logout = async () => {
        try {
            setIsLoading(true);

            // Get refresh token for logout API call
            const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

            if (refreshToken) {
                try {
                    await authService.logout(refreshToken);
                } catch (error) {
                    // Continue with logout even if API call fails
                    console.error('Logout API call failed:', error);
                }
            }

            // Clear all auth data
            await clearAuthData();
        } catch (error) {
            console.error('Logout error:', error);
            // Clear data anyway
            await clearAuthData();
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Refresh user data from API
     */
    const refreshUser = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    };

    /**
     * Clear error message
     */
    const clearError = () => {
        setError(null);
    };

    /**
     * Mark onboarding as completed
     */
    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
            setOnboardingCompleted(true);
        } catch (error) {
            console.error('Failed to save onboarding status:', error);
        }
    };

    /**
     * Set user as guest to allow app access
     */
    const continueAsGuest = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.IS_GUEST, 'true');
            setIsGuest(true);
        } catch (error) {
            console.error('Failed to save guest status:', error);
        }
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
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
