import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://injustice-production.up.railway.app";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Chat API
export interface ChatMessage {
    message: string;
}

export interface ChatResponse {
    content: string;
    sources: string[];
    confidence_score: number;
    legal_disclaimer: string;
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>("/api/v1/chat/public/message", {
        message,
    });
    return response.data;
}

// Document Review API
export interface DocumentAnalysisRequest {
    document_text: string;
}

export interface DangerousClause {
    clause: string;
    risk_level: string;
    explanation: string;
    recommendation: string;
}

export interface DocumentAnalysisResponse {
    risk_score: number;
    verdict: "Safe" | "Caution" | "Do Not Sign";
    dangerous_clauses: DangerousClause[];
    summary: string;
    legal_disclaimer: string;
}

export async function analyzeDocument(
    documentText: string
): Promise<DocumentAnalysisResponse> {
    const response = await api.post<DocumentAnalysisResponse>(
        "/api/v1/chat/analyze-document",
        {
            document_text: documentText,
        }
    );
    return response.data;
}

// Document Generator API
export interface DocumentGenerationRequest {
    doc_type: string;
    user_details: string;
}

export interface DocumentGenerationResponse {
    content: string;
    doc_type: string;
    warning: string;
}

export async function generateDocument(
    docType: string,
    userDetails: string
): Promise<DocumentGenerationResponse> {
    const response = await api.post<DocumentGenerationResponse>(
        "/api/v1/chat/generate-document",
        {
            doc_type: docType,
            user_details: userDetails,
        }
    );
    return response.data;
}
