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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../utils/responsive';

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
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, horizontalPadding, contentMaxWidth, getColumns, fluid, compact } = useResponsive();
    const navigation = useNavigation<any>();

    const columns = getColumns(220, 16);
    // Keep the staggered two-column composition as a tablet treatment.
    // Large phones remain a single-column composition instead of becoming
    // cramped pseudo-tablets.
    const isTwoColumn = !compact && columns >= 2;

    const heroTitleSize = fluid(26, 54, 320, 600);
    const heroTitleLineHeight = Math.round(heroTitleSize * 1.08);
    const heroSubtitleSize = fluid(13, 16, 320, 600);
    const cardTitleSize = fluid(15, 22, 320, 600);
    const cardSubtitleSize = fluid(11.5, 15, 320, 600);
    const cardPadding = fluid(14, 24, 320, 600);
    const cardMinHeight = fluid(156, 220, 320, 600);
    const cardIconSize = fluid(44, 56, 320, 600);
    const cardRadius = fluid(22, 28, 320, 600);
    const heroTop = fluid(16, 20, 320, 600);
    const heroBottom = fluid(28, 40, 320, 600);
    const cardInfoTop = fluid(18, 24, 320, 600);
    const statusFontSize = fluid(10, 12, 320, 600);

    const handleToolPress = (tool: typeof TOOLS[0]) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        navigation.navigate(tool.route);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Image
                    source={CLASSROOM_BG}
                    style={[styles.globalBackground, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}
                />
                <View style={[styles.gradientOverlay, { backgroundColor: colors.surface + '80' }]} />
            </View>

            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={[styles.headerContent, { paddingHorizontal: horizontalPadding }]}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.surfaceContainerHigh }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
                    </TouchableOpacity>
                    <View style={styles.headerSpacer} />
                    <View style={[styles.statusBadge, { backgroundColor: colors.primary + '15' }]}>
                        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                        <Text style={[styles.statusText, { color: colors.primary, fontSize: statusFontSize }]}>Live Service</Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={[
                    styles.heroSection,
                    {
                        paddingHorizontal: horizontalPadding,
                        maxWidth: contentMaxWidth,
                        alignSelf: contentMaxWidth ? 'center' : undefined,
                        width: '100%',
                    },
                ]}>
                    <Text style={[styles.heroPreTitle, { color: colors.primary }]}>Institutional Access</Text>
                    <Text style={[styles.heroTitle, { color: colors.onSurface, fontSize: heroTitleSize, lineHeight: heroTitleLineHeight }]}>
                        THE HUB
                    </Text>
                    <Text
                        style={[
                            styles.heroSubtitle,
                            {
                                color: colors.onSurfaceVariant,
                                fontSize: heroSubtitleSize,
                                lineHeight: Math.round(heroSubtitleSize * 1.45),
                            },
                        ]}
                    >
                        Legal information, document tools, and pathways to human legal help.
                    </Text>
                </View>

                <View style={[
                    styles.grid,
                    {
                        paddingHorizontal: horizontalPadding,
                        maxWidth: contentMaxWidth,
                        alignSelf: contentMaxWidth ? 'center' : undefined,
                        width: '100%',
                    },
                ]}>
                    {TOOLS.map((tool, index) => (
                        <TouchableOpacity
                            testID={`tool-${tool.id}`}
                            accessibilityRole="button"
                            accessibilityLabel={tool.title}
                            key={tool.id}
                            style={[
                                styles.toolCard,
                                {
                                    padding: cardPadding,
                                    minHeight: cardMinHeight,
                                    backgroundColor: index % 2 === 0
                                        ? colors.surfaceContainerLow
                                        : colors.surfaceContainerHigh,
                                    width: isTwoColumn ? '48%' : '100%',
                                    marginTop: isTwoColumn && index % 2 === 1 ? 40 : 0,
                                },
                            ]}
                            onPress={() => handleToolPress(tool)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.cardHeader}>
                                <View
                                    style={[
                                        styles.iconBox,
                                        {
                                            width: cardIconSize,
                                            height: cardIconSize,
                                            borderRadius: Math.round(cardIconSize * 0.32),
                                            backgroundColor: colors.surface,
                                        },
                                    ]}
                                >
                                    <Ionicons name={tool.icon as any} size={Math.round(cardIconSize * 0.5)} color={tool.color} />
                                </View>
                                <Ionicons
                                    name="arrow-up-outline"
                                    size={fluid(18, 20, 320, 600)}
                                    color={colors.onSurfaceVariant}
                                    style={{ transform: [{ rotate: '45deg' }] }}
                                />
                            </View>

                            <View style={[styles.toolInfo, { marginTop: cardInfoTop }]}>
                                <Text style={[styles.toolTitle, { color: colors.onSurface, fontSize: cardTitleSize, lineHeight: Math.round(cardTitleSize * 1.15) }]}>{tool.title}</Text>
                                <Text style={[styles.toolSubtitle, { color: colors.onSurfaceVariant, fontSize: cardSubtitleSize, lineHeight: Math.round(cardSubtitleSize * 1.45) }]}>{tool.subtitle}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={[
                    styles.promoBox,
                    {
                        backgroundColor: colors.surfaceContainerHighest || colors.surfaceContainerHigh,
                        marginHorizontal: horizontalPadding,
                        maxWidth: contentMaxWidth,
                        alignSelf: contentMaxWidth ? 'center' : undefined,
                        width: contentMaxWidth ? '100%' : undefined,
                    },
                ]}>
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
        paddingHorizontal: 10,
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
        marginTop: heroTop,
        marginBottom: heroBottom,
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
        fontWeight: '900',
        letterSpacing: -2.2,
    },
    heroSubtitle: {
        ...theme.typography.bodyLg,
        marginTop: 12,
        opacity: 0.7,
        maxWidth: 520,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 16,
    },
    toolCard: {
        borderRadius: cardRadius,
        justifyContent: 'space-between',
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
        marginTop: 24,
    },
    toolInfoCompact: {
        marginTop: 18,
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
        marginTop: fluid(40, 60, 320, 600),
        padding: fluid(20, 32, 320, 600),
        borderRadius: fluid(28, 36, 320, 600),
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
        resizeMode: 'cover',
        opacity: 0.08,
    },
});
