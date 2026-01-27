import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
    Linking,
    ActivityIndicator,
    Alert,
    SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Center {
    id: string;
    name: string;
    type: string;
    distance: string;
    address: string;
    phone: string;
    status: string;
    latitude: number;
    longitude: number;
    rating: number;
    reviews: number;
    credibility: 'Highly Recommended' | 'Verified Partner' | 'pro-bono';
}

interface Lawyer {
    id: string;
    name: string;
    category: string;
    experience: number;
    casesWon: number;
    rating: number;
    reviews: number;
    credibility: 'Highly Recommended' | 'Verified Professional' | 'Rising Star';
    location: string;
    image?: string;
}

type SectionData = {
    title: string;
    data: (Center | Lawyer)[];
};

const CENTERS: Center[] = [
    {
        id: '1',
        name: 'Legal Aid Council (Headquarters)',
        type: 'Government',
        distance: 'Abuja',
        address: '22 Port Harcourt Crescent, Garki, Abuja',
        phone: '+234 703 191 5990',
        status: 'Headquarters',
        latitude: 9.0435,
        longitude: 7.4931,
        rating: 4.8,
        reviews: 124,
        credibility: 'Verified Partner',
    },
    {
        id: '2',
        name: 'Legal Aid Council (Lagos)',
        type: 'Government',
        distance: 'Ikeja',
        address: 'NBA Building, Ikeja High Court',
        phone: '+234 802 315 4578',
        status: 'Open 9AM - 4PM',
        latitude: 6.6018,
        longitude: 3.3515,
        rating: 4.5,
        reviews: 89,
        credibility: 'Verified Partner',
    },
    {
        id: '3',
        name: 'Legal Defence & Assistance Project (LEDAP)',
        type: 'NGO',
        distance: 'Lagos',
        address: 'National Office, Lagos',
        phone: '+234 1 270 5420',
        status: 'Providing Free Aid',
        latitude: 6.4526,
        longitude: 3.3934,
        rating: 4.9,
        reviews: 210,
        credibility: 'Highly Recommended',
    },
    {
        id: '4',
        name: 'Network of Pro Bono Lawyers',
        type: 'NGO',
        distance: 'Abuja',
        address: '1 63 Rd, Gwarinpa Estate, Abuja',
        phone: '+234 803 042 5562',
        status: 'Netprolaw NGO',
        latitude: 9.1005,
        longitude: 7.3915,
        rating: 4.6,
        reviews: 74,
        credibility: 'Highly Recommended',
    },
    {
        id: '5',
        name: 'Chris Ogunbanjo LP',
        type: 'Law Firm',
        distance: 'Lagos Island',
        address: '3, Hospital Road, Lagos Island',
        phone: '+234 1 463 7439',
        status: 'Pro Bono Services',
        latitude: 6.4468,
        longitude: 3.4019,
        rating: 4.7,
        reviews: 156,
        credibility: 'pro-bono',
    },
];

const LAWYERS: Lawyer[] = [
    {
        id: '1',
        name: 'Adebayo Olakunle, PhD',
        category: 'Criminal Law',
        experience: 15,
        casesWon: 142,
        rating: 4.9,
        reviews: 86,
        credibility: 'Highly Recommended',
        location: 'Victoria Island, Lagos',
    },
    {
        id: '2',
        name: 'Chinelo Ezenwa',
        category: 'Family Law',
        experience: 8,
        casesWon: 67,
        rating: 4.7,
        reviews: 42,
        credibility: 'Verified Professional',
        location: 'Enugu, Nigeria',
    },
    {
        id: '3',
        name: 'Musa Ibrahim',
        category: 'Property Law',
        experience: 12,
        casesWon: 95,
        rating: 4.8,
        reviews: 110,
        credibility: 'Verified Professional',
        location: 'Maitama, Abuja',
    },
    {
        id: '4',
        name: 'Tunde Bakare',
        category: 'Human Rights',
        experience: 20,
        casesWon: 215,
        rating: 5.0,
        reviews: 184,
        credibility: 'Highly Recommended',
        location: 'Surulere, Lagos',
    },
    {
        id: '5',
        name: 'Zainab Yusuf',
        category: 'Consumer Rights',
        experience: 5,
        casesWon: 34,
        rating: 4.5,
        reviews: 28,
        credibility: 'Rising Star',
        location: 'Kaduna, Nigeria',
    },
];

