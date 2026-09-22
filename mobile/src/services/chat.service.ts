import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, streamApiRequest, createIdempotencyKey } from './api';
import { STORAGE_KEYS } from '../constants/config';
import type { ChatMessage } from '../types';

type ChatSession = { id: string; title: string; updated_at: string };

type GroundingSource = {
    title: string;
    section?: string;
    excerpt?: string;
    citation?: string;
    source_url?: string;
    issuing_authority?: string;
};

type ChatResult = {
    content: string;
    conversation_id: string | null;
    sources?: GroundingSource[];
    citation_status?: string;
};

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
        options: { conversationId?: string; persist?: boolean },
    ): Promise<ChatResult> {
        const shouldPersist = options.persist !== false;
        const currentSessionId = shouldPersist
            ? (options.conversationId ?? (await this.createConversation(message)))
            : null;

        const result = await apiRequest<ChatResult>('/api/ai/chat', {
            method: 'POST',
            headers: { 'Idempotency-Key': createIdempotencyKey() },
            body: JSON.stringify({
                conversation_id: currentSessionId,
                message,
            }),
        });

        if (!result?.content?.trim()) throw new Error('AI returned no usable response.');
        return result;
    },

    async streamMessage(
        message: string,
        options: {
            conversationId?: string;
            persist?: boolean;
            onChunk: (chunk: string) => void;
            onComplete?: (meta: { sources?: GroundingSource[]; citation_status?: string }) => void;
        },
    ): Promise<string | null> {
        const shouldPersist = options.persist !== false;
        const currentSessionId = shouldPersist
            ? (options.conversationId ?? (await this.createConversation(message)))
            : null;

        const response = await streamApiRequest('/api/ai/chat/stream', {
            method: 'POST',
            headers: { 'Idempotency-Key': createIdempotencyKey() },
            body: JSON.stringify({
                conversation_id: currentSessionId,
                message,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            let messageText = 'AI request could not be completed.';
            try {
                const payload = JSON.parse(text);
                if (typeof payload?.error === 'string') messageText = payload.error;
            } catch {
                // Keep the sanitized fallback.
            }
            throw new Error(messageText);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let conversationId: string | null = currentSessionId;
        let completed = false;

        const processEvent = (event: string) => {
            for (const line of event.split(/\\r?\\n/)) {
                if (!line.startsWith('data:')) continue;
                const raw = line.slice(5).trim();
                if (!raw) continue;
                const payload = JSON.parse(raw) as {
                    type?: 'delta' | 'done' | 'error';
                    content?: string;
                    conversation_id?: string | null;
                    error?: string;
                    sources?: GroundingSource[];
                    citation_status?: string;
                };
                if (payload.type === 'delta' && typeof payload.content === 'string') {
                    options.onChunk(payload.content);
                } else if (payload.type === 'done') {
                    conversationId = payload.conversation_id ?? null;
                    options.onComplete?.({
                        sources: payload.sources,
                        citation_status: payload.citation_status,
                    });
                    completed = true;
                } else if (payload.type === 'error') {
                    throw new Error(payload.error || 'AI provider request failed.');
                }
            }
        };

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                let separator = buffer.indexOf('\\n\\n');
                while (separator >= 0) {
                    processEvent(buffer.slice(0, separator));
                    buffer = buffer.slice(separator + 2);
                    separator = buffer.indexOf('\\n\\n');
                }
            }
            buffer += decoder.decode();
            if (buffer.trim()) processEvent(buffer);
        } finally {
            reader.releaseLock();
        }

        if (!completed) throw new Error('AI stream ended before completion.');
        return conversationId;
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
        const data = await apiRequest<Array<{ id: string; role: 'user' | 'assistant'; content: string; created_at: string }>>(
            '/api/chat/sessions/' + conversationId + '/messages',
        );

        return {
            conversationId,
            messages: data.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.created_at).getTime(),
            })),
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
