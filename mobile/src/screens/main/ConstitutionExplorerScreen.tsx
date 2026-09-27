import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    Image,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import theme, { spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';

import { legalService, Chapter } from '../../services/legalService';
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
            Alert.alert('Connection Error', 'Failed to load constitution data from the cloud.');
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

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <View style={StyleSheet.absoluteFill}>
                <Image 
                    source={require('../../../assets/onboarding/classroom_bg.png')} 
                    style={styles.globalBackground} 
                    resizeMode="cover"
                />
                <View style={[styles.overlay, { backgroundColor: colors.surface + 'F0' }]} />
            </View>

            <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint={isDark ? 'dark' : 'light'} style={styles.blurHeader}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity
                                style={[styles.backButton, { backgroundColor: colors.surfaceContainerHigh }]}
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
                            </TouchableOpacity>
                            <View style={styles.titleContainer}>
                                <Text style={[styles.heroPreTitle, { color: colors.primary }]}>Institutional Index</Text>
                                <Text style={[theme.typography.displaySm, { color: colors.onSurface }]}>1999 Constitution</Text>
                            </View>
                            <View style={{ width: 44 }} />
                        </View>

                        <View style={[styles.searchBar, { backgroundColor: colors.surfaceContainerLow }]}>
                            <Ionicons name="search" size={20} color={colors.onSurfaceVariant} />
                            <TextInput
                                testID="constitution-search"
                                accessibilityLabel="Search the Constitution"
                                style={[theme.typography.bodyMd, styles.searchInput, { color: colors.onSurface }]}
                                placeholder="Search rights, duties, or citations..."
                                placeholderTextColor={colors.onSurfaceVariant}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                clearButtonMode="while-editing"
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </BlurView>

            {isLoading ? (
                <View testID="constitution-loading" style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Consulting the Archives...</Text>
                </View>
            ) : filteredChapters.length === 0 ? (
                <View testID="constitution-empty" style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={48} color={colors.onSurfaceVariant} />
                    <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No matches found in the Constitution</Text>
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginTop: 20 }}>
                         <Text style={{ ...theme.typography.labelLg, color: colors.primary, fontWeight: '900' }}>CLEAR SEARCH</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                    {filteredChapters.map(chapter => (
                        <View key={chapter.id.toString()} style={styles.chapterWrapper}>
                            <TouchableOpacity
                                style={[
                                    styles.chapterHeader,
                                    { backgroundColor: expandedChapter === chapter.id.toString() ? colors.surfaceContainerHigh : colors.surfaceContainerLow }
                                ]}
                                onPress={() => handleToggleChapter(chapter.id.toString())}
                                activeOpacity={0.8}
                            >
                                <View style={styles.chapterTitleRow}>
                                    <View style={styles.chapterMarker}>
                                        <Text style={[styles.chapterNumber, { color: colors.primary }]}>
                                            {chapter.chapter_number.toString().padStart(2, '0')}
                                        </Text>
                                        <View style={[styles.markerDot, { backgroundColor: colors.primary }]} />
                                    </View>
                                    <Text style={[styles.chapterTitle, { color: colors.onSurface }]} numberOfLines={2}>
                                        {chapter.title}
                                    </Text>
                                </View>
                                <Ionicons 
                                    name={expandedChapter === chapter.id.toString() ? "remove" : "add"} 
                                    size={24} 
                                    color={colors.onSurfaceVariant} 
                                />
                            </TouchableOpacity>

                             {expandedChapter === chapter.id.toString() && (
                                <View style={[styles.sectionsList, { backgroundColor: colors.surfaceContainerLow }]}>
                                    {chapter.sections?.map((section, idx) => (
                                        <View
                                            key={section.id.toString()}
                                            style={[
                                                styles.sectionCard, 
                                                { 
                                                    backgroundColor: colors.surface,
                                                    paddingVertical: spacing.lg,
                                                    paddingHorizontal: spacing.md,
                                                    marginBottom: spacing.md,
                                                    borderRadius: borderRadius.lg,
                                                }
                                            ]}
                                        >
                                            <View style={styles.sectionHeader}>
                                                <Text style={[theme.typography.labelSm, { color: colors.primary, textTransform: 'uppercase' }]}>
                                                    Article {section.section_number}
                                                </Text>
                                                <Text style={[theme.typography.titleMd, { color: colors.onSurface, marginTop: 4 }]}>
                                                    {section.title}
                                                </Text>
                                            </View>
                                            <Text style={[theme.typography.bodyMd, styles.sectionText, { color: colors.onSurfaceVariant, marginTop: spacing.sm }]}>
                                                {section.content}
                                            </Text>
                                            
                                            {section.key_takeaway && (
                                                <View style={[styles.insightBox, { backgroundColor: colors.primary + '08' }]}>
                                                    <Text style={[theme.typography.labelSm, { color: colors.primary }]}>DIGITAL JURIST INSIGHT</Text>
                                                    <Text style={[theme.typography.bodyMd, { color: colors.onSurface, marginTop: 4 }]}>
                                                        {section.key_takeaway}
                                                    </Text>
                                                </View>
                                            )}

                                            <View style={styles.cardFooter}>
                                                <TouchableOpacity 
                                                    testID="constitution-save-citation"
                                                    accessibilityRole="button"
                                                    accessibilityLabel="Save citation"
                                                    style={styles.citeButton}
                                                    onPress={async () => {
                                                        try {
                                                            await accountService.saveRight({
                                                                source_type: 'constitution_section',
                                                                source_id: String(section.id),
                                                                title: section.title,
                                                                citation: `Article ${section.section_number}`,
                                                                summary: section.key_takeaway || section.content.slice(0, 500),
                                                            });
                                                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                                            Alert.alert('Citation saved', 'You can find it in Saved Rights from your profile.');
                                                        } catch (error) {
                                                            Alert.alert('Unable to save citation', error instanceof Error ? error.message : 'Sign in and try again.');
                                                        }
                                                    }}
                                                >
                                                    <Ionicons name="bookmark" size={16} color={colors.primary} />
                                                    <Text style={[theme.typography.labelSm, { color: colors.primary, marginLeft: 8 }]}>SAVE CITATION</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}

            <FloatingChatButton />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeHeader: {
        zIndex: 10,
    },
    overlay: {
        ...StyleSheet.absoluteFill,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 16,
        gap: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blurHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    sectionText: {
        opacity: 0.9,
        lineHeight: 22,
    },
    insightBox: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginVertical: spacing.md,
    },
    titleContainer: {
        alignItems: 'center',
    },
    heroPreTitle: {
        ...theme.typography.labelSm,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 2,
    },
    title: {
        ...theme.typography.titleLg,
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 56,
        borderRadius: 18,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        ...theme.typography.bodyMd,
        fontWeight: '600',
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 140,
    },
    chapterWrapper: {
        marginBottom: 12,
        borderRadius: 24,
        overflow: 'hidden',
    },
    chapterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
    },
    chapterTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 20,
    },
    chapterMarker: {
        alignItems: 'center',
        gap: 4,
    },
    chapterNumber: {
        ...theme.typography.displaySm,
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -1,
    },
    markerDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        opacity: 0.5,
    },
    chapterTitle: {
        ...theme.typography.titleMd,
        fontWeight: '800',
        fontSize: 17,
        flex: 1,
        lineHeight: 22,
    },
    sectionsList: {
        padding: 16,
        paddingTop: 0,
    },
    sectionCard: {
        padding: 24,
        borderRadius: 20,
    },
    sectionHeader: {
        marginBottom: 12,
        gap: 4,
    },
    sectionId: {
        ...theme.typography.labelSm,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    sectionTitleText: {
        ...theme.typography.titleMd,
        fontWeight: '900',
        fontSize: 18,
    },
    sectionPreview: {
        ...theme.typography.bodyMd,
        lineHeight: 24,
        opacity: 0.8,
    },
    cardFooter: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.03)',
    },
    citeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    citeText: {
        ...theme.typography.labelSm,
        fontWeight: '900',
        letterSpacing: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...theme.typography.bodyMd,
        marginTop: 16,
        opacity: 0.6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        ...theme.typography.bodyLg,
        marginTop: 16,
        textAlign: 'center',
        opacity: 0.5,
    },
    globalBackground: {
        ...StyleSheet.absoluteFill,
        opacity: 0.05,
    },
});
