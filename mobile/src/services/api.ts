/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/config';
import { logger } from '../utils/logger';

if (__DEV__) {
    logger.log('configured API_BASE_URL:', API_BASE_URL);
}

// ─── Mock Adapter Logic ──────────────────────────────────────────────
const mockAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    return new Promise((resolve, reject) => {
        const endpoint = config.url || '';
        const mockResponse = MOCK_DATA[endpoint];

        if (mockResponse) {
            if (__DEV__) logger.log(`🩻 [Mock API Success] ${endpoint}`);
            resolve({
                data: mockResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: config,
                request: {},
            });
        } else {
            if (__DEV__) logger.error(`🩻 [Mock API Error] Endpoint not found: ${endpoint}`);
            reject({
                response: {
                    status: 404,
                    data: { message: 'Mock endpoint not found' },
                    headers: {},
                    config: config,
                },
                message: 'Mock 404',
                config: config,
            });
        }
    });
};

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 120000,
    adapter: (config) => {
        if (config.baseURL?.startsWith('mock://')) {
            return mockAdapter(config as InternalAxiosRequestConfig);
        }
        // Use default adapter for real requests
        const { adapter } = axios.defaults;
        if (typeof adapter === 'function') {
            return adapter(config);
        }
        // Fallback for some axios versions
        return (axios.getAdapter(config as any))(config);
    }
});

if (__DEV__) {
    logger.log('configured API_BASE_URL:', API_BASE_URL);
}

// ─── Token Refresh Mutex ────────────────────────────────────────────────
// Prevents concurrent 401 retries from each triggering their own refresh.
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

function onTokenRefreshed(newToken: string) {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
}

function onRefreshFailed() {
    refreshSubscribers = [];
}

// ─── Mock Data Strategy ────────────────────────────────────────────────
const MOCK_DATA: Record<string, any> = {
    '/api/v1/auth/me': {
        id: 'mock-user-123',
        email: 'jurist@myrights.ng',
        full_name: 'Digital Jurist',
        avatar_url: null,
        is_premium: true,
        created_at: new Date().toISOString(),
    },
    '/api/v1/auth/register': {
        user: { id: 'new-user', email: 'user@example.com' },
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
    },
    '/api/v1/auth/login': {
        user: { id: 'mock-user-123', email: 'jurist@myrights.ng' },
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
    }
};
// ────────────────────────────────────────────────────────────────────────


// Request interceptor - Add auth token and log (dev only)
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            if (__DEV__) {
                logger.error('Error getting access token:', error);
            }
        }
// ... rest of the interceptor

        // Log request in development only
        if (__DEV__) {
            const safeData = { ...config.data };

            // SECURITY: Redact sensitive fields before logging
            const sensitiveFields = ['password', 'refresh_token', 'access_token', 'token', 'code_verifier', 'newPassword', 'confirmPassword'];
            if (safeData && typeof safeData === 'object') {
                Object.keys(safeData).forEach(key => {
                    if (sensitiveFields.includes(key)) {
                        safeData[key] = '[REDACTED]';
                    } else if (typeof safeData[key] === 'string' && safeData[key].length > 100) {
                        safeData[key] = safeData[key].substring(0, 100) + '... [TRUNCATED]';
                    }
                });
            }

            logger.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                data: safeData,
                headers: {
                    ...config.headers,
                    Authorization: config.headers?.Authorization ? '[REDACTED]' : undefined
                }
            });
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh (with mutex) and errors
api.interceptors.response.use(
    (response: AxiosResponse) => {
        if (__DEV__) {
            logger.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // If a refresh is already in progress, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh((newToken: string) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        resolve(api(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

                // BRIDGE GUARD: If using Supabase (ref token is likely a Supabase internal or missing),
                // don't try to refresh at our custom backend endpoint. Supabase handles its own 
                // refreshing via the onAuthStateChange listener we added.
                const isSupabaseUser = refreshToken?.length && refreshToken.length > 200; // Supabase JWTs are long

                if (!refreshToken || isSupabaseUser) {
                    if (__DEV__) console.warn('[API Interceptor] Skipping backend refresh (Supabase or no token)');
                    return Promise.reject(error);
                }

                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const { access_token, refresh_token: newRefreshToken } = response.data;

                    // Store new tokens
                    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access_token);
                    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

                    // Notify all queued requests
                    onTokenRefreshed(access_token);
                    isRefreshing = false;

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    }

                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - Clear tokens
                onRefreshFailed();
                isRefreshing = false;

                await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
                await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
                await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);

                return Promise.reject(refreshError);
            }

            isRefreshing = false;
        }

        // Log error in development only
        if (__DEV__) {
            logger.error('[API Error]', error.response?.status, error.response?.data || error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
