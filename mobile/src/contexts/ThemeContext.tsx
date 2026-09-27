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
            primary: '#34D399',
            primaryContainer: '#064E3B',
            onPrimary: '#052E1B',
            onPrimaryContainer: '#D1FAE5',
            onPrimaryFixed: '#052E1B',
            onPrimaryFixedVariant: '#6EE7B7',
            secondary: '#CBD5E1',
            secondaryContainer: '#1E293B',
            onSecondary: '#0B1326',
            onSecondaryContainer: '#E2E8F0',
            surface: '#0B1326',
            surfaceBright: '#111827',
            surfaceDim: '#060B14',
            surfaceContainerLowest: '#080E18',
            surfaceContainerLow: '#111A2A',
            surfaceContainer: '#172235',
            surfaceContainerHigh: '#202D43',
            surfaceContainerHighest: '#2B3950',
            surfaceVariant: '#2B3950',
            onSurface: '#F8FAFC',
            onSurfaceVariant: '#C5CEDA',
            outline: '#8B98AA',
            outlineVariant: '#475569',
            error: '#FCA5A5',
            errorContainer: '#450A0A',
            onError: '#450A0A',
            onErrorContainer: '#FECACA',
            glassBackground: 'rgba(17, 24, 39, 0.82)',
            ghostBorder: 'rgba(148, 163, 184, 0.24)',
            tabBarBackground: 'rgba(11, 19, 38, 0.94)',
            tabBarBorder: 'rgba(148, 163, 184, 0.22)',
            tabBarIconInactive: '#C5CEDA',
            tabBarIconActive: '#34D399',
            background: '#0B1326',
            backgroundDark: '#060B14',
            border: '#475569',
            borderDark: '#64748B',
            text: '#F8FAFC',
            textSecondary: '#C5CEDA',
            success: '#86EFAC',
            warning: '#FCD34D',
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
