import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Platform,
    Linking,
    ActivityIndicator,
    Alert,
    SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

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


type SectionData = {
    title: string;
    data: (Center | Lawyer | Firm)[];
};

export const LegalAidMapScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<any>();
    
    // UI State
    const [selectedType, setSelectedType] = useState('All');
    const [viewMode, setViewMode] = useState<'centers' | 'experts' | 'firms'>('centers');
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const mapTilerApiKey = String(Constants.expoConfig?.extra?.mapTilerApiKey ?? '').trim();
    const mapTilerConfigured = Boolean(mapTilerApiKey);
    
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
            Alert.alert('Could not load the lists', 'Check your connection and try again.');
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
            Alert.alert('No phone number yet', 'We do not have a number for this office. Use Directions to find it.');
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
        ? [{ title: `${filteredCenters.length} office${filteredCenters.length === 1 ? '' : 's'}`, data: filteredCenters }]
        : viewMode === 'experts'
            ? [{ title: `${filteredLawyers.length} lawyer${filteredLawyers.length === 1 ? '' : 's'}`, data: filteredLawyers }]
            : [{ title: `${filteredFirms.length} firm${filteredFirms.length === 1 ? '' : 's'}`, data: filteredFirms }];

    const VerifiedChip = () => (
        <View style={[styles.badge, { backgroundColor: colors.verifiedContainer }]}>
            <Ionicons name="checkmark-circle" size={13} color={colors.verified} />
            <Text style={[styles.badgeText, { color: colors.verified }]}>Verified</Text>
        </View>
    );

    const Why: React.FC<{ reasons?: string[] }> = ({ reasons }) =>
        reasons?.length ? (
            <View style={[styles.matchBox, { backgroundColor: colors.primaryContainer }]}>
                <Text style={[styles.matchTitle, { color: colors.onPrimaryContainer }]}>Why this match</Text>
                {reasons.map((reason) => (
                    <Text key={reason} style={[styles.matchReason, { color: colors.onPrimaryContainer }]}>{reason}</Text>
                ))}
            </View>
        ) : null;

    const renderItem = ({ item }: { item: Center | Lawyer | Firm }) => {
        if (viewMode === 'centers') {
            const center = item as Center;
            return (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
                    <View style={styles.cardTop}>
                        <Text style={[styles.typeName, { color: colors.onSurfaceVariant }]}>{center.type}</Text>
                        {center.verification_status === 'verified' ? <VerifiedChip /> : null}
                    </View>
                    <Text style={[styles.cardName, { color: colors.onSurface }]}>{center.name}</Text>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={colors.onSurfaceVariant} />
                        <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>{center.address}</Text>
                    </View>
                    <View style={styles.cardActions}>
                        {center.phone && center.phone !== '000' ? (
                            <Button title="Call" size="small" variant="primary" onPress={() => handleCall(center.phone)} icon={<Ionicons name="call-outline" size={18} color={colors.onPrimary} />} />
                        ) : null}
                        <Button title="Directions" size="small" variant="secondary" onPress={() => handleDirections(center.latitude, center.longitude, center.name)} icon={<Ionicons name="navigate-outline" size={18} color={colors.primary} />} />
                    </View>
                </View>
            );
        }
        if (viewMode === 'experts') {
            const lawyer = item as Lawyer;
            return (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
                    <View style={styles.cardTop}>
                        <Text style={[styles.typeName, { color: colors.onSurfaceVariant }]}>{lawyer.specialization}</Text>
                        {lawyer.verification_status === 'verified' ? <VerifiedChip /> : null}
                    </View>
                    <Text style={[styles.cardName, { color: colors.onSurface }]}>{lawyer.name}</Text>
                    {lawyer.location ? (
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={16} color={colors.onSurfaceVariant} />
                            <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>{lawyer.location}</Text>
                        </View>
                    ) : null}
                    <Why reasons={lawyer.match_reasons} />
                    <View style={styles.cardActions}>
                        <Button title="Send enquiry" size="small" onPress={() => handleProfessionalEnquiry(lawyer)} />
                        <Button title="Read bio" size="small" variant="secondary" onPress={() => Alert.alert('About this lawyer', lawyer.bio || 'This lawyer has not added a bio yet.')} />
                    </View>
                </View>
            );
        }
        const firm = item as Firm;
        return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
                <View style={styles.cardTop}>
                    <Text style={[styles.typeName, { color: colors.onSurfaceVariant }]}>Law firm</Text>
                    {firm.verification_status === 'verified' ? <VerifiedChip /> : null}
                </View>
                <Text style={[styles.cardName, { color: colors.onSurface }]}>{firm.name}</Text>
                {firm.location ? (
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={colors.onSurfaceVariant} />
                        <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>{firm.location}</Text>
                    </View>
                ) : null}
                {firm.practice_areas?.length ? (
                    <View style={styles.detailRow}>
                        <Ionicons name="briefcase-outline" size={16} color={colors.onSurfaceVariant} />
                        <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]} numberOfLines={2}>{firm.practice_areas.join(', ')}</Text>
                    </View>
                ) : null}
                <Why reasons={firm.match_reasons} />
                <View style={styles.cardActions}>
                    <Button title="View firm" size="small" onPress={() => navigation.navigate('FirmDetails', { firm })} />
                </View>
            </View>
        );
    };

    // The map only renders when a tile key is configured; otherwise people just get the list.
    const renderHeader = () =>
        mapTilerConfigured ? (
            <View style={styles.mapContainer}>
                <Map
                    style={styles.map}
                    mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(mapTilerApiKey)}`}
                    compass
                    attribution
                    logo
                >
                    <Camera initialViewState={{ center: [initialRegion.longitude, initialRegion.latitude], zoom: 6 }} />
                    {filteredCenters.map((center) => (
                        <Marker key={center.id} lngLat={[center.longitude, center.latitude]} anchor="bottom" onPress={() => handleDirections(center.latitude, center.longitude, center.name)}>
                            <View style={[styles.mapMarker, { backgroundColor: center.type === 'Government' ? colors.primary : colors.verified }]}>
                                <Ionicons name="location" size={18} color="#FFF" />
                            </View>
                        </Marker>
                    ))}
                </Map>
            </View>
        ) : null;

    const MODES: Array<{ id: 'centers' | 'experts' | 'firms'; label: string }> = [
        { id: 'centers', label: 'Offices' },
        { id: 'experts', label: 'Lawyers' },
        { id: 'firms', label: 'Firms' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <ScreenHeader title="Legal aid near me" subtitle="Offices, lawyers and firms" />

            <View style={[styles.controls, { backgroundColor: colors.card, borderBottomColor: colors.line }]}>
                <View style={[styles.segment, { backgroundColor: colors.surfaceContainer }]}>
                    {MODES.map((m) => {
                        const active = viewMode === m.id;
                        return (
                            <Pressable
                                key={m.id}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: active }}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setViewMode(m.id);
                                    setSelectedType('All');
                                }}
                                style={[styles.segmentBtn, active && { backgroundColor: colors.primary }]}
                            >
                                <Text style={[styles.segmentText, { color: active ? colors.onPrimary : colors.onSurfaceVariant }]}>{m.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                    {(viewMode === 'centers'
                        ? ['All', 'Government', 'NGO', 'Legal Center']
                        : ['All', 'Criminal Law', 'Family Law', 'Property Law', 'Human Rights', 'Corporate']
                    ).map((filter) => {
                        const active = selectedType === filter;
                        return (
                            <Pressable
                                key={filter}
                                accessibilityRole="button"
                                accessibilityState={{ selected: active }}
                                onPress={() => handleFilterPress(filter)}
                                style={[styles.chip, { borderColor: active ? colors.primary : colors.outlineVariant, backgroundColor: active ? colors.primaryContainer : 'transparent' }]}
                            >
                                <Text style={[styles.chipText, { color: active ? colors.onPrimaryContainer : colors.onSurfaceVariant }]}>{filter}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {isLoading ? (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>Finding help near you</Text>
                </View>
            ) : (
                <SectionList<Center | Lawyer | Firm, SectionData>
                    sections={sections}
                    keyExtractor={(item: Center | Lawyer | Firm, index: number) => `${item.id}-${index}`}
                    renderItem={renderItem}
                    renderSectionHeader={({ section }: { section: SectionData }) => (
                        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>{section.title}</Text>
                    )}
                    ListHeaderComponent={renderHeader}
                    stickySectionHeadersEnabled={false}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Ionicons name={viewMode === 'centers' ? 'map-outline' : viewMode === 'firms' ? 'business-outline' : 'people-outline'} size={44} color={colors.outline} />
                            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                                {viewMode === 'centers' ? 'No offices listed for this filter yet.' : viewMode === 'firms' ? 'No firms listed for this filter yet.' : 'No lawyers listed for this filter yet.'}
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    controls: { paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, gap: 10 },
    segment: { flexDirection: 'row', marginHorizontal: 16, padding: 3, borderRadius: 12, gap: 3 },
    segmentBtn: { flex: 1, minHeight: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    segmentText: { ...theme.typography.labelMd, fontFamily: theme.typography.fontFamily.headlineMedium },
    filtersScroll: { paddingHorizontal: 16, gap: 8 },
    chip: { paddingHorizontal: 14, minHeight: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    chipText: { ...theme.typography.labelMd },
    listContent: { padding: 16, paddingBottom: 32, gap: 10 },
    sectionTitle: { ...theme.typography.labelMd, marginTop: 4, marginBottom: 6 },
    mapContainer: { height: 200, borderRadius: theme.borderRadius.lg, overflow: 'hidden', marginBottom: 12 },
    map: { flex: 1 },
    mapMarker: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    card: { borderWidth: 1, borderRadius: theme.borderRadius.lg, padding: 14, gap: 6 },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    typeName: { ...theme.typography.labelSm, flexShrink: 1 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    badgeText: { fontFamily: theme.typography.fontFamily.headlineMedium, fontSize: 11.5 },
    cardName: { ...theme.typography.titleMd },
    detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
    detailText: { ...theme.typography.bodyMd, flex: 1 },
    matchBox: { padding: 10, borderRadius: theme.borderRadius.md, gap: 2, marginTop: 2 },
    matchTitle: { ...theme.typography.labelSm, fontFamily: theme.typography.fontFamily.headline },
    matchReason: { ...theme.typography.caption, color: undefined },
    cardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },
    emptyText: { ...theme.typography.bodyMd, textAlign: 'center' },
});
