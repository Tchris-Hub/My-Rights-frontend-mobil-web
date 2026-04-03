import { supabase } from './supabaseClient';
import type { DocumentAnalysisResponse, DocumentGenerationResponse, AuthenticityMarkers } from '../types';

export const documentService = {
    /**
     * Analyze a contract or document for risks via Supabase Edge Function
     */
    async analyzeDocument(documentText: string): Promise<DocumentAnalysisResponse> {
        const { data, error } = await supabase.functions.invoke('legal-advisor', {
            body: { 
                messages: [
                    { 
                        role: 'user', 
                        content: `Please analyze the following document for legal risks, key clauses, and suggested improvements: \n\n${documentText}` 
                    }
                ],
                mode: 'analysis'
            }
        });

        if (error) throw error;

        // Structured data returned by Edge Function
        return data as DocumentAnalysisResponse;
    },

    /**
     * Generate a legal document template via Supabase Edge Function
     */
    async generateDocument(docType: string, userDetails: string): Promise<DocumentGenerationResponse> {
        const { data, error } = await supabase.functions.invoke('legal-advisor', {
            body: { 
                messages: [
                    { 
                        role: 'user', 
                        content: `Generate a detailed ${docType} document template based on these details: ${userDetails}` 
                    }
                ],
                mode: 'generation'
            }
        });

        if (error) throw error;
        return data as DocumentGenerationResponse;
    },

    /**
     * OCR / Text Extraction
     */
    async extractText(uri: string): Promise<string> {
        return "Feature coming soon: OCR integration via Supabase Storage.";
    },

    async verifyStamp(uri: string): Promise<AuthenticityMarkers> {
        return {
            has_stamp: false,
            has_signature: false,
            verdict: 'Unknown',
            confidence: 'Low',
            details: "Visual verification is scheduled for the next release.",
            red_flags: []
        };
    },
};

