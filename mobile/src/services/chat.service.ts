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
        if (!currentSessionId) {
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

        const { error: userMessageError } = await supabase.from('chat_messages').insert({
            session_id: currentSessionId,
            role: 'user',
            content: message
        });
        if (userMessageError) throw new Error('Unable to save the message.');

        const { data, error } = await supabase.functions.invoke('legal-advisor', {
            body: {
                messages: [{ role: 'user', content: message }],
                conversation_id: currentSessionId,
                jurisdiction
            }
        });
        if (error) throw new Error('AI request failed. Please try again.');

        const aiContent = data?.choices?.[0]?.message?.content;
        if (typeof aiContent !== 'string' || !aiContent.trim()) {
            throw new Error('AI returned no usable response.');
        }

        const { error: assistantMessageError } = await supabase.from('chat_messages').insert({
            session_id: currentSessionId,
            role: 'assistant',
            content: aiContent.trim()
        });
        if (assistantMessageError) throw new Error('AI response could not be saved safely.');

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
        let buffer = '';

        while (!streamDone) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\\n\\n');
            buffer = events.pop() ?? '';

            for (const event of events) {
                const dataLines = event
                    .split('\\n')
                    .filter((line) => line.startsWith('data: '))
                    .map((line) => line.slice(6).trim());

                for (const dataLine of dataLines) {
                    if (dataLine === '[DONE]') {
                        streamDone = true;
                        break;
                    }

                    try {
                        const parsed = JSON.parse(dataLine);
                        const chunkContent = parsed.choices?.[0]?.delta?.content;
                        if (typeof chunkContent === 'string' && chunkContent) {
                            assistantContent += chunkContent;
                            if (assistantContent.length > 20_000) {
                                throw new Error('AI response is too large.');
                            }
                            onChunk(chunkContent);
                        }
                    } catch (parseError) {
                        if (parseError instanceof Error && parseError.message === 'AI response is too large.') {
                            throw parseError;
                        }
                        throw new Error('AI stream returned an invalid response.');
                    }
                }
            }
        }

        if (!streamDone) {
            throw new Error('AI stream ended before a complete response was received.');
        }

        const finalChunk = decoder.decode();
        if (finalChunk) {
            buffer += finalChunk;
        }

        if (!assistantContent.trim()) {
            throw new Error('AI stream returned no usable response.');
        }

        if (persist && currentSessionId) {
            const { error: assistantMessageError } = await supabase.from('chat_messages').insert({
                session_id: currentSessionId,
                role: 'assistant',
                content: assistantContent,
            });
            if (assistantMessageError) throw new Error('AI response could not be saved safely.');
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
        if (error) throw new Error('Unable to load conversation history.');
        return (data ?? []).map(s => ({
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
