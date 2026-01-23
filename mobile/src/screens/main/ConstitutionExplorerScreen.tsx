import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
            { id: 's3', title: 'States of the Federation and the FCT', content: 'There shall be 36 states in Nigeria... and the Federal Capital Territory, Abuja.' },
        ]
    },
    {
        id: '2',
        title: 'Chapter II: Fundamental Objectives',
        sections: [
            { id: 's13', title: 'Fundamental Obligations', content: 'It shall be the duty and responsibility of all organs of government, and of all authorities and persons... to conform to, observe and apply the provisions of this Chapter.' },
            { id: 's14', title: 'The Government and the People', content: 'The Federal Republic of Nigeria shall be a State based on the principles of democracy and social justice.' },
            { id: 's15', title: 'Political Objectives', content: 'The motto of the Federal Republic of Nigeria shall be Unity and Faith, Peace and Progress.' },
        ]
    },
    {
        id: '3',
        title: 'Chapter III: Citizenship',
        sections: [
            { id: 's25', title: 'Citizenship by Birth', content: 'The following persons are citizens of Nigeria by birth, namely- (a) every person born in Nigeria before the date of independence, either of whose parents or any of whose grandparents belongs or belonged to a community indigenous to Nigeria...' },
            { id: 's26', title: 'Citizenship by Registration', content: 'Subject to the provisions of section 28 of this Constitution, a person to whom the provisions of this section apply may be registered as a citizen of Nigeria...' },
        ]
    },
    {
        id: '4',
        title: 'Chapter IV: Fundamental Rights',
        sections: [
            { id: 's33', title: 'Right to Life', content: 'Every person has a right to life, and no one shall be deprived intentionally of his life, save in execution of the sentence of a court...' },
            { id: 's34', title: 'Right to Dignity of Human Person', content: 'Every individual is entitled to respect for the dignity of his person, and accordingly - (a) no person shall be subjected to torture or to inhuman or degrading treatment...' },
            { id: 's35', title: 'Right to Personal Liberty', content: 'Every person shall be entitled to his personal liberty and no person shall be deprived of such liberty...' },
            { id: 's36', title: 'Right to Fair Hearing', content: 'In the determination of his civil rights and obligations, a person shall be entitled to a fair hearing within a reasonable time by a court or other tribunal established by law...' },
            { id: 's37', title: 'Right to Private and Family Life', content: 'The privacy of citizens, their homes, correspondence, telephone conversations and telegraphic communications is hereby guaranteed and protected.' },
            { id: 's38', title: 'Right to Freedom of Thought', content: 'Every person shall be entitled to freedom of thought, conscience and religion...' },
            { id: 's39', title: 'Right to Freedom of Expression', content: 'Every person shall be entitled to freedom of expression, including freedom to hold opinions and to receive and impart ideas and information without interference.' },
            { id: 's40', title: 'Right to Peaceful Assembly', content: 'Every person shall be entitled to assemble freely and associate with other persons, and in particular he may form or belong to any political party, trade union or any other association...' },
            { id: 's41', title: 'Right to Freedom of Movement', content: 'Every citizen of Nigeria is entitled to move freely throughout Nigeria and to reside in any part thereof...' },
            { id: 's42', title: 'Right to Freedom from Discrimination', content: 'A citizen of Nigeria of a particular community, ethnic group, place of origin, sex, religion or political opinion shall not, by reason only that he is such a person:- (a) be subjected either expressly by, or in the practical application of, any law in force in Nigeria...' },
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

    const filteredChapters = useMemo(() => {
        if (!searchQuery) return CHAPTERS;

        return CHAPTERS.map(chapter => ({
            ...chapter,
            sections: chapter.sections.filter(s =>
                s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.content.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(c => c.sections.length > 0);
    }, [searchQuery]);

    // Automatically expand the first chapter if searching and none expanded
    useEffect(() => {
        if (searchQuery && filteredChapters.length > 0 && !expandedChapter) {
            setExpandedChapter(filteredChapters[0].id);
        }
    }, [searchQuery, filteredChapters]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.surfaceElevated1 }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: colors.text }]}>1999 Constitution</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Federal Republic of Nigeria</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <View style={[styles.searchBar, { backgroundColor: colors.surfaceElevated1, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textTertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search rights, duties, or sections..."
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
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
                                expandedChapter === chapter.id && [styles.expandedHeader, { borderBottomWidth: 1, borderBottomColor: colors.border }]
                            ]}
                            onPress={() => handleToggleChapter(chapter.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.chapterTitleRow}>
                                <View style={[styles.chapterBadge, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.chapterBadgeText}>{chapter.id}</Text>
                                </View>
                                <Text style={[styles.chapterTitle, { color: colors.text }]} numberOfLines={1}>
                                    {chapter.title}
                                </Text>
                            </View>
                            <Ionicons
                                name={expandedChapter === chapter.id ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>

                        {expandedChapter === chapter.id && (
                            <View style={[styles.sectionsList, { backgroundColor: colors.surfaceElevated1 }]}>
                                {chapter.sections.map(section => (
                                    <TouchableOpacity
                                        key={section.id}
                                        style={[styles.sectionCard, { backgroundColor: colors.background }]}
                                        activeOpacity={0.7}
                                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                    >
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.sectionTag}>
                                                <Text style={[styles.sectionId, { color: theme.colors.secondary }]}>
                                                    Section {section.id.replace('s', '')}
                                                </Text>
                                            </View>
                                            <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                                                {section.title}
                                            </Text>
                                        </View>
                                        <Text
                                            style={[styles.sectionPreview, { color: colors.textSecondary }]}
                                        >
                                            {section.content}
                                        </Text>
                                        <TouchableOpacity style={styles.readMore}>
                                            <Text style={[styles.readMoreText, { color: colors.primary }]}>Cite this section</Text>
                                            <Ionicons name="copy-outline" size={14} color={colors.primary} />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                {filteredChapters.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={64} color={colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                            No matching sections found for "{searchQuery}"
                        </Text>
                        <TouchableOpacity
                            style={[styles.clearBtn, { backgroundColor: colors.primary }]}
                            onPress={() => setSearchQuery('')}
                        >
                            <Text style={styles.clearBtnText}>Clear Search</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

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
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        ...theme.typography.h3,
        fontSize: 20,
    },
    subtitle: {
        ...theme.typography.caption,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    content: {
        padding: theme.spacing.lg,
        paddingBottom: 120,
    },
    chapterContainer: {
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
        ...theme.shadows.sm,
    },
    chapterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingHorizontal: 20,
    },
    chapterTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    chapterBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chapterBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '900',
    },
    expandedHeader: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    chapterTitle: {
        fontWeight: '800',
        fontSize: 15,
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
    },
    sectionHeader: {
        gap: 6,
    },
    sectionTag: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    sectionId: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    sectionTitleText: {
        fontSize: 16,
        fontWeight: '900',
    },
    sectionPreview: {
        fontSize: 14,
        lineHeight: 22,
        letterSpacing: 0.2,
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    readMoreText: {
        fontSize: 12,
        fontWeight: '800',
    },
    emptyState: {
        alignItems: 'center',
        padding: 60,
        gap: 20,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    clearBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    clearBtnText: {
        color: '#FFF',
        fontWeight: '800',
    }
});
