import React, { useState, useRef, useMemo, useEffect } from 'react';
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

/**
 * Standardized Input scaling and positioning for the "Editorial" feel.
 * Using Transforms instead of Top/Left to keep animations on the Native UI thread.
 */
const InputComponent: React.FC<InputProps> = ({
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
    
    // 0 = active placeholder, 1 = floating label
    const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(labelAnimation, {
            toValue: value ? 1 : 0,
            duration: theme.animations.fast,
            useNativeDriver: true,
        }).start();
    }, [value, labelAnimation]);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        Animated.timing(labelAnimation, {
            toValue: 1,
            duration: theme.animations.fast,
            useNativeDriver: true, // Switched to true for maximum smoothness
        }).start();
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        if (!value) {
            Animated.timing(labelAnimation, {
                toValue: 0,
                duration: theme.animations.fast,
                useNativeDriver: true,
            }).start();
        }
        onBlur?.(e);
    };

    /**
     * Optimization: Using translateY and scale instead of top and fontSize.
     * Scale 1.0 (Base) -> 0.75 (Label)
     * TranslateY 0 (Base) -> -28 (Label)
     */
    const labelStyle = {
        transform: [
            {
                translateY: labelAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, -10],
                }),
            },
            {
                scale: labelAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.75],
                }),
            },
            {
                translateX: labelAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10], // Compensate for scale origin center
                }),
            }
        ],
    };

    const backgroundColor = useMemo(() => {
        if (error) return colors.error + '0D'; // Very subtle error background
        return isFocused 
            ? colors.surfaceContainerHigh 
            : colors.surfaceContainerHighest;
    }, [error, isFocused, colors]);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <View style={styles.labelWrapper} pointerEvents="none">
                    <Animated.Text
                        style={[
                            styles.label,
                            labelStyle,
                            { 
                                color: error 
                                    ? colors.error 
                                    : isFocused 
                                        ? colors.primary 
                                        : colors.onSurfaceVariant 
                            },
                        ]}
                    >
                        {label}
                    </Animated.Text>
                </View>
            )}

            <View style={[
                styles.inputContainer, 
                { backgroundColor }, 
                isFocused && styles.inputFocused, 
                error && { borderColor: colors.error, borderWidth: 1 }
            ]}>
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={colors.onSurfaceVariant}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    style={[
                        styles.input,
                        { color: colors.onSurface },
                        leftIcon && styles.inputWithLeftIcon,
                        rightIcon && styles.inputWithRightIcon,
                    ]}
                    placeholderTextColor={colors.onSurfaceVariant}
                    value={value}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    selectionColor={colors.primary}
                    accessibilityLabel={textInputProps.accessibilityLabel ?? label}
                    {...textInputProps}
                    placeholder={label && !isFocused && !value ? undefined : textInputProps.placeholder}
                />

                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        accessibilityRole="button"
                        accessibilityLabel={rightIcon ? `${rightIcon} action` : 'Input action'}
                        style={styles.rightIcon}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                        <Ionicons name={rightIcon} size={20} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={12} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
            )}
        </View>
    );
};

/**
 * React.memo prevents the entire form from re-rendering every time 
 * one field's state changes. Major performance gain.
 */
export const Input = React.memo(InputComponent);

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
        width: '100%',
    },
    labelWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        zIndex: 10,
    },
    label: {
        position: 'absolute',
        left: theme.spacing.md,
        ...theme.typography.labelMd,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.borderRadius.lg,
        minHeight: theme.touchTargets.comfortable,
        zIndex: 1,
    },
    inputFocused: {
        ...theme.shadows.ambientFloat,
        shadowOpacity: 0.1, // Softer focus shadow
    },
    input: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        ...theme.typography.bodyLg,
        fontSize: 16,
    },
    inputWithLeftIcon: {
        paddingLeft: theme.spacing.xs,
    },
    inputWithRightIcon: {
        paddingRight: theme.spacing.xs,
    },
    leftIcon: {
        marginLeft: theme.spacing.md,
    },
    rightIcon: {
        marginRight: theme.spacing.md,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
        marginLeft: theme.spacing.sm,
        gap: 4,
    },
    errorText: {
        ...theme.typography.caption,
        fontSize: 11,
    },
});
