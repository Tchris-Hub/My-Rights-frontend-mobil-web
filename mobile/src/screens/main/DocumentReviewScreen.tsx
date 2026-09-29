/**
 * Document Review Screen - Premium Risk Assessment
 * Editorial "Lincoln College" upgrade: No-Line aesthetic, tonal surfaces, and classroom watermark.
 */

import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../utils/logger';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Image,
    Alert,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DocumentScanner from 'react-native-document-scanner-plugin';

import { Button } from '../../components/ui/Button';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import { documentService } from '../../services/document.service';
import { usageService } from '../../services/usage.service';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import type { DocumentAnalysisResponse, AnalysisResult } from '../../types';

import { useJobs } from '../../contexts/JobContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CLASSROOM_BG = require('../../../assets/onboarding/classroom_bg.png');
const REVIEW_HISTORY_KEY = '@myrights/document-review-history';

type ReviewHistoryItem = { id: string; documentText: string; result: DocumentAnalysisResponse; createdAt: string; };

export const DocumentReviewScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { activeJob, startJob, finishJob, failJob, updateJob, clearJob } = useJobs();
    const navigation = useNavigation<any>();
    const { isAuthenticated } = useAuth();
    const [documentText, setDocumentText] = useState('');
    const [documentCount, setDocumentCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DocumentAnalysisResponse | null>(null);
    const [selectedClause, setSelectedClause] = useState<AnalysisResult | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState<string>('');
    const [analyzeQuotaRemaining, setAnalyzeQuotaRemaining] = useState<number | null>(null);
    const [sourceMenuVisible, setSourceMenuVisible] = useState(false);
    const [historyVisible, setHistoryVisible] = useState(false);
    const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([]);

    useEffect(() => {
        AsyncStorage.getItem(REVIEW_HISTORY_KEY)
            .then((raw) => {
                if (!raw) return;
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setReviewHistory(parsed.slice(0, 10));
            })
            .catch((error) => logger.error('Failed to load document review history:', error));
    }, []);

    const saveReviewHistory = async (analysis: DocumentAnalysisResponse, text: string) => {
        const item: ReviewHistoryItem = { id: `${Date.now()}`, documentText: text, result: analysis, createdAt: new Date().toISOString() };
        const next = [item, ...reviewHistory].slice(0, 10);
        setReviewHistory(next);
        try { await AsyncStorage.setItem(REVIEW_HISTORY_KEY, JSON.stringify(next)); }
        catch (error) { logger.error('Failed to save document review history:', error); }
    };

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
            setDocumentText(activeJob.params?.text || '');
            setDocumentCount(activeJob.params?.text ? 1 : 0);
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
            setDocumentCount(1);
            await saveReviewHistory(analysis, targetText);
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

    const analyzeImageAsset = async (uri: string, mimeType: string, size?: number) => {
        if (!isAuthenticated) {
            Alert.alert('Sign in required', 'Sign in before reviewing a document.');
            return;
        }

        setIsLoading(true);
        setLoadingPhase('Uploading Document...');
        const jobId = startJob({
            type: 'analysis',
            title: 'Analyzing Document',
            progress: 'Uploading Document...',
            params: { uri },
        });

        try {
            setLoadingPhase('Analyzing document image...');
            updateJob(jobId, { progress: 'Analyzing document image...' });

            const analysis = await documentService.analyzeImage(uri, mimeType, size);
            finishJob(jobId, analysis);
            if (analysis.quota) setAnalyzeQuotaRemaining(analysis.quota.remaining);
            setResult(analysis);
            setDocumentCount(1);
            await saveReviewHistory(analysis, `[Image review: ${new Date().toISOString()}]`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            logger.error('Image analysis failed:', error);
            failJob(jobId, error?.message || 'Image analysis failed');
            Alert.alert('Analysis Failed', error?.message || 'Could not analyze the selected image.');
        } finally {
            setIsLoading(false);
            setLoadingPhase('');
        }
    };

    const handleScan = () => setSourceMenuVisible(true);

    const scanDocument = async () => {
        setSourceMenuVisible(false);
        try {
            const { scannedImages } = await DocumentScanner.scanDocument({ maxNumDocuments: 20 });
            if (scannedImages?.length) await analyzeImageAsset(scannedImages[0], 'image/jpeg');
        } catch (error: any) {
            logger.error('Document scan failed:', error);
            Alert.alert('Scan Failed', error?.message || 'Could not scan the document.');
        }
    };

    const startScan = async () => {
        setSourceMenuVisible(false);
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
                await analyzeImageAsset(asset.uri, asset.mimeType || 'image/jpeg', asset.fileSize);
            }
        } catch (error: any) {
            logger.error('Camera capture failed:', error);
            Alert.alert('Capture Failed', 'Could not capture the document image.');
        }
    };

    const pickDocument = async () => {
        setSourceMenuVisible(false);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/rtf', 'text/rtf', 'text/plain', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                if ((asset.mimeType || '').startsWith('image/')) {
                    await analyzeImageAsset(asset.uri, asset.mimeType || 'image/jpeg', asset.size);
                } else {
                    setIsLoading(true);
                    setLoadingPhase('Extracting document text...');
                    const jobId = startJob({ type: 'analysis', title: 'Analyzing Document', progress: 'Extracting document text...', params: { uri: asset.uri } });
                    try {
                        const extracted = await documentService.extractText(asset.uri, asset.name, asset.mimeType || 'application/octet-stream', asset.size);
                        setDocumentText(extracted.text);
                        setLoadingPhase('Analyzing extracted text...');
                        updateJob(jobId, { progress: 'Analyzing extracted text...' });
                        const analysis = await documentService.analyzeDocument(extracted.text);
                        finishJob(jobId, analysis);
                        setResult(analysis);
                        await saveReviewHistory(analysis, extracted.text);
                        if (analysis.quota) setAnalyzeQuotaRemaining(analysis.quota.remaining);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    } catch (error: any) {
                        failJob(jobId, error?.message || 'Document extraction failed');
                        Alert.alert('Document Review Failed', error?.message || 'Could not read this document.');
                    } finally {
                        setIsLoading(false);
                        setLoadingPhase('');
                    }
                }
            }
        } catch (error: any) {
            logger.error('Image selection failed:', error);
            Alert.alert('Selection Failed', 'Could not read the selected image.');
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
                        <Text style={[styles.title, { color: colors.onSurface }]}>Review</Text>
                        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>AI Document Review</Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {!result ? (
                        <View style={styles.inputSection}>
                            <TouchableOpacity testID="document-review-upload" accessibilityRole="button" accessibilityLabel="Add documents" style={[styles.scanAction, { backgroundColor: colors.surfaceContainerHigh }]} onPress={handleScan}>
                                <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
                                <Text style={[styles.scanActionText, { color: colors.onSurface }]}>Add Documents</Text>
                                <Text style={[styles.documentCount, { color: colors.primary }]}>{documentCount} document{documentCount === 1 ? '' : 's'} added</Text>
                                <Text style={[styles.scanActionSub, { color: colors.onSurfaceVariant }]}>Scan • Take a photo • Choose a file</Text>
                            </TouchableOpacity>

                            <TouchableOpacity testID="document-review-history" accessibilityRole="button" style={[styles.historyButton, { backgroundColor: colors.surfaceContainerLow }]} onPress={() => setHistoryVisible(true)}>
                                <Ionicons name="time-outline" size={20} color={colors.primary} />
                                <View style={styles.historyButtonText}>
                                    <Text style={[styles.historyTitle, { color: colors.onSurface }]}>Review History</Text>
                                    <Text style={[styles.historySubtitle, { color: colors.onSurfaceVariant }]}>
                                        {`${reviewHistory.length} saved review${reviewHistory.length === 1 ? '' : 's'}`}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
                            </TouchableOpacity>
                            <Button
                                testID="document-review-submit"
                                title={analyzeQuotaRemaining === 0 ? 'Daily review limit reached' : 'Review Document'}
                                onPress={() => handleAnalyze()}
                                loading={isLoading}
                                disabled={documentCount === 0 || isLoading || analyzeQuotaRemaining === 0}
                                fullWidth
                                // No border on button per guideline
                            />
                            {isAuthenticated && analyzeQuotaRemaining !== null && (
                                <Text style={[styles.quotaHint, { color: colors.onSurfaceVariant }]}>
                                    Free plan: {analyzeQuotaRemaining} document review{analyzeQuotaRemaining === 1 ? '' : 's'} remaining today.
                                </Text>
                            )}
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

            <Modal animationType="slide" transparent visible={sourceMenuVisible} onRequestClose={() => setSourceMenuVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setSourceMenuVisible(false)}>
                    <View style={styles.sheetOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.sourceSheet, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>Add a document</Text>
                                <Text style={[styles.sheetSubtitle, { color: colors.onSurfaceVariant }]}>Choose how you want to provide it.</Text>
                                <TouchableOpacity style={[styles.sourceOption, { backgroundColor: colors.surfaceContainerLow }]} onPress={scanDocument}>
                                    <Ionicons name="scan-outline" size={24} color={colors.primary} />
                                    <View style={styles.sourceOptionText}><Text style={[styles.sourceOptionTitle, { color: colors.onSurface }]}>Scan document</Text><Text style={[styles.sourceOptionSub, { color: colors.onSurfaceVariant }]}>Detect and capture document pages</Text></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.sourceOption, { backgroundColor: colors.surfaceContainerLow }]} onPress={startScan}>
                                    <Ionicons name="camera-outline" size={24} color={colors.primary} />
                                    <View style={styles.sourceOptionText}><Text style={[styles.sourceOptionTitle, { color: colors.onSurface }]}>Take a photo</Text><Text style={[styles.sourceOptionSub, { color: colors.onSurfaceVariant }]}>Capture a document image</Text></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.sourceOption, { backgroundColor: colors.surfaceContainerLow }]} onPress={pickDocument}>
                                    <Ionicons name="folder-open-outline" size={24} color={colors.primary} />
                                    <View style={styles.sourceOptionText}><Text style={[styles.sourceOptionTitle, { color: colors.onSurface }]}>Choose a file</Text><Text style={[styles.sourceOptionSub, { color: colors.onSurfaceVariant }]}>PDF, DOCX, RTF, TXT, or image</Text></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.sheetCancel} onPress={() => setSourceMenuVisible(false)}><Text style={[styles.sheetCancelText, { color: colors.primary }]}>Cancel</Text></TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal animationType="slide" transparent visible={historyVisible} onRequestClose={() => setHistoryVisible(false)}>
                <View style={styles.sheetOverlay}>
                    <View style={[styles.historySheet, { backgroundColor: colors.surface }]}>
                        <View style={styles.sheetHeader}>
                            <View><Text style={[styles.sheetTitle, { color: colors.onSurface }]}>Review History</Text><Text style={[styles.sheetSubtitle, { color: colors.onSurfaceVariant }]}>Your recent document reviews</Text></View>
                            <TouchableOpacity onPress={() => setHistoryVisible(false)}><Ionicons name="close" size={24} color={colors.onSurface} /></TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={styles.historyList}>
                            {reviewHistory.length === 0 ? (
                                <View style={styles.historyEmpty}><Ionicons name="document-text-outline" size={42} color={colors.onSurfaceVariant} /><Text style={[styles.historyEmptyTitle, { color: colors.onSurface }]}>No reviews yet</Text><Text style={[styles.historyEmptyText, { color: colors.onSurfaceVariant }]}>Reviews you complete will appear here.</Text></View>
                            ) : reviewHistory.map((item) => (
                                <TouchableOpacity key={item.id} style={[styles.historyItem, { backgroundColor: colors.surfaceContainerLow }]} onPress={() => { setResult(item.result); setDocumentText(item.documentText); setHistoryVisible(false); }}>
                                    <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                                    <View style={styles.historyItemInfo}>
                                        <Text style={[styles.historyItemTitle, { color: colors.onSurface }]} numberOfLines={1}>{item.result.document_type}</Text>
                                        <Text style={[styles.historyItemMeta, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{item.result.overall_verdict}</Text>
                                        <Text style={[styles.historyItemDate, { color: colors.onSurfaceVariant }]}>{new Date(item.createdAt).toLocaleString()}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

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
                            <ScrollView contentContainerStyle={styles.modalScroll}>
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

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingTitle, { color: colors.onSurface }]}>Review in Progress</Text>
                        <Text style={[styles.loadingSub, { color: colors.onSurfaceVariant }]}>{loadingPhase}</Text>
                    </View>
                </View>
            )}

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
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
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
        paddingHorizontal: 32,
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
        paddingHorizontal: 32,
        paddingBottom: 120,
    },
    inputSection: {
        gap: 32,
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
    documentCount: { ...theme.typography.titleMd, fontWeight: '900', marginTop: 4 },
    historyButton: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, gap: 12 },
    historyButtonText: { flex: 1 },
    historyTitle: { ...theme.typography.titleMd, fontWeight: '800' },
    historySubtitle: { ...theme.typography.caption, marginTop: 3 },
    sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
    sourceSheet: { padding: 24, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28, gap: 12 },
    historySheet: { height: '82%', padding: 24, paddingBottom: 30, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    sheetTitle: { ...theme.typography.titleLg, fontWeight: '900' },
    sheetSubtitle: { ...theme.typography.bodyMd, marginTop: 4, opacity: 0.75 },
    sourceOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, gap: 14 },
    sourceOptionText: { flex: 1 },
    sourceOptionTitle: { ...theme.typography.titleMd, fontWeight: '800' },
    sourceOptionSub: { ...theme.typography.caption, marginTop: 3 },
    sheetCancel: { alignItems: 'center', paddingVertical: 12 },
    sheetCancelText: { ...theme.typography.titleMd, fontWeight: '800' },
    historyList: { gap: 12, paddingBottom: 20 },
    historyEmpty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 10 },
    historyEmptyTitle: { ...theme.typography.titleMd, fontWeight: '800' },
    historyEmptyText: { ...theme.typography.bodyMd, textAlign: 'center' },
    historyItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, gap: 12 },
    historyItemInfo: { flex: 1 },
    historyItemTitle: { ...theme.typography.titleMd, fontWeight: '800' },
    historyItemMeta: { ...theme.typography.caption, marginTop: 3 },
    historyItemDate: { ...theme.typography.caption, marginTop: 2, opacity: 0.7 },

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
        padding: 32,
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
        padding: 32,
        paddingBottom: 16,
    },
    modalType: {
        ...theme.typography.labelSm,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    modalScroll: {
        paddingHorizontal: 32,
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
    loadingOverlay: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        alignItems: 'center',
        gap: 20,
    },
    loadingTitle: {
        ...theme.typography.titleLg,
        fontWeight: '900',
    },
    loadingSub: {
        ...theme.typography.bodyMd,
        opacity: 0.7,
    },
});

