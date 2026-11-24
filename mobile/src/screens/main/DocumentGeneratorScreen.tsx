import React, { useState, useRef, useEffect } from 'react';
import { logger } from '../../utils/logger';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Input } from '../../components/ui/Input';
import { documentService } from '../../services/document.service';
import { usageService } from '../../services/usage.service';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useAuth } from '../../contexts/AuthContext';

import { useJobs } from '../../contexts/JobContext';
import { legalService, Template } from '../../services/legalService';


type DraftStep = 'SELECT' | 'INTAKE' | 'CONSULT' | 'BUILD' | 'PREVIEW' | 'FINALIZE';

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
    const { activeJob, startJob, updateJob, finishJob, failJob, clearJob } = useJobs();
    const navigation = useNavigation<any>();
    const { isAuthenticated } = useAuth();
    
    // Workflow State
    const [step, setStep] = useState<DraftStep>('SELECT');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [intakeData, setIntakeData] = useState<Record<string, string>>({});
    const [consultMessages, setConsultMessages] = useState<ConsultMessage[]>([]);
    const [draftContent, setDraftContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [userInput, setUserInput] = useState('');
    const [generationQuotaRemaining, setGenerationQuotaRemaining] = useState<number | null>(null);

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

    const buildIntakeDetails = () => Object.entries(intakeData)
        .map(([key, value]) => `${key}: ${value.trim()}`)
        .filter((entry) => !entry.endsWith(':'))
        .join('\\n');

    const handleIntakeSubmit = async () => {
        if (!isAuthenticated) {
            Alert.alert('Sign in required', 'Sign in before generating a legal document draft.');
            return;
        }
        if (!selectedTemplate) return;

        const intakeDetails = buildIntakeDetails();
        if (!intakeDetails) {
            Alert.alert('More details needed', 'Please complete at least one primary detail before continuing.');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep('CONSULT');
        setIsLoading(true);

        try {
            const firstQuestion = await documentService.consultDocument(
                selectedTemplate.title,
                intakeDetails,
            );
            setConsultMessages([{
                id: createMessageId('assistant'),
                role: 'assistant',
                content: firstQuestion,
            }]);
        } catch (error: any) {
            setStep('INTAKE');
            Alert.alert('AI consultation failed', error?.message || 'Could not start the document consultation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConsultSubmit = async () => {
        const text = userInput.trim();
        if (!text || !selectedTemplate) return;

        const newMessage: ConsultMessage = {
            id: createMessageId('user'),
            role: 'user',
            content: text,
        };
        const nextConversation = [...consultMessages, newMessage];

        setConsultMessages(nextConversation);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await documentService.consultDocument(
                selectedTemplate.title,
                buildIntakeDetails(),
                nextConversation,
            );
            setConsultMessages(prev => [...prev, {
                id: createMessageId('assistant'),
                role: 'assistant',
                content: response,
            }]);
        } catch (error: any) {
            Alert.alert('AI consultation failed', error?.message || 'Could not get a response from the AI.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartBuild = async () => {
        if (!selectedTemplate) {
            Alert.alert('Template required', 'Select a document template before generating a draft.');
            return;
        }

        if (!isAuthenticated) {
            Alert.alert('Sign in required', 'Sign in before generating a legal document draft.');
            return;
        }
        if (generationQuotaRemaining === 0) {
            Alert.alert('Daily limit reached', 'Your free document-generation limit has been reached. You can generate another draft tomorrow.');
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
            if (!response?.content?.trim()) {
                throw new Error('No draft was returned.');
            }
            setDraftContent(response.content.trim());
            if (response.quota) setGenerationQuotaRemaining(response.quota.remaining);
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
            const safeHtml = `<html><body style="font-family: serif; padding: 32px; line-height: 1.6;"><h2>${escapeHtml(selectedTemplate?.title || 'Document Draft')}</h2><p>${escapeHtml(draftContent)}</p><hr/><p style="font-size: 11px;">AI-generated draft for general information. Verify applicable Nigerian law, facts and formalities with a qualified legal professional before signing or relying on this document.</p></body></html>`;
            const { uri } = await Print.printToFileAsync({ html: safeHtml });
            await Sharing.shareAsync(uri);
        } catch (error) {
            Alert.alert('Export Error', 'Could not generate PDF.');
        }
    };

    const subtitle =
        step === 'SELECT' ? 'Pick what you need'
            : step === 'INTAKE' ? 'A few details'
                : step === 'CONSULT' ? 'Say what to include'
                    : step === 'BUILD' ? 'Writing'
                        : 'Read it before you use it';

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <ScreenHeader
                title="Write a document"
                subtitle={subtitle}
                onBack={() => (step === 'SELECT' ? navigation.goBack() : setStep('SELECT'))}
            />

            {isLoading && step === 'SELECT' ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Loading templates</Text>
                </View>
            ) : (
                <View style={styles.workflowContainer}>
                    {step === 'SELECT' && (
                        <ScrollView contentContainerStyle={styles.templatesList} showsVerticalScrollIndicator={false}>
                            <View style={[styles.templateGroup, { backgroundColor: colors.card, borderColor: colors.line }]}>
                                {templates.map((t, idx) => (
                                    <Pressable
                                        key={t.id}
                                        accessibilityRole="button"
                                        onPress={() => handleSelectTemplate(t)}
                                        style={({ pressed }) => [styles.templateRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.line }, pressed && { backgroundColor: colors.surfaceContainer }]}
                                    >
                                        <View style={[styles.templateIcon, { backgroundColor: colors.primaryContainer }]}>
                                            <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                                        </View>
                                        <View style={styles.templateInfo}>
                                            <Text style={[styles.templateTitle, { color: colors.onSurface }]}>{t.title}</Text>
                                            <Text style={[styles.templateDesc, { color: colors.onSurfaceVariant }]} numberOfLines={2}>{t.description}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>
                    )}

                    {step === 'INTAKE' && selectedTemplate && (
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
                            <ScrollView contentContainerStyle={styles.intakeScroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                                <Text style={[styles.intakeTitle, { color: colors.onSurface }]}>{selectedTemplate.title}</Text>
                                {selectedTemplate.fields.map((field) => (
                                    <Input
                                        key={field.key}
                                        label={field.label}
                                        placeholder={field.placeholder}
                                        value={intakeData[field.key] ?? ''}
                                        onChangeText={(val) => setIntakeData((prev) => ({ ...prev, [field.key]: val }))}
                                        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                                    />
                                ))}
                                <Button title="Continue" size="large" fullWidth onPress={handleIntakeSubmit} />
                            </ScrollView>
                        </KeyboardAvoidingView>
                    )}

                    {step === 'CONSULT' && (
                        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                            <ScrollView style={styles.flex} contentContainerStyle={styles.consultScrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                                {consultMessages.map((msg) => (
                                    <View
                                        key={msg.id}
                                        style={[
                                            styles.chatBubble,
                                            msg.role === 'user'
                                                ? { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                                                : { alignSelf: 'flex-start', backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1, borderBottomLeftRadius: 4 },
                                        ]}
                                    >
                                        <Text style={[styles.chatText, { color: msg.role === 'user' ? colors.onPrimary : colors.onSurface }]}>{msg.content}</Text>
                                    </View>
                                ))}
                                {isLoading ? <ActivityIndicator color={colors.primary} style={styles.thinking} /> : null}
                            </ScrollView>

                            <View style={[styles.composer, { backgroundColor: colors.card, borderTopColor: colors.line }]}>
                                <View style={styles.chatInputRow}>
                                    <TextInput
                                        style={[styles.chatInput, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, color: colors.onSurface }]}
                                        placeholder="Anything else to include?"
                                        placeholderTextColor={colors.outline}
                                        value={userInput}
                                        onChangeText={setUserInput}
                                        multiline
                                        editable={!isLoading}
                                    />
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Send"
                                        disabled={isLoading || !userInput.trim()}
                                        style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: isLoading || !userInput.trim() ? 0.4 : 1 }]}
                                        onPress={handleConsultSubmit}
                                    >
                                        <Ionicons name="arrow-up" size={22} color={colors.onPrimary} />
                                    </Pressable>
                                </View>
                                {isAuthenticated && generationQuotaRemaining !== null ? (
                                    <Text style={[styles.quotaHint, { color: colors.onSurfaceVariant }]}>
                                        {generationQuotaRemaining} draft{generationQuotaRemaining === 1 ? '' : 's'} left today.
                                    </Text>
                                ) : null}
                                <Button title="Write the document" variant="accent" size="large" fullWidth onPress={handleStartBuild} disabled={isLoading} />
                            </View>
                        </KeyboardAvoidingView>
                    )}

                    {step === 'BUILD' && (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Writing your document…</Text>
                        </View>
                    )}

                    {step === 'PREVIEW' && (
                        <View style={styles.flex}>
                            <View style={[styles.warn, { backgroundColor: colors.tertiaryContainer }]}>
                                <Ionicons name="alert-circle" size={18} color={colors.onTertiaryContainer} />
                                <Text style={[styles.warnText, { color: colors.onTertiaryContainer }]}>Draft written by AI. Have a lawyer check it before you sign or send it.</Text>
                            </View>
                            <ScrollView style={styles.flex} contentContainerStyle={styles.previewPad}>
                                <View style={[styles.previewSheet, { backgroundColor: colors.card, borderColor: colors.line }]}>
                                    <Text style={[styles.previewText, { color: colors.onSurface }]} selectable>{draftContent.replace(/<[^>]*>?/gm, '')}</Text>
                                </View>
                            </ScrollView>
                            <View style={[styles.previewActions, { backgroundColor: colors.card, borderTopColor: colors.line }]}>
                                <Button title="Save as PDF" size="large" style={styles.actionMain} onPress={handleExportPDF} icon={<Ionicons name="download-outline" size={20} color={colors.onPrimary} />} />
                                <Button title="Change it" variant="outline" size="large" style={styles.actionSide} onPress={() => setStep('CONSULT')} />
                            </View>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { ...theme.typography.bodyMd },
    workflowContainer: { flex: 1 },
    templatesList: { padding: 16, paddingBottom: 32 },
    templateGroup: { borderWidth: 1, borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
    templateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 72 },
    templateIcon: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    templateInfo: { flex: 1 },
    templateTitle: { ...theme.typography.titleMd },
    templateDesc: { ...theme.typography.caption, marginTop: 2 },
    intakeScroll: { padding: 16, paddingBottom: 32 },
    intakeTitle: { ...theme.typography.titleLg, marginBottom: 16 },
    consultScrollContent: { padding: 16, gap: 10 },
    chatBubble: { maxWidth: '86%', padding: 12, borderRadius: 16 },
    chatText: { fontFamily: theme.typography.fontFamily.body, fontSize: 15.5, lineHeight: 22 },
    thinking: { alignSelf: 'flex-start', marginLeft: 8 },
    composer: { borderTopWidth: 1, padding: 12, gap: 10 },
    chatInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    chatInput: { flex: 1, borderWidth: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, minHeight: 44, maxHeight: 120, fontFamily: theme.typography.fontFamily.body, fontSize: 16 },
    sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    quotaHint: { ...theme.typography.caption, textAlign: 'center' },
    warn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
    warnText: { ...theme.typography.labelSm, flex: 1, color: undefined },
    previewPad: { padding: 16 },
    previewSheet: { borderWidth: 1, borderRadius: theme.borderRadius.md, padding: 18 },
    previewText: { ...theme.typography.reading },
    previewActions: { flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1 },
    actionMain: { flex: 2, alignSelf: 'stretch' },
    actionSide: { flex: 1, alignSelf: 'stretch' },
});
