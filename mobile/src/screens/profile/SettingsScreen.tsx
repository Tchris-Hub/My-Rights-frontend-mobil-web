/**
 * Settings. Appearance, account, legal. Nothing decorative.
 */
import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import theme from '../../constants/theme';
import { APP_CONFIG } from '../../constants/config';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

type Row = { id: string; icon: keyof typeof Ionicons.glyphMap; label: string; hint?: string; onPress?: () => void; trailing?: React.ReactNode };

const Group: React.FC<{ title: string; rows: Row[] }> = ({ title, rows }) => {
    const { colors } = useTheme();
    return (
        <View>
            <Text style={[styles.groupTitle, { color: colors.onSurface }]}>{title}</Text>
            <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.line }]}>
                {rows.map((r, i) => (
                    <Pressable
                        key={r.id}
                        accessibilityRole={r.onPress ? 'button' : undefined}
                        disabled={!r.onPress}
                        onPress={r.onPress}
                        style={({ pressed }) => [styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.line }, pressed && { backgroundColor: colors.surfaceContainer }]}
                    >
                        <Ionicons name={r.icon} size={22} color={colors.primary} />
                        <View style={styles.rowText}>
                            <Text style={[styles.label, { color: colors.onSurface }]}>{r.label}</Text>
                            {r.hint ? <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>{r.hint}</Text> : null}
                        </View>
                        {r.trailing ?? (r.onPress ? <Ionicons name="chevron-forward" size={18} color={colors.outline} /> : null)}
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

export const SettingsScreen: React.FC = () => {
    const { colors, isDark, toggleTheme } = useTheme();
    const { logout, isGuest } = useAuth();
    const navigation = useNavigation<any>();

    const confirmLogout = () =>
        Alert.alert('Sign out?', 'Your saved conversations stay on your account.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: () => void logout() },
        ]);

    return (
        <View style={[styles.root, { backgroundColor: colors.surface }]}>
            <ScreenHeader title="Settings" />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {!isGuest ? <Group title="Account" rows={[{ id: 'edit', icon: 'person-outline', label: 'Edit profile', onPress: () => navigation.navigate('EditProfile') }]} /> : null}

                <Group
                    title="Appearance"
                    rows={[
                        {
                            id: 'dark',
                            icon: isDark ? 'moon-outline' : 'sunny-outline',
                            label: 'Dark mode',
                            hint: isDark ? 'On' : 'Off',
                            trailing: <Switch value={isDark} onValueChange={() => void toggleTheme()} trackColor={{ false: colors.outlineVariant, true: colors.primary }} thumbColor="#FFFFFF" />,
                        },
                    ]}
                />

                <Group
                    title="Legal"
                    rows={[
                        { id: 'privacy', icon: 'lock-closed-outline', label: 'Privacy and your data', onPress: () => navigation.navigate('PrivacyCenter') },
                        { id: 'terms', icon: 'document-text-outline', label: 'Terms of service', onPress: () => void Linking.openURL(APP_CONFIG.TERMS_URL) },
                        { id: 'help', icon: 'help-circle-outline', label: 'Help and feedback', onPress: () => navigation.navigate('SupportCenter') },
                    ]}
                />

                {!isGuest ? <Button title="Sign out" variant="outline" fullWidth onPress={confirmLogout} /> : null}
                <Text style={[styles.version, { color: colors.onSurfaceVariant }]}>My Rights {APP_CONFIG.APP_VERSION}</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 32, gap: 22 },
    groupTitle: { ...theme.typography.titleMd, marginBottom: 10 },
    group: { borderRadius: theme.borderRadius.lg, borderWidth: 1, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 56 },
    rowText: { flex: 1 },
    label: { ...theme.typography.labelLg, fontFamily: theme.typography.fontFamily.headlineMedium },
    hint: { ...theme.typography.caption },
    version: { ...theme.typography.caption, textAlign: 'center' },
});
