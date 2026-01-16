/**
 * Document Service
 * API methods for document analysis and generation
 */

import api from './api';
import { API_ENDPOINTS } from '../constants/config';
import type { DocumentAnalysisResponse, DocumentGenerationResponse } from '../types';

export const documentService = {
    /**
     * Analyze a contract or document for risks
     */
    async analyzeDocument(documentText: string): Promise<DocumentAnalysisResponse> {
        const response = await api.post<DocumentAnalysisResponse>(
            API_ENDPOINTS.DOCUMENTS.ANALYZE,
            { document_text: documentText }
        );
        return response.data;
    },

    /**
     * Generate a legal document template
     */
    async generateDocument(docType: string, userDetails: string): Promise<DocumentGenerationResponse> {
        const response = await api.post<DocumentGenerationResponse>(
            API_ENDPOINTS.DOCUMENTS.GENERATE,
            {
                doc_type: docType,
                user_details: userDetails,
            }
        );
        return response.data;
    },
};
