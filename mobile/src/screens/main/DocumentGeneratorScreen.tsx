/**
 * Document Generator Screen - "Legal Document Architect"
 * Premium flow: Template Selection -> Smart Intake Form -> AI Architecting -> Live Preview -> HTML -> Export
 */

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ArchitectStep = 'SELECT' | 'INTAKE' | 'CONSULT' | 'BUILD' | 'PREVIEW' | 'FINALIZE';

interface ConsultMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

const createMessageId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface TemplateField {
    key: string;
    label: string;
    placeholder: string;
    type?: 'text' | 'number';
}

interface Template {
    id: string;
    title: string;
    category: string;
    description: string;
    fields: TemplateField[];
}

const TEMPLATES: Template[] = [
    {
        id: 'tenancy',
        title: 'Tenancy Agreement',
        category: '1',
        description: 'Standard Nigerian residential tenancy contract.',
        fields: [
            { key: 'landlord', label: 'Landlord Full Name', placeholder: 'Legal owner of the property' },
            { key: 'tenant', label: 'Tenant Full Name', placeholder: 'Full name of the person renting' },
            { key: 'address', label: 'Property Address', placeholder: 'Complete address including state' },
            { key: 'rent', label: 'Annual Rent (₦)', placeholder: 'e.g. 2,500,000', type: 'number' },
            { key: 'duration', label: 'Duration', placeholder: 'e.g. 2 years' },
        ]
    },
    {
        id: 'demand',
        title: 'Demand Letter',
        category: '3',
        description: 'Pre-litigation letter for debt recovery.',
        fields: [
            { key: 'debtor', label: 'Debtor Name', placeholder: 'Person or Company owing' },
            { key: 'amount', label: 'Amount Owed (₦)', placeholder: 'Principal amount', type: 'number' },
            { key: 'reason', label: 'Basis of Debt', placeholder: 'e.g. Unpaid goods, Loan agreement' },
            { key: 'deadline', label: 'Payment Deadline', placeholder: 'e.g. 7 days from today' },
        ]
    },
    {
        id: 'nda',
        title: 'Non-Disclosure (NDA)',
        category: '3',
        description: 'Protection for business trade secrets.',
        fields: [
            { key: 'disclosing', label: 'Disclosing Party', placeholder: 'Party sharing information' },
            { key: 'receiving', label: 'Receiving Party', placeholder: 'Party receiving information' },
            { key: 'purpose', label: 'Purpose of Sharing', placeholder: 'e.g. Investment evaluation, partnership talk' },
            { key: 'term', label: 'Confidentiality Term', placeholder: 'e.g. 5 years' },
        ]
    },
    {
        id: 'custom',
        title: 'Custom AI Draft',
        category: '4',
        description: 'Interactive AI consultation for any unique document.',
        fields: []
    },
];

