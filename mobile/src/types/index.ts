/**
 * TypeScript type definitions for the mobile app
 */

// User types
export interface User {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    phone_number: string | null;
    is_active: boolean;
    is_verified: boolean;
    has_accepted_terms: boolean;
    is_superuser: boolean;
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
export interface SourceCitation {
    title: string;
    section?: string;
    excerpt: string;
    document_type: string;
    relevance_score?: number;
}

export interface MessageResponse {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: SourceCitation[];
    confidence_score?: string;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
    sources?: Array<string | { title: string; section?: string }>;
    confidence_score?: number;
    legal_disclaimer?: string;
    isVerified?: boolean;
    isLoading?: boolean;
    error?: string;
    isNew?: boolean; // Indicates if the message was just received (triggers typing animation)
}

export interface PublicChatResponse {
    content: string;
    sources: string[];
    confidence_score?: string | number;
    legal_disclaimer: string;
}

export interface AuthenticatedChatResponse {
    message: MessageResponse;
    conversation_id: string;
    conversation_title?: string;
    risk_level?: string;
    escalation_recommended: boolean;
    disclaimer: string;
}

export type ChatResponse = PublicChatResponse | AuthenticatedChatResponse;

// Document types
export interface AnalysisResult {
    clause_title: string;
    clause_text: string;
    risk_level: 'Low' | 'Medium' | 'High';
    explanation_ei: string;
    legal_principle: string;
    long_term_risk: string;
    action_step: string;
}

export interface AuthenticityMarkers {
    has_stamp: boolean;
    has_signature: boolean;
    verdict: 'Likely Authentic' | 'Suspicious' | 'No Stamp Found' | 'Unknown';
    confidence: 'High' | 'Medium' | 'Low';
    details: string;
    red_flags: string[];
}

export interface DocumentAnalysisResponse {
    document_type: string;
    confidence_score: number;
    summary: string;
    risk_score: number;
    analysis_results: AnalysisResult[];
    overall_verdict: string;
    disclaimer: string;
    // Error handling
    error?: string;
    details?: string;
    // Visual Stamp Detection
    authenticity_markers?: AuthenticityMarkers;
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

// Constitution & Legal Architect Types
export interface Section {
    id: number;
    chapter_id: number;
    section_number: string;
    title: string;
    content: string;
    key_takeaway?: string;
}

export interface Chapter {
    id: number;
    chapter_number: number;
    title: string;
    sections?: Section[];
}

export interface TemplateField {
    key: string;
    label: string;
    placeholder: string;
    type?: 'text' | 'number';
}

export interface Template {
    id: string;
    title: string;
    category: string;
    description: string;
    content_template: string;
    fields: TemplateField[];
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

export interface LegalAidCenter {
    id: string;
    name: string;
    address: string;
    phone: string;
    type: 'Government' | 'NGO' | 'Legal Center';
    latitude: number;
    longitude: number;
    rating: number;
    reviews: number;
    credibility: string;
}

export interface Lawyer {
    id: string;
    name: string;
    specialization: string;
    location: string;
    experience_years: number;
    cases_won: number;
    rating: number;
    reviews: number;
    credibility: string;
    bio?: string;
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
