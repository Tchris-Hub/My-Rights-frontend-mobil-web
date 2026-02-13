/**
 * Document Review Screen - Premium Risk Assessment
 * "Minimal Grenade" upgrade: Visual risk gauges, camera scanning, and rich analysis
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Image,
    Alert,
    Modal,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Sophisticated Native Module Detection
const getScannerInstance = () => {
    try {
        // First check if module exists in the JS bundle
        const Scanner = require('react-native-document-scanner-plugin')?.default;
        if (!Scanner) return null;

        // Capability check (preventing crashes on misconfigured native environments)
        if (typeof Scanner.scanDocument !== 'function') return null;

        return Scanner;
    } catch (e) {
        return null;
    }
};

const DocumentScanner = getScannerInstance();
import { Button } from '../../components/ui/Button';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import { Card } from '../../components/ui/Card';
import { documentService } from '../../services/document.service';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import type { DocumentAnalysisResponse, AnalysisResult } from '../../types';

import { useJobs } from '../../contexts/JobContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DocumentReviewScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { activeJob, startJob, finishJob, failJob, updateJob, clearJob } = useJobs();
    const navigation = useNavigation<any>();
    const { isAuthenticated, isGuest } = useAuth();
    const [documentText, setDocumentText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<DocumentAnalysisResponse | null>(null);
    const [selectedClause, setSelectedClause] = useState<AnalysisResult | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState<string>('');

    // Check if there's a finished job for this screen
    useEffect(() => {
        if (activeJob && activeJob.type === 'analysis' && activeJob.status === 'completed' && activeJob.result) {
            setResult(activeJob.result);
            setDocumentText(activeJob.params?.text || '');
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

        // Granular status updates
        setLoadingPhase('Uploading Document...');

        try {
            const updatePhase = (phase: string) => {
                setLoadingPhase(phase);
                updateJob(jobId, { progress: phase });
            };

            setTimeout(() => updatePhase('Extracting Clause Patterns...'), 1000);
            setTimeout(() => updatePhase('Cross-referencing Constitutional Principles...'), 2500);
            setTimeout(() => updatePhase('Finalizing Safety Audit...'), 4000);

            const analysis = await documentService.analyzeDocument(
                targetText,
                { useAuthenticated: isAuthenticated && !isGuest }
            );

            if (analysis.error) {
                failJob(jobId, analysis.details || 'Analysis failed');
                Alert.alert('Analysis Issue', analysis.details || 'Could not analyze document.');
                return;
            }

            finishJob(jobId, analysis);
            setResult(analysis);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            console.error('Analysis failed:', error);
            const msg = error.response?.data?.detail || error.message || 'Please ensure it is a text-based format.';
            failJob(jobId, msg);
            Alert.alert('Analysis Failed', msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScan = () => {
        Alert.alert(
            'Capture Document',
            'Choose how you want to capture the document:',
            [
                { text: 'Scan with Camera', onPress: startScan },
                { text: 'Import PDF', onPress: pickDocument },
                { text: 'Photo Gallery', onPress: () => pickImage('gallery') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const startScan = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        if (!DocumentScanner) {
            console.log('DocumentScanner not found, falling back to standard camera.');
            // Subtle fallback message instead of alarming error
            Alert.alert(
                'Camera Mode',
                'Using standard camera mode for compatibility.',
                [{ text: 'Continue', onPress: () => pickImage('camera') }]
            );
            return;
        }

        try {
            const { scannedImages } = await DocumentScanner.scanDocument({
                maxNumDocuments: 1,
            });

            if (scannedImages && scannedImages.length > 0) {
                const imageUri = scannedImages[0];
                setCapturedImage(imageUri);
                setIsScanning(true);

                try {
                    const text = await documentService.extractText(imageUri);
                    setDocumentText(text);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (error) {
                    console.error('OCR Failed:', error);
                    Alert.alert('Scan Failed', 'Could not extract text from scan.');
                } finally {
                    setIsScanning(false);
                }
            }
        } catch (error) {
            console.error('Scanner failed:', error);
            Alert.alert('Scanner Error', 'Could not start document scanner.');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain'
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                const doc = result.assets[0];
                setIsScanning(true);
                setCapturedImage(null); // Clear image view if showing a PDF

                try {
                    // Pass explicit metadata from the picker to ensure backend identifies it correctly
                    const text = await documentService.extractText(
                        doc.uri,
                        doc.name,
                        doc.mimeType
                    );
                    setDocumentText(text);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (error) {
                    console.error('PDF Extraction Failed:', error);
                    Alert.alert('Import Failed', 'Could not extract text from PDF.');
                } finally {
                    setIsScanning(false);
                }
            }
        } catch (error) {
            console.error('Document picker failed:', error);
        }
    };

    const pickImage = async (source: 'camera' | 'gallery') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Request permissions
        const permissionResult = source === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission Required', `Please allow ${source} access to scan documents.`);
            return;
        }

        setIsScanning(true);

        try {
            const result = source === 'camera'
                ? await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                    allowsEditing: false,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                    allowsEditing: false,
                });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                setCapturedImage(imageUri);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                try {
                    // Send image to backend for OCR
                    const text = await documentService.extractText(imageUri);
                    setDocumentText(text);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (error) {
                    console.error('OCR Failed:', error);
                    Alert.alert('Scan Failed', 'Could not extract text. Please ensure the image is clear and contains text.');
                }
            }
        } catch (error) {
            console.error('Image capture failed:', error);
            Alert.alert('Capture Failed', 'Could not capture the image. Please try again.');
        } finally {
            setIsScanning(false);
        }
    };

    const getRiskGradient = (verdict: string) => {
        const v = verdict.toLowerCase();
        if (v.includes('safe') || v.includes('acceptable')) return ['#10B981', '#059669'] as const;
        if (v.includes('caution') || v.includes('risk')) return ['#F59E0B', '#D97706'] as const;
        return ['#EF4444', '#DC2626'] as const;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerTop}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                                    <Ionicons name="document-text" size={28} color={theme.colors.onPrimary} />
                                </View>
                                <View>
                                    <Text style={[styles.title, { color: colors.text }]}>Document Review</Text>
                                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                        AI-powered risk assessment
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Input Area */}
                        {!result && (
                            <View style={styles.inputSection}>
                                <View style={styles.inputControls}>
                                    <TouchableOpacity style={[styles.scanButton, { borderColor: colors.primary }]} onPress={handleScan}>
                                        <Ionicons name="camera" size={20} color={colors.primary} />
                                        <Text style={[styles.scanButtonText, { color: colors.primary }]}>Scan Document</Text>
                                    </TouchableOpacity>
                                    <Text style={[styles.orText, { color: colors.textTertiary }]}>OR</Text>
                                </View>

                                <TextInput
                                    style={[styles.textArea, {
                                        color: colors.text,
                                        backgroundColor: colors.surfaceElevated1,
                                        borderColor: colors.border
                                    }]}
                                    placeholder="Paste your contract or agreement here..."
                                    placeholderTextColor={colors.textTertiary}
                                    value={documentText}
                                    onChangeText={setDocumentText}
                                    multiline
                                    textAlignVertical="top"
                                />

                                <Button
                                    title="Analyze Now"
                                    onPress={() => handleAnalyze()}
                                    loading={isLoading}
                                    disabled={!documentText.trim() || isLoading}
                                    fullWidth
                                    icon={<Ionicons name="shield-checkmark" size={20} color={theme.colors.onPrimary} />}
                                />
                            </View>
                        )}

                        {/* Results UI */}
                        {result && (
                            <View style={styles.results}>
                                <TouchableOpacity style={styles.resetButton} onPress={() => setResult(null)}>
                                    <Ionicons name="arrow-back" size={20} color={colors.primary} />
                                    <Text style={[styles.resetText, { color: colors.primary }]}>Review New Document</Text>
                                </TouchableOpacity>

                                {/* Risk Gauge Card */}
                                <Card elevation="lg" style={styles.gaugeCard}>
                                    <LinearGradient
                                        colors={getRiskGradient(result.overall_verdict)}
                                        style={styles.gaugeGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <View style={styles.gaugeContent}>
                                            <View style={styles.gaugeValueContainer}>
                                                <Text style={styles.gaugeValue}>{result.risk_score}</Text>
                                                <Text style={styles.gaugeTotal}>/10</Text>
                                            </View>
                                            <View style={styles.verdictBadge}>
                                                <Text style={styles.verdictText}>{result.overall_verdict.toUpperCase()}</Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                    <View style={styles.gaugeInfo}>
                                        <Text style={[styles.riskLabel, { color: colors.text }]}>{result.document_type}</Text>
                                        <Text style={[styles.riskDesc, { color: colors.textSecondary }]}>
                                            {result.summary}
                                        </Text>
                                    </View>
                                </Card>

                                {/* Dangerous Clauses list */}
                                {result.analysis_results.length > 0 && (
                                    <View style={styles.clausesSection}>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Startling Clauses ({result.analysis_results.length})</Text>
                                        {result.analysis_results.map((clause, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                activeOpacity={0.7}
                                                onPress={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    setSelectedClause(clause);
                                                    setModalVisible(true);
                                                }}
                                            >
                                                <Card elevation="sm" style={styles.clauseCard}>
                                                    <View style={styles.clauseHeader}>
                                                        <View style={[styles.alertIcon, { backgroundColor: clause.risk_level === 'High' ? colors.error + '20' : colors.warning + '20' }]}>
                                                            <Ionicons name={clause.risk_level === 'High' ? "alert-circle" : "warning"} size={18} color={clause.risk_level === 'High' ? colors.error : colors.warning} />
                                                        </View>
                                                        <Text style={[styles.riskLevel, { color: clause.risk_level === 'High' ? colors.error : colors.warning }]}>
                                                            {clause.risk_level} Risk
                                                        </Text>
                                                        <View style={styles.spacer} />
                                                        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                                                    </View>
                                                    <Text style={[styles.title, { fontSize: 16, marginBottom: 4, color: colors.text }]}>{clause.clause_title}</Text>
                                                    <Text style={[styles.clauseSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
                                                        "{clause.clause_text}"
                                                    </Text>
                                                    <View style={styles.tapToExpand}>
                                                        <Text style={[styles.tapText, { color: colors.primary }]}>Tap for deep analysis</Text>
                                                    </View>
                                                </Card>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                <View style={styles.disclaimerContainer}>
                                    <Ionicons name="alert-circle" size={16} color={colors.textTertiary} />
                                    <Text style={[styles.disclaimer, { color: colors.textTertiary }]}>
                                        {result.disclaimer}
                                    </Text>
                                </View>

                                {/* Authenticity/Stamp Marker */}
                                {result.authenticity_markers && (
                                    <Card elevation="sm" style={styles.clauseCard}>
                                        <View style={[styles.clauseHeader, { marginBottom: 8 }]}>
                                            <Ionicons
                                                name={result.authenticity_markers.has_stamp ? "ribbon" : "help-circle"}
                                                size={20}
                                                color={result.authenticity_markers.has_stamp ? colors.primary : colors.textTertiary}
                                            />
                                            <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 0, color: colors.text }]}>
                                                Visual Authenticity Check
                                            </Text>
                                        </View>
                                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                            {result.authenticity_markers.details}
                                        </Text>
                                    </Card>
                                )}
                            </View>
                        )}
                    </ScrollView>

                    {/* Analysis Detail Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <BlurView intensity={30} style={StyleSheet.absoluteFill} />
                            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>Deep Analysis</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                {selectedClause && (
                                    <ScrollView contentContainerStyle={styles.modalScroll}>
                                        <View style={styles.modalRiskBadge}>
                                            <View style={[styles.alertIcon, { backgroundColor: selectedClause.risk_level === 'High' ? colors.error + '20' : colors.warning + '20' }]}>
                                                <Ionicons name={selectedClause.risk_level === 'High' ? "alert-circle" : "warning"} size={20} color={selectedClause.risk_level === 'High' ? colors.error : colors.warning} />
                                            </View>
                                            <Text style={[styles.riskLevel, { color: selectedClause.risk_level === 'High' ? colors.error : colors.warning }]}>
                                                {selectedClause.risk_level} Risk Clause
                                            </Text>
                                        </View>

                                        <Text style={[styles.modalClauseText, { color: colors.text }]}>
                                            "{selectedClause.clause_text}"
                                        </Text>

                                        <View style={styles.divider} />

                                        <View style={styles.detailSection}>
                                            <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>SIMPLIFIED EXPLANATION</Text>
                                            <Text style={[styles.detailText, { color: colors.text }]}>
                                                {selectedClause.explanation_ei}
                                            </Text>
                                        </View>

                                        <View style={[styles.detailSection, { marginVertical: 8 }]}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <Ionicons name="scale" size={16} color={colors.primary} />
                                                <Text style={[styles.detailLabel, { color: colors.primary }]}>CORE LEGAL PRINCIPLE</Text>
                                            </View>
                                            <Text style={[styles.detailText, { color: colors.text, fontStyle: 'italic' }]}>
                                                {selectedClause.legal_principle}
                                            </Text>
                                        </View>

                                        <View style={[styles.detailSection, styles.highlightBox, { backgroundColor: colors.surfaceElevated1 }]}>
                                            <Text style={[styles.detailLabel, { color: colors.error }]}>LONG-TERM RISK</Text>
                                            <Text style={[styles.detailText, { color: colors.text }]}>
                                                {selectedClause.long_term_risk}
                                            </Text>
                                        </View>

                                        <View style={styles.detailSection}>
                                            <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>RECOMMENDED ACTION</Text>
                                            <View style={styles.recommendationBox}>
                                                <Ionicons name="construct" size={20} color={colors.success} />
                                                <Text style={[styles.recommendation, { color: colors.success, fontSize: 16 }]}>
                                                    {selectedClause.action_step}
                                                </Text>
                                            </View>
                                        </View>
                                    </ScrollView>
                                )}

                                <View style={styles.modalFooter}>
                                    <Button
                                        title="Close Review"
                                        onPress={() => setModalVisible(false)}
                                        fullWidth
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {(isLoading || isScanning) && (
                        <View style={styles.overlay}>
                            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="large" color="#002244" />
                                {loadingPhase ? (
                                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                        {loadingPhase}
                                    </Text>
                                ) : (
                                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                        Architecting Analysis...
                                    </Text>
                                )}

                                {isLoading && (
                                    <TouchableOpacity
                                        style={styles.backgroundBtn}
                                        onPress={() => {
                                            setIsLoading(false);
                                            navigation.goBack();
                                        }}
                                    >
                                        <Text style={[styles.backgroundBtnText, { color: colors.primary }]}>
                                            Continue in Background
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
                    {/* Chat FAB */}
                    <FloatingChatButton />
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: theme.spacing.lg,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 32,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.md,
    },
    title: {
        ...theme.typography.h3,
    },
    subtitle: {
        ...theme.typography.bodySmall,
    },

    /* Input Section */
    inputSection: {
        gap: 16,
    },
    inputControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    scanButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderRadius: 16,
        paddingVertical: 12,
        gap: 8,
    },
    scanButtonText: {
        ...theme.typography.button,
        fontSize: 14,
    },
    orText: {
        ...theme.typography.caption,
        fontWeight: '700',
    },
    textArea: {
        minHeight: SCREEN_WIDTH * 0.7,
        borderWidth: 1,
        borderRadius: 24,
        padding: 20,
        ...theme.typography.body,
        textAlignVertical: 'top',
    },

    /* Results */
    results: {
        gap: 24,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    resetText: {
        ...theme.typography.button,
        fontSize: 14,
    },
    gaugeCard: {
        borderRadius: 32,
        overflow: 'hidden',
        ...theme.shadows.lg,
    },
    gaugeGradient: {
        padding: 32,
        alignItems: 'center',
    },
    gaugeContent: {
        alignItems: 'center',
        gap: 12,
    },
    gaugeValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    gaugeValue: {
        fontSize: 64,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    gaugeTotal: {
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
    },
    verdictBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    verdictText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    gaugeInfo: {
        padding: 24,
    },
    riskLabel: {
        ...theme.typography.h4,
        marginBottom: 4,
    },
    riskDesc: {
        ...theme.typography.bodySmall,
    },

    /* Flagged Clauses */
    clausesSection: {
        gap: 16,
    },
    sectionTitle: {
        ...theme.typography.h4,
    },
    clauseCard: {
        padding: 20,
        borderRadius: 24,
        gap: 12,
    },
    clauseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    alertIcon: {
        padding: 6,
        borderRadius: 8,
    },
    riskLevel: {
        ...theme.typography.caption,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    spacer: {
        flex: 1,
    },
    clauseSnippet: {
        ...theme.typography.body,
        fontStyle: 'italic',
        lineHeight: 24,
    },
    tapToExpand: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tapText: {
        ...theme.typography.caption,
        fontWeight: '700',
    },
    clauseText: {
        ...theme.typography.body,
        fontStyle: 'italic',
        lineHeight: 24,
    },
    explanationBox: {
        padding: 12,
        borderRadius: 12,
    },
    explanation: {
        ...theme.typography.bodySmall,
        lineHeight: 18,
    },
    recommendationBox: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
    },
    recommendation: {
        flex: 1,
        ...theme.typography.bodySmall,
        fontWeight: '700',
    },

    /* Overlay */
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loadingBox: {
        backgroundColor: '#FFFFFF', // Force white background for contrast
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        gap: 16,
        ...theme.shadows.lg,
        borderColor: 'rgba(0,0,0,0.05)',
        borderWidth: 1,
    },
    loadingText: {
        ...theme.typography.body,
        fontWeight: '600',
    },
    backgroundBtn: {
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(0,34,68,0.05)',
    },
    backgroundBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },

    disclaimerContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 8,
        alignItems: 'flex-start',
    },
    disclaimer: {
        flex: 1,
        ...theme.typography.caption,
        fontStyle: 'italic',
    },

    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '85%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        ...theme.shadows.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
        borderBottomWidth: 1,
    },
    modalTitle: {
        ...theme.typography.h4,
    },
    closeButton: {
        padding: 4,
    },
    modalScroll: {
        padding: 24,
        gap: 24,
    },
    modalRiskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalClauseText: {
        ...theme.typography.body,
        fontSize: 18,
        fontStyle: 'italic',
        lineHeight: 26,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    detailSection: {
        gap: 8,
    },
    detailLabel: {
        ...theme.typography.caption,
        fontWeight: '800',
        letterSpacing: 1,
    },
    detailText: {
        ...theme.typography.body,
        lineHeight: 22,
    },
    proConSection: {
        flexDirection: 'row',
        gap: 16,
    },
    proConColumn: {
        flex: 1,
        gap: 12,
    },
    bulletItem: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
    },
    bulletText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    highlightBox: {
        padding: 16,
        borderRadius: 20,
    },
    modalFooter: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
});
