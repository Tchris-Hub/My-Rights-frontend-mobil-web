/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/config';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000, // 120 seconds for AI processing (RAG heavy lifting)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting access token:', error);
        }

        // Log request in development
        if (__DEV__) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response in development
        if (__DEV__) {
            console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

                if (refreshToken) {
                    // Attempt to refresh the token
                    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const { access_token, refresh_token: newRefreshToken } = response.data;

                    // Store new tokens
                    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access_token);
                    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    }

                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - Clear tokens and redirect to login
                await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
                await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
                await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);

                // TODO: Navigate to login screen
                // This will be handled by AuthContext

                return Promise.reject(refreshError);
            }
        }

        // Log error in development
        if (__DEV__) {
            console.error('[API Error]', error.response?.status, error.response?.data || error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