export const DocumentGeneratorScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const { isAuthenticated, isGuest } = useAuth();

    // Architect State
    const [step, setStep] = useState<ArchitectStep>('SELECT');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isArchitecting, setIsArchitecting] = useState(false);
    const [documentContent, setDocumentContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [activeField, setActiveField] = useState<string | null>(null);

    // Consultation Chat State
    const [consultMessages, setConsultMessages] = useState<ConsultMessage[]>([]);
    const [currentConsultInput, setCurrentConsultInput] = useState('');
    const consultScrollViewRef = useRef<ScrollView>(null);
    const [consultConversationId, setConsultConversationId] = useState<string | null>(null);

    // Voice Hooks
    const consultVoice = useVoiceInput((text) => setCurrentConsultInput(prev => (prev ? prev + ' ' : '') + text));
    const intakeVoice = useVoiceInput((text) => {
        if (activeField) {
            setFormData(prev => ({ ...prev, [activeField]: (prev[activeField] || '') + ' ' + text }));
        }
    });

    const handleSelectTemplate = (template: Template) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedTemplate(template);
        setFormData({});

        if (template.id === 'custom') {
            setStep('CONSULT');
            setConsultMessages([
                {
                    id: createMessageId('assistant'),
                    role: 'assistant',
                    content: 'What kind of document do you need help architecting today? Please describe the situation or the parties involved.'
                }
            ]);
            setConsultConversationId(null);
        } else {
            setStep('INTAKE');
        }
    };

    const handleUpdateForm = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleConsultSubmit = async () => {
        if (!currentConsultInput.trim()) return;

        const userMsg = currentConsultInput.trim();
        const useAuthEndpoint = isAuthenticated && !isGuest;
        const newUserMessage: ConsultMessage = {
            id: createMessageId('user'),
            role: 'user',
            content: userMsg,
        };

        const nextMessages = [...consultMessages, newUserMessage];
        setConsultMessages(nextMessages);
        setCurrentConsultInput('');
        setIsArchitecting(true);

        try {
            const response = await chatService.sendMessage(userMsg, {
                useAuthenticatedEndpoint: useAuthEndpoint,
                conversationId: useAuthEndpoint ? consultConversationId ?? undefined : undefined,
            });

            const lowerContent = (content: string) => content.toLowerCase();
            const appendAssistantMessage = (content: string) => {
                const assistantMessage: ConsultMessage = {
                    id: createMessageId('assistant'),
                    role: 'assistant',
                    content,
                };
                setConsultMessages((prev) => [...prev, assistantMessage]);

                if (consultScrollViewRef.current) {
                    consultScrollViewRef.current.scrollToEnd({ animated: true });
                }

                if (lowerContent(content).includes('ready to generate') ||
                    lowerContent(content).includes('architect the document now')) {
                    // Placeholder hook: could enable a CTA to jump to build step.
                }
            };

            if (useAuthEndpoint) {
                const authResponse = response as AuthenticatedChatResponse;
                setConsultConversationId(authResponse.conversation_id);

                const responseContent = authResponse.message.content;
                const disclaimer = authResponse.disclaimer ? `\n\n${authResponse.disclaimer}` : '';
                appendAssistantMessage(`${responseContent}${disclaimer}`);
            } else {
                const publicResponse = response as PublicChatResponse;
                const disclaimer = publicResponse.legal_disclaimer ? `\n\n${publicResponse.legal_disclaimer}` : '';
                appendAssistantMessage(`${publicResponse.content}${disclaimer}`);
            }
        } catch (error) {
            console.error('Consult error:', error);
            setConsultMessages((prev) => [
                ...prev,
                {
                    id: createMessageId('assistant'),
                    role: 'assistant',
                    content: 'I could not process that request right now. Please try again in a moment.',
                },
            ]);
        } finally {
            setIsArchitecting(false);
        }
    };

    const handleFinalizeConsultation = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsArchitecting(true);

        try {
            const context = consultMessages.map(m => `${m.role}: ${m.content}`).join('\n');
            const response = await documentService.generateDocument("Custom Consultation Document", context);
            setDocumentContent(response.content);
            setStep('BUILD');
        } catch (error) {
            Alert.alert("Error", "Could not finalize document. Please try again.");
        } finally {
            setIsArchitecting(false);
        }
    };

    const handleDownload = async (format: string) => {
        setIsExporting(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            // 1. Generate HTML for the PDF
            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; }
                        h1 { color: #002244; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
                        p { line-height: 1.6; font-size: 14px; margin-bottom: 15px; }
                        .footer { margin-top: 50px; font-size: 10px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>${selectedTemplate?.title.toUpperCase()}</h1>
                    <div>${documentContent.replace(/\n/g, '<br/>')}</div>
                    <div class="footer">
                        Generated by INJUSTICE AI Advisor • ${new Date().toLocaleDateString()}
                    </div>
                </body>
                </html>
            `;

            // 2. Create PDF
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false
            });

            // 3. Share / Save
            await Sharing.shareAsync(uri, {
                UTI: '.pdf',
                mimeType: 'application/pdf',
                dialogTitle: `Save ${selectedTemplate?.title}`
            });

            Alert.alert("Success", "Document exported successfully. You can find it where you saved it via the share sheet.");

        } catch (error) {
            console.error('Export error:', error);
            Alert.alert("Export Failed", "Could not save the document. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleGenerate = async () => {
        // Validation
        if (!selectedTemplate) return;
        const missingFields = selectedTemplate.fields.filter(f => !formData[f.key]);
        if (missingFields.length > 0) {
            Alert.alert("Missing Information", `Please provide: ${missingFields[0].label}`);
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsArchitecting(true);

        try {
            const userDetails = Object.entries(formData)
                .map(([key, val]) => `${key}: ${val}`)
                .join('. ');

            const response = await documentService.generateDocument(selectedTemplate.title, userDetails);

            setDocumentContent(response.content);
            setStep('BUILD');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (error) {
            console.error('Generation error:', error);
            Alert.alert("Reviewing Request...", "AI generation failed. Please try again.");
        } finally {
            setIsArchitecting(false);
        }
    };

    const renderHeader = () => {
        let title = "Document Architect";
        let subtitle = "Select a starting point";

        if (step === 'INTAKE') {
            title = "Smart Intake";
            subtitle = `Context for ${selectedTemplate?.title}`;
        } else if (step === 'CONSULT') {
            title = "Legal Consultation";
            subtitle = "Gaining context for custom draft";
        } else if (step === 'BUILD') {
            title = "Drafting Room";
            subtitle = "Refining AI architecture";
        } else if (step === 'PREVIEW') {
            title = "Final Review";
            subtitle = "Visual document audit";
        } else if (step === 'FINALIZE') {
            title = "Download Center";
            subtitle = "Ready for export";
        }

        return (
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        onPress={() => {
                            if (step === 'SELECT') navigation.goBack();
                            else if (step === 'INTAKE' || step === 'CONSULT') setStep('SELECT');
                            else if (step === 'BUILD') setStep(selectedTemplate?.id === 'custom' ? 'CONSULT' : 'INTAKE');
                            else if (step === 'PREVIEW') setStep('BUILD');
                            else if (step === 'FINALIZE') setStep('PREVIEW');
                        }}
                        style={[styles.backBtn, { backgroundColor: colors.surfaceElevated1 }]}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                    </View>
                </View>

                {/* Step Indicator */}
                <View style={styles.stepContainer}>
                    {['SELECT', 'CONTEXT', 'BUILD', 'FINALIZE'].map((s, i) => (
                        <View key={s} style={styles.stepIndicatorWrapper}>
                            <View style={[
                                styles.stepDot,
                                { backgroundColor: (step === 'SELECT' && i === 0) || ((step === 'INTAKE' || step === 'CONSULT') && i === 1) || (step === 'BUILD' && i === 2) || (step === 'FINALIZE' && i === 3) ? colors.primary : colors.surfaceElevated2 },
                                (i === 0 && (step !== 'SELECT')) && { backgroundColor: theme.colors.success },
                                (i === 1 && (step === 'BUILD' || step === 'FINALIZE')) && { backgroundColor: theme.colors.success },
                                (i === 2 && (step === 'FINALIZE')) && { backgroundColor: theme.colors.success },
                            ]} />
                            {i < 3 && <View style={[styles.stepLine, { backgroundColor: colors.surfaceElevated2 }]} />}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {renderHeader()}

                {step === 'SELECT' && (
                    <Animated.View style={{ flex: 1 }} entering={FadeInRight.springify()}>
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Template Library</Text>
                            <View style={styles.templateGrid}>
                                {TEMPLATES.map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.templateCard, { backgroundColor: colors.surfaceElevated1 }]}
                                        onPress={() => handleSelectTemplate(item)}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: item.id === 'custom' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0, 34, 68, 0.05)' }]}>
                                            <Ionicons
                                                name={item.id === 'custom' ? "sparkles" : "document-text"}
                                                size={24}
                                                color={item.id === 'custom' ? theme.colors.secondary : theme.colors.primary}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                                            <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{item.description}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </Animated.View>
                )}

                {step === 'INTAKE' && selectedTemplate && (
                    <Animated.View style={styles.stepContent} entering={FadeInRight.springify()}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formContainer}>
                                {selectedTemplate.fields.map(field => (
                                    <View key={field.key} style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, { color: colors.text }]}>{field.label}</Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={[styles.formInput, {
                                                    backgroundColor: colors.surfaceElevated1,
                                                    color: colors.text,
                                                    borderColor: colors.border
                                                }]}
                                                placeholder={field.placeholder}
                                                placeholderTextColor={colors.textTertiary}
                                                value={formData[field.key] || ''}
                                                onChangeText={(val) => handleUpdateForm(field.key, val)}
                                                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                                            />
                                            <TouchableOpacity
                                                style={[styles.micBtn, activeField === field.key && intakeVoice.isRecording && { backgroundColor: theme.colors.error + '20' }]}
                                                onPress={() => {
                                                    setActiveField(field.key);
                                                    intakeVoice.toggleRecording();
                                                }}
                                            >
                                                <Ionicons
                                                    name={activeField === field.key && intakeVoice.isRecording ? "mic" : "mic-outline"}
                                                    size={20}
                                                    color={activeField === field.key && intakeVoice.isRecording ? theme.colors.error : colors.primary}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                        <Button
                            title="Generate Custom Draft"
                            onPress={handleGenerate}
                            style={styles.mainBtn}
                            loading={isArchitecting}
                        />
                    </Animated.View>
                )}

                {step === 'CONSULT' && (
                    <Animated.View style={styles.stepContent} entering={FadeInRight.springify()}>
                        <ScrollView
                            ref={consultScrollViewRef}
                            style={styles.chatArea}
                            contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
                            onContentSizeChange={() => consultScrollViewRef.current?.scrollToEnd({ animated: true })}
                        >
                            {consultMessages.map((m, idx) => (
                                <View key={idx} style={[
                                    styles.msgBubble,
                                    m.role === 'user' ? [styles.userBubble, { backgroundColor: colors.primary }] : [styles.aiBubble, { backgroundColor: colors.surfaceElevated1 }]
                                ]}>
                                    <Text style={[
                                        styles.msgText,
                                        m.role === 'user' ? { color: '#FFF' } : { color: colors.text }
                                    ]}>{m.content}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.consultFooter}>
                            <View style={[styles.consultInputBox, { backgroundColor: colors.surfaceElevated1 }]}>
                                <TextInput
                                    style={[styles.consultInput, { color: colors.text }]}
                                    placeholder="Type your requirements..."
                                    placeholderTextColor={colors.textTertiary}
                                    value={currentConsultInput}
                                    onChangeText={setCurrentConsultInput}
                                    multiline
                                />
                                <TouchableOpacity
                                    style={styles.consultMicBtn}
                                    onPress={consultVoice.toggleRecording}
                                >
                                    <Ionicons
                                        name={consultVoice.isRecording ? "mic" : "mic-outline"}
                                        size={20}
                                        color={consultVoice.isRecording ? theme.colors.error : colors.primary}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.sendBtn}
                                    onPress={handleConsultSubmit}
                                >
                                    <Ionicons name="send" size={20} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={[styles.finalizeBtn, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}
                                onPress={handleFinalizeConsultation}
                            >
                                <Ionicons name="sparkles" size={16} color={theme.colors.secondary} />
                                <Text style={[styles.finalizeText, { color: theme.colors.secondary }]}>Draft Document Now</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}

                {step === 'BUILD' && (
                    <Animated.View style={styles.stepContent} entering={FadeInRight.springify()}>
                        <View style={styles.editorToolbar}>
                            <TouchableOpacity
                                style={[styles.toolbarBtn, isEditing && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                                onPress={() => setIsEditing(!isEditing)}
                            >
                                <Ionicons name={isEditing ? "checkmark" : "create"} size={20} color={isEditing ? "#FFF" : colors.text} />
                                <Text style={[styles.toolbarText, { color: isEditing ? "#FFF" : colors.text }]}>
                                    {isEditing ? "Save Edit" : "Manual Edit"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.documentViewer, { backgroundColor: colors.surfaceElevated1 }]}>
                            {isEditing ? (
                                <TextInput
                                    multiline
                                    style={[styles.editingInput, { color: colors.text }]}
                                    value={documentContent}
                                    onChangeText={setDocumentContent}
                                />
                            ) : (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <Text style={[styles.documentText, { color: colors.text }]}>
                                        {documentContent}
                                    </Text>
                                </ScrollView>
                            )}
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.previewToggle, { backgroundColor: colors.surfaceElevated2 }]}
                                onPress={() => setStep('PREVIEW')}
                            >
                                <Ionicons name="eye" size={20} color={colors.primary} />
                                <Text style={[styles.previewText, { color: colors.primary }]}>Live View</Text>
                            </TouchableOpacity>
                            <Button
                                title="Finalize Draft"
                                onPress={() => setStep('FINALIZE')}
                                style={[styles.mainBtn, { flex: 2 }]}
                            />
                        </View>
                    </Animated.View>
                )}

                {/* Rest of the steps (PREVIEW, FINALIZE) remain largely the same but with UI tweaks */}
                {(step === 'PREVIEW' || step === 'FINALIZE') && (
                    <Animated.View style={styles.stepContent} entering={FadeInRight.springify()}>
                        {step === 'PREVIEW' ? (
                            <View style={styles.htmlPreviewContainer}>
                                <ScrollView contentContainerStyle={{ padding: 32 }}>
                                    <Text style={styles.htmlH1}>{selectedTemplate?.title.toUpperCase()}</Text>
                                    <View style={styles.htmlDivider} />
                                    <Text style={styles.htmlP}>{documentContent}</Text>
                                </ScrollView>
                            </View>
                        ) : (
                            <View style={styles.finalizeView}>
                                <View style={styles.successHeader}>
                                    <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
                                    <Text style={[styles.successTitle, { color: colors.text }]}>Draft Ready</Text>
                                    <Text style={[styles.successSub, { color: colors.textSecondary }]}>
                                        Your {selectedTemplate?.title} has been custom architected.
                                    </Text>
                                </View>

                                <View style={styles.exportGrid}>
                                    <TouchableOpacity
                                        style={[styles.exportCard, { backgroundColor: colors.surfaceElevated1 }]}
                                        onPress={() => handleDownload('PDF')}
                                    >
                                        <Ionicons name="document-text" size={32} color="#EF4444" />
                                        <Text style={[styles.exportText, { color: colors.text }]}>Export PDF</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.exportCard, { backgroundColor: colors.surfaceElevated1 }]}
                                        onPress={() => handleDownload('DOCX')}
                                    >
                                        <Ionicons name="document" size={32} color="#3B82F6" />
                                        <Text style={[styles.exportText, { color: colors.text }]}>Save Word</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        <Button
                            title={step === 'PREVIEW' ? "Proceed to Export" : "Back to Tool Library"}
                            onPress={() => step === 'PREVIEW' ? setStep('FINALIZE') : navigation.goBack()}
                            style={styles.mainBtn}
                        />
                    </Animated.View>
                )}
            </KeyboardAvoidingView>

            {(isArchitecting || isExporting) && (
                <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                    <BlurView intensity={30} style={StyleSheet.absoluteFill} />
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: '#002244' }]}>
                            {isExporting ? 'Exporting Files...' : 'AI Architecting...'}
                        </Text>
                        <Text style={styles.loadingSub}>Analyzing Nigerian Case Law & Context</Text>
                    </View>
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
    header: {
        padding: 24,
        paddingBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...theme.typography.h3,
        fontSize: 22,
    },
    subtitle: {
        ...theme.typography.bodySmall,
    },
    stepContainer: {
        flexDirection: 'row',
        marginTop: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepIndicatorWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    stepLine: {
        width: 40,
        height: 2,
    },
    scrollContent: {
        padding: 24,
    },
    sectionTitle: {
        ...theme.typography.h4,
        marginBottom: 20,
    },
    templateGrid: {
        gap: 14,
    },
    templateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 28,
        gap: 16,
        ...theme.shadows.sm,
    },
    iconBox: {
        width: 54,
        height: 54,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemTitle: {
        fontWeight: '800',
        fontSize: 16,
        marginBottom: 4,
    },
    itemSub: {
        fontSize: 12,
        lineHeight: 16,
    },
    stepContent: {
        flex: 1,
        padding: 24,
        gap: 20,
    },
    formContainer: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '800',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    formInput: {
        flex: 1,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        fontSize: 15,
    },
    micBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 34, 68, 0.05)',
    },
    mainBtn: {
        height: 64,
        borderRadius: 32,
        ...theme.shadows.md,
    },
    /* Consultation Chat */
    chatArea: {
        flex: 1,
    },
    msgBubble: {
        padding: 16,
        borderRadius: 20,
        maxWidth: '85%',
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    msgText: {
        fontSize: 14,
        lineHeight: 20,
    },
    consultFooter: {
        gap: 12,
    },
    consultInputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        gap: 12,
    },
    consultInput: {
        flex: 1,
        fontSize: 14,
        maxHeight: 100,
    },
    consultMicBtn: {
        padding: 4,
    },
    sendBtn: {
        padding: 4,
    },
    finalizeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 24,
        gap: 8,
    },
    finalizeText: {
        fontWeight: '800',
        fontSize: 14,
    },
    /* Editor */
    editorToolbar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    toolbarBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        gap: 8,
    },
    toolbarText: {
        fontSize: 13,
        fontWeight: '800',
    },
    documentViewer: {
        flex: 1,
        borderRadius: 32,
        padding: 24,
        ...theme.shadows.md,
    },
    documentText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
        fontSize: 14,
        lineHeight: 24,
    },
    editingInput: {
        flex: 1,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 14,
        textAlignVertical: 'top',
        lineHeight: 24,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    previewToggle: {
        flex: 1.2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 32,
        gap: 8,
    },
    previewText: {
        fontWeight: '800',
    },
    /* HTML Preview */
    htmlPreviewContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#EEE',
        overflow: 'hidden',
    },
    htmlH1: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 10,
        color: '#1A1A1A',
    },
    htmlDivider: {
        height: 4,
        width: 80,
        backgroundColor: '#D4AF37',
        alignSelf: 'center',
        marginBottom: 32,
    },
    htmlP: {
        fontSize: 15,
        lineHeight: 26,
        color: '#2D3748',
    },
    /* Finalize */
    finalizeView: {
        flex: 1,
        justifyContent: 'center',
        gap: 40,
    },
    successHeader: {
        alignItems: 'center',
        gap: 16,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '900',
    },
    successSub: {
        textAlign: 'center',
        fontSize: 15,
        paddingHorizontal: 24,
    },
    exportGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    exportCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 32,
        borderRadius: 32,
        gap: 12,
        ...theme.shadows.sm,
    },
    exportText: {
        fontWeight: '800',
        fontSize: 13,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loadingBox: {
        backgroundColor: '#FFF',
        padding: 40,
        borderRadius: 40,
        alignItems: 'center',
        gap: 16,
        ...theme.shadows.lg,
    },
    loadingText: {
        fontWeight: '900',
        fontSize: 20,
    },
    loadingSub: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});
