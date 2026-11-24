/**
 * Background job toast. Sits just above the tab bar, flat, one line.
 * Shown while a document is being analysed or drafted so the person can leave the screen.
 */
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJobs } from '../../contexts/JobContext';
import { useTheme } from '../../contexts/ThemeContext';
import theme from '../../constants/theme';

const TAB_BAR_HEIGHT = 58;

export const BackgroundJobOverlay: React.FC = () => {
    const { activeJob, clearJob } = useJobs();
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const slide = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    useEffect(() => {
        Animated.timing(slide, { toValue: activeJob ? 1 : 0, duration: 200, useNativeDriver: true }).start();
    }, [activeJob, slide]);

    if (!activeJob || keyboardVisible) return null;

    const open = () => {
        if (activeJob.status !== 'completed' && activeJob.status !== 'running') return;
        const screen = activeJob.type === 'analysis' ? 'DocumentReview' : activeJob.type === 'generation' ? 'DocumentGenerate' : null;
        if (screen) navigation.navigate('Main', { screen: 'HomeTab', params: { screen, params: { jobId: activeJob.id } } });
    };

    const info =
        activeJob.status === 'running'
            ? { icon: <ActivityIndicator size="small" color={colors.primary} />, text: activeJob.progress || 'Working on it. You can keep using the app.', tint: colors.primaryContainer }
            : activeJob.status === 'completed'
                ? { icon: <Ionicons name="checkmark-circle" size={22} color={colors.verified} />, text: 'Ready. Tap to open.', tint: colors.verifiedContainer }
                : activeJob.status === 'failed'
                    ? { icon: <Ionicons name="alert-circle" size={22} color={colors.error} />, text: 'That did not work. Tap to try again.', tint: colors.errorContainer }
                    : null;
    if (!info) return null;

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[
                styles.wrap,
                { bottom: TAB_BAR_HEIGHT + insets.bottom + 10, opacity: slide, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
            ]}
        >
            <Pressable accessibilityRole="button" onPress={open} style={[styles.toast, { backgroundColor: colors.card, borderColor: colors.line }]}>
                <View style={[styles.icon, { backgroundColor: info.tint }]}>{info.icon}</View>
                <View style={styles.text}>
                    <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>{activeJob.title}</Text>
                    <Text style={[styles.status, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{info.text}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Dismiss" hitSlop={10} onPress={clearJob} style={styles.close}>
                    <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
                </Pressable>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrap: { position: 'absolute', left: 12, right: 12, zIndex: 100 },
    toast: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: theme.borderRadius.lg, borderWidth: 1, ...theme.shadows.sheet },
    icon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    text: { flex: 1 },
    title: { ...theme.typography.labelMd, fontFamily: theme.typography.fontFamily.headlineMedium },
    status: { ...theme.typography.caption },
    close: { padding: 4 },
});
