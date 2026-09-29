import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, createIdempotencyKey } from './api';
import { STORAGE_KEYS } from '../constants/config';
import { assertGroundedChat, type GroundingSource } from './ragPolicy';
import type { ChatMessage, SourceCitation } from '../types';

type ChatSession = { id: string; title: string | null; created_at?: string; updated_at: string };

function toSourceCitations(sources: GroundingSource[] | undefined): SourceCitation[] | undefined {
    if (!Array.isArray(sources)) return undefined;
    return sources.map((source) => ({ ...source, excerpt: source.excerpt ?? '' }));
}

type ChatResult = {
    content: string;
    conversation_id: string | null;
    sources?: GroundingSource[];
    citation_status?: string;
};

function assertChatResponse(result: ChatResult): void {
    const answer = result.content.trim();
    if (!answer) throw new Error('AI returned no usable response.');

    const status = result.citation_status;
    if (status !== 'verified_context' && status !== 'live_research' && status !== 'unverified') {
        throw new Error('AI returned an invalid evidence status.');
    }

    const sources = Array.isArray(result.sources) ? result.sources : [];
    const citations = answer.match(/\[S\d+\]/g) ?? [];
    const allowed = new Set(sources.map((source) => source.id));

    if (status === 'verified_context' || status === 'live_research') {
        if (sources.length === 0) throw new Error('AI returned verified-status content without sources.');
        if (citations.length === 0) throw new Error('AI answer did not include the required source citations.');
        if (citations.some((citation) => !allowed.has(citation.slice(1, -1)))) {
            throw new Error('AI answer contained an invalid source citation.');
        }
        return;
    }

    if (citations.some((citation) => !allowed.has(citation.slice(1, -1)))) {
        throw new Error('AI answer contained an invalid source citation.');
    }
}

export const chatService = {
    async createConversation(title: string): Promise<string> {
        const session = await apiRequest<{ id: string }>('/api/chat/sessions', {
            method: 'POST',
            body: JSON.stringify({ title: title.substring(0, 50) }),
        });
        return session.id;
    },

    async sendMessage(
        message: string,
        options: { conversationId?: string; persist?: boolean; attachmentText?: string },
    ): Promise<ChatResult> {
        const persist = options.persist !== false;
        const response = await apiRequest<ChatResult>('/api/ai/chat', {
            method: 'POST',
            headers: { 'Idempotency-Key': createIdempotencyKey() },
            body: JSON.stringify({
                conversation_id: options.conversationId ?? null,
                message,
                persist,
                ...(options.attachmentText ? { attachment_text: options.attachmentText } : {}),
            }),
        });

        if (!response?.content?.trim()) {
            throw new Error('AI returned no usable response.');
        }
        assertChatResponse(response);
        return response;
    },


    async escalateConversation(
        conversationId: string,
        reason: string,
        urgency: 'low' | 'medium' | 'high' | 'critical',
    ): Promise<{ reference_number: string; status: string }> {
        const trimmedReason = reason.trim();
        if (!conversationId || !trimmedReason) throw new Error('A conversation and reason are required.');
        if (trimmedReason.length > 4000) throw new Error('Escalation reason is too long.');

        return apiRequest('/api/escalations', {
            method: 'POST',
            body: JSON.stringify({ conversation_id: conversationId, reason: trimmedReason, urgency }),
        });
    },

    async getChatHistory(): Promise<ChatSession[]> {
        return apiRequest<ChatSession[]>('/api/chat/sessions');
    },

    async getConversationDetails(conversationId: string): Promise<{ messages: ChatMessage[]; conversationId: string }> {
        const data = await apiRequest<Array<{
            id: string;
            role: 'user' | 'assistant';
            content: string;
            created_at: string;
            grounding_sources?: GroundingSource[] | null;
            citation_status?: string | null;
        }>>(
            '/api/chat/sessions/' + conversationId + '/messages',
        );

        return {
            conversationId,
            messages: data.map((m) => {
                const sources = Array.isArray(m.grounding_sources) ? m.grounding_sources : undefined;
                const verified = m.role === 'assistant'
                    && m.citation_status === 'verified_context'
                    && Boolean(sources?.length);
                return {
                    id: m.id,
                    role: m.role,
                    content: m.role === 'assistant' && !verified
                        ? 'This earlier AI answer is not displayed because it was not stored with verifiable legal-source evidence.'
                        : m.content,
                    timestamp: new Date(m.created_at).getTime(),
                    sources: verified ? toSourceCitations(sources) : undefined,
                    isVerified: verified,
                };
            }),
        };
    },

    async deleteConversation(conversationId: string): Promise<void> {
        await apiRequest('/api/chat/sessions/' + conversationId, { method: 'DELETE' });
        await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    },

    async cacheMessages(_messages: ChatMessage[], ..._legacyArgs: unknown[]): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    },

    async getCachedMessages(): Promise<ChatMessage[]> { return []; },

    async getCachedConversation(): Promise<{ messages: ChatMessage[]; conversationId: string | null }> {
        return { messages: [], conversationId: null };
    },
};
