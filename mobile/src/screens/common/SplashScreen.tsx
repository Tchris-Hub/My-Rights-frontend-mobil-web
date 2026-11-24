/**
 * Splash. Indigo field, the mark pops in, the name slides up. About 900ms, then hands over.
 * No taglines, no loops. It waits for the app to be ready but never longer than it needs to.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Mark } from '../../components/brand/Mark';
import theme from '../../constants/theme';

interface SplashScreenProps {
    onAnimationFinish?: () => void;
    isAppReady?: boolean;
}

export const CustomSplashScreen: React.FC<SplashScreenProps> = ({ onAnimationFinish, isAppReady = true }) => {
    const markScale = useRef(new Animated.Value(0.6)).current;
    const markOpacity = useRef(new Animated.Value(0)).current;
    const nameOpacity = useRef(new Animated.Value(0)).current;
    const nameShift = useRef(new Animated.Value(10)).current;
    const exit = useRef(new Animated.Value(1)).current;
    const introDone = useRef(false);
    const finished = useRef(false);

    const tryExit = () => {
        if (finished.current || !introDone.current) return;
        finished.current = true;
        Animated.timing(exit, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => onAnimationFinish?.());
    };

    useEffect(() => {
        SplashScreen.hideAsync().catch(() => undefined);
        Animated.sequence([
            Animated.parallel([
                Animated.timing(markOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(markScale, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(nameOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
                Animated.timing(nameShift, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]),
            Animated.delay(250),
        ]).start(() => {
            introDone.current = true;
            if (isAppReady) tryExit();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isAppReady) tryExit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAppReady]);

    return (
        <Animated.View style={[styles.container, { opacity: exit }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <Animated.View style={{ opacity: markOpacity, transform: [{ scale: markScale }] }}>
                <Mark size={96} />
            </Animated.View>
            <Animated.View style={{ opacity: nameOpacity, transform: [{ translateY: nameShift }] }}>
                <Text style={styles.name}>My Rights</Text>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', gap: 18 },
    name: { fontFamily: theme.typography.fontFamily.display, fontSize: 34, letterSpacing: -0.8, color: '#FFFFFF' },
});
