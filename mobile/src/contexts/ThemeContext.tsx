/**
 * Theme Context - Light/Dark Mode Support
 * Provides theme state and switching functionality
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import theme from '../constants/theme';
import type { ThemeMode } from '../types';

interface ThemeContextType {
    mode: ThemeMode;
    isDark: boolean;
    colors: typeof theme.colors;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [mode, setMode] = useState<ThemeMode>('system');

    // Determine if dark mode is active
    const isDark = mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');

    // Get theme colors based on mode
    const colors = isDark
        ? {
            ...theme.colors,
            background: theme.colors.backgroundDark,
            surface: theme.colors.surfaceContainer,
            surfaceElevated1: theme.colors.surfaceContainerLow,
            surfaceElevated2: theme.colors.surfaceContainerHigh,
            surfaceElevated3: theme.colors.surfaceContainerHighest,
            text: theme.colors.onSurface,
            textSecondary: theme.colors.onSurfaceVariant,
            textTertiary: theme.colors.onSurfaceVariant,
            border: theme.colors.borderDark,
        }
        : theme.colors;

    // Load saved theme preference on mount
    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedMode = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
            if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
                setMode(savedMode as ThemeMode);
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    };

    const setThemeMode = async (newMode: ThemeMode) => {
        try {
            setMode(newMode);
            await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, newMode);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const toggleTheme = async () => {
        const newMode = isDark ? 'light' : 'dark';
        await setThemeMode(newMode);
    };

    const value: ThemeContextType = {
        mode,
        isDark,
        colors,
        setThemeMode,
        toggleTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
