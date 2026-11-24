/**
 * Button. Flat, square-ish, one pressed state (darker fill), no shadow.
 * Variants: primary (indigo), accent (danfo yellow), secondary (tinted), outline, ghost, danger (signal red).
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
    testID?: string;
    accessibilityLabel?: string;
}

const HEIGHT: Record<ButtonSize, number> = { small: 40, medium: 48, large: 56 };
const FONT_SIZE: Record<ButtonSize, number> = { small: 14, medium: 16, large: 17 };

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
    testID,
    accessibilityLabel,
}) => {
    const { colors } = useTheme();
    const isDisabled = disabled || loading;

    const palette = {
        primary: { bg: colors.primary, pressed: colors.onPrimaryFixedVariant, fg: colors.onPrimary, border: 'transparent' },
        accent: { bg: colors.tertiary, pressed: '#DDA400', fg: colors.onTertiary, border: 'transparent' },
        secondary: { bg: colors.primaryContainer, pressed: colors.surfaceContainerHigh, fg: colors.onPrimaryContainer, border: 'transparent' },
        outline: { bg: 'transparent', pressed: colors.surfaceContainer, fg: colors.onSurface, border: colors.outline },
        ghost: { bg: 'transparent', pressed: colors.surfaceContainer, fg: colors.primary, border: 'transparent' },
        danger: { bg: colors.error, pressed: '#B52A23', fg: colors.onError, border: 'transparent' },
    }[variant];

    return (
        <Pressable
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }}
            disabled={isDisabled}
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? title}
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={({ pressed }) => [
                styles.base,
                {
                    minHeight: HEIGHT[size],
                    backgroundColor: pressed ? palette.pressed : palette.bg,
                    borderColor: palette.border,
                    borderWidth: palette.border === 'transparent' ? 0 : 1.5,
                    opacity: isDisabled ? 0.45 : 1,
                },
                fullWidth && styles.fullWidth,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={palette.fg} size="small" />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' ? <View style={styles.iconLeft}>{icon}</View> : null}
                    <Text style={[styles.text, { color: palette.fg, fontSize: FONT_SIZE[size] }]} numberOfLines={1}>
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' ? <View style={styles.iconRight}>{icon}</View> : null}
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    fullWidth: { alignSelf: 'stretch' },
    content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    text: { fontFamily: theme.typography.fontFamily.headline, textAlign: 'center' },
    iconLeft: { marginRight: 8 },
    iconRight: { marginLeft: 8 },
});
