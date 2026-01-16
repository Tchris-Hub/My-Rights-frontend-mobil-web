/**
 * Premium Card Component
 * Elevated container with press states and shadows
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

type CardElevation = 'sm' | 'md' | 'lg';

interface CardProps {
    children: React.ReactNode;
    elevation?: CardElevation;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
    children,
    elevation = 'md',
    onPress,
    style,
}) => {
    const { colors } = useTheme();

    const handlePress = () => {
        if (onPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        }
    };

    const cardStyle = [
        styles.card,
        { backgroundColor: colors.surface },
        theme.shadows[elevation],
        style,
    ];

    if (onPress) {
        return (
            <TouchableOpacity
                style={cardStyle}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
    },
});
