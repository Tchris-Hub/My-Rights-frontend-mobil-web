/**
 * Authentication Service
 * API methods for user authentication and profile management
 */

import api from './api';
import { API_ENDPOINTS } from '../constants/config';
import type { LoginCredentials, RegisterData, AuthTokens, User } from '../types';

export const authService = {
    /**
     * Register a new user account
     */
    async register(data: RegisterData): Promise<AuthTokens> {
        const response = await api.post<AuthTokens>(API_ENDPOINTS.AUTH.REGISTER, {
            email: data.email,
            password: data.password,
            full_name: data.full_name,
            phone_number: data.phone_number,
            accept_terms: true,
        });
        return response.data;
    },

    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<AuthTokens> {
        const response = await api.post<AuthTokens>(API_ENDPOINTS.AUTH.LOGIN, credentials);
        return response.data;
    },

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        const response = await api.post<AuthTokens>(API_ENDPOINTS.AUTH.REFRESH, {
            refresh_token: refreshToken,
        });
        return response.data;
    },

    /**
     * Logout and revoke refresh token
     */
    async logout(refreshToken: string): Promise<void> {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT, {
            refresh_token: refreshToken,
        });
    },

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);
        return response.data;
    },

    /**
     * Update user profile
     */
    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await api.patch<User>(API_ENDPOINTS.AUTH.ME, data);
        return response.data;
    },

    /**
     * Change password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
            current_password: currentPassword,
            new_password: newPassword,
        });
    },
};
