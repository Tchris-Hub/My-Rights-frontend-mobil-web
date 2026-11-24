/**
 * Card. A white block on paper with a 1px line. No shadow, no blur.
 * `variant` values are kept for existing call sites: solid = tinted block, others = outlined card.
 */

import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

type CardVariant = 'solid' | 'glass' | 'elevated' | 'outlined';

interface CardProps {
    children: React.ReactNode;
    /** @deprecated no effect; the design is flat */
    elevation?: 'none' | 'ambientFloat' | 'glass';
    variant?: CardVariant;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    padded?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, variant = 'outlined', onPress, style, padded = true }) => {
    const { colors } = useTheme();
    const tinted = variant === 'solid';

    const base: ViewStyle = {
        backgroundColor: tinted ? colors.surfaceContainer : colors.card,
        borderColor: tinted ? 'transparent' : colors.line,
        borderWidth: tinted ? 0 : 1,
    };

    if (!onPress) {
        return <View style={[styles.card, base, padded && styles.padded, style]}>{children}</View>;
    }

    return (
        <Pressable
            accessibilityRole="button"
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }}
            style={({ pressed }) => [
                styles.card,
                base,
                padded && styles.padded,
                pressed && { backgroundColor: colors.surfaceContainer },
                style,
            ]}
        >
            {children}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: { borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
    padded: { padding: theme.spacing.md },
});
