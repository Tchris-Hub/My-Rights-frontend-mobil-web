/**
 * First run. One screen, not a carousel: what the app does, in three plain lines, and the honest limit.
 */
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Mark } from '../../components/brand/Mark';
import { Skyline } from '../../components/brand/Skyline';
import { Button } from '../../components/ui/Button';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const POINTS: Array<{ icon: keyof typeof Ionicons.glyphMap; title: string; body: string }> = [
    { icon: 'chatbubble-ellipses-outline', title: 'Ask in plain English', body: 'Every answer shows the law it comes from, so you can check it.' },
    { icon: 'document-text-outline', title: 'Check before you sign', body: 'Upload a tenancy, contract or notice and see what it really says.' },
    { icon: 'location-outline', title: 'Find free legal help', body: 'Legal aid offices and lawyers you can contact from the app.' },
];

export const OnboardingScreen: React.FC = () => {
    const { colors } = useTheme();
    const { completeOnboarding } = useAuth();
    const { width } = useWindowDimensions();

    return (
        <View style={[styles.root, { backgroundColor: colors.surface }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <View style={styles.hero}>
                <SafeAreaView edges={['top']} style={styles.brandRow}>
                    <Mark size={30} />
                    <Text style={styles.brand}>My Rights</Text>
                </SafeAreaView>
                <Skyline width={width} />
            </View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
                <Text style={[styles.headline, { color: colors.onSurface }]}>Know where you stand, before it costs you.</Text>

                <View style={styles.points}>
                    {POINTS.map((p) => (
                        <View key={p.title} style={styles.point}>
                            <View style={[styles.pointIcon, { backgroundColor: colors.primaryContainer }]}>
                                <Ionicons name={p.icon} size={22} color={colors.primary} />
                            </View>
                            <View style={styles.pointText}>
                                <Text style={[styles.pointTitle, { color: colors.onSurface }]}>{p.title}</Text>
                                <Text style={[styles.pointBody, { color: colors.onSurfaceVariant }]}>{p.body}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.line }]}>
                <Button title="Get started" size="large" variant="accent" fullWidth onPress={() => completeOnboarding()} testID="onboarding-start" />
                <Text style={[styles.legal, { color: colors.onSurfaceVariant }]}>
                    My Rights gives legal information, not legal advice. For anything serious, speak to a lawyer.
                </Text>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1 },
    hero: { backgroundColor: theme.colors.primary },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    brand: { fontFamily: theme.typography.fontFamily.display, fontSize: 20, letterSpacing: -0.3, color: '#FFFFFF' },
    body: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
    headline: { ...theme.typography.displaySm, fontFamily: theme.typography.fontFamily.display },
    points: { marginTop: 24, gap: 18 },
    point: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
    pointIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    pointText: { flex: 1 },
    pointTitle: { ...theme.typography.titleMd },
    pointBody: { ...theme.typography.bodyMd, marginTop: 2 },
    footer: { paddingHorizontal: 20, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, gap: 10 },
    legal: { ...theme.typography.caption, textAlign: 'center', paddingBottom: 6 },
});
