import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/config';
import type { ChatResponse, ChatMessage, EscalationResponse } from '../types';

export const chatService = {
    /**
     * Send a chat message and get AI response
     * Switches between authenticated and public endpoints
     */
    async sendMessage(message: string, isAuthenticated: boolean = false): Promise<ChatResponse> {
        const endpoint = isAuthenticated
            ? API_ENDPOINTS.CHAT.MESSAGE
            : API_ENDPOINTS.CHAT.PUBLIC_MESSAGE;

        const response = await api.post<ChatResponse>(endpoint, {
            message,
            content: message, // Backward compatibility for some schemas
        });

        return response.data;
    },

    /**
     * Store chat messages locally only if authenticated
     */
    async cacheMessages(messages: ChatMessage[], isAuthenticated: boolean): Promise<void> {
        if (!isAuthenticated) return; // Never cache guest messages

        try {
            await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
        } catch (error) {
            console.error('Failed to cache messages:', error);
        }
    },

    /**
     * Get cached messages
     */
    async getCachedMessages(): Promise<ChatMessage[]> {
        try {
            const cached = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            return [];
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
};
