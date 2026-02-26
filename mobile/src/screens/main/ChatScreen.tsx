import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Keyboard,
    TouchableWithoutFeedback,
    Switch,
    Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { EscalateModal } from '../../components/chat/EscalateModal';
import { chatService } from '../../services/chat.service';
import { useAuth } from '../../contexts/AuthContext';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatMessage, AuthenticatedChatResponse, PublicChatResponse } from '../../types';

const SUGGESTIONS = [
    { title: 'Tenant Rights', query: 'What are my rights as a tenant?' },
    { title: 'Demand Letter', query: 'How do I write a demand letter?' },
    { title: 'Employment', query: 'Can my employer fire me without notice?' },
    { title: 'Land law', query: 'Explain the Land Use Act simply.' },
];

export const ChatScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { isAuthenticated, isGuest, logout } = useAuth();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isIncognito, setIsIncognito] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [guestMessageCount, setGuestMessageCount] = useState(0);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => setIsKeyboardVisible(true)
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setIsKeyboardVisible(false)
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

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
            initializeChat();
        }
    }, [isAuthenticated, route.params?.conversationId]);

    const initializeChat = async () => {
        // If route has conversationId (from History screen), load that specific chat from backend
        if (route.params?.conversationId) {
            setIsLoading(true);
            try {
                const { messages: fetchedMessages, conversationId: fetchedId } = await chatService.getConversationDetails(route.params.conversationId);
                setMessages(fetchedMessages);
                setConversationId(fetchedId);
                // Also update local cache so it's the "active" chat if user kills app
                await chatService.cacheMessages(fetchedMessages, true, fetchedId);
            } catch (error) {
                console.error("Failed to load chat history:", error);
                Alert.alert("Error", "Could not load conversation history.");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Default to fresh chat on launch (per user request)
            // loadCachedConversation(); 
            setMessages([]);
            setConversationId(null);
        }
    };

    const loadCachedConversation = async () => {
        const { messages: cachedMessages, conversationId: cachedConversationId } = await chatService.getCachedConversation();
        if (cachedMessages.length > 0) {
            setMessages(cachedMessages);
            setConversationId(cachedConversationId);
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            // Only cache if authenticated and NOT in incognito mode
            if (isAuthenticated && !isIncognito) {
                chatService.cacheMessages(messages, true, conversationId);
            }
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages, isIncognito, isAuthenticated, conversationId]);


    const isSubmitting = useRef(false);
    const handleSend = async (text?: string) => {
        const messageText = text || inputText.trim();
        if (!messageText || isLoading || isSubmitting.current) return;
        isSubmitting.current = true;

        // Guest limit logic
        if (isGuest && guestMessageCount >= 5) {
            Alert.alert(
                "Experience More",
                "You've sent several messages as a guest. Sign up now to save your legal conversations and access premium drafting tools.",
                [
                    { text: "Later", style: "cancel" },
                    {
                        text: "Sign Up", onPress: () => {
                            // We reset isGuest in context to force the RootNavigator to show AuthStack
                            logout();
                        }
                    }
                ]
            );
            return;
        }

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
            // Refined Incognito: If authenticated, use authenticated endpoint but suppress saving to DB.
            // If NOT authenticated, use public endpoint.
            const useAuthenticatedEndpoint = isAuthenticated;
            const response = await chatService.sendMessage(messageText, {
                useAuthenticatedEndpoint,
                conversationId: (useAuthenticatedEndpoint && !isIncognito) ? (conversationId ?? undefined) : undefined,
                suppressStorage: isIncognito
            });

            setMessages((prev) => {
                return prev.map((msg) => {
                    if (msg.id !== loadingMessage.id) return msg;

                    if (useAuthenticatedEndpoint) {
                        const authResponse = response as AuthenticatedChatResponse;

                        return {
                            ...msg,
                            content: authResponse.message.content,
                            sources: authResponse.message.sources,
                            confidence_score: authResponse.message.confidence_score
                                ? Number(authResponse.message.confidence_score)
                                : undefined,
                            legal_disclaimer: authResponse.disclaimer,
                            isLoading: false,
                            isNew: true, // Mark as new to trigger typing animation
                        };
                    }

                    const publicResponse = response as PublicChatResponse;

                    return {
                        ...msg,
                        content: publicResponse.content,
                        sources: publicResponse.sources,
                        confidence_score: publicResponse.confidence_score
                            ? Number(publicResponse.confidence_score)
                            : undefined,
                        legal_disclaimer: publicResponse.legal_disclaimer,
                        isLoading: false,
                        isNew: true, // Mark as new to trigger typing animation
                    };
                });
            });

            if (useAuthenticatedEndpoint) {
                const authResponse = response as AuthenticatedChatResponse;
                setConversationId(authResponse.conversation_id);
            } else if (isGuest) {
                // Increment guest message counter
                setGuestMessageCount(prev => prev + 1);
            }
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
            isSubmitting.current = false;
        }
    };

    const closeMenu = () => setIsMenuVisible(false);

    const handleNewChat = () => {
        if (messages.length === 0) return;

        Alert.alert(
            "New Conversation",
            "This will clear the current session and start a fresh chat. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Start New",
                    style: "destructive",
                    onPress: async () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        setMessages([]);
                        setConversationId(null);
                        setGuestMessageCount(0);
                        // Clear local cache
                        await chatService.cacheMessages([], isAuthenticated);
                    }
                }
            ]
        );
    };

    const pickDocument = async () => {
        try {
            Alert.alert(
                "Add Attachment",
                "Choose attachment type",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Photo Library", onPress: pickImage },
                    { text: "Document", onPress: pickFile },
                ]
            );
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant camera roll permissions to attach photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setInputText(prev => prev + `\n[Image: ${asset.fileName || 'photo.jpg'}]`);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*', 'text/plain'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                setInputText(prev => prev + `\n[Document: ${asset.name}]`);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error('Error picking file:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const { isRecording, isTranscribing, toggleRecording } = useVoiceInput((text) => {
        setInputText(prev => (prev ? prev + ' ' : '') + text);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Premium Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.headerIconButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        navigation.navigate('Tools');
                    }}
                >
                    <Ionicons name="apps-outline" size={24} color={colors.primary} />
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

                <TouchableOpacity
                    style={styles.headerIconButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setIsMenuVisible(prev => !prev);
                    }}
                >
                    <Ionicons
                        name={isMenuVisible ? 'close-circle-outline' : 'ellipsis-horizontal-circle-outline'}
                        size={26}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {isMenuVisible && (
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={[styles.menuOverlay, { paddingTop: insets.top + theme.spacing.md }]}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.menuContainer, { backgroundColor: colors.surfaceElevated1, borderColor: colors.border }]}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        closeMenu();
                                        handleNewChat();
                                    }}
                                >
                                    <View style={styles.menuItemLabelWrap}>
                                        <Ionicons name="refresh-circle" size={20} color={colors.primary} />
                                        <Text style={[styles.menuItemLabel, { color: colors.text }]}>Start New Chat</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
                                </TouchableOpacity>

                                {isAuthenticated && (
                                    <View style={[styles.menuItem, styles.menuItemDivider]}>
                                        <View style={styles.menuItemLabelWrap}>
                                            <Ionicons name="eye-off" size={20} color={isIncognito ? colors.primary : colors.textSecondary} />
                                            <Text style={[styles.menuItemLabel, { color: colors.text }]}>Incognito Mode</Text>
                                        </View>
                                        <Switch
                                            value={isIncognito}
                                            onValueChange={(val: boolean) => {
                                                closeMenu();
                                                setIsIncognito(val);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                if (val) {
                                                    Alert.alert("Incognito Mode", "Your queries in this mode will not be saved to your profile or traced back to you.");
                                                }
                                            }}
                                            trackColor={{ false: colors.border, true: colors.primary + '40' }}
                                            thumbColor={isIncognito ? colors.primary : '#f4f3f4'}
                                            ios_backgroundColor={colors.border}
                                            style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                                        />
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        closeMenu();
                                        navigation.navigate('Profile');
                                    }}
                                >
                                    <View style={styles.menuItemLabelWrap}>
                                        <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
                                        <Text style={[styles.menuItemLabel, { color: colors.text }]}>Account</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
                                </TouchableOpacity>

                                {isAuthenticated && (
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={() => {
                                            closeMenu();
                                            navigation.navigate('Profile', { screen: 'ChatHistory' });
                                        }}
                                    >
                                        <View style={styles.menuItemLabelWrap}>
                                            <Ionicons name="time-outline" size={20} color={colors.primary} />
                                            <Text style={[styles.menuItemLabel, { color: colors.text }]}>Chat History</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            )}

            {/* FIX: 'padding' on iOS only; offset=0 because header is outside this view */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
                keyboardVerticalOffset={0}
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
                    <Pressable style={styles.emptyState} onPress={Keyboard.dismiss}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '10' }]}>
                            <Ionicons name="sparkles" size={48} color={colors.primary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            How can I help you today?
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            Ask me about your legal rights or instruct me to draft a document for you.
                        </Text>
                    </Pressable>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        style={{ flex: 1 }}
                        data={messages}
                        renderItem={({ item }) => (
                            item.isLoading || isTranscribing ? (
                                <View style={styles.loadingBubble}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                        {isTranscribing ? "Transcribing voice..." : "Drafting response..."}
                                    </Text>
                                </View>
                            ) : <MessageBubble message={item} />
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[styles.messagesList, isKeyboardVisible && { paddingBottom: theme.spacing.lg }]}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        // FIX 3: Tapping on messages list dismisses keyboard
                        keyboardShouldPersistTaps="handled"
                        onScrollBeginDrag={Keyboard.dismiss}
                    />
                )}

                <BlurView
                    intensity={isDark ? 40 : 80}
                    style={[
                        styles.inputBlur,
                        {
                            // When keyboard is visible, the safe area is covered — no extra padding needed
                            paddingBottom: isKeyboardVisible ? 4 : Math.max(insets.bottom, theme.spacing.sm),
                        }
                    ]}
                >
                    <View style={styles.inputContainer}>
                        <View
                            style={[
                                styles.inputWrapper,
                                {
                                    backgroundColor: colors.surfaceElevated1,
                                    borderColor: inputFocused ? colors.primary : colors.border,
                                    shadowColor: 'rgba(0,0,0,0.05)',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 1,
                                    shadowRadius: 4,
                                    elevation: 1, // Subtle lift for the input box
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.inputLeftIcon}
                                onPress={pickDocument}
                            >
                                <Ionicons name="add" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder={isRecording ? "Listening..." : "Message AI..."}
                                placeholderTextColor={colors.textTertiary}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={10000}
                                textAlignVertical="center"
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                blurOnSubmit={false}
                                autoCorrect
                                returnKeyType="default"
                            />

                            <TouchableOpacity
                                onPress={toggleRecording}
                                style={[styles.inputRightIcon, isRecording && { backgroundColor: theme.colors.error + '20', borderRadius: 16 }]}
                            >
                                <Ionicons
                                    name={isRecording ? 'mic' : 'mic-outline'}
                                    size={20}
                                    color={isRecording ? theme.colors.error : colors.textSecondary}
                                />
                            </TouchableOpacity>
                            {inputText.length > 8000 && (
                                <Text style={[styles.charCounter, { color: inputText.length > 9500 ? '#EF4444' : colors.textTertiary }]}>
                                    {inputText.length}/10000
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                {
                                    backgroundColor: (inputText.trim() && !isLoading) ? colors.primary : colors.surfaceElevated2,
                                    shadowColor: (inputText.trim() && !isLoading) ? colors.primary : 'transparent',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: (inputText.trim() && !isLoading) ? 4 : 0,
                                }
                            ]}
                            onPress={() => handleSend()}
                            disabled={!inputText.trim() || isLoading || inputText.length > 10000}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isLoading ? "ellipsis-horizontal" : "arrow-up"}
                                size={22}
                                color={inputText.trim() && !isLoading ? colors.onPrimary : colors.textTertiary}
                            />
                        </TouchableOpacity>
                    </View>

                    {!isKeyboardVisible && (
                        <Text
                            style={[styles.disclaimer, { color: colors.textTertiary }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            AI can make mistakes. Verify important legal info.
                        </Text>
                    )}
                </BlurView>
            </KeyboardAvoidingView>

            {/* Escalation Modal */}
            <EscalateModal
                visible={showEscalateModal}
                onClose={() => setShowEscalateModal(false)}
                conversationId={conversationId}
            />
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    headerIconButton: {
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    incognitoToggle: {
        marginLeft: -4,
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
        borderWidth: 1,
        paddingHorizontal: 4,
    },
    inputLeftIcon: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRightIcon: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    charCounter: {
        fontSize: 10,
        position: 'absolute',
        bottom: 2,
        right: 44,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        paddingHorizontal: 6,
        paddingVertical: 10,
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
    menuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        paddingHorizontal: theme.spacing.lg,
        zIndex: 10,
    },
    menuContainer: {
        alignSelf: 'flex-end',
        width: 250,
        borderRadius: 20,
        paddingVertical: 8,
        borderWidth: 1,
        ...theme.shadows.md,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    menuItemDivider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(148, 163, 184, 0.15)',
    },
    menuItemLabelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    menuItemLabel: {
        ...theme.typography.bodySmall,
        fontWeight: '600',
    },
});
