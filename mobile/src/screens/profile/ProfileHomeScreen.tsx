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
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';

export const ProfileHomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const { user, logout, isGuest } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Animated.View
                        style={[styles.avatar, { backgroundColor: colors.primary }]}
                        entering={ZoomIn.duration(600).springify()}
                    >
                        <Ionicons name="person" size={48} color={colors.onPrimary} />
                    </Animated.View>
                    <Text style={[styles.name, { color: colors.text }]}>
                        {user?.full_name || 'User'}
                    </Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>
                        {user?.email || 'guest@myrights.ng'}
                    </Text>
                </View>

                <Animated.View style={styles.menu} entering={FadeInUp.delay(200).springify()}>
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: colors.border }]}
                        onPress={() => {
                            if (isGuest) {
                                Alert.alert(
                                    "Locked Feature",
                                    "Chat history is only available for registered accounts. Would you like to sign up now?",
                                    [
                                        { text: "Later", style: "cancel" },
                                        { text: "Sign Up", onPress: () => logout() }
                                    ]
                                );
                            } else {
                                navigation.navigate('ChatHistory');
                            }
                        }}
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
                </Animated.View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out-outline" size={20} color="#000000" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

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
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 16,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: theme.colors.error,
        marginTop: 8,
        ...theme.shadows.lg,
    },
    logoutText: {
        ...theme.typography.button,
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
});
