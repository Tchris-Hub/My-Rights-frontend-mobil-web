/**
 * Legal Aid Map Screen
 * Discovery tool for nearby legal aid centers and pro-bono law firms
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CENTERS = [
    {
        id: '1',
        name: 'Legal Aid Council (Headquarters)',
        type: 'Government',
        distance: 'Abuja',
        address: '22 Port Harcourt Crescent, Garki, Abuja',
        phone: '+234 703 191 5990',
        status: 'Headquarters',
    },
    {
        id: '2',
        name: 'Legal Aid Council (Lagos)',
        type: 'Government',
        distance: 'Lagos',
        address: 'NBA Building, Ikeja High Court',
        phone: '+234 802 315 4578',
        status: 'Open 9AM - 4PM',
    },
    {
        id: '3',
        name: 'Legal Defence & Assistance Project (LEDAP)',
        type: 'NGO',
        distance: 'Lagos',
        address: 'National Office, Lagos',
        phone: '+234 1 270 5420',
        status: 'Provising Free Aid',
    },
    {
        id: '4',
        name: 'Chris Ogunbanjo LP',
        type: 'Law Firm',
        distance: 'Lagos Island',
        address: '3, Hospital Road, Lagos Island',
        phone: '+234 1 463 7439',
        status: 'Pro Bono Services',
    },
    {
        id: '5',
        name: 'Network of Pro Bono Lawyers',
        type: 'NGO',
        distance: 'Abuja',
        address: '1 63 Rd, Gwarinpa Estate, Abuja',
        phone: '+234 803 042 5562',
        status: 'Netprolaw NGO',
    },
];

export const LegalAidMapScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const [selectedType, setSelectedType] = useState('All');

    const handleCall = (phone: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alert(`Calling ${phone}...`);
    };

    const handleFilterPress = (filter: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedType(filter);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Legal Aid Near Me</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Discovery & Pro-Bono Support</Text>
                </View>
            </View>

            {/* Visual Header / Simulated Map */}
            <LinearGradient
                colors={isDark ? ['#002244', '#001122'] : ['#F0F4F8', '#DDE2E8']}
                style={styles.mapContainer}
            >
                <View style={styles.mapGrid}>
                    {/* Simulated Map Markers */}
                    <View style={[styles.marker, { top: '20%', left: '30%' }]}>
                        <View style={[styles.markerDot, { backgroundColor: theme.colors.primary }]} />
                        <View style={[styles.markerPulse, { borderColor: theme.colors.primary }]} />
                    </View>
                    <View style={[styles.marker, { top: '50%', left: '70%' }]}>
                        <View style={[styles.markerDot, { backgroundColor: theme.colors.secondary }]} />
                    </View>
                    <View style={[styles.marker, { top: '40%', left: '45%' }]}>
                        <View style={[styles.markerDot, { backgroundColor: theme.colors.success }]} />
                    </View>
                </View>

                <View style={styles.mapOverlay}>
                    <Text style={[styles.mapTitle, { color: isDark ? '#FFFFFF' : '#002244' }]}>
                        3 Centers Near You
                    </Text>
                    <View style={styles.locationBadge}>
                        <Ionicons name="location" size={12} color={theme.colors.secondary} />
                        <Text style={styles.locationText}>Lagos, Nigeria</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.filtersWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                    {['All', 'Legal Aid', 'NGO', 'Government', 'Law Firm'].map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterBtn,
                                selectedType === filter ? { backgroundColor: colors.primary } : { backgroundColor: colors.surfaceElevated1 }
                            ]}
                            onPress={() => handleFilterPress(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedType === filter ? { color: '#FFFFFF' } : { color: colors.textSecondary }
                            ]}>{filter}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {CENTERS.map(center => (
                    <TouchableOpacity
                        key={center.id}
                        style={[styles.centerCard, { backgroundColor: colors.surfaceElevated1 }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.cardInfo}>
                                <Text style={[styles.typeName, { color: colors.primary }]}>{center.type}</Text>
                                <Text style={[styles.centerName, { color: colors.text }]}>{center.name}</Text>
                            </View>
                            <View style={styles.distanceBadge}>
                                <Text style={[styles.distanceText, { color: colors.textSecondary }]}>{center.distance}</Text>
                            </View>
                        </View>

                        <View style={styles.cardDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="map-outline" size={16} color={colors.textTertiary} />
                                <Text style={[styles.detailText, { color: colors.textSecondary }]}>{center.address}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={16} color={colors.textTertiary} />
                                <Text style={[styles.detailText, { color: colors.success }]}>{center.status}</Text>
                            </View>
                        </View>

                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                                onPress={() => handleCall(center.phone)}
                            >
                                <Ionicons name="call" size={18} color={colors.onPrimary} />
                                <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Call Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: colors.border }]}>
                                <Ionicons name="navigate-outline" size={18} color={colors.primary} />
                                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Directions</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 4,
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...theme.typography.h3,
        fontSize: 22,
    },
    subtitle: {
        ...theme.typography.bodySmall,
    },
    mapContainer: {
        height: 200,
        margin: theme.spacing.lg,
        borderRadius: 32,
        overflow: 'hidden',
        position: 'relative',
    },
    mapGrid: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    marker: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        zIndex: 2,
    },
    markerPulse: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        opacity: 0.5,
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 24,
        left: 24,
    },
    mapTitle: {
        ...theme.typography.h3,
        fontSize: 24,
        marginBottom: 4,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    locationText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#002244',
    },
    filtersWrapper: {
        marginBottom: 16,
    },
    filtersScroll: {
        paddingHorizontal: theme.spacing.lg,
        gap: 10,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    filterText: {
        ...theme.typography.caption,
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 100,
        gap: 16,
    },
    centerCard: {
        padding: 24,
        borderRadius: 32,
        ...theme.shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardInfo: {
        flex: 1,
        gap: 2,
    },
    typeName: {
        ...theme.typography.caption,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    centerName: {
        ...theme.typography.h4,
        fontSize: 18,
    },
    distanceBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    distanceText: {
        fontSize: 12,
        fontWeight: '700',
    },
    cardDetails: {
        gap: 8,
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        ...theme.typography.bodySmall,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        gap: 8,
    },
    actionBtnOutline: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        gap: 8,
    },
    actionBtnText: {
        ...theme.typography.button,
        fontSize: 14,
    }
});
