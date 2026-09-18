import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { STORAGE_KEYS } from '../constants/config';
import type {
    ChatMessage,
    ChatResponse,
} from '../types';

export const chatService = {
    async sendMessage(message: string, options: { conversationId?: string; jurisdiction: string } ): Promise<ChatResponse> {
        const { conversationId, jurisdiction } = options;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            throw new Error('Sign in to use the legal advisor.');
        }

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

        const { data, error } = await supabase.functions.invoke('legal-advisor', {
            body: {
                messages: [{ role: 'user', content: message }],
                conversation_id: currentSessionId,
                jurisdiction
            }
        });
        if (error) throw error;

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

    async streamMessage(
        message: string,
        options: {
            conversationId?: string;
            jurisdiction: string;
            persist?: boolean;
            onChunk: (chunk: string) => void;
        }
    ): Promise<string | null> {
        const { conversationId, jurisdiction, persist = true, onChunk } = options;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            throw new Error('Sign in to use the legal advisor.');
        }

        let currentSessionId = conversationId ?? null;
        if (persist && !currentSessionId) {
            const { data: newSession, error: sessionError } = await supabase
                .from('chat_sessions')
                .insert({ title: message.substring(0, 50), user_id: session.user.id })
                .select('id')
                .single();
            if (sessionError || !newSession?.id) {
                throw new Error('Unable to create the conversation.');
            }
            currentSessionId = newSession.id;
        }

        if (persist && currentSessionId) {
            const { error: userMessageError } = await supabase.from('chat_messages').insert({
                session_id: currentSessionId,
                role: 'user',
                content: message,
            });
            if (userMessageError) throw userMessageError;
        }

        const { data, error } = await supabase.functions.invoke('legal-advisor', {
            body: {
                messages: [{ role: 'user', content: message }],
                stream: true,
                conversation_id: currentSessionId ?? undefined,
                jurisdiction,
            },
        });

        if (error) {
            throw new Error('AI Stream Error');
        }

        const reader = data.getReader?.() || (data as Response).body?.getReader();
        if (!reader) throw new Error('Streaming not supported by this device environment');

        const decoder = new TextDecoder();
        let assistantContent = '';
        let streamDone = false;

        while (!streamDone) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\\n');
            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const dataLine = line.replace('data: ', '').trim();
                if (dataLine === '[DONE]') {
                    streamDone = true;
                    break;
                }
                try {
                    const parsed = JSON.parse(dataLine);
                    const chunkContent = parsed.choices?.[0]?.delta?.content || '';
                    if (chunkContent) {
                        assistantContent += chunkContent;
                        onChunk(chunkContent);
                    }
                } catch {
                    // Ignore incomplete SSE JSON frames; the provider may split a frame across chunks.
                }
            }
        }

        if (persist && currentSessionId && assistantContent) {
            const { error: assistantMessageError } = await supabase.from('chat_messages').insert({
                session_id: currentSessionId,
                role: 'assistant',
                content: assistantContent,
            });
            if (assistantMessageError) throw assistantMessageError;
        }

        return currentSessionId;
    },

    async getChatHistory(): Promise<any[]> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Sign in to view conversations.');
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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Sign in to view conversation details.');
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

    async deleteConversation(conversationId: string): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Sign in to manage conversations.');
        const { error } = await supabase.from('chat_sessions').delete().eq('id', conversationId);
        if (error) throw error;
        await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    },

    /**
     * Legal chat content is intentionally not persisted in generic AsyncStorage.
     * The backend conversation store is the canonical authenticated history;
     * logout/account switching must not leave legal text in a device cache.
     * Extra arguments are accepted for compatibility with older callers and
     * deliberately ignored.
     */
    async cacheMessages(_messages: ChatMessage[], ..._legacyArgs: unknown[]): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    },

    async getCachedMessages(): Promise<ChatMessage[]> {
        return [];
    },

    async getCachedConversation(): Promise<{ messages: ChatMessage[]; conversationId: string | null }> {
        return { messages: [], conversationId: null };
    }
};
