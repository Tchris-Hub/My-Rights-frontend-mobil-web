import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { chatService } from '../../services/chat.service';
import { documentService } from '../../services/document.service';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import { useAuth } from '../../contexts/AuthContext';
import type { AuthenticatedChatResponse, PublicChatResponse } from '../../types';
import { APP_CONFIG } from '../../constants/config';

import { useJobs } from '../../contexts/JobContext';
import { legalService, Template } from '../../services/legalService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ArchitectStep = 'SELECT' | 'INTAKE' | 'CONSULT' | 'BUILD' | 'PREVIEW' | 'FINALIZE';

interface ConsultMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

const createMessageId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const DocumentGeneratorScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { activeJob, startJob, updateJob, finishJob, failJob, clearJob } = useJobs();
    const navigation = useNavigation<any>();
    const { isAuthenticated } = useAuth();
    
    // Workflow State
    const [step, setStep] = useState<ArchitectStep>('SELECT');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [intakeData, setIntakeData] = useState<Record<string, string>>({});
    const [consultMessages, setConsultMessages] = useState<ConsultMessage[]>([]);
    const [draftContent, setDraftContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [userInput, setUserInput] = useState('');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            const data = await legalService.getTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
            Alert.alert('Cloud Sync Error', 'Unable to retrieve legal templates. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectTemplate = (template: Template) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedTemplate(template);
        setStep('INTAKE');
        // Initialize intake data with empty strings for all fields
        const initialData: Record<string, string> = {};
        template.fields.forEach(f => initialData[f.key] = '');
        setIntakeData(initialData);
    };

    const handleIntakeSubmit = () => {
        if (!isAuthenticated) {
            Alert.alert('Sign in required', 'Sign in before generating a legal document draft.');
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep('CONSULT');
        setConsultMessages([{
            id: createMessageId('system'),
            role: 'assistant',
            content: `I've received the basic details for your ${selectedTemplate?.title}. Would you like to add any specific custom clauses, such as special termination rights or unique liability conditions?`
        }]);
    };

    const handleConsultSubmit = async () => {
        if (!userInput.trim()) return;
        
        const newMessage: ConsultMessage = {
            id: createMessageId('user'),
            role: 'user',
            content: userInput
        };
        
        setConsultMessages(prev => [...prev, newMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            // In production, this would call the AI Architect
            setTimeout(() => {
                setConsultMessages(prev => [...prev, {
                    id: createMessageId('ai'),
                    role: 'assistant',
                    content: "Understood. I will incorporate those specifics into the final draft. Are we ready to build the document?"
                }]);
                setIsLoading(false);
            }, 1500);
        } catch (error) {
            setIsLoading(false);
        }
    };

    const handleStartBuild = async () => {
        if (!selectedTemplate || !isAuthenticated) {
            Alert.alert('Sign in required', 'Sign in before generating a legal document draft.');
            return;
        }

        const details = Object.entries(intakeData)
            .map(([key, value]) => `${key}: ${value.trim()}`)
            .filter((entry) => !entry.endsWith(':'))
            .join('\\n');
        const customRequirements = consultMessages
            .filter((message) => message.role === 'user')
            .map((message) => message.content.trim())
            .filter(Boolean)
            .join('\\n');
        const generationInput = [details, customRequirements ? `Additional requirements:\\n${customRequirements}` : '']
            .filter(Boolean)
            .join('\\n\\n');

        setStep('BUILD');
        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const response = await documentService.generateDocument(
                selectedTemplate.title,
                generationInput.slice(0, 12000),
            );
            setDraftContent(response.content.trim());
            setStep('PREVIEW');
        } catch (error: any) {
            setStep('CONSULT');
            Alert.alert('Drafting failed', error?.message || 'Could not generate the draft. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            const { uri } = await Print.printToFileAsync({ html: draftContent });
            await Sharing.shareAsync(uri);
        } catch (error) {
            Alert.alert('Export Error', 'Could not generate PDF.');
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surfaceContainer }]} onPress={() => step === 'SELECT' ? navigation.goBack() : setStep('SELECT')}>
                <Ionicons name="chevron-back" size={24} color={colors.onSurface} strokeWidth={2.5} />
            </TouchableOpacity>
            <View>
                <Text style={[styles.title, { color: colors.onSurface }]}>Document Architect</Text>
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                    {step === 'SELECT' ? 'Choose your legal blueprint' : 
                     step === 'INTAKE' ? 'Input critical details' : 
                     step === 'CONSULT' ? 'AI-assisted drafting' : 'Draft preview — review before use'}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <Image 
                    source={require('../../../assets/images/classroom_bg.png')} 
                    style={styles.globalBackground} 
                    resizeMode="cover"
                />
                <BlurView intensity={isDark ? 30 : 15} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
            </View>

            {renderHeader()}

            {isLoading && step === 'SELECT' ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Consulting the Library...</Text>
                </View>
            ) : (
                <View style={styles.workflowContainer}>
                    {step === 'SELECT' && (
                        <ScrollView contentContainerStyle={styles.templatesList} showsVerticalScrollIndicator={false}>
                            {templates.map((t, idx) => (
                                <Animated.View key={t.id} entering={FadeInRight.delay(idx * 100)}>
                                    <TouchableOpacity 
                                        style={[
                                            styles.templateCard, 
                                            { 
                                                backgroundColor: colors.surfaceContainerLow,
                                                marginTop: idx % 2 === 0 ? 0 : 24,
                                                marginLeft: idx % 2 === 0 ? 0 : 16,
                                                marginRight: idx % 2 === 0 ? 16 : 0,
                                            }
                                        ]}
                                        onPress={() => handleSelectTemplate(t)}
                                    >
                                        <View style={[styles.templateIcon, { backgroundColor: colors.primary + '10' }]}>
                                            <Ionicons name="document-text" size={28} color={colors.primary} />
                                        </View>
                                        <View style={styles.templateInfo}>
                                            <Text style={[styles.templateTitle, { color: colors.onSurface }]}>{t.title}</Text>
                                            <Text style={[styles.templateDesc, { color: colors.onSurfaceVariant }]} numberOfLines={2}>{t.description}</Text>
                                        </View>
                                        <View style={[styles.arrowCircle, { backgroundColor: colors.surfaceContainerHighest }]}>
                                            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    )}

                    {step === 'INTAKE' && selectedTemplate && (
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                            <ScrollView contentContainerStyle={styles.intakeScroll}>
                                <View style={styles.asymmetricHeader}>
                                    <View style={[styles.accentLine, { backgroundColor: colors.primary }]} />
                                    <Text style={[styles.sectionHeader, { color: colors.onSurface }]}>Primary Details</Text>
                                </View>
                                <View style={styles.formContainer}>
                                    {selectedTemplate.fields.map(field => (
                                        <View key={field.key} style={styles.inputGroup}>
                                            <Text style={[styles.inputLabel, { color: colors.primary }]}>{field.label}</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface }]}
                                                placeholder={field.placeholder}
                                                placeholderTextColor={colors.onSurfaceVariant + '60'}
                                                value={intakeData[field.key]}
                                                onChangeText={(val) => setIntakeData(prev => ({ ...prev, [field.key]: val }))}
                                                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                                            />
                                        </View>
                                    ))}
                                </View>
                                <Button 
                                    title="Continue to AI Review" 
                                    onPress={handleIntakeSubmit}
                                    style={styles.submitBtn}
                                />
                            </ScrollView>
                        </KeyboardAvoidingView>
                    )}

                    {step === 'CONSULT' && (
                        <View style={{ flex: 1 }}>
                            <ScrollView style={styles.chatScroll} contentContainerStyle={{ padding: 24 }}>
                                {consultMessages.map(msg => (
                                    <View key={msg.id} style={[
                                        styles.chatBubble, 
                                        msg.role === 'user' ? styles.userBubble : [styles.aiBubble, { backgroundColor: colors.surfaceContainerHigh }]
                                    ]}>
                                        <Text style={[styles.chatText, { color: msg.role === 'user' ? '#FFF' : colors.onSurface }]}>{msg.content}</Text>
                                    </View>
                                ) )}
                                {isLoading && <ActivityIndicator color={colors.primary} style={{ alignSelf: 'center', marginTop: 10 }} />}
                            </ScrollView>
                            <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.inputBlur}>
                                <View style={[styles.chatInputRow]}>
                                    <TextInput
                                        style={[styles.chatInput, { backgroundColor: colors.surfaceContainerHighest, color: colors.onSurface }]}
                                        placeholder="Add custom requirements..."
                                        placeholderTextColor={colors.onSurfaceVariant}
                                        value={userInput}
                                        onChangeText={setUserInput}
                                        multiline
                                    />
                                    <TouchableOpacity 
                                        style={[styles.sendBtn, { backgroundColor: colors.primary }]}
                                        onPress={handleConsultSubmit}
                                    >
                                        <Ionicons name="sparkles" size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.consultActions}>
                                    <TouchableOpacity 
                                        style={[styles.finalActionBtn, { backgroundColor: colors.primary }]}
                                        onPress={handleStartBuild}
                                    >
                                        <Text style={styles.finalActionText}>Architect Final Draft</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </View>
                    )}

                    {step === 'BUILD' && (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Architecting Legal Instrument...</Text>
                        </View>
                    )}

                    {step === 'PREVIEW' && (
                        <View style={{ flex: 1 }}>
                            <ScrollView style={[styles.previewScroll, { backgroundColor: colors.surfaceContainerLow }]}>
                                <View style={styles.previewSheet}>
                                    <Text style={[styles.previewText, { color: colors.onSurface }]}>{draftContent.replace(/<[^>]*>?/gm, '')}</Text>
                                </View>
                            </ScrollView>
                            <View style={styles.previewActions}>
                                <TouchableOpacity 
                                    style={[styles.actionBtnPrimary, { backgroundColor: colors.primary }]}
                                    onPress={handleExportPDF}
                                >
                                    <Ionicons name="download-outline" size={20} color="#FFF" />
                                    <Text style={styles.actionBtnTextMain}>Export PDF</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.actionBtnOutline, { borderColor: colors.outline }]}
                                    onPress={() => setStep('CONSULT')}
                                >
                                    <Text style={[styles.actionBtnTextOutline, { color: colors.onSurface }]}>Refine Draft</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            )}

            <FloatingChatButton />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    globalBackground: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.12,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24,
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        ...theme.shadows.ambientFloat,
    },
    title: {
        ...theme.typography.displaySm,
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    subtitle: {
        ...theme.typography.labelLg,
        fontSize: 12,
        marginTop: 4,
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    workflowContainer: {
        flex: 1,
    },
    templatesList: {
        padding: 24,
        paddingTop: 0,
    },
    templateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 32,
        marginBottom: 16,
        ...theme.shadows.ambientFloat,
    },
    templateIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    templateInfo: {
        flex: 1,
        marginLeft: 16,
        marginRight: 8,
    },
    templateTitle: {
        ...theme.typography.titleMd,
        fontSize: 18,
        fontWeight: '900',
    },
    templateDesc: {
        ...theme.typography.caption,
        fontSize: 12,
        marginTop: 4,
        lineHeight: 16,
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    intakeScroll: {
        padding: 24,
    },
    asymmetricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    accentLine: {
        width: 40,
        height: 4,
        borderRadius: 2,
        marginRight: 12,
    },
    sectionHeader: {
        ...theme.typography.titleLg,
        fontSize: 24,
        fontWeight: '900',
    },
    formContainer: {
        gap: 20,
    },
    inputGroup: {
        gap: 10,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginLeft: 4,
    },
    input: {
        padding: 20,
        borderRadius: 24,
        fontSize: 16,
        fontWeight: '600',
    },
    submitBtn: {
        marginTop: 40,
        height: 64,
        borderRadius: 32,
    },
    chatScroll: {
        flex: 1,
    },
    chatBubble: {
        padding: 20,
        borderRadius: 24,
        maxWidth: '85%',
        marginBottom: 16,
    },
    userBubble: {
        backgroundColor: theme.colors.primary,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
        ...theme.shadows.ambientFloat,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        ...theme.shadows.ambientFloat,
    },
    chatText: {
        ...theme.typography.bodyMd,
        fontSize: 15,
        lineHeight: 24,
    },
    inputBlur: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    chatInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    chatInput: {
        flex: 1,
        minHeight: 56,
        maxHeight: 120,
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 16,
        fontSize: 15,
        fontWeight: '600',
    },
    sendBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.ambientFloat,
    },
    consultActions: {
        marginTop: 16,
    },
    finalActionBtn: {
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    finalActionText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '900',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...theme.typography.titleMd,
        marginTop: 20,
        fontWeight: '900',
    },
    previewScroll: {
        flex: 1,
        margin: 20,
        borderRadius: 32,
        overflow: 'hidden',
    },
    previewSheet: {
        padding: 32,
    },
    previewWarning: {
        marginTop: 24,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '600',
    },
    previewText: {
        ...theme.typography.bodyLg,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        lineHeight: 28,
        fontSize: 16,
    },
    previewActions: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        gap: 16,
    },
    actionBtnPrimary: {
        flex: 2,
        height: 64,
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    actionBtnOutline: {
        flex: 1,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnTextMain: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '900',
    },
    actionBtnTextOutline: {
        fontSize: 14,
        fontWeight: '800',
    }
});
