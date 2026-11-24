import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import theme, { spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

import { legalService, Chapter, Section } from '../../services/legalService';
import { accountService } from '../../services/account.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ConstitutionExplorerScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

    useEffect(() => {
        loadConstitution();
    }, []);

    const loadConstitution = async () => {
        try {
            setIsLoading(true);
            const data = await legalService.getConstitution();
            setChapters(data);
            
            // Default to Chapter IV (Fundamental Rights) if it exists
            const chapterIV = data.find(c => c.chapter_number === 4);
            if (chapterIV) {
                setExpandedChapter(chapterIV.id.toString());
            } else if (data.length > 0) {
                setExpandedChapter(data[0].id.toString());
            }
        } catch (error) {
            console.error('Error loading constitution:', error);
            Alert.alert('Could not load the Constitution', 'Check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleChapter = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setExpandedChapter(expandedChapter === id ? null : id);
    };

    const filteredChapters = useMemo(() => {
        if (!searchQuery) return chapters;

        const query = searchQuery.toLowerCase();
        return chapters.map(chapter => {
            const matchedSections = chapter.sections?.filter(s =>
                s.title.toLowerCase().includes(query) ||
                s.content.toLowerCase().includes(query)
            ) || [];
            
            return {
                ...chapter,
                sections: matchedSections
            };
        }).filter(c => c.sections && c.sections.length > 0);
    }, [searchQuery, chapters]);

    // Automatically expand the first chapter if searching and none expanded
    useEffect(() => {
        if (searchQuery && filteredChapters.length > 0 && !expandedChapter) {
            setExpandedChapter(filteredChapters[0].id.toString());
        }
    }, [searchQuery, filteredChapters]);

    const saveSection = async (section: Section) => {
        try {
            await accountService.saveRight({
                source_type: 'constitution_section',
                source_id: String(section.id),
                title: section.title,
                citation: `Constitution 1999, section ${section.section_number}`,
                summary: section.key_takeaway || section.content.slice(0, 500),
            });
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Saved', 'Find it under Me, Saved rights.');
        } catch (error) {
            Alert.alert('Could not save', error instanceof Error ? error.message : 'Sign in and try again.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <ScreenHeader title="The Constitution" subtitle="Federal Republic of Nigeria, 1999" />

            <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.line }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                    <Ionicons name="search" size={20} color={colors.onSurfaceVariant} />
                    <TextInput
                        testID="constitution-search"
                        accessibilityLabel="Search the Constitution"
                        style={[styles.searchInput, { color: colors.onSurface }]}
                        placeholder="Search a right, a duty or a section number"
                        placeholderTextColor={colors.outline}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.centeredText, { color: colors.onSurfaceVariant }]}>Loading the Constitution</Text>
                </View>
            ) : filteredChapters.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="search-outline" size={44} color={colors.outline} />
                    <Text style={[styles.centeredTitle, { color: colors.onSurface }]}>Nothing matches “{searchQuery}”</Text>
                    <Text style={[styles.centeredText, { color: colors.onSurfaceVariant }]}>Try a shorter word, like “arrest” or “property”.</Text>
                    <Button title="Clear search" variant="secondary" onPress={() => setSearchQuery('')} style={styles.clear} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                    <Text style={[styles.notice, { color: colors.onSurfaceVariant }]}>
                        Text is shown for reading. Check the official gazette before you rely on it in court.
                    </Text>
                    {filteredChapters.map((chapter) => {
                        const open = expandedChapter === chapter.id.toString();
                        return (
                            <View key={chapter.id.toString()} style={[styles.chapter, { backgroundColor: colors.card, borderColor: colors.line }]}>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityState={{ expanded: open }}
                                    onPress={() => handleToggleChapter(chapter.id.toString())}
                                    style={({ pressed }) => [styles.chapterHeader, pressed && { backgroundColor: colors.surfaceContainer }]}
                                >
                                    <View style={[styles.chapterNum, { backgroundColor: open ? colors.primary : colors.primaryContainer }]}>
                                        <Text style={[styles.chapterNumText, { color: open ? colors.onPrimary : colors.primary }]}>{chapter.chapter_number}</Text>
                                    </View>
                                    <Text style={[styles.chapterTitle, { color: colors.onSurface }]} numberOfLines={2}>
                                        {chapter.title}
                                    </Text>
                                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.onSurfaceVariant} />
                                </Pressable>

                                {open
                                    ? chapter.sections?.map((section) => (
                                        <View key={section.id.toString()} style={[styles.section, { borderTopColor: colors.line }]}>
                                            <Text style={[styles.sectionNumber, { color: colors.primary }]}>Section {section.section_number}</Text>
                                            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{section.title}</Text>
                                            <Text style={[styles.sectionText, { color: colors.onSurface }]} selectable>{section.content}</Text>

                                            {section.key_takeaway ? (
                                                <View style={[styles.inShort, { backgroundColor: colors.tertiaryContainer, borderLeftColor: colors.danfo }]}>
                                                    <Text style={[styles.inShortLabel, { color: colors.onTertiaryContainer }]}>In short</Text>
                                                    <Text style={[styles.inShortText, { color: colors.onTertiaryContainer }]}>{section.key_takeaway}</Text>
                                                </View>
                                            ) : null}

                                            <Button title="Save this section" variant="ghost" size="small" onPress={() => void saveSection(section)} icon={<Ionicons name="bookmark-outline" size={18} color={colors.primary} />} />
                                        </View>
                                    ))
                                    : null}
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
    searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: theme.borderRadius.md, borderWidth: 1, paddingHorizontal: 12, minHeight: 46 },
    searchInput: { flex: 1, fontFamily: theme.typography.fontFamily.body, fontSize: 16, paddingVertical: 8 },
    content: { padding: 16, paddingBottom: 32, gap: 10 },
    notice: { ...theme.typography.caption, marginBottom: 4 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
    centeredTitle: { ...theme.typography.titleMd, textAlign: 'center' },
    centeredText: { ...theme.typography.bodyMd, textAlign: 'center' },
    clear: { marginTop: 8 },
    chapter: { borderWidth: 1, borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
    chapterHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 64 },
    chapterNum: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    chapterNumText: { fontFamily: theme.typography.fontFamily.headline, fontSize: 15 },
    chapterTitle: { ...theme.typography.titleMd, flex: 1 },
    section: { borderTopWidth: 1, padding: 14, gap: 6 },
    sectionNumber: { ...theme.typography.labelMd, fontFamily: theme.typography.fontFamily.headline },
    sectionTitle: { ...theme.typography.titleMd },
    sectionText: { ...theme.typography.readingSm, marginTop: 2 },
    inShort: { borderLeftWidth: 4, padding: 10, borderRadius: 6, marginTop: 6 },
    inShortLabel: { ...theme.typography.labelSm, fontFamily: theme.typography.fontFamily.headline },
    inShortText: { ...theme.typography.bodyMd, marginTop: 2, color: undefined },
});
