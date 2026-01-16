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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export const SettingsScreen: React.FC = () => {
    const { colors, isDark, toggleTheme } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="settings" size={48} color={colors.primary} />
                    <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>

                    <View style={[styles.setting, { borderBottomColor: colors.border }]}>
                        <View style={styles.settingLeft}>
                            <Ionicons name={isDark ? 'moon' : 'sunny'} size={24} color={colors.textSecondary} />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    {isDark ? 'Enabled' : 'Disabled'}
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
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>

                    <View style={[styles.setting, { borderBottomWidth: 0 }]}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="information-circle" size={24} color={colors.textSecondary} />
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
                                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                    1.0.0
                                </Text>
                            </View>
                        </View>
                    </View>
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
    content: {
        padding: theme.spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    title: {
        ...theme.typography.h2,
        marginTop: theme.spacing.md,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.caption,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: theme.spacing.md,
    },
    setting: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        flex: 1,
    },
    settingText: {
        flex: 1,
    },
    settingLabel: {
        ...theme.typography.body,
        marginBottom: 2,
    },
    settingDescription: {
        ...theme.typography.caption,
    },
});

