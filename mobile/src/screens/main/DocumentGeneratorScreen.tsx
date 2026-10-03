import React, { useState, useRef, useEffect } from 'react';
import { logger } from '../../utils/logger';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { documentService } from '../../services/document.service';
import { usageService } from '../../services/usage.service';
import theme from '../../constants/theme';
import { useResponsive } from '../../utils/responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import { useAuth } from '../../contexts/AuthContext';

import { useJobs } from '../../contexts/JobContext';
import { legalService, Template } from '../../services/legalService';
import type { DocumentGenerationMissingInformation } from '../../types';


type ArchitectStep = 'SELECT' | 'INTAKE' | 'CONSULT' | 'BUILD' | 'MISSING_INFO' | 'PREVIEW' | 'FINALIZE';

interface ConsultMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

const createMessageId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const escapeHtml = (value: string): string => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br/>');

export const DocumentGeneratorScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { width: SCREEN_WIDTH, horizontalPadding, contentWidth, compact, narrow, fluid } = useResponsive();
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
    const [generationQuotaRemaining, setGenerationQuotaRemaining] = useState<number | null>(null);
    const [missingInformation, setMissingInformation] = useState<DocumentGenerationMissingInformation[]>([]);
    const [missingValues, setMissingValues] = useState<Record<string, string>>({});

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            setGenerationQuotaRemaining(null);
            return;
        }
        usageService.getAiQuota()
            .then((quotas) => {
                const quota = quotas.find((item) => item.feature === 'document_generate');
                setGenerationQuotaRemaining(quota?.remaining ?? null);
            })
            .catch((error) => logger.error('Failed to load document-generation quota:', error));
    }, [isAuthenticated]);



    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            const data = await legalService.getTemplates();
            setTemplates(data);
        } catch (error) {
            logger.error('Error loading templates:', error);
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
            Alert.alert('Sign in required', 'Sign in before generating a legal document.');
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

        // This step is an intake/editorial workflow, not an AI response.
        // Never simulate a successful AI call when no backend request was made.
        setConsultMessages(prev => [...prev, {
            id: createMessageId('note'),
            role: 'assistant',
            content: 'Your additional requirements have been added to this draft session. You can review them before generating the document.'
        }]);
        setIsLoading(false);
    };

    const buildGenerationInput = (extra: Record<string, string> = {}) => {
        const details = Object.entries({ ...intakeData, ...extra })
            .map(([key, value]) => `${key}: ${value.trim()}`)
            .filter((entry) => !entry.endsWith(':'))
            .join('\\n');
        const customRequirements = consultMessages
            .filter((message) => message.role === 'user')
            .map((message) => message.content.trim())
            .filter(Boolean)
            .join('\\n');
        return [details, customRequirements ? `Additional requirements:\\n${customRequirements}` : '']
            .filter(Boolean)
            .join('\\n\\n');
    };

    const handleStartBuild = async (extraInformation: Record<string, string> = {}) => {
        if (!selectedTemplate) {
            Alert.alert('Document required', 'Select a document before generating it.');
            return;
        }

        if (!isAuthenticated) {
            Alert.alert('Sign in required', 'Sign in before generating a legal document.');
            return;
        }
        if (generationQuotaRemaining === 0) {
            Alert.alert('Daily limit reached', 'Your free document-generation limit has been reached. You can generate another document tomorrow.');
            return;
        }

        setStep('BUILD');
        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const response = await documentService.generateDocument(
                selectedTemplate.title,
                buildGenerationInput(extraInformation).slice(0, 12000),
            );

            if (response.quota) setGenerationQuotaRemaining(response.quota.remaining);

            if (response.status === 'needs_information') {
                const nextValues: Record<string, string> = {};
                response.missing_information.forEach((field) => {
                    nextValues[field.key] = missingValues[field.key] || '';
                });
                setMissingInformation(response.missing_information);
                setMissingValues(nextValues);
                setStep('MISSING_INFO');
                return;
            }

            setMissingInformation([]);
            setMissingValues({});
            setDraftContent(response.content.trim());
            setStep('PREVIEW');
        } catch (error: any) {
            setStep('CONSULT');
            Alert.alert('Document generation failed', error?.message || 'Could not generate the document. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const normalizeDraftForPdf = (content: string) => {
        const lines = content
            .replace(/\\*\\*/g, '')
            .replace(/^#{1,6}\\s*/gm, '')
            .replace(/^[-*]\\s+/gm, '')
            .split(/\\r?\\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length === 0) return '<p>No document content.</p>';

        return lines.map((line, index) => {
            const isTitle = index === 0;
            const isNumberedHeading = /^\\d+[.)]\\s+/.test(line);
            const isUpperHeading = line.length <= 90 && line === line.toUpperCase() && /[A-Z]/.test(line);
            if (isTitle) return `<h1>${escapeHtml(line)}</h1>`;
            if (isNumberedHeading || isUpperHeading) return `<h2>${escapeHtml(line)}</h2>`;
            return `<p>${escapeHtml(line)}</p>`;
        }).join('');
    };

    const handleExportPDF = async () => {
        try {
            const safeHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"/><style>
                @page { margin: 56px 54px; }
                body { font-family: Georgia, serif; color: #1b1b1b; line-height: 1.55; font-size: 13px; }
                h1 { text-align: center; font-size: 22px; margin: 0 0 28px; letter-spacing: .5px; }
                h2 { font-size: 14px; margin: 20px 0 8px; }
                p { margin: 0 0 10px; }
                .warning { margin-top: 28px; padding-top: 12px; border-top: 1px solid #ccc; font-size: 10px; color: #555; }
            </style></head><body>
                ${normalizeDraftForPdf(draftContent)}
                <div class="warning">AI-generated legal-information draft. Verify applicable Nigerian law, facts and formalities with a qualified legal professional before signing or relying on it.</div>
            </body></html>`;

            const { uri } = await Print.printToFileAsync({ html: safeHtml });
            const filename = `${(selectedTemplate?.title || 'My Rights Document').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}-${Date.now()}.pdf`;
            const savedFile = new File(Paths.document, filename);
            new File(uri).copy(savedFile);
            await Sharing.shareAsync(savedFile.uri, { mimeType: 'application/pdf', dialogTitle: 'Share My Rights document' });
            Alert.alert('Document saved', 'A copy of this PDF has been saved inside My Rights on this device.');
        } catch (error) {
            logger.error('PDF export failed:', error);
            Alert.alert('Export Error', 'Could not generate or save the PDF.');
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surfaceContainer }]} onPress={() => step === 'SELECT' ? navigation.goBack() : setStep('SELECT')}>
                <Ionicons name="chevron-back" size={24} color={colors.onSurface} strokeWidth={2.5} />
            </TouchableOpacity>
            <View>
                <Text style={[styles.title, { color: colors.onSurface, fontSize: compact ? fluid(20, 28, 320, 600) : 32, lineHeight: compact ? Math.round(fluid(24, 34, 320, 600)) : 38 }]}>Document Architect</Text>
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant, fontSize: compact ? fluid(10, 12, 320, 600) : 12, letterSpacing: compact ? fluid(1.5, 2, 320, 600) : 2 }]} numberOfLines={1}>
                    {step === 'SELECT' ? 'Choose a document type' : 
                     step === 'INTAKE' ? 'Enter the document details' : 
                     step === 'CONSULT' ? 'Add optional requirements' : 'Completed document — review before use'}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Image 
                    source={require('../../../assets/images/classroom_bg.png')} 
                    style={styles.globalBackground} 
                    resizeMode="cover"
                />
                <BlurView intensity={isDark ? 30 : 15} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
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
                        <ScrollView contentContainerStyle={[styles.templatesList, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, width: '100%', alignSelf: 'center' }]} showsVerticalScrollIndicator={false}>
                            {templates.map((t, idx) => (
                                <Animated.View key={t.id} entering={FadeInRight.delay(idx * 100)}>
                                    <TouchableOpacity 
                                        testID={`document-template-${t.id}`}
                                        accessibilityRole="button"
                                        style={[
                                            styles.templateCard,
                                            compact && {
                                                padding: fluid(10, 20, 320, 600),
                                                borderRadius: fluid(20, 32, 320, 600),
                                                marginBottom: fluid(10, 16, 320, 600),
                                            },
                                            {
                                                backgroundColor: colors.surfaceContainerLow,
                                                marginTop: compact ? 0 : (idx % 2 === 0 ? 0 : 24),
                                                marginLeft: compact ? 0 : (idx % 2 === 0 ? 0 : 16),
                                                marginRight: compact ? 0 : (idx % 2 === 0 ? 16 : 0),
                                            }
                                        ]}
                                        onPress={() => handleSelectTemplate(t)}
                                    >
                                        <View style={[styles.templateIcon, compact && {
                                            width: fluid(44, 64, 320, 600),
                                            height: fluid(44, 64, 320, 600),
                                            borderRadius: fluid(14, 20, 320, 600),
                                        }, { backgroundColor: colors.primary + '10' }]}>
                                            <Ionicons name="document-text" size={compact ? fluid(20, 28, 320, 600) : 28} color={colors.primary} />
                                        </View>
                                        <View style={[styles.templateInfo, compact && { marginLeft: fluid(10, 16, 320, 600), marginRight: fluid(4, 8, 320, 600), minWidth: 0, flex: 1 }]}>
                                            <Text style={[styles.templateTitle, compact && {
                                                fontSize: fluid(14.5, 17, 320, 600),
                                                lineHeight: fluid(18, 20, 320, 600),
                                                fontWeight: '600',
                                                letterSpacing: -0.2,
                                            }, { color: colors.onSurface }]} numberOfLines={2} ellipsizeMode="tail">{t.title}</Text>
                                            <Text style={[styles.templateDesc, compact && {
                                                fontSize: fluid(10.5, 12, 320, 600),
                                                lineHeight: fluid(13.5, 16, 320, 600),
                                                marginTop: fluid(2, 4, 320, 600),
                                            }, { color: colors.onSurfaceVariant }]} numberOfLines={2}>{t.description}</Text>
                                        </View>
                                        <View style={[styles.arrowCircle, compact && {
                                            width: fluid(28, 32, 320, 600),
                                            height: fluid(28, 32, 320, 600),
                                            borderRadius: fluid(14, 16, 320, 600),
                                            flexShrink: 0,
                                        }, { backgroundColor: colors.surfaceContainerHighest }]}>
                                            <Ionicons name="chevron-forward" size={compact ? fluid(13, 16, 320, 600) : 16} color={colors.primary} />
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    )}

                    {step === 'INTAKE' && selectedTemplate && (
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                            <ScrollView contentContainerStyle={[styles.intakeScroll, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, width: '100%', alignSelf: 'center' }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
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
                                    testID="document-generator-continue"
                                    title="Continue to AI Review" 
                                    onPress={handleIntakeSubmit}
                                    style={styles.submitBtn}
                                />
                            </ScrollView>
                        </KeyboardAvoidingView>
                    )}

                    {step === 'CONSULT' && (
                        <View style={{ flex: 1 }}>
                            <ScrollView style={styles.chatScroll} contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingVertical: 24, maxWidth: contentWidth, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
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
                                        testID="document-generator-consult-input"
                                        accessibilityLabel="Additional document requirements"
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
                                    {isAuthenticated && generationQuotaRemaining !== null && (
                                        <Text style={[styles.quotaHint, { color: colors.onSurfaceVariant }]}>
                                            Free plan: {generationQuotaRemaining} document generation{generationQuotaRemaining === 1 ? '' : 's'} remaining today.
                                        </Text>
                                    )}
                                    <TouchableOpacity 
                                        testID="document-generator-build"
                                        accessibilityRole="button"
                                        style={[styles.finalActionBtn, { backgroundColor: colors.primary }]}
                                        onPress={() => handleStartBuild()}
                                    >
                                        <Text style={styles.finalActionText}>Generate Final Document</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </View>
                    )}

                    {step === 'MISSING_INFO' && selectedTemplate && (
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                            <ScrollView contentContainerStyle={styles.intakeScroll} keyboardShouldPersistTaps="handled">
                                <View style={styles.asymmetricHeader}>
                                    <View style={[styles.accentLine, { backgroundColor: colors.primary }]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.sectionHeader, { color: colors.onSurface, fontSize: 22 }]}>A few details are still needed</Text>
                                        <Text style={[styles.missingIntro, { color: colors.onSurfaceVariant }]}>
                                            My Rights will use these details to produce the completed document instead of leaving fill-in-the-blank fields.
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.formContainer}>
                                    {missingInformation.map((field) => (
                                        <View key={field.key} style={styles.inputGroup}>
                                            <Text style={[styles.inputLabel, { color: colors.primary }]}>{field.label}</Text>
                                            <Text style={[styles.missingReason, { color: colors.onSurfaceVariant }]}>{field.reason}</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface }]}
                                                placeholder={field.label}
                                                placeholderTextColor={colors.onSurfaceVariant + '60'}
                                                value={missingValues[field.key] || ''}
                                                onChangeText={(value) => setMissingValues((current) => ({ ...current, [field.key]: value }))}
                                            />
                                        </View>
                                    ))}
                                </View>
                                <Button
                                    title="Complete Document"
                                    onPress={() => handleStartBuild(missingValues)}
                                    disabled={missingInformation.some((field) => !missingValues[field.key]?.trim())}
                                    style={styles.submitBtn}
                                />
                            </ScrollView>
                        </KeyboardAvoidingView>
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
                            <View style={[styles.previewActions, narrow && styles.previewActionsNarrow]}>
                                <TouchableOpacity 
                                    style={[styles.actionBtnPrimary, { backgroundColor: colors.primary }]}
                                    onPress={handleExportPDF}
                                >
                                    <Ionicons name="download-outline" size={20} color="#FFF" />
                                    <Text style={styles.actionBtnTextMain}>Save & Share PDF</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.actionBtnOutline, { borderColor: colors.outline }]}
                                    onPress={() => setStep('CONSULT')}
                                >
                                    <Text style={[styles.actionBtnTextOutline, { color: colors.onSurface }]}>Refine Details</Text>
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
        ...StyleSheet.absoluteFill,
        opacity: 0.12,
    },
    header: {
        paddingHorizontal: 16,
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
        fontSize: 28,
        fontWeight: '600',
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
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 24,
    },
    templateCardCompact: {
        padding: 14,
        borderRadius: 24,
        marginBottom: 12,
        minHeight: 0,
    },
    templateIconCompact: {
        width: 52,
        height: 52,
        borderRadius: 16,
    },
    templateInfoCompact: {
        marginLeft: 12,
        marginRight: 6,
        minWidth: 0,
    },
    templateTitleCompact: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    templateDescCompact: {
        fontSize: 11.5,
        lineHeight: 15,
        marginTop: 3,
    },
    arrowCircleCompact: {
        width: 32,
        height: 32,
        borderRadius: 16,
        flexShrink: 0,
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
        minWidth: 0,
    },
    templateTitle: {
        ...theme.typography.titleMd,
        fontSize: 18,
        fontWeight: '600',
    },
    templateDesc: {
        ...theme.typography.caption,
        fontSize: 12,
        marginTop: 4,
        lineHeight: 16,
        flexShrink: 1,
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    intakeScroll: {
        paddingHorizontal: 0,
        paddingVertical: 24,
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
        fontWeight: '600',
    },
    formContainer: {
        gap: 20,
    },
    missingIntro: {
        marginTop: 8,
        fontSize: 13,
        lineHeight: 20,
    },
    missingReason: {
        fontSize: 12,
        lineHeight: 18,
        marginTop: -4,
        marginBottom: 2,
    },
    inputGroup: {
        gap: 10,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '600',
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
        paddingHorizontal: 0,
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
    quotaHint: {
        textAlign: 'center',
        marginBottom: 8,
        fontSize: 12,
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
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...theme.typography.titleMd,
        marginTop: 20,
        fontWeight: '600',
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
    previewActionsNarrow: {
        flexDirection: 'column',
        gap: 12,
    },
    actionBtnPrimary: {
        flex: 2,
        width: '100%',
        height: 64,
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    actionBtnOutline: {
        flex: 1,
        width: '100%',
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnTextMain: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    actionBtnTextOutline: {
        fontSize: 14,
        fontWeight: '600',
    }
});
