import { Platform } from 'react-native';
import { moderateScale, scale, verticalScale } from '../utils/responsive';

// Lincoln College color tokens
export const colors = {
    // Primary - Emerald Refresh
    primary: '#047857',
    primaryContainer: '#ECFDF5',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#022C22',
    onPrimaryFixed: '#022C22',
    onPrimaryFixedVariant: '#059669',

    // Secondary - Dark Slate / School Blue
    secondary: '#0B1326',
    secondaryContainer: '#1B2436',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#D1E4FF',
    onSecondaryFixed: '#001D36',
    onSecondaryFixedVariant: '#004A77',

    // Tertiary - Gold Accent (Legacy)
    tertiary: '#E9C349',
    tertiaryContainer: '#AF8D11',
    onTertiary: '#3C2F00',
    onTertiaryContainer: '#342800',

    // Surfaces (Physical Layers) - High Contrast White/Grey
    surface: '#FFFFFF',                  // Base Layer
    surfaceBright: '#F8F9FA',
    surfaceDim: '#EDF1F5',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F8F9FA',      // Sectional Layer
    surfaceContainer: '#F1F3F5',         
    surfaceContainerHigh: '#E9ECEF',     // Actionable Layer
    surfaceContainerHighest: '#DEE2E6',  // Peak Layer / Input Fields
    surfaceVariant: '#E1E2EC',

    // Text & Outlines
    onSurface: '#191C1E',
    onSurfaceVariant: '#44474E',
    outline: '#74777F',
    outlineVariant: '#C4C7CF',           // Ghost border fallback (20% opacity)

    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    onError: '#FFFFFF',
    onErrorContainer: '#410002',

    // Glassmorphism Values (Light Mode)
    glassBackground: 'rgba(255, 255, 255, 0.7)', 
    ghostBorder: 'rgba(116, 119, 127, 0.2)',     
    
    // Tab Bar
    tabBarBackground: 'rgba(255, 255, 255, 0.9)', 
    tabBarBorder: 'rgba(116, 119, 127, 0.2)',      
    tabBarIconInactive: '#44474E',
    tabBarIconActive: '#047857',                // Emerald Primary

    // Compat layers for any old usages still floating around
    background: '#FFFFFF',    // maps to surface
    backgroundDark: '#F1F3F5',
    border: '#C4C7CF',
    borderDark: '#74777F',
    text: '#191C1E',
    textSecondary: '#44474E',
    success: '#2E7D32',
    warning: '#FBC02D',
};

// Precise styling for Fonts - Requires Inter & PlusJakartaSans 
export const typography = {
    fontFamily: {
        headline: 'PlusJakartaSans_600SemiBold',
        headlineMedium: 'PlusJakartaSans_600SemiBold',
        body: 'Inter_400Regular',
        bodyMedium: 'Inter_500Medium',
        bodyBold: 'Inter_700Bold',
    },

    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    // Outfit/PlusJakartaSans - "The Statement" tight spacing
    displayLg: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: moderateScale(28),
        lineHeight: moderateScale(36),
        letterSpacing: -0.64, // -0.02em mandate
        color: colors.onSurface,
    },
    displayMd: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: moderateScale(24),
        lineHeight: moderateScale(32),
        letterSpacing: -0.56,
        color: colors.onSurface,
    },
    displaySm: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: moderateScale(22),
        lineHeight: moderateScale(28),
        letterSpacing: -0.48,
        color: colors.onSurface,
    },
    headlineLg: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: moderateScale(20),
        lineHeight: moderateScale(26),
        letterSpacing: -0.44,
        color: colors.onSurface,
    },
    titleLg: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: moderateScale(18),
        lineHeight: moderateScale(26),
        letterSpacing: -0.368,
        color: colors.onSurface,
    },
    titleMd: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: moderateScale(18),
        lineHeight: moderateScale(26),
        letterSpacing: -0.36,
        color: colors.onSurface,
    },

    // Inter - "The Evidence" precise legibility
    bodyLg: {
        fontFamily: 'Inter_400Regular',
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
        letterSpacing: 0,
        color: colors.onSurfaceVariant,
    },
    labelLg: {
        fontFamily: 'Inter_500Medium',
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
        letterSpacing: 0.1,
        color: colors.onSurface,
    },
    bodyMd: {
        fontFamily: 'Inter_400Regular',
        fontSize: moderateScale(14),
        lineHeight: moderateScale(20),
        letterSpacing: 0,
        color: colors.onSurfaceVariant,
    },
    labelMd: {
        fontFamily: 'Inter_500Medium',
        fontSize: moderateScale(14),
        lineHeight: moderateScale(20),
        letterSpacing: 0.1, 
        color: colors.onSurface,
    },
    labelSm: {
        fontFamily: 'Inter_500Medium',
        fontSize: moderateScale(12),
        lineHeight: moderateScale(16),
        letterSpacing: 0.1,
        color: colors.onSurface,
    },
    caption: {
        fontFamily: 'Inter_400Regular',
        fontSize: moderateScale(12),
        lineHeight: moderateScale(16),
        letterSpacing: 0,
        color: colors.onSurfaceVariant,
    },
};

export const spacing = {
    xs: scale(4),
    sm: scale(8),
    md: scale(16), // No 1px dividers. Use this vertical whitespace.
    lg: scale(24),
    xl: scale(32),
    xxl: scale(48), // Spacing '12' (3rem) for Hero Section margins
    xxxl: scale(64),
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16, // All cards and containers MUST use 16px
    xl: 24,
    full: 9999,
};

export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    // Ambient light - Tonal shadows (never pure black)
    // Tinted ambient shadow for floating elements (0px 20px 40px rgba(x,x,x, 0.4))
    ambientFloat: {
        shadowColor: '#0b1326', 
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
        elevation: 15,
    },
    glass: {
        shadowColor: '#0b1326',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    }
};

export const animations = {
    fast: 150,
    normal: 250,
    slow: 350,
    easing: {
        standard: [0.4, 0.0, 0.2, 1] as const,
        decelerate: [0.0, 0.0, 0.2, 1] as const,
        accelerate: [0.4, 0.0, 1, 1] as const,
    },
};

export const touchTargets = {
    min: 44,
    comfortable: 56,
};

export const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1600,
    tooltip: 1700,
};

export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animations,
    touchTargets,
    zIndex,
};

export type Theme = typeof theme;

export default theme;
