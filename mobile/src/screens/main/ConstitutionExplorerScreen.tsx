/**
 * Constitution Explorer Screen
 * A searchable, interactive directory of the 1999 Nigerian Constitution
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';

const CHAPTERS = [
    {
        id: '1',
        title: 'Chapter I: General Provisions',
        sections: [
            { id: 's1', title: 'Supremacy of Constitution', content: 'This Constitution is supreme and its provisions shall have binding force on all authorities and persons throughout the Federal Republic of Nigeria.' },
            { id: 's2', title: 'The Federal Republic of Nigeria', content: 'Nigeria is one indivisible and indissoluble sovereign state to be known by the name of the Federal Republic of Nigeria.' },
        ]
    },
    {
        id: '4',
        title: 'Chapter IV: Fundamental Rights',
        sections: [
            { id: 's33', title: 'Right to Life', content: 'Every person has a right to life, and no one shall be deprived intentionally of his life, save in execution of the sentence of a court...' },
            { id: 's34', title: 'Right to Dignity of Human Person', content: 'Every individual is entitled to respect for the dignity of his person, and accordingly - (a) no person shall be subjected to torture or to inhuman or degrading treatment...' },
            { id: 's35', title: 'Right to Personal Liberty', content: 'Every person shall be entitled to his personal liberty and no person shall be deprived of such liberty...' },
        ]
    }
];

export const ConstitutionExplorerScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedChapter, setExpandedChapter] = useState<string | null>('4'); // Default to Chapter IV

    const handleToggleChapter = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpandedChapter(expandedChapter === id ? null : id);
    };

    const filteredChapters = CHAPTERS.map(chapter => ({
        ...chapter,
        sections: chapter.sections.filter(s =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(c => c.sections.length > 0);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Constitution 1999</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={[styles.searchBar, { backgroundColor: colors.surfaceElevated1 }]}>
                    <Ionicons name="search" size={20} color={colors.textTertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search Sections or Keywords..."
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {filteredChapters.map(chapter => (
                    <View key={chapter.id} style={styles.chapterContainer}>
                        <TouchableOpacity
                            style={[
                                styles.chapterHeader,
                                { backgroundColor: colors.surfaceElevated1 },
                                expandedChapter === chapter.id && styles.expandedHeader
                            ]}
                            onPress={() => handleToggleChapter(chapter.id)}
                        >
                            <Text style={[styles.chapterTitle, { color: colors.text }]}>{chapter.title}</Text>
                            <Ionicons
                                name={expandedChapter === chapter.id ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>

                        {expandedChapter === chapter.id && (
                            <View style={styles.sectionsList}>
                                {chapter.sections.map(section => (
                                    <TouchableOpacity
                                        key={section.id}
                                        style={[styles.sectionCard, { backgroundColor: colors.surfaceElevated2 }]}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.sectionHeader}>
                                            <Text style={[styles.sectionId, { color: theme.colors.primary }]}>
                                                Section {section.id.replace('s', '')}
                                            </Text>
                                            <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                                                {section.title}
                                            </Text>
                                        </View>
                                        <Text
                                            style={[styles.sectionPreview, { color: colors.textSecondary }]}
                                            numberOfLines={3}
                                        >
                                            {section.content}
                                        </Text>
                                        <View style={styles.readMore}>
                                            <Text style={[styles.readMoreText, { color: colors.primary }]}>Read full section</Text>
                                            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                {filteredChapters.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No matching sections found.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Chat FAB */}
            <FloatingChatButton />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: theme.spacing.lg,
        gap: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...theme.typography.h3,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        ...theme.typography.bodySmall,
    },
    content: {
        padding: theme.spacing.lg,
        paddingBottom: 100,
    },
    chapterContainer: {
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
    },
    chapterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 24,
    },
    expandedHeader: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    chapterTitle: {
        ...theme.typography.h4,
        fontSize: 16,
        flex: 1,
    },
    sectionsList: {
        padding: 12,
        gap: 12,
    },
    sectionCard: {
        padding: 20,
        borderRadius: 20,
        gap: 12,
        ...theme.shadows.sm,
    },
    sectionHeader: {
        gap: 4,
    },
    sectionId: {
        ...theme.typography.caption,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    sectionTitleText: {
        ...theme.typography.body,
        fontWeight: '700',
    },
    sectionPreview: {
        ...theme.typography.bodySmall,
        lineHeight: 20,
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    readMoreText: {
        ...theme.typography.caption,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        padding: 60,
        gap: 16,
    },
    emptyText: {
        ...theme.typography.bodySmall,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        borderRadius: 28,
        overflow: 'hidden',
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.lg,
    }
});
