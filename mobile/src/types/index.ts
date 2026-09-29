/**
 * TypeScript type definitions for the mobile app
 */

// User types
export interface User {
    id: string;
    email: string;
    name: string;
    image: string | null;
    phone_number: string | null;
    is_active: boolean;
    emailVerified: boolean;
    is_superuser: boolean;
    account_type?: 'unset' | 'client' | 'legal_professional';
    createdAt: string;
}

// Authentication uses passwordless email magic links or Google OAuth.
// Chat types
export interface SourceCitation {
    id: string;
    title: string;
    section?: string;
    excerpt: string;
    citation?: string;
    source_url?: string;
    issuing_authority?: string;
    source_type?: string;
    verified_at?: string;
    effective_from?: string;
    effective_to?: string;
    retrieval_score?: number;
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
    sources?: Array<SourceCitation>;
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
    summary: string;
    analysis_results: AnalysisResult[];
    overall_verdict: string;
    disclaimer: string;
    // Error handling
    error?: string;
    details?: string;
    // Visual Stamp Detection
    authenticity_markers?: AuthenticityMarkers;
    quota?: {
        feature: 'document_analyze';
        used: number;
        limit: number;
        remaining: number;
    };
}

export interface DocumentGenerationResponse {
    content: string;
    doc_type: string;
    warning: string;
    quota?: {
        feature: 'document_generate';
        used: number;
        limit: number;
        remaining: number;
    };
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
    credibility: 'Verified by source registry' | 'Verified professional profile' | 'Unverified';
    verification_status?: 'verified' | 'unverified';
    verification_source_url?: string;
    verified_at?: string;
}

export interface MarketplaceMatchReason {
    matched_attributes: string[];
    match_reasons: string[];
}

export interface ProfessionalMatch extends MarketplaceMatchReason {
    id: string;
    display_name: string;
    role: string;
    bio?: string | null;
    location?: string | null;
    practice_areas: string[];
    service_areas: string[];
    languages: string[];
    availability?: string | null;
    fee_band?: string | null;
    public_phone?: string | null;
    whatsapp?: string | null;
    public_email?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    website?: string | null;
    bar_admission_number?: string | null;
    bar_association?: string | null;
    jurisdiction?: string | null;
    years_experience?: number;
    headline?: string | null;
    education?: string[];
    experience?: string[];
    certifications?: string[];
    skills?: string[];
    organization_name?: string | null;
    nba_branch?: string | null;
    year_of_call?: number | null;
    verification_status: 'verified';
    verified_at?: string | null;
    firms: Array<{ id: string; name: string; location?: string | null; member_role?: string | null }>;
}

export interface FirmMatch extends MarketplaceMatchReason {
    id: string;
    name: string;
    description?: string | null;
    location?: string | null;
    practice_areas: string[];
    service_areas: string[];
    languages: string[];
    fee_band?: string | null;
    verification_status: 'verified';
    verified_at?: string | null;
    professionals: Array<{ id: string; display_name: string; role: string; practice_areas: string[] }>;
}

export interface Lawyer {
    id: string;
    name: string;
    specialization: string;
    location: string;
    experience_years?: number;
    cases_won?: number;
    rating?: number;
    reviews?: number;
    credibility: 'Verified by source registry' | 'Verified professional profile' | 'Unverified';
    verification_status?: 'verified' | 'unverified';
    verification_source_url?: string;
    verified_at?: string;
    bio?: string;
    matched_attributes?: string[];
    match_reasons?: string[];
    public_phone?: string | null;
    whatsapp?: string | null;
    public_email?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    website?: string | null;
    headline?: string | null;
    education?: string[];
    experience?: string[];
    certifications?: string[];
    skills?: string[];
    organization_name?: string | null;
    nba_branch?: string | null;
    year_of_call?: number | null;
    bar_admission_number?: string | null;
    bar_association?: string | null;
    jurisdiction?: string | null;
    firms?: Array<{ id: string; name: string; location?: string | null; member_role?: string | null; public_phone?: string | null; whatsapp?: string | null; public_email?: string | null; instagram?: string | null; linkedin?: string | null; website?: string | null }>;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

