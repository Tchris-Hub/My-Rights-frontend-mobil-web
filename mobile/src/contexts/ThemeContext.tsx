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

    // Keep a dedicated dark palette so semantic roles remain readable in both modes.
    const colors = isDark
        ? {
            ...theme.colors,
            primary: '#AEB9F2',
            primaryContainer: '#232F6B',
            onPrimary: '#0E1230',
            onPrimaryContainer: '#E3E7F5',
            onPrimaryFixed: '#E3E7F5',
            onPrimaryFixedVariant: '#AEB9F2',
            secondary: '#C9D0F0',
            secondaryContainer: '#1A2150',
            onSecondary: '#0E1230',
            onSecondaryContainer: '#E3E7F5',
            tertiary: '#F5B800',
            tertiaryContainer: '#4A3800',
            onTertiary: '#2A2000',
            onTertiaryContainer: '#FFE9A6',
            surface: '#0E1230',
            surfaceBright: '#1A2050',
            surfaceDim: '#0A0D24',
            surfaceContainerLowest: '#0A0D24',
            surfaceContainerLow: '#141944',
            surfaceContainer: '#1A2050',
            surfaceContainerHigh: '#232A5E',
            surfaceContainerHighest: '#2D3570',
            surfaceVariant: '#232A5E',
            onSurface: '#F2F4F9',
            onSurfaceVariant: '#B5BCD8',
            outline: '#7C84A3',
            outlineVariant: '#2D3570',
            error: '#FF8A82',
            errorContainer: '#5A0F0B',
            onError: '#3B0906',
            onErrorContainer: '#FCE4E2',
            glassBackground: '#141944',
            ghostBorder: '#2D3570',
            tabBarBackground: '#141944',
            tabBarBorder: '#2D3570',
            tabBarIconInactive: '#7C84A3',
            tabBarIconActive: '#F5B800',
            background: '#0E1230',
            backgroundDark: '#0A0D24',
            border: '#2D3570',
            borderDark: '#7C84A3',
            text: '#F2F4F9',
            textSecondary: '#B5BCD8',
            success: '#7FD6A5',
            warning: '#F5B800',
            ink: '#F2F4F9',
            paper: '#0E1230',
            card: '#141944',
            line: '#2D3570',
            signal: '#FF8A82',
            verified: '#7FD6A5',
            verifiedContainer: '#123B29',
            danfo: '#F5B800',
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
