/**
 * Profile Home Screen
 * User profile and account information
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export const ProfileHomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Ionicons name="person" size={48} color={colors.onPrimary} />
                    </View>
                    <Text style={[styles.name, { color: colors.text }]}>
                        {user?.full_name || 'User'}
                    </Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>
                        {user?.email || 'guest@myrights.ng'}
                    </Text>
                </View>

                <View style={styles.menu}>
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: colors.border }]}
                        onPress={() => navigation.navigate('ChatHistory')}
                    >
                        <Ionicons name="chatbubbles-outline" size={24} color={colors.textSecondary} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Chat History</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: colors.border }]}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: colors.border }]}
                        onPress={() => { }}
                    >
                        <Ionicons name="help-circle-outline" size={24} color={colors.textSecondary} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: colors.border }]}
                        onPress={() => { }}
                    >
                        <Ionicons name="document-text-outline" size={24} color={colors.textSecondary} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: colors.border }]}
                        onPress={() => { }}
                    >
                        <Ionicons name="shield-checkmark-outline" size={24} color={colors.textSecondary} />
                        <Text style={[styles.menuText, { color: colors.text }]}>Terms of Service</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                <Button
                    title="Logout"
                    onPress={handleLogout}
                    variant="danger"
                    fullWidth
                    icon={<Ionicons name="log-out" size={20} color={theme.colors.onPrimary} />}
                />

                <Text style={[styles.version, { color: colors.textTertiary }]}>
                    Version 1.0.0
                </Text>
            </ScrollView>
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
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
        ...theme.shadows.md,
    },
    name: {
        ...theme.typography.h2,
        marginBottom: theme.spacing.xs,
    },
    email: {
        ...theme.typography.body,
    },
    menu: {
        marginBottom: theme.spacing.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        gap: theme.spacing.md,
    },
    menuText: {
        ...theme.typography.body,
        flex: 1,
    },
    version: {
        ...theme.typography.caption,
        textAlign: 'center',
        marginTop: theme.spacing.lg,
    },
});
