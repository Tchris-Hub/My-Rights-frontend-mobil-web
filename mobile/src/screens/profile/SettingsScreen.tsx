import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Alert,
    Dimensions,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { APP_CONFIG } from '../../constants/config';

const { width } = Dimensions.get('window');

export const SettingsScreen: React.FC = () => {
    const { colors, isDark, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const navigation = useNavigation<any>();

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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={[styles.headerSubtitle, { color: colors.primary }]}>PREFERENCES</Text>
                        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Vault Settings</Text>
                    </View>
                    <View style={[styles.headerIcon, { backgroundColor: colors.surfaceContainerHigh }]}>
                        <Ionicons name="settings" size={20} color={colors.primary} />
                    </View>
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: colors.onSurfaceVariant }]}>Visual Configuration</Text>
                    
                    <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconBox, { backgroundColor: colors.surfaceContainerHigh }]}>
                                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.settingLabel, { color: colors.onSurface }]}>Dark Mode</Text>
                                <Text style={[styles.settingDesc, { color: colors.onSurfaceVariant }]}>
                                    {isDark ? 'Nigerian Emerald (Midnight)' : 'Classic Editorial (Light)'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
                            thumbColor={colors.surface}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: colors.onSurfaceVariant }]}>Security & Legal</Text>
                    
                    <View style={[styles.multiCard, { backgroundColor: colors.surface }]}>
                        <TouchableOpacity style={styles.multiItem} onPress={() => navigation.navigate('PrivacyCenter')}>
                            <View style={styles.settingInfo}>
                                <View style={[styles.iconBox, { backgroundColor: colors.surfaceContainerHigh }]}>
                                    <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.settingLabel, { color: colors.onSurface }]}>Privacy Protocol</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
                        </TouchableOpacity>

                        <View style={[styles.separator, { backgroundColor: colors.surfaceContainerLowest }]} />

                        <TouchableOpacity style={styles.multiItem} onPress={() => void Linking.openURL(APP_CONFIG.TERMS_URL)}>
                            <View style={styles.settingInfo}>
                                <View style={[styles.iconBox, { backgroundColor: colors.surfaceContainerHigh }]}>
                                    <Ionicons name="document-text" size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.settingLabel, { color: colors.onSurface }]}>Terms of Service</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: colors.onSurfaceVariant }]}>Help & Support</Text>
                    
                    <TouchableOpacity style={[styles.settingCard, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('SupportCenter')}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconBox, { backgroundColor: colors.surfaceContainerHigh }]}>
                                <Ionicons name="help-buoy" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.settingLabel, { color: colors.onSurface }]}>Support Center</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.logoutBtn, { backgroundColor: colors.errorContainer }]}
                        onPress={handleLogout}
                    >
                        <Text style={[styles.logoutText, { color: colors.error }]}>Terminate Session</Text>
                        <Ionicons name="log-out" size={18} color={colors.error} />
                    </TouchableOpacity>
                    
                    <View style={styles.versionContainer}>
                        <Text style={[styles.versionText, { color: colors.onSurfaceVariant }]}>Digital Jurist v1.2.4</Text>
                        <Text style={[styles.builtText, { color: colors.onSurfaceVariant }]}>Emerald Build • Secured with Better Auth</Text>
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
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerSubtitle: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 4,
    },
    headerTitle: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    section: {
        marginTop: 32,
    },
    sectionHeader: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    settingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 24,
    },
    multiCard: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    multiItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    settingLabel: {
        ...theme.typography.bodyLg,
        fontWeight: '700',
    },
    settingDesc: {
        ...theme.typography.caption,
        marginTop: 2,
        opacity: 0.7,
    },
    separator: {
        height: 2,
        marginHorizontal: 16,
    },
    footer: {
        marginTop: 48,
        alignItems: 'center',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 28,
        width: '100%',
        justifyContent: 'center',
    },
    logoutText: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    versionContainer: {
        marginTop: 32,
        alignItems: 'center',
    },
    versionText: {
        ...theme.typography.bodyLg,
        fontWeight: '800',
        opacity: 0.9,
    },
    builtText: {
        ...theme.typography.caption,
        marginTop: 4,
        opacity: 0.5,
        fontWeight: '600',
    },
});

