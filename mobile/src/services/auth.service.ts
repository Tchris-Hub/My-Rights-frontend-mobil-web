/**
 * Authentication Service
 * Uses the single canonical Supabase client for production authentication.
 */

import { supabase } from './supabase';
import type { LoginCredentials, RegisterData, User } from '../types';

export const authService = {
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

    async login(credentials: LoginCredentials): Promise<any> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });
        if (error) throw error;
        return data;
    },

    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error || !authUser) return null;

        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

        return {
            id: authUser.id,
            email: authUser.email || '',
            full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
            avatar_url: profile?.avatar_url || null,
        } as User;
    },

    async updateProfile(data: Partial<User>): Promise<User | null> {
        const { data: { user }, error } = await supabase.auth.updateUser({
            data: { full_name: data.full_name }
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

    async changePassword(newPassword: string): Promise<void> {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
    },

    async getSession() {
        return await supabase.auth.getSession();
    }
};
