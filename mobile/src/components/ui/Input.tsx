/**
 * Premium Input Component
 * Text input with floating labels, icons, and animations
 */

import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    value,
    onFocus,
    onBlur,
    ...textInputProps
}) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

    const handleFocus = (e: any) => {
        setIsFocused(true);
        Animated.timing(labelAnimation, {
            toValue: 1,
            duration: theme.animations.fast,
            useNativeDriver: false,
        }).start();
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        if (!value) {
            Animated.timing(labelAnimation, {
                toValue: 0,
                duration: theme.animations.fast,
                useNativeDriver: false,
            }).start();
        }
        onBlur?.(e);
    };

    const labelStyle = {
        top: labelAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -8],
        }),
        fontSize: labelAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
    };

    const borderColor = error
        ? colors.error
        : isFocused
            ? colors.borderFocus
            : colors.border;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Animated.Text
                    style={[
                        styles.label,
                        labelStyle,
                        { color: error ? colors.error : isFocused ? colors.primary : colors.textSecondary },
                        { backgroundColor: colors.background },
                    ]}
                >
                    {label}
                </Animated.Text>
            )}

            <View style={[styles.inputContainer, { borderColor }]}>
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={colors.textSecondary}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    style={[
                        styles.input,
                        { color: colors.text },
                        leftIcon && styles.inputWithLeftIcon,
                        rightIcon && styles.inputWithRightIcon,
                    ]}
                    placeholderTextColor={colors.textTertiary}
                    value={value}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...textInputProps}
                />

                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.rightIcon}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name={rightIcon} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        position: 'absolute',
        left: theme.spacing.md,
        paddingHorizontal: 4,
        zIndex: 1,
        ...theme.typography.bodySmall,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: theme.borderRadius.md,
        minHeight: theme.touchTargets.comfortable,
    },
    input: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        ...theme.typography.body,
    },
    inputWithLeftIcon: {
        paddingLeft: theme.spacing.sm,
    },
    inputWithRightIcon: {
        paddingRight: theme.spacing.sm,
    },
    leftIcon: {
        marginLeft: theme.spacing.md,
    },
    rightIcon: {
        marginRight: theme.spacing.md,
    },
    errorText: {
        marginTop: theme.spacing.xs,
        marginLeft: theme.spacing.md,
        ...theme.typography.caption,
    },
});
