/**
 * Premium Glassmorphic Floating Tab Bar
 * The crown jewel of navigation - meticulously crafted with optical spacing
 */

import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import theme from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Tab bar specifications (12-14% of screen height)
const TAB_BAR_HEIGHT = Math.min(Math.max(SCREEN_HEIGHT * 0.13, 80), 90);
const HORIZONTAL_MARGIN = 16;
const BOTTOM_SPACING = 16; // Breathing space below bar
const ICON_SIZE = 24;
const FOCUS_HUB_SIZE = 56;
const ICON_CONTAINER_SIZE = 56;

const TabItem = ({ route, index, state, descriptors, navigation, getTabIcon }: any) => {
    const isFocused = state.index === index;
    const isFocusHub = route.name === 'Chat';
    const scale = useSharedValue(isFocused ? 1.15 : 1);

    React.useEffect(() => {
        scale.value = withSpring(isFocused ? 1.15 : 1, {
            damping: 12,
            stiffness: 90,
        });
    }, [isFocused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const onPress = () => {
        if (isFocusHub) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }
    };

    const iconName = getTabIcon(route.name, isFocused);

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
        >
            <Animated.View style={animatedStyle}>
                {isFocusHub ? (
                    <View style={[styles.focusHub, isFocused && styles.focusHubActive]}>
                        <Ionicons
                            name={iconName}
                            size={ICON_SIZE}
                            color={theme.colors.onSecondary}
                        />
                    </View>
                ) : (
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={iconName}
                            size={ICON_SIZE}
                            color={
                                isFocused
                                    ? theme.colors.tabBarIconActive
                                    : theme.colors.tabBarIconInactive
                            }
                            style={isFocused && styles.activeIconGlow}
                        />
                    </View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

export const GlassmorphicTabBar: React.FC<BottomTabBarProps> = (props) => {
    const { state, descriptors, navigation } = props;
    const insets = useSafeAreaInsets();

    const focusedOptions = descriptors[state.routes[state.index].key].options;
    const isTabBarHidden = (focusedOptions.tabBarStyle as any)?.display === 'none';

    if (isTabBarHidden) {
        return null;
    }

    const getTabIcon = (routeName: string, isFocused: boolean) => {
        const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Chat: 'chatbubble',
            Tools: 'briefcase',
            Profile: 'person',
        };
        return iconMap[routeName] || 'help-circle';
    };

    return (
        <View
            style={[
                styles.container,
                {
                    bottom: insets.bottom + BOTTOM_SPACING,
                    width: SCREEN_WIDTH - (HORIZONTAL_MARGIN * 2),
                    height: TAB_BAR_HEIGHT,
                },
            ]}
        >
            <BlurView
                intensity={Platform.OS === 'ios' ? 80 : 60}
                tint="dark"
                style={StyleSheet.absoluteFill}
            >
                <View style={styles.glassBackground} />
            </BlurView>

            <View style={styles.tabsContainer}>
                {state.routes.map((route, index) => (
                    <TabItem
                        key={route.key}
                        route={route}
                        index={index}
                        state={state}
                        descriptors={descriptors}
                        navigation={navigation}
                        getTabIcon={getTabIcon}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: HORIZONTAL_MARGIN,
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        // Outer shadow (soft elevation)
        ...theme.shadows.glass,
    },

    glassBackground: {
        flex: 1,
        backgroundColor: theme.colors.tabBarBackground,
        // Inner shadow (subtle top highlight)
        borderTopWidth: 1,
        borderTopColor: theme.colors.tabBarBorder,
    },

    tabsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: theme.spacing.md,
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: ICON_CONTAINER_SIZE,
    },

    iconContainer: {
        width: ICON_CONTAINER_SIZE,
        height: ICON_CONTAINER_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        // Icons sit 2px above optical center (compensates for badges)
        paddingBottom: 2,
    },

    // Focus Hub (Chat tab)
    focusHub: {
        width: FOCUS_HUB_SIZE,
        height: FOCUS_HUB_SIZE,
        borderRadius: FOCUS_HUB_SIZE / 2,
        backgroundColor: theme.colors.primaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
        // Slightly overlaps the tab bar visually
        ...theme.shadows.ambientFloat,
    },

    focusHubActive: {
        // Subtle scale animation effect (handled by TouchableOpacity activeOpacity)
        transform: [{ scale: 1.0 }],
    },

    // Active icon glow (non-focus tabs)
    activeIconGlow: {
        shadowColor: theme.colors.tabBarIconActive,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
