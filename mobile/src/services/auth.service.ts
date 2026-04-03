/**
 * Authentication Service
 * Refactored to use Supabase Auth for production reliability.
 */

import { supabase } from './supabaseClient';
import type { LoginCredentials, RegisterData, AuthTokens, User } from '../types';

export const authService = {
    /**
     * Register a new user account via Supabase Auth
     */
    async register(data: RegisterData): Promise<any> {
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    full_name: data.full_name,
                    phone_number: data.phone_number,
                }
            }
        });

        if (error) throw error;
        return authData;
    },

    /**
     * Login with email and password via Supabase
     */
    async login(credentials: LoginCredentials): Promise<any> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) throw error;
        return data;
    },

    /**
     * Logout and clear local session
     */
    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Get current authenticated user session/profile
     */
    async getCurrentUser(): Promise<User | null> {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;

        // Fetch custom profile data (including is_superuser) from public.users table
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.warn('Could not fetch user profile from public.users:', profileError);
        }

        // Map Supabase and Database data to our internal User type
        return {
            id: user.id,
            email: user.email || '',
            full_name: profile?.full_name || user.user_metadata?.full_name || '',
            avatar_url: profile?.avatar_url || null,
            phone_number: profile?.phone_number || user.user_metadata?.phone_number || '',
            is_active: profile?.is_active ?? true,
            is_verified: profile?.is_verified ?? false,
            has_accepted_terms: profile?.has_accepted_terms ?? false,
            is_superuser: profile?.is_superuser ?? false,
            created_at: user.created_at,
        } as User;
    },

    /**
     * Update user metadata in Supabase
     */
    async updateProfile(data: Partial<User>): Promise<User | null> {
        const { data: { user }, error } = await supabase.auth.updateUser({
            data: {
                full_name: data.full_name,
                phone_number: data.phone_number,
            }
        });

        if (error || !user) throw error;

        return {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            phone_number: user.user_metadata?.phone_number || '',
            created_at: user.created_at,
        } as User;
    },

    /**
     * Reset password / Change password
     */
    async changePassword(newPassword: string): Promise<void> {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
    },

    /**
     * Get active session
     */
    async getSession() {
        return await supabase.auth.getSession();
    }
};