export const LegalAidMapScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const [selectedType, setSelectedType] = useState('All');
    const [viewMode, setViewMode] = useState<'centers' | 'experts'>('centers');
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);
            } catch (error) {
                console.error('Location error:', error);
            }
        })();
    }, []);

    const handleCall = (phone: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Coming Soon", "Direct contact features are currently being verified to ensure secure legal representation.");
    };

    const handleDirections = async (lat: number, lng: number, name: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert("Coming Soon", "Secure location navigation will be available once the legal center's physical verification is complete.");
    };

    const handleFilterPress = (filter: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedType(filter);
    };

    const filteredCenters = selectedType === 'All'
        ? CENTERS
        : CENTERS.filter(c => c.type === selectedType);

    const filteredLawyers = selectedType === 'All'
        ? LAWYERS
        : LAWYERS.filter(l => l.category.includes(selectedType));

    const initialRegion = {
        latitude: location?.coords.latitude || 9.0435,
        longitude: location?.coords.longitude || 7.4931,
        latitudeDelta: 12,
        longitudeDelta: 12,
    };

    const sections: SectionData[] = viewMode === 'centers'
        ? [{ title: `Verified Organizations (${filteredCenters.length})`, data: filteredCenters }]
        : [{ title: `Legal Experts (${filteredLawyers.length})`, data: filteredLawyers }];

    const renderItem = ({ item, index }: { item: Center | Lawyer; index: number }) => {
        if (viewMode === 'centers') {
            const center = item as Center;
            return (
                <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                    <TouchableOpacity
                        style={[styles.centerCard, { backgroundColor: colors.surfaceElevated1 }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.cardInfo}>
                                <View style={styles.typeRow}>
                                    <Text style={[styles.typeName, { color: colors.primary }]}>{center.type}</Text>
                                    <View style={[styles.badge, { backgroundColor: center.credibility === 'Highly Recommended' ? '#FFD70020' : colors.primary + '10' }]}>
                                        <Ionicons
                                            name={center.credibility === 'Highly Recommended' ? 'star' : 'checkmark-circle'}
                                            size={10}
                                            color={center.credibility === 'Highly Recommended' ? '#D4AF37' : colors.primary}
                                        />
                                        <Text style={[styles.badgeText, { color: center.credibility === 'Highly Recommended' ? '#B8941F' : colors.primary }]}>
                                            {center.credibility}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.centerName, { color: colors.text }]}>{center.name}</Text>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={14} color="#D4AF37" />
                                    <Text style={[styles.ratingText, { color: colors.text }]}>{center.rating}</Text>
                                    <Text style={[styles.reviewsText, { color: colors.textTertiary }]}>({center.reviews} reviews)</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.cardDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="map-outline" size={16} color={colors.textTertiary} />
                                <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>{center.address}</Text>
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
                            <TouchableOpacity
                                style={[styles.actionBtnOutline, { borderColor: colors.border }]}
                                onPress={() => handleDirections(center.latitude, center.longitude, center.name)}
                            >
                                <Ionicons name="navigate-outline" size={18} color={colors.primary} />
                                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Directions</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            );
        } else {
            const lawyer = item as Lawyer;
            return (
                <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                    <TouchableOpacity
                        style={[styles.centerCard, { backgroundColor: colors.surfaceElevated1 }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.cardInfo}>
                                <View style={styles.typeRow}>
                                    <Text style={[styles.typeName, { color: colors.primary }]}>{lawyer.category}</Text>
                                    <View style={[styles.badge, { backgroundColor: lawyer.credibility === 'Highly Recommended' ? '#FFD70020' : colors.primary + '10' }]}>
                                        <Ionicons
                                            name={lawyer.credibility === 'Highly Recommended' ? 'star' : 'checkmark-circle'}
                                            size={10}
                                            color={lawyer.credibility === 'Highly Recommended' ? '#D4AF37' : colors.primary}
                                        />
                                        <Text style={[styles.badgeText, { color: lawyer.credibility === 'Highly Recommended' ? '#B8941F' : colors.primary }]}>
                                            {lawyer.credibility}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.centerName, { color: colors.text }]}>{lawyer.name}</Text>

                                <View style={styles.metricsRow}>
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>Exp.</Text>
                                        <Text style={[styles.metricValue, { color: colors.text }]}>{lawyer.experience}y</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricLabel, { color: colors.textTertiary }]}>Wins</Text>
                                        <Text style={[styles.metricValue, { color: colors.text }]}>{lawyer.casesWon}+</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.ratingRowSmall}>
                                        <Ionicons name="star" size={12} color="#D4AF37" />
                                        <Text style={[styles.ratingTextSmall, { color: colors.text }]}>{lawyer.rating}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.cardDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={16} color={colors.textTertiary} />
                                <Text style={[styles.detailText, { color: colors.textSecondary }]}>{lawyer.location}</Text>
                            </View>
                        </View>

                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                                onPress={() => handleCall('000')}
                            >
                                <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.onPrimary} />
                                <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Contact</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtnOutline, { borderColor: colors.border }]}
                                onPress={() => handleDirections(0, 0, lawyer.name)}
                            >
                                <Ionicons name="folder-open-outline" size={18} color={colors.primary} />
                                <Text style={[styles.actionBtnText, { color: colors.primary }]}>View Bio</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            );
        }
    };

    const renderHeader = () => (
        <View style={styles.mapContainer}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton
                showsCompass
                userInterfaceStyle={isDark ? 'dark' : 'light'}
            >
                {filteredCenters.map(center => (
                    <Marker
                        key={center.id}
                        coordinate={{ latitude: center.latitude, longitude: center.longitude }}
                        pinColor={center.type === 'Government' ? colors.primary : center.type === 'NGO' ? colors.success : colors.secondary}
                    >
                        <Callout onPress={() => handleDirections(center.latitude, center.longitude, center.name)}>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{center.name}</Text>
                                <Text style={styles.calloutSub}>{center.address}</Text>
                                <View style={styles.calloutActionBadge}>
                                    <Ionicons name="navigate" size={12} color="#FFF" />
                                    <Text style={styles.calloutAction}>Directions</Text>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>
    );

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
                    <Text style={[styles.title, { color: colors.text }]}>Legal Aid Discovery</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Connect with Verified Legal Experts</Text>
                </View>
            </View>

            {/* Discovery Mode Toggle */}
            <View style={styles.navToggleContainer}>
                <View style={[styles.navToggle, { backgroundColor: colors.surfaceElevated1 }]}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'centers' && { backgroundColor: colors.primary }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setViewMode('centers');
                            setSelectedType('All');
                        }}
                    >
                        <Ionicons name="business" size={16} color={viewMode === 'centers' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.toggleText, { color: viewMode === 'centers' ? '#FFF' : colors.textSecondary }]}>Legal Centers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'experts' && { backgroundColor: colors.primary }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setViewMode('experts');
                            setSelectedType('All');
                        }}
                    >
                        <Ionicons name="people" size={16} color={viewMode === 'experts' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.toggleText, { color: viewMode === 'experts' ? '#FFF' : colors.textSecondary }]}>Expert Search</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filters Wrapper */}
            <View style={styles.filtersWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersScroll}
                >
                    {(viewMode === 'centers' ? ['All', 'NGO', 'Government', 'Law Firm'] : ['All', 'Criminal Law', 'Family Law', 'Property Law', 'Human Rights', 'Consumer Rights']).map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterBtn,
                                selectedType === filter ? { backgroundColor: colors.primary + '15', borderColor: colors.primary } : { backgroundColor: colors.surfaceElevated1, borderColor: colors.border }
                            ]}
                            onPress={() => handleFilterPress(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedType === filter ? { color: colors.primary } : { color: colors.textSecondary }
                            ]}>{filter}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

        <View style={{ flex: 1 }}>
            <SectionList
                sections={sections}
                keyExtractor={(item: Center | Lawyer, index: number) => `${item.id}-${index}`}
                renderItem={renderItem}
                renderSectionHeader={({ section }: { section: SectionData }) => (
                    <View style={{ backgroundColor: colors.background, paddingBottom: 10, paddingTop: 10 }}>
                        <Text style={[styles.sectionTitle, { color: colors.textTertiary, paddingHorizontal: theme.spacing.lg }]}>{section.title}</Text>
                    </View>
                )}
                ListHeaderComponent={renderHeader}
                stickySectionHeadersEnabled={true}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <Ionicons name={viewMode === 'centers' ? "map-outline" : "people-outline"} size={48} color={colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {viewMode === 'centers' ? 'No centers found for this filter.' : 'No legal experts found in this category.'}
                        </Text>
                    </View>
                )}
            />
        </View>
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
    sectionTitle: {
        ...theme.typography.caption,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    mapContainer: {
        height: 300,
        marginHorizontal: theme.spacing.lg,
        borderRadius: 32,
        overflow: 'hidden',
        ...theme.shadows.md,
        marginBottom: 16,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    navToggleContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    navToggle: {
        flexDirection: 'row',
        padding: 6,
        borderRadius: 16,
        ...theme.shadows.sm,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '700',
    },
    callout: {
        padding: 12,
        width: 200,
        borderRadius: 16,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
        color: '#1A1A1A',
    },
    calloutSub: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    calloutActionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#002244',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        gap: 4,
    },
    calloutAction: {
        fontSize: 10,
        color: '#FFF',
        fontWeight: 'bold',
    },
    filtersWrapper: {
        marginBottom: 16,
    },
    filtersScroll: {
        paddingHorizontal: theme.spacing.lg,
        gap: 10,
    },
    filterBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1.5,
    },
    filterText: {
        ...theme.typography.caption,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    listContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 100,
        gap: 20,
    },
    centerCard: {
        padding: 24,
        borderRadius: 32,
        ...theme.shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardInfo: {
        flex: 1,
        gap: 4,
    },
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typeName: {
        ...theme.typography.caption,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    centerName: {
        ...theme.typography.h4,
        fontSize: 18,
    },
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 12,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metricLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    metricValue: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    ratingRowSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingTextSmall: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    reviewsText: {
        fontSize: 12,
    },
    cardDetails: {
        gap: 10,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailText: {
        ...theme.typography.bodySmall,
        fontSize: 14,
        flex: 1,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
        ...theme.shadows.sm,
    },
    actionBtnOutline: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: 8,
    },
    actionBtnText: {
        ...theme.typography.button,
        fontSize: 14,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 12,
    },
    emptyText: {
        ...theme.typography.bodySmall,
        textAlign: 'center',
    }
});
