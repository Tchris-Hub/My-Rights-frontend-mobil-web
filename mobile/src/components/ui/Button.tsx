/**
 * Premium Button Component
 * Multiple variants with micro-interactions and haptic feedback
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
    StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import theme from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
}) => {
    const handlePress = () => {
        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[`button_${variant}`],
                styles[`button_${size}`],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={handlePress}
            disabled={isDisabled}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.onPrimary}
                    size="small"
                />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
                    <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    // Variants
    button_primary: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.sm,
    },
    button_secondary: {
        backgroundColor: theme.colors.secondary,
        ...theme.shadows.sm,
    },
    button_outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    button_ghost: {
        backgroundColor: 'transparent',
    },
    button_danger: {
        backgroundColor: theme.colors.error,
        ...theme.shadows.sm,
    },

    // Sizes
    button_small: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
    },
    button_medium: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: theme.touchTargets.min,
    },
    button_large: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: theme.touchTargets.comfortable,
    },

    // Text styles
    text: {
        ...theme.typography.button,
        textAlign: 'center',
    },
    text_primary: {
        color: theme.colors.onPrimary,
    },
    text_secondary: {
        color: theme.colors.onSecondary,
    },
    text_outline: {
        color: theme.colors.primary,
    },
    text_ghost: {
        color: theme.colors.primary,
    },
    text_danger: {
        color: theme.colors.onPrimary,
    },
    text_small: {
        fontSize: 14,
    },
    text_medium: {
        fontSize: 16,
    },
    text_large: {
        fontSize: 18,
    },

    // States
    disabled: {
        opacity: 0.5,
    },

    // Layout
    fullWidth: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: theme.spacing.sm,
    },
    iconRight: {
        marginLeft: theme.spacing.sm,
    },
});
