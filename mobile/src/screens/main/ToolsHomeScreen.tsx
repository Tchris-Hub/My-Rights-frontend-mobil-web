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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const TOOLS = [
    {
        id: 'generate',
        title: 'Document Architect',
        subtitle: 'Generate tailored legal documents in seconds.',
        icon: 'document-attach',
        color: theme.colors.primary,
        route: 'DocumentGenerate',
    },
    {
        id: 'review',
        title: 'Document Review',
        subtitle: 'Analyze & verify legal contracts for risks.',
        icon: 'scan',
        color: theme.colors.secondary,
        route: 'DocumentReview',
    },
    {
        id: 'constitution',
        title: '1999 Constitution',
        subtitle: 'Browse and search the Nigerian Constitution.',
        icon: 'book',
        color: '#F59E0B',
        route: 'ConstitutionExplorer',
    },
    {
        id: 'map',
        title: 'Legal Aid Map',
        subtitle: 'Find pro-bono support near your location.',
        icon: 'location',
        color: '#10B981',
        route: 'LegalAidMap',
    },
];

export const ToolsHomeScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<any>();

    const handleToolPress = (tool: typeof TOOLS[0]) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate(tool.route);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Legal Power Tools</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>World-class legal support at your fingertips</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {TOOLS.map((tool) => (
                        <TouchableOpacity
                            key={tool.id}
                            style={[styles.toolCard, { backgroundColor: colors.surfaceElevated1 }]}
                            onPress={() => handleToolPress(tool)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconBox, { backgroundColor: tool.color + '15' }]}>
                                <Ionicons name={tool.icon as any} size={32} color={tool.color} />
                            </View>
                            <View style={styles.toolInfo}>
                                <Text style={[styles.toolTitle, { color: colors.text }]}>{tool.title}</Text>
                                <Text style={[styles.toolSubtitle, { color: colors.textSecondary }]}>{tool.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Promotional Tip */}
                <View style={[styles.promoBox, { backgroundColor: colors.surfaceElevated2 }]}>
                    <Ionicons name="sparkles" size={24} color={theme.colors.secondary} />
                    <View style={styles.promoTextContent}>
                        <Text style={[styles.promoTitle, { color: colors.text }]}>AI Architecting</Text>
                        <Text style={[styles.promoText, { color: colors.textSecondary }]}>
                            Our tools are cross-referenced with the 1999 Constitution to ensure maximum legal safety.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -12,
    },
    title: {
        ...theme.typography.h2,
        fontSize: 28,
        marginBottom: 2,
    },
    subtitle: {
        ...theme.typography.bodySmall,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 120, // Tab bar margin
    },
    grid: {
        gap: 16,
    },
    toolCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 32,
        ...theme.shadows.md,
        gap: 20,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toolInfo: {
        flex: 1,
    },
    toolTitle: {
        ...theme.typography.h4,
        fontSize: 18,
        marginBottom: 4,
    },
    toolSubtitle: {
        ...theme.typography.caption,
        fontSize: 12,
        lineHeight: 16,
    },
    promoBox: {
        marginTop: 32,
        padding: 24,
        borderRadius: 28,
        flexDirection: 'row',
        gap: 16,
    },
    promoTextContent: {
        flex: 1,
    },
    promoTitle: {
        ...theme.typography.body,
        fontWeight: '700',
        marginBottom: 4,
    },
    promoText: {
        ...theme.typography.caption,
        lineHeight: 18,
    },
});
