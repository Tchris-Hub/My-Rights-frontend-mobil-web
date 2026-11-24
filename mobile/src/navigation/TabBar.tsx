/**
 * Bottom tab bar. Flat, always visible, four tabs with labels. Active tab gets a danfo-yellow bar on top.
 * In normal flow (not absolute), so screens never need to guess its height.
 */
import React, { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import theme from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const TABS: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }> = {
    HomeTab: { label: 'Home', icon: 'home-outline', iconActive: 'home' },
    AskTab: { label: 'Ask', icon: 'chatbubble-ellipses-outline', iconActive: 'chatbubble-ellipses' },
    HelpTab: { label: 'Get help', icon: 'location-outline', iconActive: 'location' },
    MeTab: { label: 'Me', icon: 'person-outline', iconActive: 'person' },
};

export const TabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [keyboardUp, setKeyboardUp] = useState(false);

    // The bar steps aside while typing so the composer and keyboard never fight it for space.
    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardUp(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardUp(false));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    if (keyboardUp) return null;

    return (
        <View style={[styles.bar, { backgroundColor: colors.card, borderTopColor: colors.line, paddingBottom: Math.max(insets.bottom, 6) }]}>
            {state.routes.map((route, index) => {
                const focused = state.index === index;
                const tab = TABS[route.name];
                if (!tab) return null;
                return (
                    <Pressable
                        key={route.key}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: focused }}
                        accessibilityLabel={tab.label}
                        testID={`tab-${route.name}`}
                        onPress={() => {
                            Haptics.selectionAsync();
                            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                            if (!focused && !event.defaultPrevented) navigation.navigate(route.name as never);
                        }}
                        style={styles.tab}
                    >
                        <View style={[styles.indicator, { backgroundColor: focused ? colors.danfo : 'transparent' }]} />
                        <Ionicons name={focused ? tab.iconActive : tab.icon} size={23} color={focused ? colors.tabBarIconActive : colors.tabBarIconInactive} />
                        <Text style={[styles.label, { color: focused ? colors.onSurface : colors.tabBarIconInactive, fontFamily: focused ? theme.typography.fontFamily.headline : theme.typography.fontFamily.bodyMedium }]}>
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    bar: { flexDirection: 'row', borderTopWidth: 1 },
    tab: { flex: 1, alignItems: 'center', paddingTop: 8, paddingBottom: 2, minHeight: 56 },
    indicator: { position: 'absolute', top: -1, height: 3, width: 28, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
    label: { fontSize: 11.5, marginTop: 2 },
});
