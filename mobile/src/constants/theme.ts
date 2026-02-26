import { Platform } from 'react-native';
import { moderateScale, scale, verticalScale } from '../utils/responsive';

export const colors = {
    // Primary - Nigerian Emerald (Land, Prosperity, Flag)
    primary: '#006B3F',
    primaryLight: '#008751',
    primaryDark: '#004529',
    onPrimary: '#FFFFFF',

    // Secondary - Gold (Premium, Excellence)
    secondary: '#D4AF37',
    secondaryLight: '#E5C158',
    secondaryDark: '#B8941F',
    onSecondary: '#002244',

    // Surfaces (Elevation System)
    background: '#FFFFFF',
    backgroundDark: '#000000',
    surface: '#FFFFFF',
    surfaceElevated1: '#F8F9FA',  // 1dp elevation
    surfaceElevated2: '#F1F3F5',  // 2dp elevation
    surfaceElevated3: '#E9ECEF',  // 4dp elevation

    // Dark mode surfaces
    surfaceDark: '#1A1A1A',
    surfaceDarkElevated1: '#2A2A2A',
    surfaceDarkElevated2: '#3A3A3A',
    surfaceDarkElevated3: '#4A4A4A',

    // Text
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',

    // Text dark mode
    textDark: '#FFFFFF',
    textSecondaryDark: '#9CA3AF',
    textTertiaryDark: '#6B7280',

    // Feedback
    success: '#10B981',
    successLight: '#34D399',
    successDark: '#059669',

    warning: '#F59E0B',
    warningLight: '#FBBF24',
    warningDark: '#D97706',

    error: '#EF4444',
    errorLight: '#F87171',
    errorDark: '#DC2626',

    info: '#3B82F6',
    infoLight: '#60A5FA',
    infoDark: '#2563EB',

    // Borders
    border: '#E5E7EB',
    borderFocus: '#006B3F',
    borderDark: '#374151',

    // Glassmorphic Tab Bar - Subtle Emerald Tint
    tabBarBackground: 'rgba(0, 75, 41, 0.45)', // Emerald-Green tint
    tabBarBorder: 'rgba(255, 255, 255, 0.15)', // Crisp edge
    tabBarIconInactive: 'rgba(255, 255, 255, 0.6)',
    tabBarIconActive: '#FFFFFF',
    tabBarFocusHub: '#D4AF37',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayHeavy: 'rgba(0, 0, 0, 0.7)',
};

export const typography = {
    // Platform-specific font families
    fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
    }),

    // Font weights
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    // Sizes with optical adjustments (negative letter spacing for large text)
    h1: {
        fontSize: moderateScale(32),
        lineHeight: moderateScale(40),
        fontWeight: '700' as const,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: moderateScale(28),
        lineHeight: moderateScale(36),
        fontWeight: '700' as const,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: moderateScale(24),
        lineHeight: moderateScale(32),
        fontWeight: '600' as const,
        letterSpacing: -0.2,
    },
    h4: {
        fontSize: moderateScale(20),
        lineHeight: moderateScale(28),
        fontWeight: '600' as const,
        letterSpacing: 0,
    },
    body: {
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
        fontWeight: '400' as const,
        letterSpacing: 0,
    },
    bodySmall: {
        fontSize: moderateScale(14),
        lineHeight: moderateScale(20),
        fontWeight: '400' as const,
        letterSpacing: 0,
    },
    caption: {
        fontSize: moderateScale(12),
        lineHeight: moderateScale(16),
        fontWeight: '400' as const,
        letterSpacing: 0.3,
    },
    button: {
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
        fontWeight: '600' as const,
        letterSpacing: 0.5,
    },
};

export const spacing = {
    xs: scale(4),
    sm: scale(8),
    md: scale(16),
    lg: scale(24),
    xl: scale(32),
    xxl: scale(48),
    xxxl: scale(64),
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
};

export const animations = {
    // Duration in milliseconds
    fast: 150,
    normal: 250,
    slow: 350,

    // Easing curves (for Animated API)
    easing: {
        // Material Design standard curve
        standard: [0.4, 0.0, 0.2, 1] as const,
        // Deceleration curve (entering)
        decelerate: [0.0, 0.0, 0.2, 1] as const,
        // Acceleration curve (exiting)
        accelerate: [0.4, 0.0, 1, 1] as const,
    },

    // Spring configurations (for react-native-reanimated)
    spring: {
        damping: 15,
        stiffness: 150,
        mass: 1,
    },

    springGentle: {
        damping: 20,
        stiffness: 100,
        mass: 1,
    },

    springBouncy: {
        damping: 10,
        stiffness: 200,
        mass: 1,
    },
};

// Touch target sizes (minimum 44x44 for accessibility)
export const touchTargets = {
    min: 44,
    comfortable: 56,
};

// Z-index layers
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
