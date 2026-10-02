import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CLASSROOM_BG = require('../../../assets/onboarding/classroom_bg.png');

interface OnboardingSlide {
    id: string;
    badge: string;
    title: string;
    highlight: string;
    description: string;
    image: any;
}

const slides: OnboardingSlide[] = [
    {
        id: '1',
        badge: 'EDITORIAL AUTHORITY',
        title: 'Know Your\n',
        highlight: 'Rights.',
        description: 'Navigate complex legal landscapes with clarity. We provide the editorial authority you need to protect your interests and command your future.',
        image: require('../../../assets/onboarding/rights.png'),
    },
    {
        id: '2',
        badge: 'LEGAL PRECISION',
        title: 'Command Your\n',
        highlight: 'Future.',
        description: 'Leverage AI-driven legal tools to review contracts and generate binding documents instantly. Precision at scale.',
        image: require('../../../assets/onboarding/precision.png'),
    },
    {
        id: '3',
        badge: 'ACCESSIBLE JUSTICE',
        title: 'Justice for\n',
        highlight: 'Everyone.',
        description: 'Free, accessible legal help. Connect with trusted legal aid organizations when you need active representation.',
        image: require('../../../assets/onboarding/justice.png'),
    },
];

export const OnboardingScreen: React.FC = () => {
    const { colors } = useTheme();
    const { completeOnboarding } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            completeOnboarding();
        }
    };

    const renderSlide = ({ item }: { item: OnboardingSlide }) => (
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.imageContainer}>
                <Image 
                    source={item.image} 
                    style={styles.heroImage} 
                />
                <LinearGradient
                    colors={[
                        'rgba(255, 255, 255, 0.1)', // Top transparent
                        'rgba(255, 255, 255, 0.5)', // Mid fade
                        colors.surface           // Bottom solid
                    ]}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <View style={styles.contentContainer}>
                <View style={[styles.badgeContainer, { backgroundColor: colors.secondaryContainer + '1A', borderColor: colors.secondaryContainer + '33' }]}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.secondary} style={styles.badgeIcon} />
                    <Text style={[styles.badgeText, { color: colors.secondary }]}>{item.badge}</Text>
                </View>

                <Text style={[styles.title, { color: colors.secondary }]}>
                    {item.title}
                    <Text style={[styles.highlight, { color: colors.primary }]}>{item.highlight}</Text>
                </Text>

                <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
                    {item.description}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            
            {/* Global Faded Background */}
            <View style={styles.globalBackgroundContainer}>
                <Image 
                    source={CLASSROOM_BG}
                    style={styles.globalBackground}
                />
            </View>
            
            {/* Top Navigation / Header */}
            <SafeAreaView style={styles.header} edges={['top']}>
                <View style={styles.logoRow}>
                    <Ionicons name="hammer" size={28} color={colors.primary} />
                    <Text style={[styles.logoText, { color: colors.primary }]}>My Rights</Text>
                </View>
                {currentIndex < slides.length - 1 && (
                    <TouchableOpacity testID="onboarding-skip" accessibilityRole="button" accessibilityLabel="Skip onboarding" onPress={() => completeOnboarding()}>
                        <Text style={[styles.headerSkip, { color: colors.onSurfaceVariant }]}>Skip</Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>

            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id}
            />

            {/* Bottom Interaction Layer */}
            <View pointerEvents="box-none" style={styles.bottomContainer}>
                <SafeAreaView edges={['bottom']} style={styles.footerRow}>
                    
                    {/* Progress indicators */}
                    <View style={styles.pagination}>
                        {slides.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor: index === currentIndex ? colors.primary : colors.surfaceContainerHighest,
                                        width: index === currentIndex ? 32 : 8,
                                        shadowColor: index === currentIndex ? colors.primary : 'transparent',
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: index === currentIndex ? 0.6 : 0,
                                        shadowRadius: index === currentIndex ? 8 : 0,
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Primary Action */}
                    <TouchableOpacity testID="onboarding-primary" accessibilityRole="button" activeOpacity={0.8} onPress={handleNext} style={styles.buttonWrapper}>
                        <LinearGradient
                            colors={[colors.primary, colors.primaryContainer]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={[styles.buttonText, { color: colors.onPrimaryContainer }]}>
                                {currentIndex === slides.length - 1 ? "Get Started" : "Continue"}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color={colors.onPrimaryContainer} />
                        </LinearGradient>
                    </TouchableOpacity>

                </SafeAreaView>
            </View>

            {/* Background elements */}
            <View style={[styles.blob1, { backgroundColor: colors.primary + '0A' }]} />
            <View style={[styles.blob2, { backgroundColor: colors.secondaryContainer + '0A' }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 24,
        zIndex: 50,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoText: {
        fontFamily: theme.typography.displayMd.fontFamily,
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerSkip: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontWeight: '500',
        fontSize: 16,
    },
    slide: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 220, // Keep copy clear of the floating footer
    },
    imageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.4, // Grayscale effect fallback
    },
    contentContainer: {
        paddingHorizontal: 48, // Wide 3rem Hero margins
        zIndex: 20,
        maxWidth: 600,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
        borderWidth: 1,
        marginBottom: 24,
        gap: 6,
    },
    badgeIcon: {
        marginTop: -1,
    },
    badgeText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    title: {
        fontFamily: theme.typography.displayLg.fontFamily, // authoritative weight
        fontSize: 52,
        fontWeight: '800',
        lineHeight: 56,
        letterSpacing: -1.04, // tight editorial spacing
        marginBottom: 32,
    },
    highlight: {
        fontFamily: theme.typography.displayLg.fontFamily,
        fontStyle: 'italic',
        fontWeight: '900',
    },
    description: {
        fontFamily: theme.typography.bodyLg.fontFamily,
        fontSize: 18,
        lineHeight: 28,
        maxWidth: 320, // Asymmetric offset
        marginLeft: 12, // Intentional asymmetry
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingTop: 24,
        paddingBottom: 20,
        paddingHorizontal: 48, // Match slide margins
        zIndex: 30,
        borderTopWidth: 0, // NO-LINE RULE
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    pagination: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    buttonWrapper: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonText: {
        fontFamily: theme.typography.labelLg.fontFamily,
        fontSize: 18,
        fontWeight: '700',
    },
    blob1: {
        position: 'absolute',
        top: '25%',
        right: -80,
        width: 500,
        height: 500,
        borderRadius: 250,
        zIndex: 0,
        transform: [{ scale: 1.5 }],
    },
    blob2: {
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 400,
        height: 400,
        borderRadius: 200,
        zIndex: 0,
        transform: [{ scale: 1.5 }],
    },
    globalBackgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        zIndex: -1,
        backgroundColor: '#FFFFFF',
    },
    globalBackground: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.15, // 15% opacity as requested
    }
});
