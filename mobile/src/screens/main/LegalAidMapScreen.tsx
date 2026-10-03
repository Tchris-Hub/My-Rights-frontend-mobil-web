import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
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
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../utils/responsive';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { legalService, Center, Lawyer } from '../../services/legalService';

type Firm = {
    id: string;
    name: string;
    description?: string | null;
    location?: string | null;
    practice_areas?: string[];
    service_areas?: string[];
    languages?: string[];
    fee_band?: string | null;
    verification_status?: string;
    professionals?: Array<{ id: string; display_name: string; role: string; practice_areas: string[] }>;
    match_reasons?: string[];
};

const CLASSROOM_BG = require('../../../assets/images/classroom_bg.png');

type SectionData = {
    title: string;
    data: (Center | Lawyer | Firm)[];
};

export const LegalAidMapScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, horizontalPadding, contentWidth, narrow } = useResponsive();
    const navigation = useNavigation<any>();
    
    // UI State
    const [selectedType, setSelectedType] = useState('All');
    const [viewMode, setViewMode] = useState<'centers' | 'experts' | 'firms'>('centers');
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [mapError, setMapError] = useState(false);
    
    // Data State
    const [centers, setCenters] = useState<Center[]>([]);
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [firms, setFirms] = useState<Firm[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initScreen();
    }, []);

    const initScreen = async () => {
        try {
            setIsLoading(true);
            
            // Parallel execution: Location + Data
            const [locationResult, centersData, lawyersData, firmsData] = await Promise.allSettled([
                Location.requestForegroundPermissionsAsync().then(async ({ status }) => {
                    if (status === 'granted') return await Location.getCurrentPositionAsync({});
                    return null;
                }),
                legalService.getLegalAidCenters(),
                legalService.getLawyers(),
                legalService.getFirms()
            ]);

            if (locationResult.status === 'fulfilled') setUserLocation(locationResult.value);
            if (centersData.status === 'fulfilled') setCenters(centersData.value);
            if (lawyersData.status === 'fulfilled') setLawyers(lawyersData.value);
            if (firmsData.status === 'fulfilled') setFirms(firmsData.value as Firm[]);

        } catch (error) {
            console.error('Error initializing Legal Aid Map:', error);
            Alert.alert('Database Connection', 'Unable to fetch legal directories. Using cached data where available.');
        } finally {
            setIsLoading(false);
        }
    };


    const loadExplainableMatches = async (filter: string) => {
        if (filter === 'All') return;
        setIsLoading(true);
        try {
            if (viewMode === 'experts') {
                const matches = await legalService.getProfessionalMatches({ practiceArea: filter });
                setLawyers(matches.map((match) => ({
                    id: match.id,
                    name: match.display_name,
                    specialization: match.practice_areas[0] || filter,
                    location: match.location || '',
                    experience_years: undefined,
                    cases_won: undefined,
                    rating: undefined,
                    reviews: undefined,
                    credibility: 'Verified professional profile',
                    verification_status: 'verified',
                    verified_at: match.verified_at || undefined,
                    bio: match.bio || undefined,
                    matched_attributes: match.matched_attributes,
                    match_reasons: match.match_reasons,
                })));
            } else if (viewMode === 'firms') {
                const matches = await legalService.getFirmMatches({ practiceArea: filter });
                setFirms(matches);
            }
        } catch (error) {
            console.error('Explainable marketplace match failed:', error);
            Alert.alert('Matching unavailable', 'We could not load matching results. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedType !== 'All' && (viewMode === 'experts' || viewMode === 'firms')) {
            void loadExplainableMatches(selectedType);
        }
    }, [selectedType, viewMode]);

    const handleCall = (phone: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (phone && phone !== '000') {
            Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
        } else {
            Alert.alert("Verification Pending", "Direct contact verified link is currently being encrypted for your security.");
        }
    };

    const handleProfessionalEnquiry = (lawyer: Lawyer) => {
        navigation.navigate('ProfessionalEnquiry', {
            professionalId: lawyer.id,
            professionalName: lawyer.name,
            practiceArea: lawyer.specialization,
        });
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

    const filteredFirms = useMemo(() => {
        if (selectedType === 'All') return firms;
        return firms.filter(f => f.practice_areas?.some(area => area.toLowerCase() === selectedType.toLowerCase()));
    }, [selectedType, firms]);

    const initialRegion = {
        latitude: userLocation?.coords.latitude || 9.0435,
        longitude: userLocation?.coords.longitude || 7.4931,
        latitudeDelta: 12,
        longitudeDelta: 12,
    };

    const sections: SectionData[] = viewMode === 'centers'
        ? [{ title: `Verified Centers (${filteredCenters.length})`, data: filteredCenters }]
        : viewMode === 'experts'
            ? [{ title: `Legal Experts (${filteredLawyers.length})`, data: filteredLawyers }]
            : [{ title: `Verified Firms (${filteredFirms.length})`, data: filteredFirms }];

    const renderItem = ({ item, index }: { item: Center | Lawyer | Firm; index: number }) => {
        if (viewMode === 'centers') {
            const center = item as Center;
            return (
                <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                    <View style={[styles.centerCard, { backgroundColor: colors.surfaceContainer }]}>
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
                            <TouchableOpacity onPress={() => handleDirections(center.latitude, center.longitude, center.name)} style={styles.actionBtnContainer}>
                                <LinearGradient colors={[colors.primary, theme.colors.primaryContainer]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionBtn}>
                                    <Ionicons name="navigate-outline" size={18} color={colors.onPrimary} />
                                    <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Directions</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            );
        }
        if (viewMode === 'experts') {
            const lawyer = item as Lawyer;
            return (
                <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                    <View style={[styles.centerCard, { backgroundColor: colors.surfaceContainer }]}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardInfo}>
                                <View style={styles.typeRow}>
                                    <Text style={[styles.typeName, { color: colors.primary }]}>{lawyer.specialization}</Text>
                                    {lawyer.verification_status === 'verified' && <View style={[styles.badge, { backgroundColor: colors.primary + '10' }]}>
                                        <Ionicons name="checkmark-circle" size={10} color={colors.primary} />
                                        <Text style={[styles.badgeText, { color: colors.primary }]}>Verified</Text>
                                    </View>}
                                </View>
                                <Text style={[styles.centerName, { color: colors.onSurface }]}>{lawyer.name}</Text>
                            </View>
                        </View>
                        <View style={styles.cardDetails}>
                            {lawyer.location ? <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={16} color={colors.onSurfaceVariant} />
                                <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>{lawyer.location}</Text>
                            </View> : null}
                            {lawyer.match_reasons?.length ? <View style={[styles.matchBox, { backgroundColor: colors.primary + '08' }]}>
                                <Text style={[styles.matchTitle, { color: colors.primary }]}>Why this match</Text>
                                {lawyer.match_reasons.map((reason) => <Text key={reason} style={[styles.matchReason, { color: colors.onSurfaceVariant }]}>• {reason}</Text>)}
                            </View> : null}
                        </View>
                        <View style={styles.cardActions}>
                            <TouchableOpacity testID="legal-aid-send-enquiry" accessibilityRole="button" accessibilityLabel="Send legal enquiry" onPress={() => handleProfessionalEnquiry(lawyer)} style={styles.actionBtnContainer}>
                                <LinearGradient colors={[colors.primary, theme.colors.primaryContainer]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionBtn}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.onPrimary} />
                                    <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Send enquiry</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtnOutline, { backgroundColor: colors.surfaceContainerHighest }]} onPress={() => Alert.alert('Professional bio', lawyer.bio || 'Detailed professional profile pending verification.')}>
                                <Ionicons name="folder-open-outline" size={18} color={colors.primary} />
                                <Text style={[styles.actionBtnText, { color: colors.primary }]}>View Bio</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            );
        }
        const firm = item as Firm;
        return (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                <View style={[styles.centerCard, { backgroundColor: colors.surfaceContainer }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardInfo}>
                            <View style={styles.typeRow}>
                                <Text style={[styles.typeName, { color: colors.primary }]}>Verified firm</Text>
                                <View style={[styles.badge, { backgroundColor: colors.primary + '10' }]}>
                                    <Ionicons name="checkmark-circle" size={10} color={colors.primary} />
                                    <Text style={[styles.badgeText, { color: colors.primary }]}>Verified</Text>
                                </View>
                            </View>
                            <Text style={[styles.centerName, { color: colors.onSurface }]}>{firm.name}</Text>
                        </View>
                    </View>
                    <View style={styles.cardDetails}>
                        {firm.location ? <View style={styles.detailRow}><Ionicons name="location-outline" size={16} color={colors.onSurfaceVariant} /><Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>{firm.location}</Text></View> : null}
                        {firm.practice_areas?.length ? <View style={styles.detailRow}><Ionicons name="briefcase-outline" size={16} color={colors.onSurfaceVariant} /><Text style={[styles.detailText, { color: colors.onSurfaceVariant }]} numberOfLines={2}>{firm.practice_areas.join(' • ')}</Text></View> : null}
                        {firm.match_reasons?.length ? <View style={[styles.matchBox, { backgroundColor: colors.primary + '08' }]}><Text style={[styles.matchTitle, { color: colors.primary }]}>Why this match</Text>{firm.match_reasons.map((reason) => <Text key={reason} style={[styles.matchReason, { color: colors.onSurfaceVariant }]}>• {reason}</Text>)}</View> : null}
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.actionBtnContainer} onPress={() => navigation.navigate('FirmDetails', { firm })}>
                            <LinearGradient colors={[colors.primary, theme.colors.primaryContainer]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionBtn}>
                                <Ionicons name="business-outline" size={18} color={colors.onPrimary} />
                                <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>View firm</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        );
    };

    const mapTilerApiKey = String(Constants.expoConfig?.extra?.mapTilerApiKey ?? '').trim();
    const mapTilerConfigured = Boolean(mapTilerApiKey);

    const renderHeader = () => (
        <View style={styles.mapContainer}>
            {mapTilerConfigured ? (
                <Map
                    style={styles.map}
                    mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(mapTilerApiKey)}`}
                    compass
                    attribution
                    logo
                >
                    <Camera
                        initialViewState={{
                            center: [initialRegion.longitude, initialRegion.latitude],
                            zoom: 6,
                        }}
                    />
                    {filteredCenters.map(center => (
                        <Marker
                            key={center.id}
                            lngLat={[center.longitude, center.latitude]}
                            anchor="bottom"
                            onPress={() => handleDirections(center.latitude, center.longitude, center.name)}
                        >
                            <View
                                style={[
                                    styles.mapMarker,
                                    { backgroundColor: center.type === 'Government' ? colors.primary : colors.success },
                                ]}
                            >
                                <Ionicons name="location" size={18} color="#FFF" />
                            </View>
                        </Marker>
                    ))}
                </Map>
            ) : (
                <View style={[styles.map, { backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center', paddingHorizontal: horizontalPadding }]}>
                    <Ionicons name="map-outline" size={42} color={colors.onSurfaceVariant} />
                    <Text style={[styles.emptyText, { color: colors.onSurface, marginTop: 8 }]}>Map view unavailable</Text>
                    <Text style={[styles.emptyText, { color: colors.onSurfaceVariant, fontSize: 12, marginTop: 4 }]}>
                        Add MAPTILER_API_KEY to the mobile build environment to display the map. The verified legal-aid directory is still available below.
                    </Text>
                </View>
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
            <View style={[styles.navToggleContainer, { paddingHorizontal: horizontalPadding }]}>
                <View style={[styles.navToggle, { backgroundColor: colors.surfaceContainer }]}>
                    <TouchableOpacity
                        testID="legal-aid-centers"
                        accessibilityRole="button"
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
                        testID="legal-aid-experts"
                        accessibilityRole="button"
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
                    <TouchableOpacity
                        testID="legal-aid-firms"
                        accessibilityRole="button"
                        style={[styles.toggleBtn, viewMode === 'firms' && { backgroundColor: colors.primary }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setViewMode('firms');
                            setSelectedType('All');
                        }}
                    >
                        <Ionicons name="business" size={16} color={viewMode === 'firms' ? '#FFF' : colors.onSurfaceVariant} />
                        <Text style={[styles.toggleText, { color: viewMode === 'firms' ? '#FFF' : colors.onSurfaceVariant }]}>Firms</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filters Wrapper */}
            <View style={styles.filtersWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filtersScroll, { paddingHorizontal: horizontalPadding }]}>
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
                <SectionList<Center | Lawyer | Firm, SectionData>
                    sections={sections}
                    keyExtractor={(item: Center | Lawyer | Firm, index: number) => `${item.id}-${index}`}
                    renderItem={renderItem}
                    renderSectionHeader={({ section }: { section: SectionData }) => (
                        <View style={{ backgroundColor: 'transparent', paddingBottom: 10, paddingTop: 10 }}>
                            <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant, paddingHorizontal: theme.spacing.lg }]}>{section.title}</Text>
                        </View>
                    )}
                    ListHeaderComponent={renderHeader}
                    stickySectionHeadersEnabled={false}
                    contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: horizontalPadding, maxWidth: contentWidth, width: '100%', alignSelf: 'center' }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Ionicons name={viewMode === 'centers' ? "map-outline" : viewMode === 'firms' ? "business-outline" : "people-outline"} size={48} color={colors.onSurfaceVariant} />
                            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                                {viewMode === 'centers' ? 'No centers found in this region.' : viewMode === 'firms' ? 'No verified firms found for this filter.' : 'No verified professionals found for this filter.'}
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
        width: '100%',
        height: '100%',
        opacity: 0.1,
    },
    header: {
        zIndex: 100,
    },
    headerContent: {
        paddingHorizontal: 16,
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
        paddingHorizontal: 0,
        marginBottom: 16,
    },
    navToggleWrapper: {
        paddingHorizontal: 0,
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
        paddingHorizontal: 0,
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
        marginHorizontal: 16,
        borderRadius: 32,
        overflow: 'hidden',
        marginTop: 12,
        marginBottom: 24,
    },
    map: {
        flex: 1,
    },
    sectionHeaderBox: {
        paddingHorizontal: 0,
        paddingVertical: 16,
    },
    sectionTitle: {
        ...theme.typography.labelSm,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    centerCard: {
        marginHorizontal: 0,
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
        flex: 1,
        minWidth: 0,
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
    mapMarker: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
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
    matchBox: {
        marginTop: 8,
        padding: 12,
        borderRadius: 12,
        gap: 4,
    },
    matchTitle: {
        ...theme.typography.labelSm,
        fontWeight: '900',
        marginBottom: 2,
    },
    matchReason: {
        ...theme.typography.caption,
        fontSize: 12,
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
