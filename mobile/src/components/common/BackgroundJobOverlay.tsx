import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ActivityIndicator, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    interpolate
} from 'react-native-reanimated';
import { useJobs } from '../../contexts/JobContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BackgroundJobOverlay: React.FC = () => {
    const { activeJob, clearJob } = useJobs();
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => { show.remove(); hide.remove(); };
    }, []);

    const translateY = useSharedValue(100);
    const opacity = useSharedValue(0);
    const pulse = useSharedValue(1);

    useEffect(() => {
        if (activeJob) {
            translateY.value = withSpring(0, { damping: 15 });
            opacity.value = withTiming(1, { duration: 300 });

            if (activeJob.status === 'completed') {
                pulse.value = withRepeat(
                    withSequence(
                        withTiming(1.05, { duration: 800 }),
                        withTiming(1, { duration: 800 })
                    ),
                    -1,
                    true
                );
            } else {
                pulse.value = 1;
            }
        } else {
            translateY.value = withTiming(100, { duration: 500 });
            opacity.value = withTiming(0, { duration: 300 });
        }
    }, [activeJob?.id, activeJob?.status]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: pulse.value }
        ],
        opacity: opacity.value,
    }));

    if (!activeJob || keyboardVisible) return null;

    const handlePress = () => {
        if (activeJob.status === 'completed' || activeJob.status === 'running') {
            // Navigate to the target screen if specified, or provide contextual navigation
            if (activeJob.type === 'analysis') {
                navigation.navigate('Tools', { screen: 'DocumentReview', params: { jobId: activeJob.id } });
            } else if (activeJob.type === 'generation') {
                navigation.navigate('Tools', { screen: 'DocumentGenerate', params: { jobId: activeJob.id } });
            }
        }

        if (activeJob.status === 'completed') {
            // Once viewed, we can clear it or let the screen handle it
            // For now, let's keep it until they manually dismiss or navigate
        }
    };

    const getStatusInfo = () => {
        switch (activeJob.status) {
            case 'running':
                return {
                    icon: <ActivityIndicator size="small" color={colors.primary} />,
                    text: activeJob.progress || 'AI Architecting...',
                    color: colors.primary
                };
            case 'completed':
                return {
                    icon: <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />,
                    text: 'Review Results',
                    color: theme.colors.success
                };
            case 'failed':
                return {
                    icon: <Ionicons name="alert-circle" size={24} color={theme.colors.error} />,
                    text: 'Analysis Failed',
                    color: theme.colors.error
                };
            default:
                return null;
        }
    };

    const status = getStatusInfo();
    if (!status) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle, { bottom: theme.spacing.xl + insets.bottom }]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                style={styles.touchable}
            >
                <BlurView
                    intensity={isDark ? 40 : 80}
                    tint={isDark ? 'dark' : 'light'}
                    style={styles.blur}
                >
                    <View style={styles.content}>
                        <View style={styles.leftSection}>
                            <View style={[styles.iconContainer, { backgroundColor: status.color + '15' }]}>
                                {status.icon}
                            </View>
                            <View>
                                <Text style={[styles.jobTitle, { color: colors.onSurface }]} numberOfLines={1}>
                                    {activeJob.title}
                                </Text>
                                <Text style={[styles.jobStatus, { color: status.color }]}>
                                    {status.text}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                clearJob();
                            }}
                            style={styles.closeBtn}
                        >
                            <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100, // Above bottom tabs
        left: 16,
        right: 16,
        zIndex: 10000,
    },
    touchable: {
        borderRadius: 24,
        overflow: 'hidden',
        ...theme.shadows.glass,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    blur: {
        padding: 12,
        paddingHorizontal: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    jobTitle: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    jobStatus: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    closeBtn: {
        padding: 4,
    }
});
