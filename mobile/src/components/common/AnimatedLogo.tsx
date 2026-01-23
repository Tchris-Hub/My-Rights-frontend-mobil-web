import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    withDelay,
    Easing,
    useAnimatedStyle,
} from 'react-native-reanimated';
import theme from '../../constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedLine = Animated.createAnimatedComponent(Line);

import { runOnJS } from 'react-native-reanimated';

interface AnimatedLogoProps {
    size?: number;
    primaryColor?: string;
    secondaryColor?: string;
    onAnimationComplete?: () => void;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
    size = 120,
    primaryColor = theme.colors.primary,
    secondaryColor = theme.colors.secondary,
    onAnimationComplete
}) => {
    const shieldOpacity = useSharedValue(0);
    const shieldScale = useSharedValue(0.8);
    const beamOpacity = useSharedValue(0);
    const platesOpacity = useSharedValue(0);
    const checkOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    // Cinematic easing
    const cinematicEasing = Easing.bezier(0.25, 1, 0.5, 1);

    useEffect(() => {
        shieldOpacity.value = withTiming(1, { duration: 1200, easing: cinematicEasing });
        shieldScale.value = withTiming(1, { duration: 1200, easing: cinematicEasing });

        beamOpacity.value = withDelay(400, withTiming(1, { duration: 1000, easing: cinematicEasing }));
        platesOpacity.value = withDelay(800, withTiming(1, { duration: 1000, easing: cinematicEasing }));
        checkOpacity.value = withDelay(1400, withTiming(1, { duration: 1000, easing: cinematicEasing }));

        textOpacity.value = withDelay(2000, withTiming(1, { duration: 1000, easing: cinematicEasing }, (finished) => {
            if (finished && onAnimationComplete) {
                runOnJS(onAnimationComplete)();
            }
        }));
    }, []);

    const shieldProps = useAnimatedProps(() => ({
        opacity: shieldOpacity.value,
        transform: [{ scale: shieldScale.value }],
    }));

    const beamProps = useAnimatedProps(() => ({
        opacity: beamOpacity.value,
    }));

    const platesProps = useAnimatedProps(() => ({
        opacity: platesOpacity.value,
    }));

    const checkProps = useAnimatedProps(() => ({
        opacity: checkOpacity.value,
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    return (
        <View style={[styles.container, { width: size, height: size + 40 }]}>
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Defs>
                    <LinearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor={primaryColor} stopOpacity="1" />
                        <Stop offset="0.5" stopColor="#4A90E2" stopOpacity="1" />
                        <Stop offset="1" stopColor={primaryColor} stopOpacity="1" />
                    </LinearGradient>
                    <LinearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor={secondaryColor} stopOpacity="0" />
                        <Stop offset="0.5" stopColor={secondaryColor} stopOpacity="1" />
                        <Stop offset="1" stopColor={secondaryColor} stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {/* Shield Body */}
                <AnimatedPath
                    d="M50 10 L15 25 V55 C15 75 50 90 50 90 C50 90 85 75 85 55 V25 L50 10 Z"
                    stroke="url(#shieldGrad)"
                    strokeWidth="3"
                    fill="rgba(0, 34, 68, 0.3)" // Semi-transparent fill
                    animatedProps={shieldProps}
                />

                {/* Beam/Scanner Effect */}
                <AnimatedLine
                    x1="20" y1="45" x2="80" y2="45"
                    stroke="url(#beamGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    animatedProps={beamProps}
                />

                {/* Decorative Plates - Refined */}
                <AnimatedPath
                    d="M30 48 L35 48 L32 55 Z"
                    fill={primaryColor}
                    animatedProps={platesProps}
                />
                <AnimatedPath
                    d="M70 48 L65 48 L68 55 Z"
                    fill={primaryColor}
                    animatedProps={platesProps}
                />

                {/* Checkmark - Sharp and Clean */}
                <AnimatedPath
                    d="M38 68 L48 78 L62 50"
                    stroke={secondaryColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    animatedProps={checkProps}
                />
            </Svg>

            <Animated.View style={[styles.textContainer, textStyle]}>
                <Text style={[styles.text, { color: primaryColor, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 2 } }]}>
                    My <Text style={{ color: secondaryColor }}>Rights</Text>
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        marginTop: 10,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    }
});
