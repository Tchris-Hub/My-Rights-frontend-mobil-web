/**
 * Profile Home Screen
 * User profile and account information
 */

import React, { useEffect, useState } from 'react';
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
import { BlurView } from 'expo-blur';
import { accountService } from '../../services/account.service';

export const ProfileHomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const { user, logout, isGuest } = useAuth();
    const [stats, setStats] = useState({ consultations: 0, enquiries: 0, saved_rights: 0 });

    useEffect(() => {
        if (isGuest) return;
        void accountService.getStats().then(setStats).catch(() => undefined);
    }, [isGuest]);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            {/* Background Layering */}
            <View style={StyleSheet.absoluteFill}>
                <View style={[styles.blob1, { backgroundColor: colors.primary + '10' }]} />
                <View style={[styles.blob2, { backgroundColor: colors.secondary + '05' }]} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View 
                    entering={FadeInUp.duration(600).springify()}
                    style={styles.header}
                >
                    <View style={styles.headerTop}>
                        <View style={[styles.avatarWrapper, { backgroundColor: colors.surfaceContainerHighest }]}>
                            <Ionicons name="person" size={32} color={colors.primary} />
                        </View>
                        <TouchableOpacity 
                            style={[styles.settingsButton, { backgroundColor: colors.surfaceContainerHigh }]}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Ionicons name="settings-sharp" size={20} color={colors.onSurface} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.titleSection}>
                        <Text style={[styles.greeting, { color: colors.onSurfaceVariant }]}>
                            {isGuest ? 'Welcome,' : 'Good Day,'}
                        </Text>
                        <Text style={[styles.name, { color: colors.onSurface }]}>
                            {user?.name?.split(' ')[0] || 'Jurist'}
                        </Text>
                        <View style={[styles.roleBadge, { backgroundColor: colors.primary + '15' }]}>
                            <Text style={[styles.roleText, { color: colors.primary }]}>
                                {isGuest ? 'Public Observer' : 'Member'}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View 
                    entering={FadeInUp.delay(200).duration(600).springify()}
                    style={styles.statsContainer}
                >
                    <View style={[styles.statBox, { backgroundColor: colors.surfaceContainerLow }]}>
                        <Text style={[styles.statValue, { color: colors.onSurface }]}>{stats.consultations}</Text>
                        <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Consultations</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: colors.surfaceContainerLow }]}>
                        <Text style={[styles.statValue, { color: colors.onSurface }]}>{stats.saved_rights}</Text>
                        <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Saved Rights</Text>
                    </View>
                </Animated.View>

                <Animated.View 
                    entering={FadeInUp.delay(400).duration(600).springify()}
                    style={styles.menuSection}
                >
                    <Text style={[styles.sectionHeader, { color: colors.onSurfaceVariant }]}>Your Legal Vault</Text>
                    
                    <View style={[styles.menuCard, { backgroundColor: colors.surfaceContainerHigh }]}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                if (isGuest) {
                                    Alert.alert(
                                        "Locked Feature",
                                        "Chat history is only available for registered accounts.",
                                        [
                                            { text: "Later", style: "cancel" },
                                            { text: "Sign in", onPress: () => logout() }
                                        ]
                                    );
                                } else {
                                    navigation.navigate('ChatHistory');
                                }
                            }}
                        >
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="chatbubbles" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.menuTextContent}>
                                <Text style={[styles.menuTitle, { color: colors.onSurface }]}>Consultation History</Text>
                                <Text style={[styles.menuSub, { color: colors.onSurfaceVariant }]}>Review past legal briefings</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '30' }]} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                if (!isGuest) navigation.navigate('LegalEnquiries');
                            }}
                        >
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.menuTextContent}>
                                <Text style={[styles.menuTitle, { color: colors.onSurface }]}>Legal Enquiries</Text>
                                <Text style={[styles.menuSub, { color: colors.onSurfaceVariant }]}>Track requests and manage your professional inbox</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '30' }]} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                if (!isGuest) navigation.navigate('ProfessionalProfile');
                            }}
                        >
                            <View style={[styles.iconBox, { backgroundColor: colors.secondary + '15' }]}>
                                <Ionicons name="briefcase-outline" size={20} color={colors.secondary} />
                            </View>
                            <View style={styles.menuTextContent}>
                                <Text style={[styles.menuTitle, { color: colors.onSurface }]}>Professional Profile</Text>
                                <Text style={[styles.menuSub, { color: colors.onSurfaceVariant }]}>Manage your legal marketplace profile</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '30' }]} />

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.iconBox, { backgroundColor: colors.secondary + '15' }]}>
                                <Ionicons name="document-text" size={20} color={colors.secondary} />
                            </View>
                            <View style={styles.menuTextContent}>
                                <Text style={[styles.menuTitle, { color: colors.onSurface }]}>Saved Rights</Text>
                                <Text style={[styles.menuSub, { color: colors.onSurfaceVariant }]}>Quick access to your bookmarks</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.sectionHeader, { color: colors.onSurfaceVariant, marginTop: 32 }]}>Application</Text>

                    <View style={[styles.menuCard, { backgroundColor: colors.surfaceContainerHigh }]}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
                                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.menuTitle, { color: colors.onSurface, flex: 1 }]}>Security & Privacy</Text>
                            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '30' }]} />

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.iconBox, { backgroundColor: colors.onSurfaceVariant + '15' }]}>
                                <Ionicons name="information-circle" size={20} color={colors.onSurface} />
                            </View>
                            <Text style={[styles.menuTitle, { color: colors.onSurface, flex: 1 }]}>Legal Notices</Text>
                            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View 
                    entering={FadeInUp.delay(600).duration(600).springify()}
                    style={styles.footer}
                >
                    <TouchableOpacity
                        style={[styles.logoutButton, { borderColor: colors.error + '40' }]}
                        onPress={handleLogout}
                    >
                        <Text style={[styles.logoutText, { color: colors.error }]}>End Session</Text>
                        <Ionicons name="log-out-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                    <Text style={[styles.version, { color: colors.onSurfaceVariant }]}>
                        DIGITAL JURIST v1.0.4
                    </Text>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    blob1: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    blob2: {
        position: 'absolute',
        bottom: 50,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
    },
    header: {
        marginBottom: 32,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarWrapper: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleSection: {
        gap: 2,
    },
    greeting: {
        fontFamily: theme.typography.fontFamily.bodyMedium,
        fontSize: 16,
        letterSpacing: 0.2,
    },
    name: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 40,
        fontWeight: '700',
        letterSpacing: -1.2,
        lineHeight: 48,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 8,
    },
    roleText: {
        fontFamily: theme.typography.fontFamily.bodyBold,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
    },
    statBox: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    statValue: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.48,
    },
    statLabel: {
        fontFamily: theme.typography.fontFamily.body,
        fontSize: 12,
        opacity: 0.7,
    },
    menuSection: {
        marginBottom: 32,
    },
    sectionHeader: {
        fontFamily: theme.typography.fontFamily.bodyBold,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 16,
        paddingLeft: 4,
    },
    menuCard: {
        borderRadius: 28,
        overflow: 'hidden',
        padding: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuTextContent: {
        flex: 1,
        gap: 2,
    },
    menuTitle: {
        fontFamily: theme.typography.fontFamily.bodyBold,
        fontSize: 16,
    },
    menuSub: {
        fontFamily: theme.typography.fontFamily.body,
        fontSize: 12,
        opacity: 0.7,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    footer: {
        alignItems: 'center',
        gap: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    logoutText: {
        fontFamily: theme.typography.fontFamily.bodyBold,
        fontSize: 14,
        letterSpacing: 0.5,
    },
    version: {
        fontFamily: theme.typography.fontFamily.bodyMedium,
        fontSize: 10,
        letterSpacing: 1,
        opacity: 0.4,
    },
});
