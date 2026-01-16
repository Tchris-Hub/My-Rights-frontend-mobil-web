/**
 * Home Screen - Premium Landing Experience
 * "Minimal Grenade" redesign: High impact, compact UI with world-class aesthetics
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/ui/Card';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const QUICK_ACTIONS = [
    {
        id: '1',
        title: 'Report Dispute',
        icon: 'warning',
        color: '#EF4444',
        route: 'Chat',
        params: { initialMessage: 'I want to report a legal dispute.' }
    },
    {
        id: '2',
        title: 'Review Rent',
        icon: 'home',
        color: '#F59E0B',
        route: 'Tools',
        params: { screen: 'DocumentReview' }
    },
    {
        id: '3',
        title: 'Get Help',
        icon: 'help-buoy',
        color: '#10B981',
        route: 'Chat'
    },
    {
        id: '4',
        title: 'Daily Tip',
        icon: 'bulb',
        color: '#3B82F6',
        route: 'Home'
    },
];

export const HomeScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<any>();

    const handleActionPress = (action: typeof QUICK_ACTIONS[0]) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (action.route) {
            navigation.navigate(action.route, action.params);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <LinearGradient
                    colors={isDark ? ['#002244', '#001122'] : [theme.colors.primary, theme.colors.primaryDark]}
                    style={styles.hero}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.heroHeader}>
                            <View>
                                <Text style={styles.greeting}>
                                    {user?.full_name ? `Hello, ${user.full_name.split(' ')[0]}!` : 'Welcome back'}
                                </Text>
                                <Text style={styles.heroTitle}>Your Rights, Secured.</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.profileBadge}
                                onPress={() => navigation.navigate('Profile')}
                            >
                                <Ionicons name="person-circle" size={40} color={theme.colors.secondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.heroNotice}>
                            <BlurView intensity={20} tint="light" style={styles.noticeBlur}>
                                <View style={styles.noticeContent}>
                                    <Ionicons name="shield-checkmark" size={20} color={theme.colors.secondary} />
                                    <Text style={styles.noticeText}>
                                        AI Agent online: Constitution 1999 verified.
                                    </Text>
                                </View>
                            </BlurView>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Actions Carousel */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.actionsContainer}
                    >
                        {QUICK_ACTIONS.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={[styles.actionCard, { backgroundColor: colors.surfaceElevated1 }]}
                                onPress={() => handleActionPress(action)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                                </View>
                                <Text style={[styles.actionText, { color: colors.text }]}>{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Main Features */}
                <View style={[styles.section, styles.lastSection]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Core Power Tools</Text>

                    <TouchableOpacity
                        style={[styles.featureCardLarge, { backgroundColor: colors.surfaceElevated1 }]}
                        onPress={() => navigation.navigate('Chat')}
                    >
                        <LinearGradient
                            colors={['#3B82F615', '#3B82F605']}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.featureIconLarge}>
                            <Ionicons name="chatbubbles" size={32} color="#3B82F6" />
                        </View>
                        <View style={styles.featureInfo}>
                            <Text style={[styles.featureTitle, { color: colors.text }]}>Legal Chat Assistant</Text>
                            <Text style={[styles.featureSubtitle, { color: colors.textSecondary }]}>
                                Consult with our AI agent on any legal matter in seconds.
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    <View style={styles.featureGrid}>
                        <TouchableOpacity
                            style={[styles.featureCardSmall, { backgroundColor: colors.surfaceElevated1 }]}
                            onPress={() => navigation.navigate('Tools', { screen: 'DocumentGenerate' })}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#3B82F615' }]}>
                                <Ionicons name="document-attach" size={24} color="#3B82F6" />
                            </View>
                            <Text style={[styles.featureTitleSmall, { color: colors.text }]}>Architect</Text>
                            <Text style={[styles.featureSubtitleSmall, { color: colors.textSecondary }]}>Draft legal docs</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.featureCardSmall, { backgroundColor: colors.surfaceElevated1 }]}
                            onPress={() => navigation.navigate('Tools', { screen: 'ConstitutionExplorer' })}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#F59E0B15' }]}>
                                <Ionicons name="book" size={24} color="#F59E0B" />
                            </View>
                            <Text style={[styles.featureTitleSmall, { color: colors.text }]}>Constitution</Text>
                            <Text style={[styles.featureSubtitleSmall, { color: colors.textSecondary }]}>Browse laws</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Daily Tip Section */}
                    <Card elevation="md" style={styles.tipCard}>
                        <LinearGradient
                            colors={isDark ? ['#003366', '#002244'] : ['#F0F9FF', '#E0F2FE']}
                            style={styles.tipGradient}
                        >
                            <View style={styles.tipHeader}>
                                <Ionicons name="bulb" size={20} color={theme.colors.secondary} />
                                <Text style={[styles.tipTitle, { color: colors.text }]}>Legal Tip of the Day</Text>
                            </View>
                            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                Section 36 ensures you are innocent until proven guilty. Always demand your right to a fair hearing.
                            </Text>
                            <TouchableOpacity style={styles.tipAction}>
                                <Text style={[styles.tipActionText, { color: colors.primary }]}>Learn more</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: 100, // Space for tab bar
    },
    /* Hero Section */
    hero: {
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: theme.spacing.lg,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        ...theme.shadows.lg,
    },
    heroContent: {
        gap: 24,
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        ...theme.typography.body,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
    },
    heroTitle: {
        ...theme.typography.h2,
        color: '#FFFFFF',
        marginTop: 4,
    },
    profileBadge: {
        padding: 4,
    },
    heroNotice: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    noticeBlur: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    noticeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    noticeText: {
        ...theme.typography.bodySmall,
        color: '#FFFFFF',
        fontWeight: '600',
    },

    /* Sections */
    section: {
        marginTop: 32,
    },
    sectionTitle: {
        ...theme.typography.h4,
        marginHorizontal: theme.spacing.lg,
        marginBottom: 16,
    },

    /* Actions Carousel */
    actionsContainer: {
        paddingHorizontal: theme.spacing.lg,
        gap: 12,
    },
    actionCard: {
        width: 110,
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        gap: 8,
        ...theme.shadows.sm,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        ...theme.typography.caption,
        fontWeight: '700',
        textAlign: 'center',
    },

    /* Feature Cards */
    featureCardLarge: {
        marginHorizontal: theme.spacing.lg,
        padding: 24,
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        overflow: 'hidden',
        ...theme.shadows.md,
        marginBottom: 16,
    },
    featureIconLarge: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.sm,
    },
    featureInfo: {
        flex: 1,
    },
    featureTitle: {
        ...theme.typography.h4,
        fontSize: 18,
        marginBottom: 4,
    },
    featureSubtitle: {
        ...theme.typography.bodySmall,
        lineHeight: 18,
    },

    featureGrid: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        gap: 16,
    },
    featureCardSmall: {
        flex: 1,
        padding: 20,
        borderRadius: 28,
        gap: 12,
        ...theme.shadows.sm,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureTitleSmall: {
        ...theme.typography.h4,
        fontSize: 16,
    },
    featureSubtitleSmall: {
        ...theme.typography.caption,
    },

    lastSection: {
        marginBottom: 40,
    },
    /* Tip Card */
    tipCard: {
        marginHorizontal: theme.spacing.lg,
        marginTop: 32,
        borderRadius: 32,
        overflow: 'hidden',
    },
    tipGradient: {
        padding: 24,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    tipTitle: {
        ...theme.typography.h4,
        fontSize: 16,
    },
    tipText: {
        ...theme.typography.bodySmall,
        lineHeight: 20,
        marginBottom: 16,
    },
    tipAction: {
        alignSelf: 'flex-start',
    },
    tipActionText: {
        ...theme.typography.caption,
        fontWeight: '800',
    }
});
