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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Button } from '../../components/ui/Button';
import { chatService } from '../../services/chat.service';
import { documentService } from '../../services/document.service';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ArchitectStep = 'SELECT' | 'INTAKE' | 'BUILD' | 'PREVIEW' | 'FINALIZE';

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
        description: 'Describe any document you need.',
        fields: [
            { key: 'description', label: 'What do you need?', placeholder: 'Describe the agreement, parties, and specific terms in detail...' },
        ]
    },
];

export const DocumentGeneratorScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();

    // Architect State
    const [step, setStep] = useState<ArchitectStep>('SELECT');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isArchitecting, setIsArchitecting] = useState(false);
    const [documentContent, setDocumentContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleSelectTemplate = (template: Template) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedTemplate(template);
        setFormData({});
        setStep('INTAKE');
    };

    const handleUpdateForm = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
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
            // Conver form data to a descriptive string for the RAG service
            const userDetails = Object.entries(formData)
                .map(([key, val]) => `${key}: ${val}`)
                .join('. ');

            const response = await documentService.generateDocument(selectedTemplate.title, userDetails);

            setDocumentContent(response.content);
            setStep('BUILD');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (error) {
            console.error('Generation error:', error);
            Alert.alert(
                "Reviewing Request...",
                "The AI is taking a bit longer than usual to think. Please wait a moment and try again—it's crafting something custom for you.",
                [{ text: "OK" }]
            );
        } finally {
            setIsArchitecting(false);
        }
    };

    const handleDownload = (format: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            Alert.alert(
                "Export Successful",
                `Your document has been generated as a ${format} and saved to your library.`,
                [{ text: "View Dashboard", onPress: () => navigation.navigate('Home' as never) }]
            );
        }, 2000);
    };

    const renderHeader = () => {
        let title = "Document Architect";
        let subtitle = "Select a starting point";

        if (step === 'INTAKE') {
            title = "Smart Intake";
            subtitle = `Context for ${selectedTemplate?.title}`;
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
                            else if (step === 'INTAKE') setStep('SELECT');
                            else if (step === 'BUILD') setStep('INTAKE');
                            else if (step === 'PREVIEW') setStep('BUILD');
                            else if (step === 'FINALIZE') setStep('PREVIEW');
                        }}
                        style={styles.backBtn}
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
                    {['SELECT', 'INTAKE', 'BUILD', 'FINALIZE'].map((s, i) => (
                        <View key={s} style={styles.stepIndicatorWrapper}>
                            <View style={[
                                styles.stepDot,
                                { backgroundColor: step === s ? colors.primary : colors.surfaceElevated1 },
                                (['SELECT', 'INTAKE', 'BUILD', 'PREVIEW', 'FINALIZE'].indexOf(step) > i + 1) && { backgroundColor: theme.colors.success }
                            ]} />
                            {i < 3 && <View style={[styles.stepLine, { backgroundColor: colors.surfaceElevated1 }]} />}
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
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Template Library</Text>
                        <View style={styles.templateGrid}>
                            {TEMPLATES.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.templateCard, { backgroundColor: colors.surfaceElevated1 }]}
                                    onPress={() => handleSelectTemplate(item)}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: item.id === 'custom' ? '#D4AF3720' : '#3B82F620' }]}>
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
                )}

                {step === 'INTAKE' && selectedTemplate && (
                    <View style={styles.stepContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formContainer}>
                                {selectedTemplate.fields.map(field => (
                                    <View key={field.key} style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, { color: colors.text }]}>{field.label}</Text>
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
                                            multiline={field.key === 'description'}
                                            numberOfLines={field.key === 'description' ? 4 : 1}
                                        />
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
                    </View>
                )}

                {step === 'BUILD' && (
                    <View style={styles.stepContent}>
                        <View style={styles.editorToolbar}>
                            <TouchableOpacity
                                style={[styles.toolbarBtn, isEditing && { backgroundColor: theme.colors.primary }]}
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
                                <Text style={[styles.previewText, { color: colors.primary }]}>HTML</Text>
                            </TouchableOpacity>
                            <Button
                                title="Finalize Document"
                                onPress={() => setStep('FINALIZE')}
                                style={[styles.mainBtn, { flex: 2 }]}
                            />
                        </View>
                    </View>
                )}

                {step === 'PREVIEW' && (
                    <View style={styles.stepContent}>
                        <View style={styles.htmlPreviewContainer}>
                            <ScrollView contentContainerStyle={{ padding: 32 }}>
                                <Text style={styles.htmlH1}>{selectedTemplate?.title.toUpperCase()}</Text>
                                <View style={styles.htmlDivider} />
                                <Text style={styles.htmlP}>{documentContent}</Text>
                            </ScrollView>
                        </View>
                        <Button
                            title="Proceed to Export"
                            onPress={() => setStep('FINALIZE')}
                            style={styles.mainBtn}
                        />
                    </View>
                )}

                {step === 'FINALIZE' && (
                    <View style={styles.stepContent}>
                        <View style={styles.successHeader}>
                            <Ionicons name="document-attach" size={64} color={theme.colors.primary} />
                            <Text style={[styles.successTitle, { color: colors.text }]}>Draft Ready</Text>
                            <Text style={[styles.successSub, { color: colors.textSecondary }]}>
                                Your document has been tailored with the provided context and is ready for export.
                            </Text>
                        </View>

                        <View style={styles.exportGrid}>
                            <TouchableOpacity
                                style={[styles.exportCard, { backgroundColor: colors.surfaceElevated1 }, theme.shadows.sm]}
                                onPress={() => handleDownload('PDF')}
                            >
                                <Ionicons name="document-text" size={32} color="#EF4444" />
                                <Text style={[styles.exportText, { color: colors.text }]}>PDF</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.exportCard, { backgroundColor: colors.surfaceElevated1 }, theme.shadows.sm]}
                                onPress={() => handleDownload('DOCX')}
                            >
                                <Ionicons name="document" size={32} color="#3B82F6" />
                                <Text style={[styles.exportText, { color: colors.text }]}>Word</Text>
                            </TouchableOpacity>
                        </View>

                        <Button
                            title="Back to Dashboard"
                            onPress={() => navigation.navigate('Home' as never)}
                            variant="outline"
                            style={[styles.mainBtn, { borderColor: colors.border }]}
                        />
                    </View>
                )}
            </KeyboardAvoidingView>

            {(isArchitecting || isExporting) && (
                <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <BlurView intensity={30} style={StyleSheet.absoluteFill} />
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: '#000' }]}>
                            {isExporting ? 'Exporting...' : 'AI Architecting...'}
                        </Text>
                        <Text style={styles.loadingSub}>Analyzing context & laws</Text>
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
        width: 40,
        height: 40,
        borderRadius: 20,
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
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    stepLine: {
        width: 50,
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
        gap: 12,
    },
    templateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        gap: 16,
        ...theme.shadows.sm,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemTitle: {
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 4,
    },
    itemSub: {
        fontSize: 11,
        lineHeight: 14,
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
        fontWeight: '700',
    },
    formInput: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        fontSize: 14,
    },
    mainBtn: {
        height: 60,
        borderRadius: 30,
        ...theme.shadows.md,
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        gap: 8,
    },
    toolbarText: {
        fontSize: 12,
        fontWeight: '800',
    },
    documentViewer: {
        flex: 1,
        borderRadius: 28,
        padding: 24,
        ...theme.shadows.lg,
    },
    documentText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
        fontSize: 14,
        lineHeight: 22,
    },
    editingInput: {
        flex: 1,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 14,
        textAlignVertical: 'top',
        lineHeight: 22,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    previewToggle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        gap: 8,
    },
    previewText: {
        fontWeight: '800',
    },
    /* HTML Preview */
    htmlPreviewContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#EEE',
        overflow: 'hidden',
    },
    htmlH1: {
        fontSize: 22,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 10,
    },
    htmlDivider: {
        height: 3,
        width: 60,
        backgroundColor: '#000',
        alignSelf: 'center',
        marginBottom: 24,
    },
    htmlP: {
        fontSize: 14,
        lineHeight: 24,
        color: '#444',
    },
    /* Finalize */
    successHeader: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 12,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
    },
    successSub: {
        textAlign: 'center',
        fontSize: 14,
        paddingHorizontal: 20,
    },
    exportGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    exportCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 32,
        borderRadius: 24,
        gap: 12,
    },
    exportText: {
        fontWeight: '800',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loadingBox: {
        backgroundColor: '#FFF',
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontWeight: '900',
        fontSize: 18,
    },
    loadingSub: {
        fontSize: 12,
        color: '#666',
    },
});
