/**
 * Input. Label sits above the field (no floating label, so it can never overlap the text).
 * Outlined, indigo ring on focus, red ring with a message on error.
 */

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
}

const InputComponent: React.FC<InputProps> = ({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    onFocus,
    onBlur,
    multiline,
    ...textInputProps
}) => {
    const { colors } = useTheme();
    const [focused, setFocused] = useState(false);

    const borderColor = error ? colors.error : focused ? colors.primary : colors.outlineVariant;

    return (
        <View style={[styles.container, containerStyle]}>
            {label ? <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text> : null}

            <View
                style={[
                    styles.field,
                    { backgroundColor: colors.card, borderColor, borderWidth: focused || error ? 2 : 1 },
                    multiline && styles.fieldMultiline,
                ]}
            >
                {leftIcon ? <Ionicons name={leftIcon} size={20} color={colors.onSurfaceVariant} style={styles.leftIcon} /> : null}

                <TextInput
                    style={[styles.input, { color: colors.onSurface }, multiline && styles.inputMultiline]}
                    placeholderTextColor={colors.outline}
                    selectionColor={colors.primary}
                    accessibilityLabel={textInputProps.accessibilityLabel ?? label}
                    multiline={multiline}
                    onFocus={(e) => {
                        setFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        onBlur?.(e);
                    }}
                    {...textInputProps}
                />

                {rightIcon ? (
                    <Pressable
                        onPress={onRightIconPress}
                        accessibilityRole="button"
                        accessibilityLabel={`${rightIcon} action`}
                        style={styles.rightIcon}
                        hitSlop={12}
                    >
                        <Ionicons name={rightIcon} size={20} color={colors.onSurfaceVariant} />
                    </Pressable>
                ) : null}
            </View>

            {error ? (
                <View style={styles.messageRow}>
                    <Ionicons name="alert-circle" size={14} color={colors.error} />
                    <Text style={[styles.message, { color: colors.error }]}>{error}</Text>
                </View>
            ) : hint ? (
                <Text style={[styles.message, { color: colors.onSurfaceVariant, marginTop: 6 }]}>{hint}</Text>
            ) : null}
        </View>
    );
};

export const Input = React.memo(InputComponent);

const styles = StyleSheet.create({
    container: { marginBottom: theme.spacing.md, width: '100%' },
    label: { ...theme.typography.labelMd, fontFamily: theme.typography.fontFamily.headlineMedium, marginBottom: 6 },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.borderRadius.md,
        minHeight: 52,
    },
    fieldMultiline: { alignItems: 'flex-start' },
    input: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 12,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: 16,
    },
    inputMultiline: { minHeight: 110, textAlignVertical: 'top' },
    leftIcon: { marginLeft: theme.spacing.md },
    rightIcon: { marginRight: theme.spacing.md },
    messageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
    message: { ...theme.typography.caption },
});
