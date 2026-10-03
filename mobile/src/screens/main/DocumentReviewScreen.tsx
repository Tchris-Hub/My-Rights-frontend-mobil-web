/**
 * Document Review Screen - Premium Risk Assessment
 * Editorial "Lincoln College" upgrade: No-Line aesthetic, tonal surfaces, and classroom watermark.
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
    Image,
    Alert,
    Modal,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { Button } from '../../components/ui/Button';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import { documentService } from '../../services/document.service';
import { usageService } from '../../services/usage.service';
import theme from '../../constants/theme';
import { useResponsive } from '../../utils/responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import type { DocumentAnalysisResponse, AnalysisResult } from '../../types';

import { useJobs } from '../../contexts/JobContext';
import { useNavigation } from '@react-navigation/native';
import { localDataService, type LocalDocumentReview } from '../../services/localData.service';

const CLASSROOM_BG = require('../../../assets/onboarding/classroom_bg.png');

export const DocumentReviewScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, horizontalPadding, contentWidth, narrow } = useResponsive();
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
    const [analyzeQuotaRemaining, setAnalyzeQuotaRemaining] = useState<number | null>(null);
    const [reviewHistory, setReviewHistory] = useState<LocalDocumentReview[]>([]);

    useEffect(() => {
        localDataService.getDocumentReviewHistory()
            .then(setReviewHistory)
            .catch((error) => logger.error('Failed to load local document review history:', error));
    }, []);

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

    const saveReviewLocally = async (analysis: DocumentAnalysisResponse) => {
        const review: LocalDocumentReview = {
            id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            document_name: pendingDocument?.name || 'Document review',
            reviewed_at: new Date().toISOString(),
            analysis,
        };
        await localDataService.saveDocumentReview(review);
        setReviewHistory((current) => [review, ...current.filter((item) => item.id !== review.id)].slice(0, 20));
    };

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

        try {
            const updatePhase = (phase: string) => {
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
            await saveReviewLocally(analysis);
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
            await saveReviewLocally(analysis);
            if (analysis.quota) setAnalyzeQuotaRemaining(analysis.quota.remaining);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            logger.error('Image analysis failed:', error);
            failJob(jobId, error?.message || 'Image analysis failed');
            Alert.alert('Document Review Failed', error?.message || 'Could not analyze the selected document.');
        } finally {
            setIsLoading(false);
        }
    };


    const handleAddDocument = () => {
        Alert.alert(
            'Add Document',
            'Choose how you want to add your document:',
            [
                { text: 'Scan Document', onPress: startScan },
                { text: 'Upload Image', onPress: pickImage },
                { text: 'Upload File', onPress: pickFile },
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

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: false,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                queueImageForReview(
                    asset.uri,
                    asset.mimeType || 'image/jpeg',
                    asset.fileSize,
                    asset.fileName || 'Image document',
                );
            }
        } catch (error: any) {
            logger.error('Image selection failed:', error);
            Alert.alert('Image Upload Failed', 'Could not select the image.');
        }
    };

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/msword',
                    'application/rtf',
                    'text/rtf',
                    'text/plain',
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
                }
            }
        } catch (error: any) {
            logger.error('Document selection failed:', error);
            Alert.alert('Selection Failed', 'Could not select the document.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            {/* Background Decoration (Lincoln College Watermark) */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Image source={CLASSROOM_BG} style={styles.globalBackground} />
                <View style={[styles.blob1, { backgroundColor: colors.primary + '05' }]} />
            </View>

            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: colors.onSurface, fontSize: narrow ? 30 : 36, lineHeight: narrow ? 34 : 40 }]}>Review</Text>
                        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>AI Document Review</Text>
                    </View>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, width: '100%', alignSelf: 'center' }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                    {!result ? (
                        <View style={styles.inputSection}>
                            {reviewHistory.length > 0 && (
                                <View style={styles.historySection}>
                                    <View style={styles.historyHeader}>
                                        <View>
                                            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Recent Reviews</Text>
                                            <Text style={[styles.historySubtext, { color: colors.onSurfaceVariant }]}>
                                                Stored only on this device
                                            </Text>
                                        </View>
                                        <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
                                    </View>
                                    {reviewHistory.map((review) => (
                                        <TouchableOpacity
                                            key={review.id}
                                            style={[styles.historyCard, { backgroundColor: colors.surfaceContainerLow }]}
                                            onPress={() => {
                                                setResult(review.analysis);
                                                setPendingDocument(null);
                                                setDocumentText('');
                                            }}
                                        >
                                            <View style={[styles.historyIcon, { backgroundColor: colors.primary + '14' }]}>
                                                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                                            </View>
                                            <View style={styles.historyInfo}>
                                                <Text style={[styles.historyTitle, { color: colors.onSurface }]} numberOfLines={1}>
                                                    {review.document_name}
                                                </Text>
                                                <Text style={[styles.historyDate, { color: colors.onSurfaceVariant }]}>
                                                    {new Date(review.reviewed_at).toLocaleString()}
                                                </Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <View style={styles.addDocumentSection}>
                                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>New Review</Text>
                            <TouchableOpacity style={[styles.scanAction, { backgroundColor: colors.surfaceContainerHigh }]} onPress={handleAddDocument}>
                                <Ionicons name="scan-outline" size={32} color={colors.primary} />
                                <Text style={[styles.scanActionText, { color: colors.onSurface }]}>Add Document</Text>
                                <Text style={[styles.scanActionSub, { color: colors.onSurfaceVariant }]}>Scan a document, upload an image, or upload a file</Text>
                            </TouchableOpacity>

                            {pendingDocument ? (
                                <View style={[styles.documentAttached, { backgroundColor: colors.surfaceContainerLow }]}>
                                    <View style={[styles.documentCheck, { backgroundColor: colors.primary + '14' }]}>
                                        <Ionicons name="checkmark" size={22} color={colors.primary} />
                                    </View>
                                    <View style={styles.documentAttachedInfo}>
                                        <Text style={[styles.documentAttachedTitle, { color: colors.onSurface }]}>Document added</Text>
                                        <Text style={[styles.documentAttachedName, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                                            {pendingDocument.name}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setPendingDocument(null);
                                            setDocumentText('');
                                        }}
                                        accessibilityLabel="Remove attached document"
                                    >
                                        <Ionicons name="close-circle-outline" size={24} color={colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>
                            ) : null}

                            <Button
                                title={analyzeQuotaRemaining === 0 ? 'Daily review limit reached' : 'Review Document'}
                                onPress={reviewSelectedDocument}
                                loading={isLoading && !activeJob}
                                disabled={!pendingDocument || isLoading || analyzeQuotaRemaining === 0}
                                fullWidth
                            />
                            {isAuthenticated && analyzeQuotaRemaining !== null && (
                                <Text style={[styles.quotaHint, { color: colors.onSurfaceVariant }]}>
                                    Free plan: {analyzeQuotaRemaining} document review{analyzeQuotaRemaining === 1 ? '' : 's'} remaining today.
                                </Text>
                            )}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.resultsSection}>
                            <TouchableOpacity style={styles.resetBtn} onPress={() => setResult(null)}>
                                <Ionicons name="refresh-outline" size={16} color={colors.primary} />
                                <Text style={[styles.resetText, { color: colors.primary }]}>NEW REVIEW</Text>
                            </TouchableOpacity>

                            {/* General findings summary — no numerical risk/confidence score is shown. */}
                            <View style={[styles.riskHero, { backgroundColor: colors.surfaceContainerHigh }]}>
                                <View style={styles.riskHeader}>
                                    <View>
                                        <Text style={[styles.riskTitle, { color: colors.onSurface }]}>{result.document_type}</Text>
                                        <Text style={[styles.riskStatus, { color: colors.primary }]}>{result.overall_verdict.toUpperCase()}</Text>
                                    </View>

                                </View>
                                <Text style={[styles.riskSummary, { color: colors.onSurfaceVariant }]}>{result.summary}</Text>
                            </View>

                            {/* Clauses List */}
                            <View style={styles.clausesGrid}>
                                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Detected Clauses</Text>
                                {result.analysis_results.map((clause, idx) => (
                                    <TouchableOpacity 
                                        key={idx} 
                                        style={[styles.clauseCard, { backgroundColor: colors.surfaceContainerLow }]}
                                        onPress={() => {
                                            setSelectedClause(clause);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <View style={[styles.riskIndicator, { backgroundColor: clause.risk_level === 'High' ? colors.error : colors.warning }]} />
                                        <View style={styles.clauseInfo}>
                                            <Text style={[styles.clauseTitle, { color: colors.onSurface }]}>{clause.clause_title}</Text>
                                            <Text style={[styles.clauseSnippet, { color: colors.onSurfaceVariant }]} numberOfLines={2}>"{clause.clause_text}"</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* Analysis Detail Modal */}
            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalType, { color: colors.onSurfaceVariant }]}>Deep Analysis</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.onSurface} />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedClause && (
                            <ScrollView contentContainerStyle={[styles.modalScroll, { paddingHorizontal: horizontalPadding }]}>
                                <Text style={[styles.modalTitle, { color: colors.onSurface }]}>{selectedClause.clause_title}</Text>
                                
                                <View style={[styles.modalClauseBox, { backgroundColor: colors.surfaceContainerLow }]}>
                                    <Text style={[styles.modalClauseText, { color: colors.onSurface }]}>"{selectedClause.clause_text}"</Text>
                                </View>

                                <View style={styles.editorialMetric}>
                                    <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>GENERAL EXPLANATION</Text>
                                    <Text style={[styles.metricValue, { color: colors.onSurface }]}>{selectedClause.explanation_ei}</Text>
                                </View>

                                <View style={styles.editorialMetric}>
                                    <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>LEGAL CONTEXT</Text>
                                    <Text style={[styles.metricValue, { color: colors.onSurface }]}>{selectedClause.legal_principle}</Text>
                                </View>

                                <View style={[styles.riskWarning, { backgroundColor: colors.error + '10' }]}>
                                    <Ionicons name="alert-circle" size={20} color={colors.error} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.warningTitle, { color: colors.error }]}>POTENTIAL CONCERNS</Text>
                                        <Text style={[styles.warningText, { color: colors.onSurface }]}>{selectedClause.long_term_risk}</Text>
                                    </View>
                                </View>

                                <View style={styles.actionSection}>
                                    <Text style={[styles.metricLabel, { color: colors.primary }]}>POSSIBLE NEXT STEP</Text>
                                    <Text style={[styles.actionText, { color: colors.onSurface }]}>{selectedClause.action_step}</Text>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            <FloatingChatButton />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    globalBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.15,
    },
    blob1: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 400,
        height: 400,
        borderRadius: 200,
    },
    header: {
        zIndex: 100,
    },
    headerContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        ...theme.typography.displayMd,
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1.5,
    },
    subtitle: {
        ...theme.typography.labelSm,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        fontWeight: '700',
        marginTop: -4,
    },
    scrollContent: {
        paddingHorizontal: 0,
        paddingBottom: 120,
    },
    documentAttached: {
        minHeight: 72,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 12,
    },
    documentCheck: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    documentAttachedInfo: {
        flex: 1,
    },
    documentAttachedTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    documentAttachedName: {
        fontSize: 12,
        marginTop: 3,
    },
    inputSection: {
        gap: 32,
    },
    addDocumentSection: {
        gap: 16,
    },
    historySection: {
        gap: 12,
        marginBottom: 8,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    historySubtext: {
        fontSize: 12,
        marginTop: 3,
    },
    historyCard: {
        minHeight: 68,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    historyIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyInfo: {
        flex: 1,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: '800',
    },
    historyDate: {
        fontSize: 11,
        marginTop: 4,
    },
    scanAction: {
        padding: 40,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    scanActionText: {
        ...theme.typography.titleMd,
        fontWeight: '800',
    },
    scanActionSub: {
        ...theme.typography.labelSm,
        opacity: 0.6,
    },
    editorialInput: {
        gap: 12,
    },
    inputLabel: {
        ...theme.typography.labelSm,
        fontWeight: '800',
        letterSpacing: 1,
    },
    textArea: {
        minHeight: 200,
        borderRadius: 24,
        padding: 24,
        ...theme.typography.bodyMd,
        fontSize: 16,
        lineHeight: 24,
        textAlignVertical: 'top',
    },
    resultsSection: {
        gap: 32,
    },
    quotaHint: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 12,
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    resetText: {
        ...theme.typography.labelSm,
        fontWeight: '900',
        letterSpacing: 1,
    },
    riskHero: {
        padding: 24,
        borderRadius: 32,
        gap: 20,
    },
    riskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    riskTitle: {
        ...theme.typography.displaySm,
        fontSize: 24,
        fontWeight: '900',
    },
    riskStatus: {
        ...theme.typography.labelSm,
        fontWeight: '800',
        marginTop: 4,
    },
    riskSummary: {
        ...theme.typography.bodyMd,
        lineHeight: 22,
        fontSize: 15,
    },
    clausesGrid: {
        gap: 16,
    },
    sectionTitle: {
        ...theme.typography.titleMd,
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 8,
    },
    clauseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        gap: 16,
    },
    riskIndicator: {
        width: 6,
        height: 48,
        borderRadius: 3,
    },
    clauseInfo: {
        flex: 1,
    },
    clauseTitle: {
        ...theme.typography.titleMd,
        fontWeight: '800',
        marginBottom: 4,
    },
    clauseSnippet: {
        ...theme.typography.caption,
        fontSize: 13,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '92%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 16,
    },
    modalType: {
        ...theme.typography.labelSm,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    modalScroll: {
        paddingHorizontal: 0,
        paddingBottom: 60,
        gap: 32,
    },
    modalTitle: {
        ...theme.typography.displaySm,
        fontSize: 32,
        fontWeight: '900',
        lineHeight: 40,
    },
    modalClauseBox: {
        padding: 24,
        borderRadius: 24,
    },
    modalClauseText: {
        ...theme.typography.bodyMd,
        fontSize: 16,
        lineHeight: 26,
        fontStyle: 'italic',
    },
    editorialMetric: {
        gap: 8,
    },
    metricLabel: {
        ...theme.typography.labelSm,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    metricValue: {
        ...theme.typography.bodyMd,
        fontSize: 15,
        lineHeight: 24,
    },
    riskWarning: {
        flexDirection: 'row',
        padding: 24,
        borderRadius: 24,
        gap: 16,
    },
    warningTitle: {
        ...theme.typography.labelSm,
        fontWeight: '900',
        marginBottom: 4,
    },
    warningText: {
        ...theme.typography.caption,
        lineHeight: 20,
    },
    actionSection: {
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    actionText: {
        ...theme.typography.bodyLg,
        fontWeight: '700',
        lineHeight: 24,
    },
});

