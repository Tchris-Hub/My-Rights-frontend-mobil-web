/**
 * Home. Starts from the person's situation, not from our feature list.
 * Order: emergency, "what is happening", then the three things you can do with a document or the law.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Mark } from '../../components/brand/Mark';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { SITUATIONS } from '../../content/situations';

const TOOLS: Array<{ route: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { route: 'DocumentReview', label: 'Check a document', icon: 'scan-outline' },
    { route: 'DocumentGenerate', label: 'Write a letter', icon: 'create-outline' },
    { route: 'ConstitutionExplorer', label: 'Read the law', icon: 'book-outline' },
];

export const HomeScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    const ask = (prompt?: string) => navigation.navigate('AskTab', { initialMessage: prompt, nonce: Date.now() });

    return (
        <View style={[styles.root, { backgroundColor: colors.surface }]}>
            <View style={styles.top}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.brandRow}>
                        <Mark size={28} />
                        <Text style={styles.brand}>My Rights</Text>
                    </View>
                    <Text style={styles.headline}>What is happening?</Text>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Pressable
                    testID="home-emergency"
                    accessibilityRole="button"
                    accessibilityLabel="Being stopped or arrested right now"
                    onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        navigation.navigate('Emergency');
                    }}
                    style={({ pressed }) => [styles.emergency, { backgroundColor: pressed ? '#B52A23' : '#D7332B' }]}
                >
                    <Ionicons name="alert-circle" size={26} color="#FFFFFF" />
                    <View style={styles.emergencyText}>
                        <Text style={styles.emergencyTitle}>Being stopped or arrested now?</Text>
                        <Text style={styles.emergencyHint}>Open this first. It takes 30 seconds.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </Pressable>

                <Text style={[styles.section, { color: colors.onSurface }]}>Pick what fits</Text>
                <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.line }]}>
                    {SITUATIONS.map((s, i) => (
                        <Pressable
                            key={s.id}
                            testID={`situation-${s.id}`}
                            accessibilityRole="button"
                            onPress={() => ask(s.prompt)}
                            style={({ pressed }) => [
                                styles.row,
                                i > 0 && { borderTopWidth: 1, borderTopColor: colors.line },
                                pressed && { backgroundColor: colors.surfaceContainer },
                            ]}
                        >
                            <View style={[styles.rowIcon, { backgroundColor: colors.primaryContainer }]}>
                                <Ionicons name={s.icon} size={22} color={colors.primary} />
                            </View>
                            <View style={styles.rowText}>
                                <Text style={[styles.rowTitle, { color: colors.onSurface }]}>{s.title}</Text>
                                <Text style={[styles.rowHint, { color: colors.onSurfaceVariant }]}>{s.hint}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                        </Pressable>
                    ))}
                    <Pressable
                        testID="situation-other"
                        accessibilityRole="button"
                        onPress={() => ask()}
                        style={({ pressed }) => [styles.row, { borderTopWidth: 1, borderTopColor: colors.line }, pressed && { backgroundColor: colors.surfaceContainer }]}
                    >
                        <View style={[styles.rowIcon, { backgroundColor: colors.tertiaryContainer }]}>
                            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.onTertiaryContainer} />
                        </View>
                        <View style={styles.rowText}>
                            <Text style={[styles.rowTitle, { color: colors.onSurface }]}>Something else</Text>
                            <Text style={[styles.rowHint, { color: colors.onSurfaceVariant }]}>Describe it in your own words</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                    </Pressable>
                </View>

                <Text style={[styles.section, { color: colors.onSurface }]}>Or do something with the law</Text>
                <View style={styles.tools}>
                    {TOOLS.map((t) => (
                        <Pressable
                            key={t.route}
                            testID={`tool-${t.route}`}
                            accessibilityRole="button"
                            onPress={() => navigation.navigate(t.route)}
                            style={({ pressed }) => [
                                styles.tool,
                                { backgroundColor: pressed ? colors.surfaceContainer : colors.card, borderColor: colors.line },
                            ]}
                        >
                            <Ionicons name={t.icon} size={26} color={colors.primary} />
                            <Text style={[styles.toolLabel, { color: colors.onSurface }]}>{t.label}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={[styles.legal, { color: colors.onSurfaceVariant }]}>
                    General legal information, not legal advice. For anything serious, speak to a lawyer.
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1 },
    top: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingBottom: 22 },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12 },
    brand: { fontFamily: theme.typography.fontFamily.display, fontSize: 18, letterSpacing: -0.2, color: '#FFFFFF' },
    headline: { ...theme.typography.displayMd, color: '#FFFFFF', marginTop: 18 },
    scroll: { padding: 16, paddingBottom: 28 },
    emergency: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: theme.borderRadius.lg },
    emergencyText: { flex: 1 },
    emergencyTitle: { fontFamily: theme.typography.fontFamily.headline, fontSize: 17, color: '#FFFFFF' },
    emergencyHint: { ...theme.typography.bodyMd, color: '#FFE2DF', marginTop: 1 },
    section: { ...theme.typography.titleMd, marginTop: 26, marginBottom: 10 },
    list: { borderRadius: theme.borderRadius.lg, borderWidth: 1, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13, minHeight: 64 },
    rowIcon: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    rowText: { flex: 1 },
    rowTitle: { ...theme.typography.labelLg, fontFamily: theme.typography.fontFamily.headlineMedium },
    rowHint: { ...theme.typography.caption, marginTop: 1 },
    tools: { flexDirection: 'row', gap: 10 },
    tool: { flex: 1, minHeight: 92, borderWidth: 1, borderRadius: theme.borderRadius.lg, padding: 12, justifyContent: 'space-between' },
    toolLabel: { ...theme.typography.labelMd, fontFamily: theme.typography.fontFamily.headlineMedium },
    legal: { ...theme.typography.caption, textAlign: 'center', marginTop: 26 },
});
