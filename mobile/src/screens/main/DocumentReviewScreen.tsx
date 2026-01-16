/**
 * Document Review Screen - Premium Risk Assessment
 * "Minimal Grenade" upgrade: Visual risk gauges, camera scanning, and rich analysis
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components/ui/Button';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import { Card } from '../../components/ui/Card';
import { documentService } from '../../services/document.service';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import type { DocumentAnalysisResponse, DangerousClause } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DocumentReviewScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const [documentText, setDocumentText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [result, setResult] = useState<DocumentAnalysisResponse | null>(null);
    const [selectedClause, setSelectedClause] = useState<DangerousClause | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleAnalyze = async (text?: string) => {
        const targetText = text || documentText;
        if (!targetText.trim()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsLoading(true);
        try {
            const analysis = await documentService.analyzeDocument(targetText);
            setResult(analysis);
        } catch (error) {
            console.error('Analysis failed:', error);
            Alert.alert('Analysis Failed', 'Could not analyze the document. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleScan = () => {
        Alert.alert(
            'Capture Document',
            'Choose how you want to capture the document:',
            [
                { text: 'Camera', onPress: () => pickImage('camera') },
                { text: 'Gallery', onPress: () => pickImage('gallery') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
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
                    allowsEditing: true,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                    allowsEditing: true,
                });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                setCapturedImage(imageUri);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // OCR Placeholder: In production, send imageUri to an OCR service (e.g., Google Cloud Vision)
                // For now, prompt user to manually enter text or use a sample
                Alert.alert(
                    'Image Captured',
                    'OCR is not yet integrated. Please paste the document text manually for analysis, or use the sample text.',
                    [
                        {
                            text: 'Use Sample Text',
                            onPress: () => {
                                const sampleText = "This rental agreement is between the Landlord and Tenant. The tenant must pay 100% of repairs. The landlord can enter at any time without notice. Rent is subject to 50% increase monthly.";
                                setDocumentText(sampleText);
                            }
                        },
                        { text: 'Enter Manually', style: 'cancel' },
                    ]
                );
            }
        } catch (error) {
            console.error('Image capture failed:', error);
            Alert.alert('Capture Failed', 'Could not capture the image. Please try again.');
        } finally {
            setIsScanning(false);
        }
    };

    const getRiskGradient = (verdict: string) => {
        if (verdict === 'Safe') return ['#10B981', '#059669'] as const;
        if (verdict === 'Caution') return ['#F59E0B', '#D97706'] as const;
        return ['#EF4444', '#DC2626'] as const;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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
                                colors={getRiskGradient(result.verdict)}
                                style={styles.gaugeGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.gaugeContent}>
                                    <View style={styles.gaugeValueContainer}>
                                        <Text style={styles.gaugeValue}>{result.risk_score}</Text>
                                        <Text style={styles.gaugeTotal}>/100</Text>
                                    </View>
                                    <View style={styles.verdictBadge}>
                                        <Text style={styles.verdictText}>{result.verdict.toUpperCase()}</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                            <View style={styles.gaugeInfo}>
                                <Text style={[styles.riskLabel, { color: colors.text }]}>General Risk Assessment</Text>
                                <Text style={[styles.riskDesc, { color: colors.textSecondary }]}>
                                    Based on Nigerian Law and standard contract security practices.
                                </Text>
                            </View>
                        </Card>

                        {/* Dangerous Clauses list */}
                        {result.dangerous_clauses.length > 0 && (
                            <View style={styles.clausesSection}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Flagged Clauses</Text>
                                {result.dangerous_clauses.map((clause, index) => (
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
                                                <View style={[styles.alertIcon, { backgroundColor: colors.error + '20' }]}>
                                                    <Ionicons name="warning" size={18} color={colors.error} />
                                                </View>
                                                <Text style={[styles.riskLevel, { color: colors.error }]}>
                                                    {clause.risk_level} Risk
                                                </Text>
                                                <View style={styles.spacer} />
                                                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                                            </View>
                                            <Text style={[styles.clauseSnippet, { color: colors.text }]} numberOfLines={2}>
                                                "{clause.clause}"
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
                                {result.legal_disclaimer}
                            </Text>
                        </View>
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
                                    <View style={[styles.alertIcon, { backgroundColor: colors.error + '20' }]}>
                                        <Ionicons name="warning" size={20} color={colors.error} />
                                    </View>
                                    <Text style={[styles.riskLevel, { color: colors.error }]}>
                                        {selectedClause.risk_level} Risk Clause
                                    </Text>
                                </View>

                                <Text style={[styles.modalClauseText, { color: colors.text }]}>
                                    "{selectedClause.clause}"
                                </Text>

                                <View style={styles.divider} />

                                <View style={styles.detailSection}>
                                    <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>SIMPLIFIED MEANING</Text>
                                    <Text style={[styles.detailText, { color: colors.text }]}>
                                        {selectedClause.simplified_explanation}
                                    </Text>
                                </View>

                                <View style={styles.proConSection}>
                                    <View style={styles.proConColumn}>
                                        <Text style={[styles.detailLabel, { color: colors.success }]}>PROS (ADVANTAGES)</Text>
                                        {selectedClause.pros.length > 0 ? (
                                            selectedClause.pros.map((pro, i) => (
                                                <View key={i} style={styles.bulletItem}>
                                                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                                                    <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{pro}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={[styles.bulletText, { color: colors.textTertiary, fontStyle: 'italic' }]}>None identified.</Text>
                                        )}
                                    </View>

                                    <View style={styles.proConColumn}>
                                        <Text style={[styles.detailLabel, { color: colors.error }]}>CONS (DISADVANTAGES)</Text>
                                        {selectedClause.cons.length > 0 ? (
                                            selectedClause.cons.map((con, i) => (
                                                <View key={i} style={styles.bulletItem}>
                                                    <Ionicons name="remove-circle" size={14} color={colors.error} />
                                                    <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{con}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={[styles.bulletText, { color: colors.textTertiary, fontStyle: 'italic' }]}>None identified.</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={[styles.detailSection, styles.highlightBox, { backgroundColor: colors.surfaceElevated1 }]}>
                                    <Text style={[styles.detailLabel, { color: colors.primary }]}>LONG-TERM IMPLICATIONS</Text>
                                    <Text style={[styles.detailText, { color: colors.text }]}>
                                        {selectedClause.long_term_implications}
                                    </Text>
                                </View>

                                <View style={styles.detailSection}>
                                    <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>RECOMMENDATION</Text>
                                    <View style={styles.recommendationBox}>
                                        <Ionicons name="bulb" size={20} color={colors.primary} />
                                        <Text style={[styles.recommendation, { color: colors.primary, fontSize: 16 }]}>
                                            {selectedClause.recommendation}
                                        </Text>
                                    </View>
                                </View>
                            </ScrollView>
                        )}

                        <View style={styles.modalFooter}>
                            <Button
                                title="Got it"
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
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>
                            {isScanning ? 'Scanning Document...' : 'Analyzing Clauses...'}
                        </Text>
                    </View>
                </View>
            )}
            {/* Chat FAB */}
            <FloatingChatButton />

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
        backgroundColor: '#FFFFFF',
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        gap: 16,
        ...theme.shadows.lg,
    },
    loadingText: {
        ...theme.typography.body,
        fontWeight: '600',
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
