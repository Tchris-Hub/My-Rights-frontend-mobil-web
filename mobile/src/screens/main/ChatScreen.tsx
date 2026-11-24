import React, { useState, useRef, useEffect } from 'react';
import { logger } from '../../utils/logger';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { EscalateModal } from '../../components/chat/EscalateModal';
import { chatService } from '../../services/chat.service';
import { documentService } from '../../services/document.service';
import { usageService } from '../../services/usage.service';
import { sanitizeDocumentName, validateDocumentMetadata } from '../../services/documentSecurity.service';
import { useAuth } from '../../contexts/AuthContext';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatMessage } from '../../types';

const SUGGESTIONS = [
    'Can my landlord remove me without notice?',
    'Can my employer sack me without notice?',
    'How do I write a demand letter?',
    'Explain the Land Use Act simply.',
];

export const ChatScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { isAuthenticated, logout } = useAuth();
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
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [attachment, setAttachment] = useState<{ name: string; mimeType: string; text: string; characterCount: number; truncated: boolean } | null>(null);
    const [isExtractingAttachment, setIsExtractingAttachment] = useState(false);
    const [chatQuotaRemaining, setChatQuotaRemaining] = useState<number | null>(null);
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
                if (!isAuthenticated) {
                    setMessages([]);
    
                }
            };
        }, [isAuthenticated])
    );

    useEffect(() => {
        if (!isAuthenticated) {
            setChatQuotaRemaining(null);
            return;
        }

        usageService.getAiQuota()
            .then((quotas) => {
                const chatQuota = quotas.find((quota) => quota.feature === 'chat');
                setChatQuotaRemaining(chatQuota?.remaining ?? null);
            })
            .catch((error) => {
                logger.error('Failed to load AI quota:', error);
                setChatQuotaRemaining(null);
            });
    }, [isAuthenticated]);

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

            } catch (error) {
                logger.error("Failed to load chat history:", error);
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

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);


    const isSubmitting = useRef(false);
    const handleSend = async (text?: string) => {
        const messageText = text || inputText.trim() || (attachment ? 'Please review the attached document.' : '');
        if (!messageText || isLoading || isSubmitting.current) return;

        if (!isAuthenticated) {
            Alert.alert('Sign in required', 'Sign in to ask questions. Guests can read the law and use the emergency guide.');
            return;
        }

        isSubmitting.current = true;
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
            const response = await chatService.sendMessage(messageText, {
                conversationId: !isIncognito ? (conversationId ?? undefined) : undefined,
                persist: !isIncognito,
                attachmentText: attachment?.text,
            });

            if (response.conversation_id && response.conversation_id !== conversationId) {
                setConversationId(response.conversation_id);
            }

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === loadingMessage.id
                        ? {
                            ...msg,
                            content: response.content,
                            isLoading: false,
                            sources: response.sources?.map((source) => ({
                                ...source,
                                excerpt: source.excerpt ?? '',
                            })),
                            isVerified: response.citation_status === 'verified_context',
                        }
                        : msg
                )
            );

            setAttachment(null);
            setChatQuotaRemaining(response.quota?.remaining ?? null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            logger.error('Chat error:', error);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === loadingMessage.id
                        ? {
                            ...msg,
                            content: error instanceof Error && error.message
                                ? error.message
                                : 'Sorry, I encountered an error. Please try again.',
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

    // A situation chosen on Home (or from Emergency) arrives as route params.
    // Signed-in people get the question sent straight away; guests get it pre-filled behind the sign-in card.
    const handledNonce = useRef<number | undefined>(undefined);
    useEffect(() => {
        const params = route.params;
        if (!params?.initialMessage || handledNonce.current === params.nonce) return;
        handledNonce.current = params.nonce;
        if (isAuthenticated) {
            void handleSend(params.initialMessage);
        } else {
            setInputText(params.initialMessage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params?.nonce, isAuthenticated]);

    const closeMenu = () => setIsMenuVisible(false);

    const resetChatState = () => {
        setMessages([]);
        setConversationId(null);
        setAttachment(null);
        setInputText('');
        setIsMenuVisible(false);
    };

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
                        resetChatState();

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
            logger.error('Error picking document:', error);
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
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                if (typeof asset.fileSize === 'number' && asset.fileSize > 4 * 1024 * 1024) {
                    Alert.alert('File too large', 'Please choose an image smaller than 4 MB.');
                    return;
                }
                setIsExtractingAttachment(true);
                try {
                    const extracted = await documentService.extractImageText(
                        asset.uri,
                        asset.fileName || 'contract-image',
                        asset.mimeType || 'image/jpeg',
                        asset.fileSize,
                    );
                    setAttachment({
                        name: sanitizeDocumentName(asset.fileName || 'contract-image'),
                        mimeType: asset.mimeType || 'image/jpeg',
                        text: extracted.text,
                        characterCount: extracted.character_count,
                        truncated: extracted.truncated,
                    });
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (extractionError) {
                    Alert.alert(
                        'Could not read image',
                        extractionError instanceof Error
                            ? extractionError.message
                            : 'The image could not be read.',
                    );
                } finally {
                    setIsExtractingAttachment(false);
                }
            }
        } catch (error) {
            logger.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/rtf', 'text/rtf', 'text/plain'],
                copyToCacheDirectory: false,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                try {
                    validateDocumentMetadata({
                        name: asset.name,
                        size: asset.size,
                        mimeType: asset.mimeType,
                    });
                } catch (validationError) {
                    Alert.alert('Unsupported document', validationError instanceof Error ? validationError.message : 'This document cannot be attached.');
                    return;
                }
                setIsExtractingAttachment(true);
                try {
                    const extracted = await documentService.extractText(asset.uri, asset.name, asset.mimeType || 'application/octet-stream', asset.size);
                    setAttachment({ name: sanitizeDocumentName(asset.name), mimeType: extracted.mime_type, text: extracted.text, characterCount: extracted.character_count, truncated: extracted.truncated });
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (extractionError) {
                    Alert.alert('Could not read document', extractionError instanceof Error ? extractionError.message : 'The document could not be extracted.');
                } finally {
                    setIsExtractingAttachment(false);
                }
            }
        } catch (error) {
            logger.error('Error picking file:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const { isRecording, isTranscribing, toggleRecording } = useVoiceInput((text) => {
        setInputText(prev => (prev ? prev + ' ' : '') + text);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <ScreenHeader
                root
                title="Ask"
                subtitle={
                    isIncognito
                        ? 'Private session'
                        : chatQuotaRemaining === null
                            ? 'Answers show the law they rely on'
                            : `${chatQuotaRemaining} free questions left today`
                }
                right={
                    <Pressable
                        testID="chat-menu"
                        accessibilityRole="button"
                        accessibilityLabel="Chat options"
                        hitSlop={8}
                        onPress={() => setIsMenuVisible((prev) => !prev)}
                        style={styles.menuButton}
                    >
                        <Ionicons name={isMenuVisible ? 'close' : 'ellipsis-horizontal'} size={22} color={colors.onSurface} />
                    </Pressable>
                }
            />

            {isMenuVisible && (
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={styles.menuOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.menu, { top: insets.top + 60, backgroundColor: colors.card, borderColor: colors.line }]}>
                                <MenuItem icon="add-circle-outline" label="New conversation" onPress={() => { closeMenu(); handleNewChat(); }} />
                                {conversationId && isAuthenticated ? (
                                    <MenuItem icon="people-outline" label="Ask a lawyer about this" onPress={() => { closeMenu(); setShowEscalateModal(true); }} />
                                ) : null}
                                {isAuthenticated ? (
                                    <MenuItem icon="time-outline" label="Past conversations" onPress={() => { closeMenu(); navigation.navigate('MeTab', { screen: 'ChatHistory' }); }} />
                                ) : null}
                                {isAuthenticated ? (
                                    <View style={[styles.menuItem, { borderTopColor: colors.line, borderTopWidth: 1 }]}>
                                        <Ionicons name="eye-off-outline" size={20} color={colors.onSurface} />
                                        <View style={styles.menuText}>
                                            <Text style={[styles.menuLabel, { color: colors.onSurface }]}>Private session</Text>
                                            <Text style={[styles.menuHint, { color: colors.onSurfaceVariant }]}>Not saved to your history</Text>
                                        </View>
                                        <Switch
                                            value={isIncognito}
                                            onValueChange={(val: boolean) => {
                                                closeMenu();
                                                setIsIncognito(val);
                                                resetChatState();
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                if (val) {
                                                    Alert.alert('Private session', 'Messages from this session are not added to your My Rights conversation history. The request is still processed by the AI service and may appear in service and security logs.');
                                                }
                                            }}
                                            trackColor={{ false: colors.outlineVariant, true: colors.primary }}
                                            thumbColor="#FFFFFF"
                                        />
                                    </View>
                                ) : null}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            )}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
                {messages.length === 0 ? (
                    <ScrollView contentContainerStyle={styles.empty} keyboardShouldPersistTaps="handled">
                        <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>What do you need to know?</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
                            Ask in your own words. You can also attach a photo or file of a document.
                        </Text>

                        {!isAuthenticated ? (
                            <View style={[styles.signIn, { backgroundColor: colors.tertiaryContainer, borderColor: colors.danfo }]}>
                                <Text style={[styles.signInTitle, { color: colors.onTertiaryContainer }]}>Sign in to ask</Text>
                                <Text style={[styles.signInBody, { color: colors.onTertiaryContainer }]}>
                                    As a guest you can read the law and use the emergency guide. Questions to the assistant need an account.
                                </Text>
                                <Button title="Sign in or create account" variant="primary" onPress={() => { void logout(); }} testID="chat-signin" />
                            </View>
                        ) : null}

                        <View style={[styles.suggestions, { backgroundColor: colors.card, borderColor: colors.line }]}>
                            {SUGGESTIONS.map((q, i) => (
                                <Pressable
                                    key={q}
                                    accessibilityRole="button"
                                    onPress={() => (isAuthenticated ? handleSend(q) : setInputText(q))}
                                    style={({ pressed }) => [styles.suggestion, i > 0 && { borderTopWidth: 1, borderTopColor: colors.line }, pressed && { backgroundColor: colors.surfaceContainer }]}
                                >
                                    <Text style={[styles.suggestionText, { color: colors.onSurface }]}>{q}</Text>
                                    <Ionicons name="arrow-up-circle-outline" size={20} color={colors.primary} />
                                </Pressable>
                            ))}
                        </View>
                    </ScrollView>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        style={styles.list}
                        data={messages}
                        renderItem={({ item }) =>
                            item.isLoading ? (
                                <View style={[styles.loadingBubble, { backgroundColor: colors.card, borderColor: colors.line }]}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                                        {isTranscribing ? 'Writing down what you said' : 'Checking the law'}
                                    </Text>
                                </View>
                            ) : (
                                <MessageBubble message={item} />
                            )
                        }
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messagesList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        keyboardShouldPersistTaps="handled"
                        onScrollBeginDrag={Keyboard.dismiss}
                    />
                )}

                <View style={[styles.composer, { backgroundColor: colors.card, borderTopColor: colors.line }]}>
                    {(attachment || isExtractingAttachment) && (
                        <View style={[styles.attachment, { backgroundColor: colors.surfaceContainer }]}>
                            <Ionicons name={isExtractingAttachment ? 'sync-outline' : 'document-text-outline'} size={20} color={colors.primary} />
                            <View style={styles.attachmentInfo}>
                                <Text style={[styles.attachmentName, { color: colors.onSurface }]} numberOfLines={1}>
                                    {isExtractingAttachment ? 'Reading document…' : attachment?.name}
                                </Text>
                                <Text style={[styles.attachmentMeta, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                                    {isExtractingAttachment
                                        ? 'Getting the text out'
                                        : `${attachment?.characterCount.toLocaleString()} characters read${attachment?.truncated ? ', shortened to fit' : ''}`}
                                </Text>
                            </View>
                            {isExtractingAttachment ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <Pressable accessibilityRole="button" accessibilityLabel="Remove attachment" hitSlop={10} onPress={() => setAttachment(null)}>
                                    <Ionicons name="close-circle" size={20} color={colors.onSurfaceVariant} />
                                </Pressable>
                            )}
                        </View>
                    )}

                    <View style={styles.inputRow}>
                        <Pressable accessibilityRole="button" accessibilityLabel="Attach a document" onPress={pickDocument} style={styles.iconButton}>
                            <Ionicons name="attach" size={24} color={colors.onSurfaceVariant} />
                        </Pressable>

                        <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                            <TextInput
                                testID="chat-input"
                                accessibilityLabel="Your question"
                                style={[styles.input, { color: colors.onSurface }]}
                                placeholder={isRecording ? 'Listening…' : 'Type your question'}
                                placeholderTextColor={colors.outline}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={10000}
                                blurOnSubmit={false}
                                autoCorrect
                            />
                            {inputText.length > 8000 && (
                                <Text style={[styles.counter, { color: inputText.length > 9500 ? colors.error : colors.onSurfaceVariant }]}>{inputText.length}/10000</Text>
                            )}
                        </View>

                        {inputText.trim() || attachment ? (
                            <Pressable
                                testID="chat-send"
                                accessibilityRole="button"
                                accessibilityLabel="Send message"
                                onPress={() => handleSend()}
                                disabled={isLoading || isExtractingAttachment || inputText.length > 10000}
                                style={({ pressed }) => [styles.send, { backgroundColor: pressed ? colors.onPrimaryFixedVariant : colors.primary, opacity: isLoading || isExtractingAttachment ? 0.5 : 1 }]}
                            >
                                <Ionicons name={isLoading ? 'ellipsis-horizontal' : 'arrow-up'} size={22} color={colors.onPrimary} />
                            </Pressable>
                        ) : (
                            <Pressable
                                testID="chat-mic"
                                accessibilityRole="button"
                                accessibilityLabel={isRecording ? 'Stop recording' : 'Speak your question'}
                                onPress={toggleRecording}
                                style={[styles.send, { backgroundColor: isRecording ? colors.error : colors.primaryContainer }]}
                            >
                                <Ionicons name={isRecording ? 'stop' : 'mic'} size={22} color={isRecording ? colors.onError : colors.primary} />
                            </Pressable>
                        )}
                    </View>
                    {!isKeyboardVisible && (
                        <Text style={[styles.disclaimer, { color: colors.onSurfaceVariant }]}>General information, not legal advice. Check important points with a lawyer.</Text>
                    )}
                </View>
            </KeyboardAvoidingView>

            <EscalateModal visible={showEscalateModal} onClose={() => setShowEscalateModal(false)} conversationId={conversationId} />
        </View>
    );
};

const MenuItem: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }> = ({ icon, label, onPress }) => {
    const { colors } = useTheme();
    return (
        <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.surfaceContainer }]}>
            <Ionicons name={icon} size={20} color={colors.onSurface} />
            <Text style={[styles.menuLabel, { color: colors.onSurface }]}>{label}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    menuButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
    menu: { position: 'absolute', right: 12, width: 270, borderRadius: theme.borderRadius.lg, borderWidth: 1, overflow: 'hidden', ...theme.shadows.sheet },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13, minHeight: 50 },
    menuText: { flex: 1 },
    menuLabel: { ...theme.typography.labelMd, flexShrink: 1 },
    menuHint: { ...theme.typography.caption },
    empty: { padding: 20, paddingBottom: 24 },
    emptyTitle: { ...theme.typography.displaySm, fontFamily: theme.typography.fontFamily.display },
    emptySubtitle: { ...theme.typography.bodyLg, marginTop: 8, marginBottom: 20 },
    signIn: { borderWidth: 1, borderRadius: theme.borderRadius.lg, padding: 16, marginBottom: 20, gap: 10 },
    signInTitle: { ...theme.typography.titleMd },
    signInBody: { ...theme.typography.bodyMd },
    suggestions: { borderRadius: theme.borderRadius.lg, borderWidth: 1, overflow: 'hidden' },
    suggestion: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, minHeight: 56 },
    suggestionText: { ...theme.typography.labelMd, flex: 1 },
    list: { flex: 1 },
    messagesList: { padding: 16, paddingBottom: 20, gap: 14 },
    loadingBubble: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', padding: 12, borderRadius: theme.borderRadius.lg, borderWidth: 1 },
    loadingText: { ...theme.typography.bodyMd },
    composer: { borderTopWidth: 1, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 6 },
    attachment: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: theme.borderRadius.md, marginBottom: 8 },
    attachmentInfo: { flex: 1 },
    attachmentName: { ...theme.typography.labelMd },
    attachmentMeta: { ...theme.typography.caption },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    inputWrap: { flex: 1, borderWidth: 1, borderRadius: 22, paddingHorizontal: 14, minHeight: 44, maxHeight: 140, justifyContent: 'center' },
    input: { fontFamily: theme.typography.fontFamily.body, fontSize: 16, paddingVertical: 10, maxHeight: 120 },
    counter: { ...theme.typography.caption, alignSelf: 'flex-end', paddingBottom: 4 },
    send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    disclaimer: { ...theme.typography.caption, textAlign: 'center', paddingTop: 6 },
});
