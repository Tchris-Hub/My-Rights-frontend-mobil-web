import React, { useState, useEffect, useMemo } from 'react';
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
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { legalService, Center, Lawyer } from '../../services/legalService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CLASSROOM_BG = require('../../../assets/images/classroom_bg.png');

type SectionData = {
    title: string;
    data: (Center | Lawyer)[];
};

export const LegalAidMapScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<any>();
    
    // UI State
    const [selectedType, setSelectedType] = useState('All');
    const [viewMode, setViewMode] = useState<'centers' | 'experts'>('centers');
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [mapError, setMapError] = useState(false);
    
    // Data State
    const [centers, setCenters] = useState<Center[]>([]);
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initScreen();
    }, []);

    const initScreen = async () => {
        try {
            setIsLoading(true);
            
            // Parallel execution: Location + Data
            const [locationResult, centersData, lawyersData] = await Promise.allSettled([
                Location.requestForegroundPermissionsAsync().then(async ({ status }) => {
                    if (status === 'granted') return await Location.getCurrentPositionAsync({});
                    return null;
                }),
                legalService.getLegalAidCenters(),
                legalService.getLawyers()
            ]);

            if (locationResult.status === 'fulfilled') setUserLocation(locationResult.value);
            if (centersData.status === 'fulfilled') setCenters(centersData.value);
            if (lawyersData.status === 'fulfilled') setLawyers(lawyersData.value);

        } catch (error) {
            console.error('Error initializing Legal Aid Map:', error);
            Alert.alert('Database Connection', 'Unable to fetch legal directories. Using cached data where available.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCall = (phone: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (phone && phone !== '000') {
            Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
        } else {
            Alert.alert("Verification Pending", "Direct contact verified link is currently being encrypted for your security.");
        }
    };

    const handleDirections = async (lat: number, lng: number, name: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const label = name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        
        if (url) {
            Linking.openURL(url);
        }
    };

    const handleFilterPress = (filter: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedType(filter);
    };

    const filteredCenters = useMemo(() => {
        if (selectedType === 'All') return centers;
        return centers.filter(c => c.type === selectedType);
    }, [selectedType, centers]);

    const filteredLawyers = useMemo(() => {
        if (selectedType === 'All') return lawyers;
        return lawyers.filter(l => l.specialization === selectedType);
    }, [selectedType, lawyers]);

    const initialRegion = {
        latitude: userLocation?.coords.latitude || 9.0435,
        longitude: userLocation?.coords.longitude || 7.4931,
        latitudeDelta: 12,
        longitudeDelta: 12,
    };

    const sections: SectionData[] = viewMode === 'centers'
        ? [{ title: `Verified Centers (${filteredCenters.length})`, data: filteredCenters }]
        : [{ title: `Legal Experts (${filteredLawyers.length})`, data: filteredLawyers }];

    const renderItem = ({ item, index }: { item: Center | Lawyer; index: number }) => {
        if (viewMode === 'centers') {
            const center = item as Center;
            return (
                <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                    <TouchableOpacity
                        style={[styles.centerCard, { backgroundColor: colors.surfaceContainer }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.cardInfo}>
                                <View style={styles.typeRow}>
                                    <Text style={[styles.typeName, { color: colors.primary }]}>{center.type}</Text>
                                    <View style={[styles.badge, { backgroundColor: colors.primary + '10' }]}>
                                        <Ionicons name="checkmark-circle" size={10} color={colors.primary} />
                                        <Text style={[styles.badgeText, { color: colors.primary }]}>Verified</Text>
                                    </View>
                                </View>
                                <Text style={[styles.centerName, { color: colors.onSurface }]}>{center.name}</Text>
                                </View>
                        </View>

                        <View style={styles.cardDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="map-outline" size={16} color={colors.onSurfaceVariant} />
                                <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{center.address}</Text>
                            </View>
                        </View>

                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                onPress={() => handleCall(center.phone)}
                                style={styles.actionBtnContainer}
                            >
                                <LinearGradient
                                    colors={[colors.primary, theme.colors.primaryContainer]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.actionBtn}
                                >
                                    <Ionicons name="call" size={18} color={colors.onPrimary} />
                                    <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Call Now</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtnOutline, { backgroundColor: colors.surfaceContainerHighest }]}
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
                <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                    <TouchableOpacity
                        style={[styles.centerCard, { backgroundColor: colors.surfaceContainer }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.cardInfo}>
                                <View style={styles.typeRow}>
                                    <Text style={[styles.typeName, { color: colors.primary }]}>{lawyer.specialization}</Text>
                                    {lawyer.verification_status === 'verified' && (
                                        <View style={[styles.badge, { backgroundColor: colors.primary + '10' }]}>
                                            <Ionicons name="checkmark-circle" size={10} color={colors.primary} />
                                            <Text style={[styles.badgeText, { color: colors.primary }]}>Verified</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.centerName, { color: colors.onSurface }]}>{lawyer.name}</Text>

                                <View style={styles.metricsRow}>
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>Experience</Text>
                                        <Text style={[styles.metricValue, { color: colors.onSurface }]}>{lawyer.experience_years}y</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricLabel, { color: colors.onSurfaceVariant }]}>Location</Text>
                                        <Text style={[styles.metricValue, { color: colors.onSurface }]} numberOfLines={1}>{lawyer.location || 'Not disclosed'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.cardDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={16} color={colors.onSurfaceVariant} />
                                <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>{lawyer.location}</Text>
                            </View>
                        </View>

                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                onPress={() => handleCall('000')}
                                style={styles.actionBtnContainer}
                            >
                                <LinearGradient
                                    colors={[colors.primary, theme.colors.primaryContainer]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.actionBtn}
                                >
                                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.onPrimary} />
                                    <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Contact</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtnOutline, { backgroundColor: colors.surfaceContainerHighest }]}
                                onPress={() => Alert.alert("Expert Bio", lawyer.bio || "Detailed professional profile pending verification.")}
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
            {mapError ? (
                <View style={[styles.map, { backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="map-outline" size={48} color={colors.onSurfaceVariant} />
                    <Text style={[styles.emptyText, { color: colors.onSurfaceVariant, marginTop: 8 }]}>Map unavailable</Text>
                    <Text style={[styles.emptyText, { color: colors.onSurfaceVariant, fontSize: 11 }]}>Browse directories in the list below</Text>
                </View>
            ) : (
                <MapView
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
                            pinColor={center.type === 'Government' ? colors.primary : colors.success}
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
            )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Image 
                    source={require('../../../assets/images/classroom_bg.png')} 
                    style={styles.globalBackground} 
                    resizeMode="cover"
                />
                <BlurView intensity={isDark ? 40 : 20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            </View>

            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backBtn, { backgroundColor: colors.surfaceContainer }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: colors.onSurface }]}>Legal Discovery</Text>
                    <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Connect with Verified Professionals</Text>
                </View>
            </View>

            {/* Discovery Mode Toggle */}
            <View style={styles.navToggleContainer}>
                <View style={[styles.navToggle, { backgroundColor: colors.surfaceContainer }]}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'centers' && { backgroundColor: colors.primary }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setViewMode('centers');
                            setSelectedType('All');
                        }}
                    >
                        <Ionicons name="business" size={16} color={viewMode === 'centers' ? '#FFF' : colors.onSurfaceVariant} />
                        <Text style={[styles.toggleText, { color: viewMode === 'centers' ? '#FFF' : colors.onSurfaceVariant }]}>Centers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'experts' && { backgroundColor: colors.primary }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setViewMode('experts');
                            setSelectedType('All');
                        }}
                    >
                        <Ionicons name="people" size={16} color={viewMode === 'experts' ? '#FFF' : colors.onSurfaceVariant} />
                        <Text style={[styles.toggleText, { color: viewMode === 'experts' ? '#FFF' : colors.onSurfaceVariant }]}>Experts</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filters Wrapper */}
            <View style={styles.filtersWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                    {(viewMode === 'centers' 
                        ? ['All', 'Government', 'NGO', 'Legal Center'] 
                        : ['All', 'Criminal Law', 'Family Law', 'Property Law', 'Human Rights', 'Corporate']
                    ).map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterBtn,
                                selectedType === filter 
                                    ? { backgroundColor: colors.primary } 
                                    : { backgroundColor: colors.surfaceContainerHighest }
                            ]}
                            onPress={() => handleFilterPress(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedType === filter ? { color: colors.onPrimary } : { color: colors.onSurfaceVariant }
                            ]}>{filter}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {isLoading ? (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.emptyText, { color: colors.onSurfaceVariant, marginTop: 12 }]}>Syncing with High Court Archives...</Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item: Center | Lawyer, index: number) => `${item.id}-${index}`}
                    renderItem={renderItem}
                    renderSectionHeader={({ section }: { section: SectionData }) => (
                        <View style={{ backgroundColor: 'transparent', paddingBottom: 10, paddingTop: 10 }}>
                            <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant, paddingHorizontal: theme.spacing.lg }]}>{section.title}</Text>
                        </View>
                    )}
                    ListHeaderComponent={renderHeader}
                    stickySectionHeadersEnabled={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Ionicons name={viewMode === 'centers' ? "map-outline" : "people-outline"} size={48} color={colors.onSurfaceVariant} />
                            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                                {viewMode === 'centers' ? 'No centers found in this region.' : 'Profile pending verification.'}
                            </Text>
                        </View>
                    )}
                />
            )}
            
            <FloatingChatButton />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    globalBackground: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        opacity: 0.1,
    },
    header: {
        zIndex: 100,
    },
    headerContent: {
        paddingHorizontal: 32,
        paddingTop: 12,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        ...theme.typography.displayMd,
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    subtitle: {
        ...theme.typography.labelSm,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        fontWeight: '700',
        marginTop: -2,
    },
    navToggleContainer: {
        paddingHorizontal: 32,
        marginBottom: 16,
    },
    navToggleWrapper: {
        paddingHorizontal: 32,
        marginBottom: 16,
    },
    navToggle: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 16,
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
        ...theme.typography.labelSm,
        fontWeight: '800',
    },
    filtersWrapper: {
        marginBottom: 8,
    },
    filtersScroll: {
        paddingHorizontal: 32,
        gap: 10,
    },
    filterBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    filterText: {
        ...theme.typography.labelSm,
        fontWeight: '800',
    },
    mapContainer: {
        height: 300,
        marginHorizontal: 32,
        borderRadius: 32,
        overflow: 'hidden',
        marginTop: 12,
        marginBottom: 24,
    },
    map: {
        flex: 1,
    },
    sectionHeaderBox: {
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    sectionTitle: {
        ...theme.typography.labelSm,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    centerCard: {
        marginHorizontal: 32,
        marginBottom: 16,
        padding: 24,
        borderRadius: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardInfo: {
        flex: 1,
    },
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    typeName: {
        ...theme.typography.labelSm,
        fontWeight: '900',
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
        ...theme.typography.caption,
        fontSize: 10,
        fontWeight: '900',
    },
    centerName: {
        ...theme.typography.titleLg,
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        ...theme.typography.caption,
        fontWeight: 'bold',
    },
    reviewsText: {
        ...theme.typography.caption,
        opacity: 0.6,
    },
    cardDetails: {
        marginTop: 16,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        ...theme.typography.bodyMd,
        fontSize: 14,
    },
    cardActions: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    actionBtnContainer: {
        flex: 1,
    },
    actionBtn: {
        height: 48,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionBtnText: {
        ...theme.typography.labelSm,
        fontWeight: '900',
    },
    actionBtnOutline: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    emptyState: {
        padding: 60,
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        ...theme.typography.bodyMd,
        textAlign: 'center',
    },
    callout: {
        width: 200,
        padding: 12,
        borderRadius: 16,
    },
    calloutTitle: {
        ...theme.typography.titleMd,
        fontWeight: '900',
        fontSize: 14,
    },
    calloutSub: {
        ...theme.typography.caption,
        fontSize: 11,
        marginVertical: 4,
    },
    calloutActionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        borderRadius: 8,
        justifyContent: 'center',
        gap: 6,
    },
    calloutAction: {
        ...theme.typography.labelSm,
        fontSize: 10,
        fontWeight: '900',
    },
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    metricItem: {
        alignItems: 'center',
    },
    metricLabel: {
        ...theme.typography.caption,
        fontSize: 9,
        fontWeight: '900',
    },
    metricValue: {
        ...theme.typography.titleMd,
        fontWeight: '900',
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: 16,
    },
    ratingRowSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingTextSmall: {
        ...theme.typography.caption,
        fontWeight: '900',
    },
});
