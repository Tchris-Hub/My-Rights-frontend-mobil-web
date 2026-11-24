/**
 * Check a document: pick a file or photo, get the clauses that need attention, tap one for the detail.
 */

import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { documentService } from '../../services/document.service';
import { usageService } from '../../services/usage.service';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import type { DocumentAnalysisResponse, AnalysisResult } from '../../types';

import { useJobs } from '../../contexts/JobContext';
import { useNavigation } from '@react-navigation/native';


export const DocumentReviewScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { activeJob, startJob, finishJob, failJob, updateJob, clearJob } = useJobs();
    const navigation = useNavigation<any>();
    const { isAuthenticated } = useAuth();
    const [documentText, setDocumentText] = useState('');
    const [pendingDocument, setPendingDocument] = useState<{
        kind: 'text' | 'image';
        name: string;
        uri?: string;
        mimeType?: string;
        size?: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DocumentAnalysisResponse | null>(null);
    const [selectedClause, setSelectedClause] = useState<AnalysisResult | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState<string>('');
    const [analyzeQuotaRemaining, setAnalyzeQuotaRemaining] = useState<number | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setAnalyzeQuotaRemaining(null);
            return;
        }
        usageService.getAiQuota()
            .then((quotas) => {
                const quota = quotas.find((item) => item.feature === 'document_analyze');
                setAnalyzeQuotaRemaining(quota?.remaining ?? null);
            })
            .catch((error) => logger.error('Failed to load document-review quota:', error));
    }, [isAuthenticated]);

    // Check if there's a finished job for this screen
    useEffect(() => {
        if (activeJob && activeJob.type === 'analysis' && activeJob.status === 'completed' && activeJob.result) {
            setResult(activeJob.result);
            clearJob();
        }
    }, [activeJob?.status]);

    const handleAnalyze = async (text?: string) => {
        const targetText = text || documentText;
        if (!targetText.trim()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsLoading(true);

        const jobId = startJob({
            type: 'analysis',
            title: 'Analyzing Document',
            progress: 'Uploading Document...',
            params: { text: targetText }
        });

        setLoadingPhase('Uploading Document...');

        try {
            const updatePhase = (phase: string) => {
                setLoadingPhase(phase);
                updateJob(jobId, { progress: phase });
            };

            setTimeout(() => updatePhase('Analyzing document content...'), 1000);
            setTimeout(() => updatePhase('Preparing review findings...'), 2500);

            const analysis = await documentService.analyzeDocument(targetText);

            if (analysis.error) {
                failJob(jobId, analysis.details || 'Analysis failed');
                Alert.alert('Analysis Issue', analysis.details || 'Could not analyze document.');
                return;
            }

            finishJob(jobId, analysis);
            setResult(analysis);
            if (analysis.quota) setAnalyzeQuotaRemaining(analysis.quota.remaining);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            logger.error('Analysis failed:', error);
            failJob(jobId, error.message || 'Analysis failed');
            Alert.alert('Analysis Failed', error.message || 'Please ensure it is a text-based format.');
        } finally {
            setIsLoading(false);
        }
    };

    const queueImageForReview = (uri: string, mimeType: string, size?: number, name = 'Image document') => {
        setPendingDocument({ kind: 'image', name, uri, mimeType, size });
        setDocumentText('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const reviewSelectedDocument = async () => {
        if (!pendingDocument || isLoading) return;

        if (pendingDocument.kind === 'text') {
            await handleAnalyze(documentText);
            return;
        }

        if (!pendingDocument.uri || !pendingDocument.mimeType) return;

        setIsLoading(true);
        setLoadingPhase('Reviewing document...');
        const jobId = startJob({
            type: 'analysis',
            title: 'Analyzing Document',
            progress: 'Reviewing document...',
            params: { uri: pendingDocument.uri, name: pendingDocument.name },
        });

        try {
            const analysis = await documentService.analyzeImage(
                pendingDocument.uri,
                pendingDocument.mimeType,
                pendingDocument.size,
            );
            finishJob(jobId, analysis);
            setResult(analysis);
            if (analysis.quota) setAnalyzeQuotaRemaining(analysis.quota.remaining);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            logger.error('Image analysis failed:', error);
            failJob(jobId, error?.message || 'Image analysis failed');
            Alert.alert('Document Review Failed', error?.message || 'Could not analyze the selected document.');
        } finally {
            setIsLoading(false);
            setLoadingPhase('');
        }
    };


    const handleScan = () => {
        Alert.alert(
            'Capture Document',
            'Choose capture method:',
            [
                { text: 'Use Camera', onPress: startScan },
                { text: 'Choose Image', onPress: pickDocument },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const startScan = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission needed', 'Camera access is required to capture a document.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: false,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                queueImageForReview(asset.uri, asset.mimeType || 'image/jpeg', asset.fileSize, 'Captured document');
            }
        } catch (error: any) {
            logger.error('Camera capture failed:', error);
            Alert.alert('Capture Failed', 'Could not capture the document image.');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/rtf',
                    'text/rtf',
                    'text/plain',
                    'image/*',
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];

                if ((asset.mimeType || '').startsWith('image/')) {
                    queueImageForReview(
                        asset.uri,
                        asset.mimeType || 'image/jpeg',
                        asset.size,
                        asset.name || 'Image document',
                    );
                    return;
                }

                setIsLoading(true);
                setLoadingPhase('Reading document...');
                try {
                    const extracted = await documentService.extractText(
                        asset.uri,
                        asset.name,
                        asset.mimeType || 'application/octet-stream',
                        asset.size,
                    );
                    setDocumentText(extracted.text);
                    setPendingDocument({
                        kind: 'text',
                        name: asset.name || 'Document',
                    });
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (error: any) {
                    Alert.alert('Document Upload Failed', error?.message || 'Could not read the selected document.');
                } finally {
                    setIsLoading(false);
                    setLoadingPhase('');
                }
            }
        } catch (error: any) {
            logger.error('Document selection failed:', error);
            Alert.alert('Selection Failed', 'Could not select the document.');
        }
    };

    const riskLabel = (level?: string) => (level === 'High' ? 'High risk' : level === 'Medium' ? 'Check this' : 'Low risk');
    const riskColor = (level?: string) => (level === 'High' ? colors.error : level === 'Medium' ? colors.danfo : colors.verified);

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <ScreenHeader title="Check a document" subtitle="Tenancy, contract, notice or letter" />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                        {!result ? (
                            <View style={styles.inputSection}>
                                <Pressable
                                    testID="review-pick"
                                    accessibilityRole="button"
                                    onPress={handleScan}
                                    style={({ pressed }) => [styles.pick, { borderColor: colors.outline, backgroundColor: pressed ? colors.surfaceContainer : colors.card }]}
                                >
                                    <View style={[styles.pickIcon, { backgroundColor: colors.primaryContainer }]}>
                                        <Ionicons name="scan-outline" size={28} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.pickTitle, { color: colors.onSurface }]}>Choose a file or take a photo</Text>
                                    <Text style={[styles.pickSub, { color: colors.onSurfaceVariant }]}>PDF, Word, RTF, text or image</Text>
                                </Pressable>

                                {pendingDocument ? (
                                    <View style={[styles.attached, { backgroundColor: colors.verifiedContainer }]}>
                                        <Ionicons name="checkmark-circle" size={24} color={colors.verified} />
                                        <View style={styles.attachedText}>
                                            <Text style={[styles.attachedTitle, { color: colors.onSurface }]}>Ready to check</Text>
                                            <Text style={[styles.attachedName, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{pendingDocument.name}</Text>
                                        </View>
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Remove document"
                                            hitSlop={10}
                                            onPress={() => {
                                                setPendingDocument(null);
                                                setDocumentText('');
                                            }}
                                        >
                                            <Ionicons name="close-circle" size={24} color={colors.onSurfaceVariant} />
                                        </Pressable>
                                    </View>
                                ) : null}

                                <Button
                                    title={analyzeQuotaRemaining === 0 ? 'Daily limit reached' : 'Check this document'}
                                    onPress={reviewSelectedDocument}
                                    loading={isLoading}
                                    disabled={!pendingDocument || isLoading || analyzeQuotaRemaining === 0}
                                    size="large"
                                    fullWidth
                                    testID="review-run"
                                />
                                {isAuthenticated && analyzeQuotaRemaining !== null ? (
                                    <Text style={[styles.quotaHint, { color: colors.onSurfaceVariant }]}>
                                        {analyzeQuotaRemaining} free check{analyzeQuotaRemaining === 1 ? '' : 's'} left today.
                                    </Text>
                                ) : null}
                                <Text style={[styles.quotaHint, { color: colors.onSurfaceVariant }]}>
                                    This explains what a document says. It is not legal advice.
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.resultsSection}>
                                <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.line }]}>
                                    <Text style={[styles.summaryType, { color: colors.onSurfaceVariant }]}>{result.document_type}</Text>
                                    <Text style={[styles.summaryVerdict, { color: colors.onSurface }]}>{result.overall_verdict}</Text>
                                    <Text style={[styles.summaryText, { color: colors.onSurface }]}>{result.summary}</Text>
                                </View>

                                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Clauses to look at</Text>
                                <View style={[styles.clauses, { backgroundColor: colors.card, borderColor: colors.line }]}>
                                    {result.analysis_results.map((clause, idx) => (
                                        <Pressable
                                            key={idx}
                                            accessibilityRole="button"
                                            onPress={() => {
                                                setSelectedClause(clause);
                                                setModalVisible(true);
                                            }}
                                            style={({ pressed }) => [styles.clause, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.line }, pressed && { backgroundColor: colors.surfaceContainer }]}
                                        >
                                            <View style={[styles.riskBar, { backgroundColor: riskColor(clause.risk_level) }]} />
                                            <View style={styles.clauseInfo}>
                                                <Text style={[styles.clauseTitle, { color: colors.onSurface }]}>{clause.clause_title}</Text>
                                                <Text style={[styles.clauseRisk, { color: colors.onSurfaceVariant }]}>{riskLabel(clause.risk_level)}</Text>
                                                <Text style={[styles.clauseSnippet, { color: colors.onSurfaceVariant }]} numberOfLines={2}>{clause.clause_text}</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                                        </Pressable>
                                    ))}
                                </View>

                                <Button title="Check another document" variant="outline" fullWidth onPress={() => setResult(null)} style={styles.again} />
                            </View>
                        )}
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(18,24,56,0.55)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.line }]}>
                            <Text style={[styles.modalType, { color: colors.onSurface }]}>About this clause</Text>
                            <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.onSurface} />
                            </Pressable>
                        </View>

                        {selectedClause ? (
                            <ScrollView contentContainerStyle={styles.modalScroll}>
                                <Text style={[styles.modalTitle, { color: colors.onSurface }]}>{selectedClause.clause_title}</Text>

                                <Text style={[styles.clauseQuote, { color: colors.onSurface, borderLeftColor: colors.danfo, backgroundColor: colors.card }]}>{selectedClause.clause_text}</Text>

                                <Text style={[styles.detailLabel, { color: colors.onSurface }]}>What it means</Text>
                                <Text style={[styles.detailText, { color: colors.onSurface }]}>{selectedClause.explanation_ei}</Text>

                                <Text style={[styles.detailLabel, { color: colors.onSurface }]}>The law behind it</Text>
                                <Text style={[styles.detailText, { color: colors.onSurface }]}>{selectedClause.legal_principle}</Text>

                                <View style={[styles.concern, { backgroundColor: colors.errorContainer, borderColor: colors.error }]}>
                                    <Ionicons name="alert-circle" size={20} color={colors.error} />
                                    <View style={styles.concernText}>
                                        <Text style={[styles.concernTitle, { color: colors.onErrorContainer }]}>What could go wrong</Text>
                                        <Text style={[styles.detailText, { color: colors.onErrorContainer }]}>{selectedClause.long_term_risk}</Text>
                                    </View>
                                </View>

                                <Text style={[styles.detailLabel, { color: colors.onSurface }]}>What you could do</Text>
                                <Text style={[styles.detailText, { color: colors.onSurface }]}>{selectedClause.action_step}</Text>
                            </ScrollView>
                        ) : null}
                    </View>
                </View>
            </Modal>

            {isLoading ? (
                <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(242,244,249,0.94)' }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingTitle, { color: colors.onSurface }]}>Reading your document</Text>
                    <Text style={[styles.loadingSub, { color: colors.onSurfaceVariant }]}>{loadingPhase}</Text>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 32 },
    inputSection: { gap: 14 },
    pick: { borderWidth: 2, borderStyle: 'dashed', borderRadius: theme.borderRadius.lg, alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16, gap: 8 },
    pickIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    pickTitle: { ...theme.typography.titleMd, textAlign: 'center' },
    pickSub: { ...theme.typography.bodyMd, textAlign: 'center' },
    attached: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: theme.borderRadius.md },
    attachedText: { flex: 1 },
    attachedTitle: { ...theme.typography.labelMd, fontFamily: theme.typography.fontFamily.headlineMedium },
    attachedName: { ...theme.typography.caption },
    quotaHint: { ...theme.typography.caption, textAlign: 'center' },
    resultsSection: { gap: 14 },
    summary: { borderWidth: 1, borderRadius: theme.borderRadius.lg, padding: 16, gap: 6 },
    summaryType: { ...theme.typography.labelMd },
    summaryVerdict: { ...theme.typography.titleLg },
    summaryText: { ...theme.typography.reading, fontSize: 15.5, lineHeight: 24 },
    sectionTitle: { ...theme.typography.titleMd, marginTop: 6 },
    clauses: { borderWidth: 1, borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
    clause: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 14, minHeight: 80 },
    riskBar: { width: 5, alignSelf: 'stretch' },
    clauseInfo: { flex: 1, paddingVertical: 12 },
    clauseTitle: { ...theme.typography.titleMd },
    clauseRisk: { ...theme.typography.labelSm, marginTop: 2 },
    clauseSnippet: { ...theme.typography.caption, marginTop: 4 },
    again: { marginTop: 8 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { maxHeight: '88%', borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, ...theme.shadows.sheet },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    modalType: { ...theme.typography.titleMd },
    modalScroll: { padding: 16, paddingBottom: 32, gap: 8 },
    modalTitle: { ...theme.typography.titleLg },
    clauseQuote: { ...theme.typography.readingSm, borderLeftWidth: 4, padding: 12, borderRadius: 6, marginVertical: 6 },
    detailLabel: { ...theme.typography.titleMd, marginTop: 10 },
    detailText: { ...theme.typography.bodyLg, color: undefined },
    concern: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: theme.borderRadius.md, borderWidth: 1, marginTop: 12 },
    concernText: { flex: 1, gap: 2 },
    concernTitle: { ...theme.typography.titleMd },
    loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 20 },
    loadingTitle: { ...theme.typography.titleMd, marginTop: 8 },
    loadingSub: { ...theme.typography.bodyMd, textAlign: 'center', paddingHorizontal: 32 },
});
