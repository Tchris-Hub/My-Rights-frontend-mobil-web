/**
 * Me. Account, the things you have done in the app, and settings. Plain list, no stats dashboard.
 */
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import theme from '../../constants/theme';
import { APP_CONFIG } from '../../constants/config';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { accountService } from '../../services/account.service';

type Row = { id: string; icon: keyof typeof Ionicons.glyphMap; title: string; sub?: string; onPress: () => void };

const RowList: React.FC<{ rows: Row[] }> = ({ rows }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.line }]}>
            {rows.map((r, i) => (
                <Pressable
                    key={r.id}
                    testID={`me-${r.id}`}
                    accessibilityRole="button"
                    onPress={r.onPress}
                    style={({ pressed }) => [styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.line }, pressed && { backgroundColor: colors.surfaceContainer }]}
                >
                    <View style={[styles.icon, { backgroundColor: colors.primaryContainer }]}>
                        <Ionicons name={r.icon} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.rowText}>
                        <Text style={[styles.rowTitle, { color: colors.onSurface }]}>{r.title}</Text>
                        {r.sub ? <Text style={[styles.rowSub, { color: colors.onSurfaceVariant }]}>{r.sub}</Text> : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                </Pressable>
            ))}
        </View>
    );
};

export const ProfileHomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const { user, logout, isGuest } = useAuth();
    const [stats, setStats] = useState({ consultations: 0, enquiries: 0, saved_rights: 0 });

    useEffect(() => {
        if (isGuest) return;
        void accountService.getStats().then(setStats).catch(() => undefined);
    }, [isGuest]);

    const displayName = user?.name?.trim() || user?.email || 'Guest';
    const initial = displayName.charAt(0).toUpperCase();

    const yours: Row[] = [
        { id: 'history', icon: 'time-outline', title: 'Past conversations', sub: stats.consultations ? `${stats.consultations} saved` : 'Questions you have asked', onPress: () => navigation.navigate('ChatHistory') },
        { id: 'enquiries', icon: 'mail-open-outline', title: 'My enquiries to lawyers', sub: stats.enquiries ? `${stats.enquiries} sent` : 'Replies and status', onPress: () => navigation.navigate('LegalEnquiries') },
        { id: 'saved', icon: 'bookmark-outline', title: 'Saved rights', sub: stats.saved_rights ? `${stats.saved_rights} saved` : 'Cards you kept for later', onPress: () => navigation.navigate('SavedRights') },
        { id: 'pro', icon: 'briefcase-outline', title: 'I am a lawyer', sub: 'Manage your professional profile', onPress: () => navigation.navigate('ProfessionalProfile') },
    ];

    const app: Row[] = [
        { id: 'settings', icon: 'settings-outline', title: 'Settings', sub: 'Appearance, notifications', onPress: () => navigation.navigate('Settings') },
        { id: 'privacy', icon: 'lock-closed-outline', title: 'Privacy and your data', sub: 'What we keep, export or delete it', onPress: () => navigation.navigate('PrivacyCenter') },
        { id: 'support', icon: 'help-circle-outline', title: 'Help and feedback', onPress: () => navigation.navigate('SupportCenter') },
    ];

    return (
        <View style={[styles.root, { backgroundColor: colors.surface }]}>
            <ScreenHeader title="Me" root />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={[styles.account, { backgroundColor: colors.card, borderColor: colors.line }]}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>{initial}</Text>
                    </View>
                    <View style={styles.accountText}>
                        <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={1}>{displayName}</Text>
                        <Text style={[styles.email, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                            {isGuest ? 'Not signed in' : user?.email ?? ''}
                        </Text>
                    </View>
                    {isGuest ? <Button title="Sign in" size="small" variant="accent" onPress={() => { void logout(); }} testID="me-signin" /> : null}
                </View>

                {!isGuest ? (
                    <>
                        <Text style={[styles.section, { color: colors.onSurface }]}>Your things</Text>
                        <RowList rows={yours} />
                    </>
                ) : null}

                <Text style={[styles.section, { color: colors.onSurface }]}>The app</Text>
                <RowList rows={app} />

                {!isGuest ? (
                    <Button title="Sign out" variant="outline" fullWidth onPress={() => { void logout(); }} style={styles.signOut} testID="me-signout" />
                ) : null}
                <Text style={[styles.version, { color: colors.onSurfaceVariant }]}>My Rights {APP_CONFIG.APP_VERSION}</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 32 },
    account: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: theme.borderRadius.lg, borderWidth: 1 },
    avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontFamily: theme.typography.fontFamily.display, fontSize: 20, color: '#FFFFFF' },
    accountText: { flex: 1 },
    name: { ...theme.typography.titleMd },
    email: { ...theme.typography.caption },
    section: { ...theme.typography.titleMd, marginTop: 24, marginBottom: 10 },
    list: { borderRadius: theme.borderRadius.lg, borderWidth: 1, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 62 },
    icon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    rowText: { flex: 1 },
    rowTitle: { ...theme.typography.labelLg, fontFamily: theme.typography.fontFamily.headlineMedium },
    rowSub: { ...theme.typography.caption, marginTop: 1 },
    signOut: { marginTop: 24, alignSelf: 'stretch' },
    version: { ...theme.typography.caption, textAlign: 'center', marginTop: 16 },
});
