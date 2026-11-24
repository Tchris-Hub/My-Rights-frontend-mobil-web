/**
 * Get help: the human side. Legal aid offices, your enquiries to lawyers, and the emergency number.
 */
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export const HelpHomeScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    const rows: Array<{ id: string; icon: keyof typeof Ionicons.glyphMap; title: string; body: string; onPress: () => void }> = [
        {
            id: 'map',
            icon: 'location-outline',
            title: 'Legal aid near me',
            body: 'Free and low-cost legal offices on a map, with phone numbers.',
            onPress: () => navigation.navigate('LegalAidMap'),
        },
        {
            id: 'enquiries',
            icon: 'mail-open-outline',
            title: 'My enquiries to lawyers',
            body: 'Check the replies to questions you sent to a lawyer.',
            onPress: () => navigation.navigate('MeTab', { screen: 'LegalEnquiries' }),
        },
        {
            id: 'call',
            icon: 'call-outline',
            title: 'Emergency: call 112',
            body: 'For immediate danger. Works from any network in Nigeria.',
            onPress: () => Linking.openURL('tel:112'),
        },
    ];

    return (
        <View style={[styles.root, { backgroundColor: colors.surface }]}>
            <ScreenHeader title="Get help" root />
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={[styles.lead, { color: colors.onSurfaceVariant }]}>
                    An app cannot stand next to you in a police station or a court. These can.
                </Text>
                <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.line }]}>
                    {rows.map((r, i) => (
                        <Pressable
                            key={r.id}
                            testID={`help-${r.id}`}
                            accessibilityRole="button"
                            onPress={r.onPress}
                            style={({ pressed }) => [styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.line }, pressed && { backgroundColor: colors.surfaceContainer }]}
                        >
                            <View style={[styles.icon, { backgroundColor: r.id === 'call' ? colors.errorContainer : colors.primaryContainer }]}>
                                <Ionicons name={r.icon} size={22} color={r.id === 'call' ? colors.error : colors.primary} />
                            </View>
                            <View style={styles.text}>
                                <Text style={[styles.title, { color: colors.onSurface }]}>{r.title}</Text>
                                <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>{r.body}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1 },
    scroll: { padding: 16 },
    lead: { ...theme.typography.bodyLg, marginBottom: 16 },
    list: { borderRadius: theme.borderRadius.lg, borderWidth: 1, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 76 },
    icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    text: { flex: 1 },
    title: { ...theme.typography.titleMd },
    body: { ...theme.typography.bodyMd, marginTop: 2 },
});
