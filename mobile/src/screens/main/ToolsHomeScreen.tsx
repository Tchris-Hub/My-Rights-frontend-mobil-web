/**
 * Tools Home Screen - Power Tools Hub
 * Central dashboard for legal document architecture, review, and discovery.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CLASSROOM_BG = require('../../../assets/onboarding/classroom_bg.png');

const TOOLS = [
    {
        id: 'generate',
        title: 'Document Architect',
        subtitle: 'Create structured legal-document drafts from the details you provide.',
        icon: 'document-attach',
        color: theme.colors.primary,
        route: 'DocumentGenerate',
    },
    {
        id: 'review',
        title: 'Document Review',
        subtitle: 'AI-assisted review of document text for potential issues and explanations.',
        icon: 'scan',
        color: theme.colors.secondary,
        route: 'DocumentReview',
    },
    {
        id: 'constitution',
        title: '1999 Constitution',
        subtitle: 'Browse available Constitution content and related legal-source information.',
        icon: 'book',
        color: theme.colors.onSurfaceVariant,
        route: 'ConstitutionExplorer',
    },
    {
        id: 'map',
        title: 'Legal Aid Map',
        subtitle: 'Find available legal-aid centres and legal professionals.',
        icon: 'location',
        color: theme.colors.primary,
        route: 'LegalAidMap',
    },
];

export const ToolsHomeScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    const handleToolPress = (tool: typeof TOOLS[0]) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        navigation.navigate(tool.route);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            {/* Background Decoration (Lincoln College Watermark) */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Image 
                    source={CLASSROOM_BG}
                    style={styles.globalBackground}
                />
                <View style={[styles.gradientOverlay, { backgroundColor: colors.surface + '80' }]} />
            </View>

            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.surfaceContainerHigh }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
                    </TouchableOpacity>
                    <View style={styles.headerSpacer} />
                    <View style={[styles.statusBadge, { backgroundColor: colors.primary + '15' }]}>
                        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                        <Text style={[styles.statusText, { color: colors.primary }]}>Live Service</Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroSection}>
                    <Text style={[styles.heroPreTitle, { color: colors.primary }]}>Institutional Access</Text>
                    <Text style={[styles.heroTitle, { color: colors.onSurface }]}>THE HUB</Text>
                    <Text style={[styles.heroSubtitle, { color: colors.onSurfaceVariant }]}>
                        Legal information, document tools, and pathways to human legal help.
                    </Text>
                </View>

                <View style={styles.grid}>
                    {TOOLS.map((tool, index) => (
                        <TouchableOpacity
                            testID={`tool-${tool.id}`}
                            accessibilityRole="button"
                            accessibilityLabel={tool.title}
                            key={tool.id}
                            style={[
                                styles.toolCard, 
                                { 
                                    backgroundColor: index % 2 === 0 ? colors.surfaceContainerLow : colors.surfaceContainerHigh,
                                    marginTop: index % 2 === 1 ? 40 : 0 // Deep Asymmetric stagger
                                }
                            ]}
                            onPress={() => handleToolPress(tool)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                                    <Ionicons name={tool.icon as any} size={28} color={tool.color} />
                                </View>
                                <Ionicons name="arrow-up-outline" size={20} color={colors.onSurfaceVariant} style={{ transform: [{ rotate: '45deg' }] }} />
                            </View>
                            
                            <View style={styles.toolInfo}>
                                <Text style={[styles.toolTitle, { color: colors.onSurface }]}>{tool.title}</Text>
                                <Text style={[styles.toolSubtitle, { color: colors.onSurfaceVariant }]}>{tool.subtitle}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Promotional Tip - Evidence Locker Style */}
                <View style={[styles.promoBox, { backgroundColor: colors.surfaceContainerHighest || colors.surfaceContainerHigh }]}>
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                    <View style={styles.promoTextContent}>
                        <View style={styles.promoHeader}>
                            <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
                            <Text style={[styles.promoTitle, { color: colors.onSurface }]}>THE PLAIN TRUTH</Text>
                        </View>
                        <Text style={[styles.promoText, { color: colors.onSurfaceVariant }]}>
                            Use these tools to review information and prepare drafts. Legal documents and AI-generated explanations should be checked against authoritative sources or by a qualified legal professional when the matter is important.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFill,
    },
    header: {
        zIndex: 100,
    },
    headerContent: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerSpacer: {
        flex: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        ...theme.typography.labelSm,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroSection: {
        paddingHorizontal: 24,
        marginTop: 20,
        marginBottom: 40,
    },
    heroPreTitle: {
        ...theme.typography.labelSm,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    heroTitle: {
        ...theme.typography.displayLg,
        fontSize: 56,
        lineHeight: 60,
        fontWeight: '900',
        letterSpacing: -3,
    },
    heroSubtitle: {
        ...theme.typography.bodyLg,
        marginTop: 12,
        opacity: 0.7,
        maxWidth: '80%',
    },
    scrollContent: {
        paddingBottom: 120, 
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    toolCard: {
        width: '47%',
        padding: 24,
        borderRadius: 32, 
        justifyContent: 'space-between',
        minHeight: 220,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toolInfo: {
        marginTop: 32,
    },
    toolTitle: {
        ...theme.typography.titleLg,
        fontSize: 20,
        lineHeight: 24,
        fontWeight: '900',
        marginBottom: 8,
    },
    toolSubtitle: {
        ...theme.typography.bodyMd,
        fontSize: 13,
        lineHeight: 18,
        opacity: 0.8,
    },
    promoBox: {
        marginHorizontal: 24,
        marginTop: 60,
        padding: 32,
        borderRadius: 36,
        overflow: 'hidden',
    },
    promoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    accentBar: {
        width: 3,
        height: 18,
        borderRadius: 2,
    },
    promoTextContent: {
        flex: 1,
    },
    promoTitle: {
        ...theme.typography.labelLg,
        fontWeight: '900',
        letterSpacing: 2,
    },
    promoText: {
        ...theme.typography.bodyLg,
        lineHeight: 26,
        fontSize: 16,
    },
    globalBackground: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        resizeMode: 'cover',
        opacity: 0.08,
    },
});

