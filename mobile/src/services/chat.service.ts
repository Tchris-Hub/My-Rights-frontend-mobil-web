import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';
import { STORAGE_KEYS } from '../constants/config';
import type { ChatMessage } from '../types';

type ChatSession = { id: string; title: string; updated_at: string };

type ChatResult = {
    content: string;
    conversation_id: string | null;
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
        },
    ): Promise<string | null> {
        // The method name is retained for UI compatibility, but this request
        // is deliberately non-streaming until the transport supports SSE.
        const result = await this.sendMessage(message, {
            conversationId: options.conversationId,
            persist: options.persist,
        });
        options.onChunk(result.content);
        return result.conversation_id;
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
