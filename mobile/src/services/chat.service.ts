import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, createIdempotencyKey } from './api';
import { STORAGE_KEYS } from '../constants/config';
type ChatSession = { id: string; title: string | null; created_at?: string; updated_at: string };

function toSourceCitations(sources: GroundingSource[] | undefined): SourceCitation[] | undefined {
    if (!Array.isArray(sources)) return undefined;
    return sources.map((source) => ({ ...source, excerpt: source.excerpt ?? '' }));
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
    ): Promise<AiChatResponse> {
        const persist = options.persist !== false;
        const response = await apiRequest<AiChatResponse>('/api/ai/chat', {
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
        validateChatResponse(response);
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
                const evidenceBacked = m.role === 'assistant'
                    && (m.citation_status === 'verified_context' || m.citation_status === 'live_research')
                    && Boolean(sources?.length);
                return {
                    id: m.id,
                    role: m.role,
                    content: m.role === 'assistant' && m.citation_status === 'unverified'
                        ? 'This earlier AI answer is not displayed because it was stored without verifiable legal-source evidence.'
                        : m.content,
                    timestamp: new Date(m.created_at).getTime(),
                    sources: evidenceBacked ? toSourceCitations(sources) : undefined,
                    isVerified: m.citation_status === 'verified_context',
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
