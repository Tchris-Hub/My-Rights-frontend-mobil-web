import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { EscalateModal } from '../../components/chat/EscalateModal';
import { chatService } from '../../services/chat.service';
import { documentService } from '../../services/document.service';
import { usageService } from '../../services/usage.service';
import { sanitizeDocumentName, validateDocumentMetadata } from '../../services/documentSecurity.service';
import { useAuth } from '../../contexts/AuthContext';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatMessage, AuthenticatedChatResponse, PublicChatResponse } from '../../types';

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const SUGGESTIONS = [
    { title: 'Tenant Rights', query: 'What are my rights as a tenant?' },
    { title: 'Demand Letter', query: 'How do I write a demand letter?' },
    { title: 'Employment', query: 'Can my employer fire me without notice?' },
    { title: 'Land law', query: 'Explain the Land Use Act simply.' },
];

export const ChatScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { isAuthenticated } = useAuth();
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
    const [inputFocused, setInputFocused] = useState(false);
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

    const refreshChatQuota = async () => {
        try {
            const quotas = await usageService.getAiQuota();
            const quota = quotas.find((item) => item.feature === 'chat');
            setChatQuotaRemaining(quota?.remaining ?? null);
        } catch (error) {
            logger.error('Failed to refresh AI quota:', error);
        }
    };

    const handleSend = async (text?: string) => {
        const messageText = text || inputText.trim() || (attachment ? 'Please review the attached document.' : '');
        if (!messageText || isLoading || isSubmitting.current) return;

        if (!isAuthenticated) {
            Alert.alert('Sign in required', 'Sign in to use the Legal Agent. Guest mode does not send legal queries to the AI service.');
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
            const result = await chatService.sendMessage(messageText, {
                conversationId: !isIncognito ? (conversationId ?? undefined) : undefined,
                persist: !isIncognito,
                attachmentText: attachment?.text,
            });

            const sources = result.sources?.map((source) => ({
                ...source,
                excerpt: source.excerpt ?? '',
            }));

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === loadingMessage.id
                        ? {
                            ...msg,
                            content: result.content,
                            isLoading: false,
                            sources,
                            isVerified: result.citation_status === 'verified_context',
                        }
                        : msg
                )
            );

            if (result.conversation_id && result.conversation_id !== conversationId) {
                setConversationId(result.conversation_id);
            }

            await refreshChatQuota();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            logger.error('Chat error:', error);
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
                        // Clear local cache

                    }
                }
            ]
        );
    };

    const pickDocument = async () => {
        try {
            Alert.alert(
                "Add to chat",
                "Choose what you want to attach",
                [
                    { text: "Scan document", onPress: scanAttachment },
                    { text: "Take a photo", onPress: takePhoto },
                    { text: "Photo Library", onPress: pickImage },
                    { text: "Choose file", onPress: pickFile },
                    { text: "Cancel", style: "cancel" },
                ]
            );
        } catch (error) {
            logger.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to open attachment options');
        }
    };

    const scanAttachment = async () => {
        try {
            // The scanner is a custom native module and is not bundled into Expo Go.
            // Load it only when the user requests scanning so unsupported runtimes
            // can still launch and use the rest of the application.
            const { default: DocumentScanner } = await import('react-native-document-scanner-plugin');
            const { scannedImages } = await DocumentScanner.scanDocument({ maxNumDocuments: 1 });
            if (scannedImages?.[0]) {
                await extractImageAttachment(scannedImages[0], 'scanned-document.jpg', 'image/jpeg');
            }
        } catch (error) {
            logger.error('Error scanning attachment:', error);
            Alert.alert('Scan failed', error instanceof Error ? error.message : 'Could not scan the document.');
        }
    };

    const takePhoto = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission needed', 'Camera access is required to take a document photo.');
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                await extractImageAttachment(
                    asset.uri,
                    asset.fileName || 'document-photo',
                    asset.mimeType || 'image/jpeg',
                    asset.fileSize,
                );
            }
        } catch (error) {
            logger.error('Error taking attachment photo:', error);
            Alert.alert('Camera error', 'Failed to capture the document photo.');
        }
    };

    const extractImageAttachment = async (uri: string, name: string, mimeType: string, size?: number) => {
        if (typeof size === 'number' && size > 4 * 1024 * 1024) {
            Alert.alert('File too large', 'Please capture or choose an image smaller than 4 MB.');
            return;
        }
        setIsExtractingAttachment(true);
        try {
            const extracted = await documentService.extractImageText(uri, name, mimeType, size);
            setAttachment({
                name: sanitizeDocumentName(name),
                mimeType,
                text: extracted.text,
                characterCount: extracted.character_count,
                truncated: extracted.truncated,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (extractionError) {
            Alert.alert(
                'Could not read image',
                extractionError instanceof Error ? extractionError.message : 'The image could not be read.',
            );
        } finally {
            setIsExtractingAttachment(false);
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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
            {/* Background Decoration (Blobs) */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={[styles.blob1, { backgroundColor: colors.primary + '0A' }]} />
                <View style={[styles.blob2, { backgroundColor: colors.secondaryContainer + '0A' }]} />
            </View>

            {/* Premium Header */}
            <View style={styles.headerContainer}>
                <BlurView intensity={isDark ? 40 : 80} style={styles.headerBlur}>
                    <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
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
                                <View style={[styles.onlineDot, isIncognito && { backgroundColor: colors.onSurfaceVariant }]} />
                                <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
                                    {isIncognito ? 'Ghost Advisor' : 'Legal Agent'}
                                </Text>
                            </View>
                            <Text style={[styles.headerStatus, { color: isIncognito ? colors.onSurfaceVariant : colors.primary }]}>
                                {isIncognito
                                    ? 'Private Session'
                                    : chatQuotaRemaining === null
                                        ? 'Online • AI-generated information'
                                        : `Online • ${chatQuotaRemaining} free questions left today`}
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
                </BlurView>
            </View>

            {isMenuVisible && (
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={[styles.menuOverlay, { paddingTop: insets.top + theme.spacing.md }]}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.menuContainer, { backgroundColor: colors.surfaceContainer, borderColor: colors.outline }]}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        closeMenu();
                                        handleNewChat();
                                    }}
                                >
                                    <View style={styles.menuItemLabelWrap}>
                                        <Ionicons name="refresh-circle" size={20} color={colors.primary} />
                                        <Text style={[styles.menuItemLabel, { color: colors.onSurface }]}>Start New Chat</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={14} color={colors.onSurfaceVariant} />
                                </TouchableOpacity>

                                {isAuthenticated && (
                                    <View style={[styles.menuItem, styles.menuItemDivider]}>
                                        <View style={styles.menuItemLabelWrap}>
                                            <Ionicons name="eye-off" size={20} color={isIncognito ? colors.primary : colors.onSurfaceVariant} />
                                            <Text style={[styles.menuItemLabel, { color: colors.onSurface }]}>Incognito Mode</Text>
                                        </View>
                                        <Switch
                                            value={isIncognito}
                                            onValueChange={(val: boolean) => {
                                                closeMenu();
                                                setIsIncognito(val);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                if (val) {
                                                    Alert.alert("Private Session", "Messages from this session are not added to your My Rights conversation history. The request is still processed by the AI service and may appear in service/security logs.");
                                                }
                                            }}
                                            trackColor={{ false: colors.outline, true: colors.primary + '40' }}
                                            thumbColor={isIncognito ? colors.primary : '#f4f3f4'}
                                            ios_backgroundColor={colors.outline}
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
                                        <Text style={[styles.menuItemLabel, { color: colors.onSurface }]}>Account</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={14} color={colors.onSurfaceVariant} />
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
                                            <Text style={[styles.menuItemLabel, { color: colors.onSurface }]}>Chat History</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={14} color={colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            )}

            {/* FIX: 'padding' on iOS only; offset=0 because header is outside this view */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                                    style={[styles.suggestionChip, { backgroundColor: colors.surfaceContainer }]}
                                    onPress={() => handleSend(s.query)}
                                >
                                    <Text style={[styles.suggestionText, { color: colors.onSurface }]}>{s.title}</Text>
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
                        <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                            How can I help you today?
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
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
                                    <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
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
                    intensity={isDark ? 60 : 90}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                        styles.inputBlur,
                        {
                            paddingBottom: isKeyboardVisible ? 4 : Math.max(insets.bottom, theme.spacing.sm),
                        }
                    ]}
                >
                    {(attachment || isExtractingAttachment) && (
                        <View style={[styles.attachmentCard, { backgroundColor: colors.surfaceContainerHigh }]}> 
                            <View style={[styles.attachmentIcon, { backgroundColor: colors.primary + '12' }]}>
                                <Ionicons name={isExtractingAttachment ? 'sync-outline' : 'document-text-outline'} size={20} color={colors.primary} />
                            </View>
                            <View style={styles.attachmentInfo}>
                                <Text style={[styles.attachmentName, { color: colors.onSurface }]} numberOfLines={1}>
                                    {isExtractingAttachment ? 'Reading document…' : attachment?.name}
                                </Text>
                                <Text style={[styles.attachmentMeta, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                                    {isExtractingAttachment ? 'Extracting readable text' : `${attachment?.characterCount.toLocaleString()} characters extracted${attachment?.truncated ? ' • shortened for chat' : ''}`}
                                </Text>
                            </View>
                            {attachment && !isExtractingAttachment && <TouchableOpacity onPress={() => setAttachment(null)} style={styles.attachmentRemove}><Ionicons name="close-circle" size={20} color={colors.onSurfaceVariant} /></TouchableOpacity>}
                            {isExtractingAttachment && <ActivityIndicator size="small" color={colors.primary} />}
                        </View>
                    )}
                    <View style={styles.inputContainer}>
                        <View
                            style={[
                                styles.inputWrapper,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceContainerHighest,
                                    // No-Line Rule: Removed borderBottomWidth
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.inputLeftIcon}
                                onPress={pickDocument}
                            >
                                <Ionicons name="add" size={24} color={colors.onSurfaceVariant} />
                            </TouchableOpacity>

                            <TextInput
                                testID="chat-input"
                                accessibilityLabel="Message AI"
                                style={[styles.input, { color: colors.onSurface }]}
                                placeholder={isRecording ? "Listening..." : "Message AI..."}
                                placeholderTextColor={colors.onSurfaceVariant}
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
                                    color={isRecording ? theme.colors.error : colors.onSurfaceVariant}
                                />
                            </TouchableOpacity>
                            {inputText.length > 8000 && (
                                <Text style={[styles.charCounter, { color: inputText.length > 9500 ? '#EF4444' : colors.onSurfaceVariant }]}>
                                    {inputText.length}/10000
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            testID="chat-send"
                            accessibilityRole="button"
                            accessibilityLabel="Send message"
                            onPress={() => handleSend()}
                            disabled={(!inputText.trim() && !attachment) || isLoading || isExtractingAttachment || inputText.length > 10000}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={(inputText.trim() || attachment) && !isLoading && !isExtractingAttachment
                                    ? [colors.primary, theme.colors.primaryContainer]
                                    : [colors.surfaceContainerHigh, colors.surfaceContainerHigh]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[
                                    styles.sendButton,
                                    ((inputText.trim() || attachment) && !isLoading && !isExtractingAttachment) && {
                                        shadowColor: colors.primary,
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 4,
                                    }
                                ]}
                            >
                                <Ionicons
                                    name={isLoading ? "ellipsis-horizontal" : "arrow-up"}
                                    size={22}
                                    color={(inputText.trim() || attachment) && !isLoading && !isExtractingAttachment ? colors.onPrimary : colors.onSurfaceVariant}
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {!isKeyboardVisible && (
                        <Text
                            style={[styles.disclaimer, { color: colors.onSurfaceVariant }]}
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
    blob1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    blob2: {
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    headerBlur: {
        overflow: 'hidden',
    },
    header: {
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
    },
    headerTitle: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.36,
    },
    headerStatus: {
        fontSize: 10,
        fontFamily: theme.typography.fontFamily.bodyBold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    keyboardView: {
        flex: 1,
        paddingTop: 80,
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
        borderRadius: 16,
    },
    suggestionText: {
        fontFamily: theme.typography.fontFamily.bodyMedium,
        fontSize: 14,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    emptyIconContainer: {
        padding: 24,
        borderRadius: 40,
        marginBottom: 24,
    },
    emptyTitle: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.64,
    },
    emptySubtitle: {
        fontFamily: theme.typography.fontFamily.body,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.7,
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
        fontFamily: theme.typography.fontFamily.bodyMedium,
        fontSize: 14,
    },
    inputBlur: {
        width: '100%',
        paddingTop: 12,
        paddingHorizontal: theme.spacing.lg,
    },
    attachmentCard: {
        flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8,
        paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14,
    },
    attachmentIcon: {
        width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    },
    attachmentInfo: { flex: 1, minWidth: 0 },
    attachmentName: { fontFamily: theme.typography.fontFamily.bodyMedium, fontSize: 13 },
    attachmentMeta: { fontFamily: theme.typography.fontFamily.body, fontSize: 11, marginTop: 2 },
    attachmentRemove: { padding: 2 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 52,
        maxHeight: 120,
        borderRadius: 16,
        paddingHorizontal: 4,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        paddingHorizontal: 6,
        paddingVertical: 10,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: 16,
    },
    inputLeftIcon: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRightIcon: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    charCounter: {
        fontSize: 10,
        position: 'absolute',
        bottom: 2,
        right: 44,
    },
    disclaimer: {
        fontSize: 10,
        fontFamily: theme.typography.fontFamily.body,
        textAlign: 'center',
        marginTop: 8,
        opacity: 0.5,
    },
    menuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
    },
    menuContainer: {
        position: 'absolute',
        top: 100,
        right: theme.spacing.lg,
        width: 240,
        borderRadius: 20,
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    menuItemLabelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    menuItemLabel: {
        fontFamily: theme.typography.fontFamily.bodyMedium,
        fontSize: 14,
    },
    menuItemDivider: {
        height: 1,
        marginHorizontal: 16,
    },
    escalateButton: {
        marginLeft: 6,
        padding: 5,
        borderRadius: 10,
    },
});
