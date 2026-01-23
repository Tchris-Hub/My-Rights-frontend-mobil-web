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

    /**
     * Extract text from an image or PDF
     */
    async extractText(uri: string, fileName?: string, mimeType?: string): Promise<string> {
        const formData = new FormData();

        // Use provided metadata or fallback to URI parsing
        const finalName = fileName || uri.split('/').pop() || 'document.jpg';

        // Efficient production-grade MIME mapping
        let finalType = mimeType;
        if (!finalType) {
            const extension = finalName.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeMap: Record<string, string> = {
                'pdf': 'application/pdf',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'txt': 'text/plain',
                'png': 'image/png',
                'webp': 'image/webp',
                'heic': 'image/heic',
            };
            finalType = mimeMap[extension] || 'image/jpeg';
        }

        // @ts-ignore - React Native FormData expects uri, name, type
        formData.append('image', {
            uri: uri,
            name: finalName,
            type: finalType,
        });

        const response = await api.post<{ success: boolean; text: string }>(
            API_ENDPOINTS.DOCUMENTS.EXTRACT_TEXT,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data, headers) => {
                    return formData; // Prevent axios from serializing FormData
                },
            }
        );
        return response.data.text;
    },
};
