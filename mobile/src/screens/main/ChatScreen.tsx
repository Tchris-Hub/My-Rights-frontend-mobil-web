import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
    Alert,
    Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { EscalateModal } from '../../components/chat/EscalateModal';
import { chatService } from '../../services/chat.service';
import { useAuth } from '../../contexts/AuthContext';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatMessage } from '../../types';

const SUGGESTIONS = [
    { title: 'Tenant Rights', query: 'What are my rights as a tenant?' },
    { title: 'Demand Letter', query: 'How do I write a demand letter?' },
    { title: 'Employment', query: 'Can my employer fire me without notice?' },
    { title: 'Land law', query: 'Explain the Land Use Act simply.' },
];

export const ChatScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { isAuthenticated, isGuest } = useAuth();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isIncognito, setIsIncognito] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const flatListRef = useRef<FlatList>(null);

    // Ephemeral logic: Clear chat if guest leaves the screen
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                if (isGuest || !isAuthenticated) {
                    setMessages([]);
                    chatService.cacheMessages([], false); // Clear cache too just in case
                }
            };
        }, [isGuest, isAuthenticated])
    );

    useEffect(() => {
        if (isAuthenticated) {
            loadCachedMessages();
        }
    }, [isAuthenticated]);

    const loadCachedMessages = async () => {
        const cached = await chatService.getCachedMessages();
        if (cached.length > 0) {
            setMessages(cached);
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            // Only cache if authenticated and NOT in incognito mode
            if (isAuthenticated && !isIncognito) {
                chatService.cacheMessages(messages, true);
            }
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages, isIncognito, isAuthenticated]);

    // Clean up recording on unmount
    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
        };
    }, [recording]);

    const handleSend = async (text?: string) => {
        const messageText = text || inputText.trim();
        if (!messageText || isLoading) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: Date.now(),
        };

        const loadingMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            isLoading: true,
        };

        setMessages((prev) => [...prev, userMessage, loadingMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Use authenticated endpoint only if logged in AND NOT in incognito
            const useAuthenticatedEndpoint = isAuthenticated && !isIncognito;
            const response = await chatService.sendMessage(messageText, useAuthenticatedEndpoint);

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === loadingMessage.id
                        ? {
                            ...msg,
                            content: response.content,
                            sources: response.sources,
                            confidence_score: response.confidence_score,
                            legal_disclaimer: response.legal_disclaimer,
                            isLoading: false,
                        }
                        : msg
                )
            );
        } catch (error) {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === loadingMessage.id
                        ? {
                            ...msg,
                            content: 'Sorry, I encountered an error. Please try again.',
                            isLoading: false,
                            error: 'Failed to get response',
                        }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('Permission Denied', 'Please enable microphone access to use voice-to-text.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Could not start recording. Please try again.');
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        setIsRecording(false);
        setIsLoading(true); // Show loading while transcribing

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            if (uri) {
                const result = await chatService.transcribeAudio(uri);
                if (result.text) {
                    setInputText(result.text);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
            }
        } catch (err) {
            console.error('Failed to stop recording', err);
            Alert.alert('Transcription Failed', 'Could not process your voice. Please try typing or try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Premium Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Home' as never)}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerCentered}>
                    <View style={styles.statusRow}>
                        <View style={[styles.onlineDot, isIncognito && { backgroundColor: '#94A3B8' }]} />
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            {isIncognito ? 'Ghost Advisor' : 'Legal Agent'}
                        </Text>
                    </View>
                    <Text style={[styles.headerStatus, { color: isIncognito ? colors.textTertiary : colors.success }]}>
                        {isIncognito ? 'Incognito • Zero-Trace' : 'Online • AI verified'}
                    </Text>
                </View>

                {isAuthenticated ? (
                    <View style={styles.incognitoContainer}>
                        <Ionicons
                            name={isIncognito ? "eye-off" : "eye"}
                            size={18}
                            color={isIncognito ? colors.primary : colors.textTertiary}
                            style={{ marginRight: 4 }}
                        />
                        <Switch
                            value={isIncognito}
                            onValueChange={(val) => {
                                setIsIncognito(val);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                if (val) {
                                    Alert.alert("Incognito Mode", "Your queries in this mode will not be saved to your profile or traced back to you.");
                                }
                            }}
                            trackColor={{ false: colors.border, true: colors.primary + '40' }}
                            thumbColor={isIncognito ? colors.primary : '#f4f3f4'}
                            ios_backgroundColor={colors.border}
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                        {messages.length > 0 && !isIncognito && (
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    setShowEscalateModal(true);
                                }}
                                style={styles.escalateButton}
                            >
                                <Ionicons name="call-outline" size={18} color={theme.colors.error} />
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <TouchableOpacity style={styles.historyButton} onPress={() => Alert.alert("Guest Session", "Login to save chat history and get personalized legal documents.")}>
                        <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                {/* Suggestions List */}
                {messages.length === 0 && (
                    <View style={styles.suggestionsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
                            {SUGGESTIONS.map((s, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.suggestionChip, { backgroundColor: colors.surfaceElevated1 }]}
                                    onPress={() => handleSend(s.query)}
                                >
                                    <Text style={[styles.suggestionText, { color: colors.text }]}>{s.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="chatbubbles-outline" size={80} color={colors.primary + '20'} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            Tell me your legal problem.
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            I can analyze laws, explain rights, and draft documents for you.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        style={{ flex: 1 }}
                        data={messages}
                        renderItem={({ item }) => (
                            item.isLoading ? (
                                <View style={styles.loadingBubble}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Reviewing laws...</Text>
                                </View>
                            ) : <MessageBubble message={item} />
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messagesList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                )}

                {/* Input Area - Now Relative */}
                <BlurView intensity={isDark ? 40 : 80} style={[styles.inputBlur, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceElevated1 }]}>
                            <TouchableOpacity
                                style={styles.inputIconButton}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    Alert.alert("Add Attachment", "Upload documents, ID, or evidence for legal review.");
                                }}
                            >
                                <Ionicons name="add-circle" size={26} color={colors.primary} />
                            </TouchableOpacity>

                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder={isRecording ? "Listening..." : "Type your legal question..."}
                                placeholderTextColor={colors.textTertiary}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={1000}
                            />

                            <TouchableOpacity
                                onPress={toggleRecording}
                                style={[styles.inputIconButton, isRecording && { backgroundColor: theme.colors.error + '20', borderRadius: 20 }]}
                            >
                                <Ionicons
                                    name={isRecording ? 'mic' : 'mic-outline'}
                                    size={22}
                                    color={isRecording ? theme.colors.error : colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                {
                                    backgroundColor: (inputText.trim() && !isLoading) ? colors.primary : colors.border
                                }
                            ]}
                            onPress={() => handleSend()}
                            disabled={!inputText.trim() || isLoading}
                        >
                            <Ionicons name="send" size={20} color={colors.onPrimary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.disclaimer, { color: colors.textTertiary }]}>
                        Always verify legal actions with a professional lawyer.
                    </Text>
                </BlurView>
            </KeyboardAvoidingView>

            {/* Escalation Modal */}
            <EscalateModal
                visible={showEscalateModal}
                onClose={() => setShowEscalateModal(false)}
                conversationId={conversationId}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: theme.spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCentered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    headerTitle: {
        ...theme.typography.h4,
        fontSize: 16,
    },
    headerStatus: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    historyButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    incognitoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    keyboardView: {
        flex: 1,
    },
    suggestionsContainer: {
        paddingVertical: 12,
    },
    suggestionsScroll: {
        paddingHorizontal: theme.spacing.lg,
        gap: 8,
    },
    suggestionChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        ...theme.shadows.sm,
    },
    suggestionText: {
        ...theme.typography.bodySmall,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    emptyIconContainer: {
        padding: 24,
        backgroundColor: theme.colors.surfaceElevated1,
        borderRadius: 40,
        marginBottom: 24,
    },
    emptyTitle: {
        ...theme.typography.h3,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        ...theme.typography.body,
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    messagesList: {
        padding: theme.spacing.lg,
        paddingBottom: 20,
    },
    loadingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingLeft: 4,
    },
    loadingText: {
        ...theme.typography.bodySmall,
        fontWeight: '500',
    },
    inputBlur: {
        width: '100%',
        paddingTop: 12,
        paddingHorizontal: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        maxHeight: 120,
        borderRadius: 24,
        paddingHorizontal: 6,
    },
    inputIconButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        paddingHorizontal: 8,
        paddingVertical: 8,
        ...theme.typography.body,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disclaimer: {
        ...theme.typography.caption,
        textAlign: 'center',
        marginTop: 8,
    },
    escalateButton: {
        marginLeft: 6,
        padding: 5,
        borderRadius: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
});

