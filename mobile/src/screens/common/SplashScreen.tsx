import React, { useEffect, useState } from 'react';
import { StyleSheet, StatusBar, Image, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS, withDelay, Easing } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SplashScreenProps {
    onAnimationFinish?: () => void;
    isAppReady?: boolean;
}

export const CustomSplashScreen: React.FC<SplashScreenProps> = ({ onAnimationFinish, isAppReady = false }) => {
    const { colors } = useTheme();
    const [isAnimationDone, setIsAnimationDone] = useState(false);
    const containerOpacity = useSharedValue(1);
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.8);
    const textOpacity = useSharedValue(0);

    useEffect(() => {
        // Sequenced animation - Stretched for 6-second cinematic feel
        logoOpacity.value = withTiming(1, { duration: 2500, easing: Easing.out(Easing.exp) });
        logoScale.value = withTiming(1, { duration: 2500, easing: Easing.out(Easing.exp) });

        textOpacity.value = withDelay(2000, withTiming(1, { duration: 1500 }, (finished) => {
            if (finished) {
                runOnJS(setIsAnimationDone)(true);
            }
        }));

        const hideNativeSplash = async () => {
            try {
                // Keep native splash a bit longer to ensure JS is ready
                await new Promise(resolve => setTimeout(resolve, 200));
                await SplashScreen.hideAsync();
            } catch (e) {
                console.warn('Error hiding splash screen:', e);
            }
        };
        hideNativeSplash();
    }, []);

    useEffect(() => {
        if (isAppReady && isAnimationDone) {
            // Wait before transitioning to app to reach total ~6s
            containerOpacity.value = withDelay(2000, withTiming(0, { duration: 500 }, (finished) => {
                if (finished && onAnimationFinish) {
                    runOnJS(onAnimationFinish)();
                }
            }));
        }
    }, [isAppReady, isAnimationDone]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
        backgroundColor: colors.primary,
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            <SafeAreaView style={styles.safeArea}>
                <Animated.View style={[styles.mainContent, contentStyle]}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../../assets/icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <Animated.View style={[styles.textGroup, textStyle]}>
                        <Text style={styles.title}>
                            My <Text style={{ color: '#D4AF37' }}>Rights</Text>
                        </Text>
                        <Text style={styles.subtitle}>POWERED BY JUSTICE AI</Text>
                    </Animated.View>
                </Animated.View>
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
    logoContainer: {
        width: 160,
        height: 160,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    textGroup: {
        marginTop: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 12,
        letterSpacing: 3,
        fontWeight: '600',
    },
});

// For backward compatibility if needed, or update imports elsewhere
export const SplashScreenComponent = CustomSplashScreen;
export default CustomSplashScreen; // Default export
