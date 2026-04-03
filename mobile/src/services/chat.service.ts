import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, supabaseAnonKey } from './supabaseClient';
import { STORAGE_KEYS } from '../constants/config';
import type {
    ChatMessage,
    ChatResponse,
    EscalationResponse,
} from '../types';

export const chatService = {
    /**
     * Send a single message to AI via Supabase Edge Function
     */
    async sendMessage(message: string, options: { conversationId?: string } = {}): Promise<ChatResponse> {
        const { conversationId } = options;
        const { data: { session } } = await supabase.auth.getSession();

        // 1. If authenticated, save user message to DB first
        let currentSessionId = conversationId;
        if (session && !currentSessionId) {
            const { data: newSession } = await supabase
                .from('chat_sessions')
                .insert({ title: message.substring(0, 50) })
                .select()
                .single();
            currentSessionId = newSession?.id;
        }

        if (session && currentSessionId) {
            await supabase.from('chat_messages').insert({
                session_id: currentSessionId,
                role: 'user',
                content: message
            });
        }

        // 2. Call AI Proxy
        const { data, error } = await supabase.functions.invoke('legal-advisor', {
            body: { 
                messages: [{ role: 'user', content: message }],
                conversation_id: currentSessionId 
            }
        });

        if (error) throw error;

        // 3. Save AI response to DB
        const aiContent = data.choices[0].message.content;
        if (session && currentSessionId) {
            await supabase.from('chat_messages').insert({
                session_id: currentSessionId,
                role: 'assistant',
                content: aiContent
            });
        }

        return {
            content: aiContent,
            conversation_id: currentSessionId,
            role: 'assistant',
            timestamp: Date.now()
        } as unknown as ChatResponse;
    },

    /**
     * Stream message via SSE using the legal-advisor proxy
     */
    async streamMessage(
        message: string,
        options: { conversationId?: string; onChunk: (chunk: string) => void }
    ): Promise<void> {
        const { conversationId, onChunk } = options;
        const { data: { session } } = await supabase.auth.getSession();

        // For simplicity in this production version, we use the direct function URL for streaming
        const baseUrl = (supabase as any).functionsUrl; // Internal helper or construct manually
        const url = `${baseUrl}/legal-advisor`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
                'apikey': supabaseAnonKey
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: message }],
                stream: true,
                conversation_id: conversationId
            }),
        });

        if (!response.ok) throw new Error('AI Stream Error');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('Streaming not supported');

        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.replace('data: ', '').trim();
                    if (data === '[DONE]') break;
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0].delta?.content || '';
                        if (content) onChunk(content);
                    } catch (e) {
                        // Handle non-JSON lines or partials
                    }
                }
            }
        }
    },

    /**
     * History fetching from Supabase
     */
    async getChatHistory(): Promise<any[]> {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) return [];
        return data.map(s => ({
            id: s.id,
            title: s.title,
            updated_at: s.updated_at
        }));
    },

    async getConversationDetails(conversationId: string): Promise<{ messages: ChatMessage[], conversationId: string }> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return {
            conversationId,
            messages: data.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.created_at).getTime()
            }))
        };
    },

    /**
     * Delete a conversation
     */
    async deleteConversation(conversationId: string): Promise<void> {
        await supabase.from('chat_sessions').delete().eq('id', conversationId);
        await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    },

    /**
     * Utility: Store locally as secondary cache
     */
    async cacheMessages(messages: ChatMessage[]): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    },

    async getCachedMessages(): Promise<ChatMessage[]> {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
        return cached ? JSON.parse(cached) : [];
    }
};

