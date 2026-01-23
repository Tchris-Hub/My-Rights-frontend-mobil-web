/**
 * Settings Screen
 * App preferences and configuration
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export const SettingsScreen: React.FC = () => {
    const { colors, isDark, toggleTheme } = useTheme();
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out of your legal vault?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: logout }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                    <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>

                    <View style={[styles.setting, { borderBottomColor: colors.border }]}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
                            </View>
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    {isDark ? 'High-contrast emerald theme' : 'Standard clean theme'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.onPrimary}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Support & Legal</Text>

                    <TouchableOpacity style={[styles.setting, { borderBottomColor: colors.border }]}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                                <Ionicons name="shield-checkmark" size={20} color="#D4AF37" />
                            </View>
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.setting, { borderBottomColor: colors.border }]}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 107, 63, 0.1)' }]}>
                                <Ionicons name="help-buoy" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Help Center</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, { marginTop: 20 }]}>
                    <TouchableOpacity
                        style={[styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                        <Text style={styles.logoutText}>Logout of Vault</Text>
                    </TouchableOpacity>
                    <Text style={styles.versionText}>Version 1.0.0 (Nigerian Emerald Build)</Text>
                </View>
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
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.md,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        ...theme.typography.h2,
        fontSize: 28,
    },
    content: {
        padding: theme.spacing.lg,
        paddingTop: 0,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.caption,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: theme.spacing.md,
        letterSpacing: 1.5,
    },
    setting: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        flex: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingText: {
        flex: 1,
    },
    settingLabel: {
        ...theme.typography.body,
        fontWeight: '600',
        marginBottom: 2,
    },
    settingDescription: {
        ...theme.typography.caption,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#FF3B30',
        backgroundColor: 'transparent',
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '700',
    },
    versionText: {
        textAlign: 'center',
        marginTop: 20,
        color: 'rgba(0,0,0,0.3)',
        fontSize: 12,
        fontWeight: '500',
    },
});

