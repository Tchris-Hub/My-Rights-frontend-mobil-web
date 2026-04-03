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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
                styles.buttonBase,
                styles[`buttonBase_${size}`],
                fullWidth && styles.fullWidth,
                style,
            ]}
            onPress={handlePress}
            disabled={isDisabled}
            activeOpacity={0.7}
        >
            <View style={[styles.container, isDisabled && styles.disabled, styles[`container_${variant}`]]}>
                {variant === 'primary' && (
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.primaryContainer]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                        locations={[0, 1]}
                    />
                )}
                {variant === 'secondary' && (
                    <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFillObject} />
                )}
                <View style={styles.content}>
                    {loading ? (
                        <ActivityIndicator
                            color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.onPrimary}
                            size="small"
                        />
                    ) : (
                        <>
                            {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
                            <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
                                {title}
                            </Text>
                            {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
                        </>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonBase: {
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden', // Ensures inner gradient/blur conforms to border radius
        justifyContent: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.4)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 6,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Variants
    container_primary: {
        // LinearGradient applied via absoluteFill
    },
    container_secondary: {
        backgroundColor: 'rgba(34, 42, 61, 0.7)', // surfaceContainerHigh @ 70%
    },
    container_outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: 'rgba(61, 74, 65, 0.2)', // ghost border fallback
    },
    container_ghost: {
        backgroundColor: 'transparent',
    },
    container_danger: {
        backgroundColor: theme.colors.error,
    },

    // Sizes
    buttonBase_small: {
        minHeight: 36,
    },
    buttonBase_medium: {
        minHeight: theme.touchTargets.min,
    },
    buttonBase_large: {
        minHeight: theme.touchTargets.comfortable,
    },

    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        width: '100%',
        height: '100%',
        zIndex: 1, // Ensure content sits above gradient/blur
    },

    // Text styles
    text: {
        ...theme.typography.labelMd,
        fontFamily: theme.typography.fontFamily.headline,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    text_primary: {
        color: '#00331d', // onPrimaryContainer to match gradient
    },
    text_secondary: {
        color: theme.colors.primary,
    },
    text_outline: {
        color: theme.colors.onSurface,
    },
    text_ghost: {
        color: theme.colors.onSurface,
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
    iconLeft: {
        marginRight: theme.spacing.sm,
        zIndex: 1,
    },
    iconRight: {
        marginLeft: theme.spacing.sm,
        zIndex: 1,
    },
});
