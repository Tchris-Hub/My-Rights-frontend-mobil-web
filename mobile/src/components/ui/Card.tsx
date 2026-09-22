/**
 * Premium Card Component
 * Elevated container with press states and shadows
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

type CardElevation = 'none' | 'ambientFloat' | 'glass';
type CardVariant = 'solid' | 'glass' | 'elevated';

interface CardProps {
    children: React.ReactNode;
    elevation?: CardElevation;
    variant?: CardVariant;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
    children,
    elevation = 'ambientFloat',
    variant = 'elevated',
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
    
    // Solid cards use surfaceContainer, Elevated uses shadow+surfaceContainerLow, Glass uses blur
    const backgroundColor = variant === 'solid' 
        ? colors.surfaceContainer 
        : variant === 'elevated' 
            ? colors.surfaceContainerLow 
            : 'rgba(255, 255, 255, 0.05)'; // Glass fallback

    const cardStyle = [
        styles.cardBase,
        variant !== 'glass' && { backgroundColor },
        variant === 'elevated' && elevation !== 'none' && theme.shadows[elevation],
        variant === 'glass' && theme.shadows.glass,
        style,
    ];

    const content = variant === 'glass' ? (
        <BlurView intensity={24} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: theme.borderRadius.lg }]}>
            <View style={styles.cardContent}>{children}</View>
        </BlurView>
    ) : (
        <View style={styles.cardContent}>{children}</View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                style={cardStyle}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                {content}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyle}>{content}</View>;
};

const styles = StyleSheet.create({
    cardBase: {
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden', // Contain the blur view
        borderWidth: 0, // Stitch strict No-Line rule
    },
    cardContent: {
        padding: theme.spacing.md,
    }
});
