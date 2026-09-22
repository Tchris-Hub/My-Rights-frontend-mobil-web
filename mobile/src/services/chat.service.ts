import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';
import { STORAGE_KEYS, APP_CONFIG } from '../constants/config';
import type { ChatMessage } from '../types';

type ChatSession = { id: string; title: string; updated_at: string };

export const chatService = {
    async createConversation(title: string): Promise<string> {
        const session = await apiRequest<{ id: string }>('/api/chat/sessions', {
            method: 'POST',
            body: JSON.stringify({ title: title.substring(0, 50) }),
        });
        return session.id;
    },

    async sendMessage(message: string, options: { conversationId?: string; jurisdiction: string }): Promise<{ content: string; conversation_id: string }> {
        const currentSessionId = options.conversationId ?? (await this.createConversation(message));

        await apiRequest('/api/chat/sessions/' + currentSessionId + '/messages', {
            method: 'POST',
            body: JSON.stringify({ role: 'user', content: message }),
        });

        const result = await apiRequest<{ content: string }>('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({
                conversation_id: currentSessionId,
                message,
                jurisdiction: options.jurisdiction || APP_CONFIG.LEGAL_JURISDICTION,
            }),
        });

        if (!result?.content?.trim()) throw new Error('AI returned no usable response.');
        return { ...result, conversation_id: currentSessionId };
    },

    async streamMessage(
        message: string,
        options: {
            conversationId?: string;
            jurisdiction: string;
            persist?: boolean;
            onChunk: (chunk: string) => void;
        },
    ): Promise<string | null> {
        const currentSessionId =
            options.conversationId ?? (options.persist === false ? null : await this.createConversation(message));

        if (options.persist !== false && currentSessionId) {
            await apiRequest('/api/chat/sessions/' + currentSessionId + '/messages', {
                method: 'POST',
                body: JSON.stringify({ role: 'user', content: message }),
            });
        }

        const result = await apiRequest<{ content: string }>('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({
                conversation_id: currentSessionId,
                message,
                jurisdiction: options.jurisdiction || APP_CONFIG.LEGAL_JURISDICTION,
            }),
        });

        if (!result.content?.trim()) throw new Error('AI returned no usable response.');
        options.onChunk(result.content);

        if (options.persist !== false && currentSessionId) {
            await apiRequest('/api/chat/sessions/' + currentSessionId + '/messages', {
                method: 'POST',
                body: JSON.stringify({ role: 'assistant', content: result.content }),
            });
        }

        return currentSessionId;
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
