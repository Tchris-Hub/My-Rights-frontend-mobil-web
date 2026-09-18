/**
 * Authentication Service
 * Uses the single canonical Supabase client for production authentication.
 *
 * Security boundary:
 * - Supabase Auth is the source of truth for identity/session state.
 * - Client-side checks improve UX only; authorization must be enforced server-side/RLS.
 * - No privileged Supabase key or provider credential is used here.
 */

import { supabase } from './supabase';
import type { LoginCredentials, RegisterData, User } from '../types';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const validateCredentials = (email: string, password: string): void => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Enter a valid email address.');
    }
    if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
    }
};

export const authService = {
    async register(data: RegisterData): Promise<any> {
        validateCredentials(data.email, data.password);

        if (data.accept_terms !== true) {
            throw new Error('You must accept the Terms of Service and Privacy Policy before creating an account.');
        }

        const { data: authData, error } = await supabase.auth.signUp({
            email: normalizeEmail(data.email),
            password: data.password,
            options: {
                data: {
                    full_name: data.full_name?.trim() || '',
                    phone_number: data.phone_number?.trim() || '',
                }
            }
        });

        if (error) throw error;
        return authData;
    },

    async login(credentials: LoginCredentials): Promise<any> {
        validateCredentials(credentials.email, credentials.password);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizeEmail(credentials.email),
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

        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

        if (profileError) {
            throw profileError;
        }

        return {
            id: authUser.id,
            email: authUser.email || '',
            full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
            avatar_url: profile?.avatar_url || null,
            phone_number: profile?.phone_number || authUser.user_metadata?.phone_number || null,
            is_active: profile?.is_active ?? true,
            is_verified: profile?.is_verified ?? false,
            has_accepted_terms: profile?.has_accepted_terms ?? false,
            is_superuser: profile?.is_superuser ?? false,
            created_at: profile?.created_at || authUser.created_at,
        };
    },

    async updateProfile(data: Partial<User>): Promise<User | null> {
        const { data: { user }, error } = await supabase.auth.updateUser({
            data: {
                full_name: data.full_name?.trim() || '',
                phone_number: data.phone_number?.trim() || '',
            }
        });

        if (error || !user) throw error || new Error('Unable to update profile.');

        return {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || null,
            phone_number: user.user_metadata?.phone_number || '',
            is_active: true,
            is_verified: false,
            has_accepted_terms: false,
            is_superuser: false,
            created_at: user.created_at,
        };
    },

    async changePassword(newPassword: string): Promise<void> {
        if (!newPassword || newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters.');
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
    },

    async getSession() {
        return await supabase.auth.getSession();
    }
};
