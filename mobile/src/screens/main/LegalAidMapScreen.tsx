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
}

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
    },
    {
        id: '4',
        name: 'Chris Ogunbanjo LP',
        type: 'Law Firm',
        distance: 'Lagos Island',
        address: '3, Hospital Road, Lagos Island',
        phone: '+234 1 463 7439',
        status: 'Pro Bono Services',
        latitude: 6.4468,
        longitude: 3.4019,
    },
    {
        id: '5',
        name: 'Network of Pro Bono Lawyers',
        type: 'NGO',
        distance: 'Abuja',
        address: '1 63 Rd, Gwarinpa Estate, Abuja',
        phone: '+234 803 042 5562',
        status: 'Netprolaw NGO',
        latitude: 9.1005,
        longitude: 7.3915,
    },
];

export const LegalAidMapScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const [selectedType, setSelectedType] = useState('All');
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
        Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
    };

    const handleDirections = async (lat: number, lng: number, name: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const label = encodeURIComponent(name);
        const latLng = `${lat},${lng}`;

        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${latLng}`,
            android: `geo:0,0?q=${latLng}(${label})`
        });

        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latLng}`;

        try {
            if (url && await Linking.canOpenURL(url)) {
                await Linking.openURL(url);
            } else {
                await Linking.openURL(fallbackUrl);
            }
        } catch (error) {
            console.error('Failed to open maps:', error);
            Linking.openURL(fallbackUrl).catch(() => {
                Alert.alert("Error", "Could not open map application.");
            });
        }
    };

    const handleFilterPress = (filter: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedType(filter);
    };

    const filteredCenters = selectedType === 'All'
        ? CENTERS
        : CENTERS.filter(c => c.type === selectedType || (selectedType === 'Legal Aid' && (c.type === 'Government' || c.type === 'NGO')));

    const initialRegion = {
        latitude: location?.coords.latitude || 6.5244,
        longitude: location?.coords.longitude || 3.3792,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
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
                    <Text style={[styles.title, { color: colors.text }]}>Legal Aid Map</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Discovery & Pro-Bono Support</Text>
                </View>
            </View>

            {/* Live Map Area */}
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
                            pinColor={center.type === 'Government' ? theme.colors.primary : center.type === 'NGO' ? theme.colors.success : theme.colors.secondary}
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

            <View style={styles.filtersWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                    {['All', 'NGO', 'Government', 'Law Firm'].map(filter => (
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
                {filteredCenters.length > 0 ? (
                    filteredCenters.map(center => (
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
                                    <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Call</Text>
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
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="map-outline" size={48} color={colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No centers found for this filter.</Text>
                    </View>
                )}
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
        height: 250,
        margin: theme.spacing.lg,
        borderRadius: 32,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
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
        gap: 2,
    },
    typeName: {
        ...theme.typography.caption,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    centerName: {
        ...theme.typography.h4,
        fontSize: 17,
    },
    distanceBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    distanceText: {
        fontSize: 11,
        fontWeight: '700',
    },
    cardDetails: {
        gap: 8,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        ...theme.typography.bodySmall,
        fontSize: 13,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 14,
        gap: 6,
    },
    actionBtnOutline: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        gap: 6,
    },
    actionBtnText: {
        ...theme.typography.button,
        fontSize: 13,
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
