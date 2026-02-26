/**
 * Authentication Context
 * Manages user authentication state, tokens, and auth methods
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import { authService } from '../services/auth.service';
import { supabase } from '../services/supabase';
import { STORAGE_KEYS } from '../constants/config';
import { logger } from '../utils/logger';
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
    signInWithGoogle: (redirectPath?: string) => Promise<void>;
    resetPasswordForEmail: (email: string) => Promise<void>;
    updateUserPassword: (password: string) => Promise<void>;
    needsPasswordReset: boolean;
    setNeedsPasswordReset: (value: boolean) => void;
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
    const [needsPasswordReset, setNeedsPasswordReset] = useState(false);

    const isAuthenticated = user !== null;

    // Helper to generate consistent redirect URIs
    const getRedirectUri = (path: string = '') => {
        // In Expo Go, we need to use the exp:// scheme for reliable redirects
        // If we're on a real device with APK, we use our custom scheme
        return makeRedirectUri({
            scheme: 'myrights',
            path: path,
            preferLocalhost: false,
        });
    };

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
                        logger.error('Failed to fetch user data:', error);
                    }
                }
            })();
        } catch (error) {
            logger.error('Failed to initialize auth:', error);
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
                    logger.error('Logout API call failed:', error);
                }
            }

            // Clear all auth data
            await clearAuthData();
        } catch (error) {
            logger.error('Logout error:', error);
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
            logger.error('Failed to refresh user data:', error);
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
            logger.error('Failed to save onboarding status:', error);
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
            logger.error('Failed to save guest status:', error);
        }
    };

    /**
     * Sign in with Google using Supabase OAuth
     */
    const signInWithGoogle = async (redirectPath: string = 'home') => {
        if (isLoading) return;
        try {
            setIsLoading(true);
            setError(null);

            const redirectTo = getRedirectUri(redirectPath);
            logger.log('[Google Auth] Starting OAuth flow with redirect:', redirectTo);

            // Check for crypto support
            const hasCrypto = typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
            const hasEncoder = typeof TextEncoder !== 'undefined';
            logger.log('[Google Auth] Crypto support check:', { hasCrypto, hasEncoder });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                    skipBrowserRedirect: true,
                    queryParams: {
                        prompt: 'select_account',
                        access_type: 'offline',
                    }
                },
            });

            if (error) {
                logger.error('[Google Auth] Supabase OAuth Error:', error);
                throw error;
            }

            if (data?.url) {
                logger.log('[Google Auth] Opening WebBrowser with URL:', data.url);
                const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
                logger.log('[Google Auth] WebBrowser result:', result.type);

                if (result.type === 'success' && result.url) {
                    logger.log('[Google Auth] Redirect URL caught by WebBrowser:', result.url);

                    // Standardize the URL for parsing
                    // Only replace # if it's not already a query string
                    const cleanUrl = result.url.includes('?')
                        ? result.url.replace('#', '&')
                        : result.url.replace('#', '?');
                    const parsed = Linking.parse(cleanUrl);
                    const { queryParams } = parsed;

                    const accessToken = queryParams?.access_token as string;
                    const refreshToken = queryParams?.refresh_token as string;
                    const code = queryParams?.code as string;
                    const authError = queryParams?.error as string;
                    const errorDescription = queryParams?.error_description as string;

                    logger.log('[Google Auth] Parsed link params:', {
                        hasAccessToken: !!accessToken,
                        hasCode: !!code,
                        error: authError || null
                    });

                    if (authError) {
                        throw new Error(errorDescription || authError);
                    }

                    if (accessToken && refreshToken) {
                        logger.log('[Google Auth] Session tokens found, establishing session...');
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                        if (sessionError) throw sessionError;
                    } else if (code) {
                        logger.log('[Google Auth] Auth code found, checking storage before exchange...');

                        // Debug: Inspect AsyncStorage
                        try {
                            const keys = await AsyncStorage.getAllKeys();
                            logger.log('[Google Auth] AsyncStorage keys size:', keys.length);
                            const verifierKey = 'myrights-auth-code-verifier';
                            const verifier = await AsyncStorage.getItem(verifierKey);
                            logger.log(`[Google Auth] Verifier found at ${verifierKey}:`, verifier ? 'YES' : 'NO');
                        } catch (e) {
                            logger.error('[Google Auth] Storage check error:', e);
                        }

                        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
                        if (sessionError) {
                            logger.error('[Google Auth] Exchange Error Detail:', sessionError);
                            throw sessionError;
                        }
                    } else {
                        logger.warn('[Google Auth] No session data or code found in redirect URL');
                    }
                } else if (result.type !== 'success') {
                    logger.log('[Google Auth] WebBrowser session was not success:', result.type);
                }
            } else {
                logger.warn('[Google Auth] No URL returned from Supabase OAuth');
            }
        } catch (err: any) {
            logger.error('[Google Auth] Catch Error:', err.message);
            setError(err.message || 'Google Sign-In failed');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Send password reset email
     */
    const resetPasswordForEmail = async (email: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const redirectTo = getRedirectUri('reset-password');
            logger.log('[AuthContext] Requesting password reset for:', email);
            logger.log('[AuthContext] Reset redirect URL:', redirectTo);

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });

            if (error) {
                logger.error('[AuthContext] Password reset error:', error);
                throw error;
            }

            logger.log('[AuthContext] Password reset email sent successfully');
        } catch (err: any) {
            logger.error('[AuthContext] Password reset catch error:', err);
            setError(err.message || 'Failed to send reset email');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Update user password (used after recovery)
     */
    const updateUserPassword = async (password: string) => {
        try {
            setIsLoading(true);
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Listen for Auth Changes (especially for deep linking/recovery)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (__DEV__) logger.debug('[AuthContext] Auth State Change:', event);

            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
                const userData: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    full_name: session.user.user_metadata?.full_name || '',
                    avatar_url: session.user.user_metadata?.avatar_url || '',
                    phone_number: session.user.user_metadata?.phone_number || null,
                    is_active: true,
                    // Security: Don't assume. Check if provider verified or metadata flags exist.
                    is_verified: !!session.user.email_confirmed_at || !!session.user.user_metadata?.email_verified,
                    has_accepted_terms: !!session.user.user_metadata?.has_accepted_terms,
                    created_at: session.user.created_at || new Date().toISOString(),
                };
                setUser(userData);
                await storeTokens({
                    access_token: session.access_token,
                    refresh_token: session.refresh_token || '',
                    token_type: 'bearer',
                    expires_at: session.expires_at?.toString() || '',
                });
                await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                // Normal sign in clears the reset flag. 
                // Recovery events happen AFTER this and will set it back to true.
                setNeedsPasswordReset(false);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                await clearAuthData();
                setNeedsPasswordReset(false);
            } else if (event === 'PASSWORD_RECOVERY') {
                logger.log('[AuthContext] Password recovery mode detected - forcing state');
                setNeedsPasswordReset(true);
            }
        });

        const handleDeepLink = async (event: { url: string }) => {
            const { url } = event;
            if (!url) return;

            logger.log('[AuthContext] Full deep link received:', url);
            logger.log('[AuthContext] Processing deep link (no fragment):', url.split('#')[0]);
            setError(null);

            try {
                // Use Expo's Linking.parse which handles fragments and query params correctly
                const parsed = Linking.parse(url);
                const { queryParams } = parsed;

                // Supabase puts tokens in the fragment, which Linking.parse handles in queryParams 
                // if it's following the standard redirect pattern
                const accessToken = queryParams?.access_token as string;
                const refreshToken = queryParams?.refresh_token as string;
                const code = queryParams?.code as string;
                const returnedState = queryParams?.state as string;
                const type = queryParams?.type as string;
                const error = queryParams?.error as string;
                const errorDescription = queryParams?.error_description as string;

                if (error) {
                    logger.error('[AuthContext] Auth error in URL:', error, errorDescription);
                    setError(errorDescription || 'Authentication error');
                    return;
                }

                if (accessToken && refreshToken) {
                    logger.log('[AuthContext] Tokens found, setting session...');
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (sessionError) {
                        logger.error('[AuthContext] setSession error:', sessionError.message);
                        if (sessionError.message.includes('Network request failed')) {
                            logger.log('[AuthContext] Retrying setSession once...');
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken,
                            });
                        } else {
                            throw sessionError;
                        }
                    }

                    if (type === 'recovery') {
                        logger.log('[AuthContext] Recovery session set successfully');
                        setNeedsPasswordReset(true);
                    }
                } else {
                    logger.log('[AuthContext] No auth parameters found in link query params, checking manual fragment/tokens...');

                    // Fallback: Manually check fragment and session tokens
                    if (url.includes('access_token=') || url.includes('#')) {
                        logger.log('[AuthContext] Fragment-style tokens detected');

                        // Use URL class or manual parsing if Linking.parse missed it
                        const fragment = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
                        const params = new URLSearchParams(fragment || '');

                        const fAccessToken = params.get('access_token');
                        const fRefreshToken = params.get('refresh_token');
                        const fType = params.get('type');
                        const fCode = params.get('code');

                        if (fAccessToken && fRefreshToken) {
                            logger.log('[AuthContext] Setting session from fragment tokens...');
                            const { error: sessionError } = await supabase.auth.setSession({
                                access_token: fAccessToken,
                                refresh_token: fRefreshToken,
                            });

                            if (!sessionError && fType === 'recovery') {
                                logger.log('[AuthContext] Recovery type detected in fragment');
                                setNeedsPasswordReset(true);
                            }
                        } else if (fCode) {
                            logger.log('[AuthContext] Found code in fragment, exchanging...');
                            const { error: sessionError } = await supabase.auth.exchangeCodeForSession(fCode);
                            if (sessionError) throw sessionError;
                        }
                    }
                }
            } catch (err: any) {
                logger.error('[AuthContext] Deep link processing failure:', err?.message || err);
            }
        };

        // Check initial URL on launch (Cold Boot)
        Linking.getInitialURL().then((url) => {
            if (url) {
                logger.debug('[AuthContext] Cold boot URL detected');
                handleDeepLink({ url });
            }
        });

        const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

        return () => {
            subscription.unsubscribe();
            linkingSubscription.remove();
        };
    }, []);

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

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
