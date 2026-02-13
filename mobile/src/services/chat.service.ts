import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/config';
import type {
    ChatMessage,
    ChatResponse,
    AuthenticatedChatResponse,
    PublicChatResponse,
    EscalationResponse,
} from '../types';

type SendMessageOptions = {
    useAuthenticatedEndpoint?: boolean;
    conversationId?: string;
    suppressStorage?: boolean;
};

interface CachedConversationPayload {
    conversation_id: string | null;
    messages: ChatMessage[];
}

export const chatService = {
    /**
     * Send a chat message and get AI response
     * Switches between authenticated and public endpoints
     */
    async sendMessage(message: string, options: SendMessageOptions = {}): Promise<ChatResponse> {
        const { useAuthenticatedEndpoint = false, conversationId, suppressStorage = false } = options;

        if (useAuthenticatedEndpoint) {
            const payload: Record<string, unknown> = {
                content: message,
            };

            if (conversationId) {
                payload.conversation_id = conversationId;
            }

            if (suppressStorage) {
                payload.suppress_storage = true;
            }

            const response = await api.post<AuthenticatedChatResponse>(API_ENDPOINTS.CHAT.MESSAGE, payload);
            return response.data;
        }

        const response = await api.post<PublicChatResponse>(API_ENDPOINTS.CHAT.PUBLIC_MESSAGE, {
            message,
            content: message, // Backward compatibility for some schemas
        });

        return response.data;
    },

    /**
     * Store chat messages locally only if authenticated
     */
    async cacheMessages(messages: ChatMessage[], isAuthenticated: boolean, conversationId?: string | null): Promise<void> {
        if (!isAuthenticated) return; // Never cache guest messages

        try {
            const payload: CachedConversationPayload = {
                conversation_id: conversationId ?? null,
                messages,
            };
            await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(payload));
        } catch (error) {
            console.error('Failed to cache messages:', error);
        }
    },

    async getCachedMessages(): Promise<ChatMessage[]> {
        const { messages } = await this.getCachedConversation();
        return messages;
    },

    /**
     * Get cached messages
     */
    async getCachedConversation(): Promise<{ conversationId: string | null; messages: ChatMessage[] }> {
        try {
            const cached = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
            if (!cached) {
                return { conversationId: null, messages: [] };
            }

            const parsed = JSON.parse(cached) as ChatMessage[] | CachedConversationPayload;

            if (Array.isArray(parsed)) {
                return { conversationId: null, messages: parsed };
            }

            return {
                conversationId: parsed.conversation_id ?? null,
                messages: parsed.messages ?? [],
            };
        } catch (error) {
            return { conversationId: null, messages: [] };
        }
    },

    /**
     * Get chat history from server (Authenticated only)
     */
    async getChatHistory(): Promise<any[]> {
        try {
            const response = await api.get(API_ENDPOINTS.CHAT.HISTORY);
            // Handle pagination if necessary (backend returns ConversationList)
            return response.data.conversations || [];
        } catch (error) {
            return [];
        }
    },

    /**
     * Get details of a specific conversation (messages)
     */
    async getConversationDetails(conversationId: string): Promise<{ messages: ChatMessage[], conversationId: string }> {
        try {
            const response = await api.get<{ messages: any[] }>(API_ENDPOINTS.CHAT.DETAILS(conversationId));

            // Map backend messages to frontend ChatMessage format
            const messages: ChatMessage[] = response.data.messages.map((msg: any) => ({
                id: msg.id,
                role: msg.role === 'system' ? 'assistant' : (msg.role as 'user' | 'assistant'),
                content: msg.content,
                timestamp: new Date(msg.created_at).getTime(),
                sources: msg.sources,
                confidence_score: msg.confidence_score ? Number(msg.confidence_score) : undefined,
            }));

            return { messages, conversationId };
        } catch (error) {
            console.error('Failed to fetch conversation details:', error);
            throw error;
        }
    },

    /**
     * Escalate a conversation to a human lawyer (Authenticated only)
     */
    async escalateConversation(
        conversationId: string,
        reason: string,
        urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium',
        contactPreference: 'email' | 'phone' | 'either' = 'either'
    ): Promise<EscalationResponse> {
        const response = await api.post<EscalationResponse>(API_ENDPOINTS.CHAT.ESCALATE, {
            conversation_id: conversationId,
            reason,
            urgency,
            contact_preference: contactPreference,
        });
        return response.data;
    },

    /**
     * Transcribe audio to text using Whisper (Public endpoint)
     */
    async transcribeAudio(uri: string): Promise<{ text: string }> {
        const formData = new FormData();

        // Convert URI to file object for FormData
        // On mobile, uri is the local path
        const filename = uri.split('/').pop() || 'recording.m4a';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `audio/${match[1]}` : `audio/m4a`;

        formData.append('audio', {
            uri,
            name: filename,
            type,
        } as any);

        const response = await api.post<{ success: boolean; text: string }>(
            API_ENDPOINTS.CHAT.TRANSCRIBE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return { text: response.data.text };
    },

    /**
     * Delete a conversation (Authenticated only)
     */
    async deleteConversation(conversationId: string): Promise<void> {
        await api.delete(API_ENDPOINTS.CHAT.DETAILS(conversationId));

        // If the deleted conversation is the one cached locally, clear it
        const { conversationId: cachedId } = await this.getCachedConversation();
        if (cachedId === conversationId) {
            await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
        }
    },

    /**
     * Store generated documents/reviews locally
     */
    async saveDocument(doc: { type: string; title: string; content: string }): Promise<void> {
        try {
            const saved = await AsyncStorage.getItem('myrights_saved_documents');
            const docs = saved ? JSON.parse(saved) : [];
            docs.unshift({
                ...doc,
                id: Date.now().toString(),
                created_at: new Date().toISOString(),
            });
            await AsyncStorage.setItem('myrights_saved_documents', JSON.stringify(docs.slice(0, 50)));
        } catch (error) {
            console.error('Failed to save document:', error);
        }
    },

    /**
     * Get saved documents
     */
    async getSavedDocuments(): Promise<any[]> {
        try {
            const saved = await AsyncStorage.getItem('myrights_saved_documents');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    },
};
