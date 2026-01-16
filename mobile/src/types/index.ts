/**
 * TypeScript type definitions for the mobile app
 */

// User types
export interface User {
    id: string;
    email: string;
    full_name: string | null;
    phone_number: string | null;
    is_active: boolean;
    is_verified: boolean;
    has_accepted_terms: boolean;
    created_at: string;
}

// Authentication types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    full_name?: string;
    phone_number?: string;
    accept_terms: boolean;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_at: string;
}

// Chat types
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
    confidence_score?: number;
    legal_disclaimer?: string;
    timestamp: number;
    isLoading?: boolean;
    error?: string;
}

export interface ChatResponse {
    content: string;
    sources: string[];
    confidence_score: number;
    legal_disclaimer: string;
}

// Document types
export interface DangerousClause {
    clause: string;
    risk_level: string;
    explanation: string;
    simplified_explanation: string;
    long_term_implications: string;
    pros: string[];
    cons: string[];
    recommendation: string;
}

export interface DocumentAnalysisResponse {
    risk_score: number;
    verdict: 'Safe' | 'Caution' | 'Do Not Sign';
    dangerous_clauses: DangerousClause[];
    summary: string;
    legal_disclaimer: string;
}

export interface DocumentGenerationResponse {
    content: string;
    doc_type: string;
    warning: string;
}

export interface EscalationResponse {
    success: boolean;
    message: string;
    reference_number: string;
    estimated_response_time: string;
}

// Lawyer directory types
export interface LegalOrganization {
    id: string;
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    location: string;
    specialty: string[];
    website?: string;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Navigation types (will be extended in navigation/types.ts)
export type RootStackParamList = {
    Onboarding: undefined;
    Auth: undefined;
    Main: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Chat: undefined;
    Tools: undefined;
    Profile: undefined;
};
