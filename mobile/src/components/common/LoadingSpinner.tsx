/**
 * Loading Spinner Component
 * Smooth rotating animation with size variants
 */

import React from 'react';
import { ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    overlay?: boolean;
    style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'large',
    color,
    overlay = false,
    style,
}) => {
    const { colors } = useTheme();
    const spinnerColor = color || colors.primary;

    if (overlay) {
        return (
            <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                <ActivityIndicator size={size} color={spinnerColor} />
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <ActivityIndicator size={size} color={spinnerColor} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: theme.zIndex.modal,
    },
});
