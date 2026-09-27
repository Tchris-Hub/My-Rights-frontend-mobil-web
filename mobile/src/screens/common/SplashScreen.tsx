import React, { useEffect, useState } from 'react';
import { StyleSheet, StatusBar, Image, Text, View, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    runOnJS,
    withDelay,
    Easing,
    withRepeat,
    withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SplashScreenProps {
    onAnimationFinish?: () => void;
    isAppReady?: boolean;
}

const FUNNY_SUBTITLES = [
    "READING THE FINE PRINT SO YOU DON'T HAVE TO",
    "LAWYERING WITHOUT THE HOURLY RATE",
    "OBJECTION! (JUST KIDDING, WE'RE COOL)",
    "100% JUSTICE. 0% DRAMA.",
    "SUING YOUR PROBLEMS INTO OBLIVION",
    "YOUR RIGHTS, BUT MAKE IT FASHION",
    "AI LAWYER: CHEAPER THAN A RETAINER",
    "LITIGATING FROM THE COUCH",
    "SQUASHING BUGS AND LEGAL THUGS",
    "COURTROOM DRAMA NOT INCLUDED",
];

export const CustomSplashScreen: React.FC<SplashScreenProps> = ({ onAnimationFinish, isAppReady = false }) => {
    const { colors, isDark } = useTheme();
    const [isAnimationDone, setIsAnimationDone] = useState(false);
    const [randomSubtitle, setRandomSubtitle] = useState('');

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * FUNNY_SUBTITLES.length);
        setRandomSubtitle(FUNNY_SUBTITLES[randomIndex]);
    }, []);

    // Shared values for staggered animations
    const containerOpacity = useSharedValue(1);
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.7);
    const logoTranslateY = useSharedValue(20);
    const titleOpacity = useSharedValue(0);
    const titleTranslateY = useSharedValue(10);
    const subtitleOpacity = useSharedValue(0);
    const floatValue = useSharedValue(0);

    useEffect(() => {
        // 1. Logo Reveal (0ms)
        logoOpacity.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) });
        logoScale.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.exp) });
        logoTranslateY.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.exp) });

        // 2. Title Reveal (800ms)
        titleOpacity.value = withDelay(800, withTiming(1, { duration: 1000 }));
        titleTranslateY.value = withDelay(800, withTiming(0, { duration: 1000 }));

        // 3. Subtitle Reveal (1500ms)
        subtitleOpacity.value = withDelay(1500, withTiming(1, { duration: 800 }, (finished) => {
            if (finished) {
                runOnJS(setIsAnimationDone)(true);
            }
        }));

        // 4. Subtle Float Loop
        floatValue.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );

        const hideNativeSplash = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 300));
                await SplashScreen.hideAsync();
            } catch (e) {
                console.warn('Error hiding splash screen:', e);
            }
        };
        hideNativeSplash();
    }, []);

    useEffect(() => {
        if (isAppReady && isAnimationDone) {
            // Smooth exit transition
            containerOpacity.value = withDelay(1000, withTiming(0, { duration: 800 }, (finished) => {
                if (finished && onAnimationFinish) {
                    runOnJS(onAnimationFinish)();
                }
            }));
        }
    }, [isAppReady, isAnimationDone]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [
            { scale: logoScale.value },
            { translateY: logoTranslateY.value + floatValue.value }
        ],
    }));

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleTranslateY.value }],
    }));

    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOpacity.value,
    }));

    return (
        <Animated.View testID={isAppReady ? "app-splash-ready" : "app-session-restoring"} style={[styles.container, containerStyle]}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={['#004D2C', '#002244']} // Emerald to Deep Navy gradient
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.mainContent}>
                    {/* Glassmorphism Logo Container */}
                    <Animated.View style={[styles.logoWrapper, logoStyle]}>
                        <BlurView
                            intensity={30}
                            tint="light"
                            style={styles.logoBlur}
                        >
                            <Image
                                source={require('../../../assets/premium_logo.png')}
                                style={styles.logo}
                                resizeMode="cover"
                            />
                        </BlurView>
                        {/* Shadow drop under the floating logo */}
                        <View style={styles.logoShadow} />
                    </Animated.View>

                    <View style={styles.textGroup}>
                        <Animated.View style={titleStyle}>
                            <Text style={styles.title}>
                                My <Text style={{ color: '#D4AF37' }}>Rights</Text>
                            </Text>
                        </Animated.View>

                        <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
                            <View style={styles.line} />
                            <Text style={styles.subtitle}>{randomSubtitle}</Text>
                            <View style={styles.line} />
                        </Animated.View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.version}>v1.0.0 • INVESTOR GRADE</Text>
                </View>
            </SafeAreaView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    safeArea: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    logoBlur: {
        width: 180,
        height: 180,
        borderRadius: 45,
        padding: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    logoShadow: {
        position: 'absolute',
        bottom: -20,
        width: 120,
        height: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 50,
        filter: 'blur(10px)',
    },
    textGroup: {
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    subtitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 12,
    },
    subtitle: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 4,
        fontWeight: '700',
    },
    line: {
        height: 1,
        width: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    footer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    version: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 2,
        fontWeight: '700',
    },
});

export default CustomSplashScreen;
