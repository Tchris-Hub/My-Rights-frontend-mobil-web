import { Platform } from 'react-native';
import { moderateScale, scale, verticalScale } from '../utils/responsive';

// My Rights design tokens.
// Identity: Nigerian indigo (adire dye) + danfo yellow. Flat surfaces, hard edges, no glass.
// Key names are kept from the previous token set so existing screens recolor automatically;
// new code should prefer the semantic names (ink, paper, card, line, signal, verified).
export const colors = {
    // Brand
    primary: '#1E2A5E',
    primaryContainer: '#E3E7F5',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#121838',
    onPrimaryFixed: '#121838',
    onPrimaryFixedVariant: '#34428A',

    secondary: '#121838',
    secondaryContainer: '#E8EAF3',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#121838',
    onSecondaryFixed: '#121838',
    onSecondaryFixedVariant: '#34428A',

    // Danfo yellow
    tertiary: '#F5B800',
    tertiaryContainer: '#FFE9A6',
    onTertiary: '#2A2000',
    onTertiaryContainer: '#2A2000',

    // Surfaces: paper behind, white cards on top, separated by a line not a shadow
    surface: '#F2F4F9',
    surfaceBright: '#FFFFFF',
    surfaceDim: '#E6E9F2',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F8F9FC',
    surfaceContainer: '#ECEFF6',
    surfaceContainerHigh: '#E3E7F1',
    surfaceContainerHighest: '#D9DEEB',
    surfaceVariant: '#E3E7F1',

    onSurface: '#121838',
    onSurfaceVariant: '#4A5273',
    outline: '#7C84A3',
    outlineVariant: '#D3D8E8',

    error: '#D7332B',
    errorContainer: '#FCE4E2',
    onError: '#FFFFFF',
    onErrorContainer: '#5A0F0B',

    // Kept so old call sites compile; values are now flat, not translucent
    glassBackground: '#FFFFFF',
    ghostBorder: '#D3D8E8',

    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#D3D8E8',
    tabBarIconInactive: '#7C84A3',
    tabBarIconActive: '#1E2A5E',

    background: '#F2F4F9',
    backgroundDark: '#E6E9F2',
    border: '#D3D8E8',
    borderDark: '#7C84A3',
    text: '#121838',
    textSecondary: '#4A5273',
    success: '#1F7A4D',
    warning: '#B27A00',

    // Semantic names for new code
    ink: '#121838',
    paper: '#F2F4F9',
    card: '#FFFFFF',
    line: '#D3D8E8',
    signal: '#D7332B',
    verified: '#1F7A4D',
    verifiedContainer: '#DDF1E7',
    danfo: '#F5B800',
};

const FONT = {
    display: 'BricolageGrotesque_800ExtraBold',
    headline: 'BricolageGrotesque_700Bold',
    headlineMedium: 'BricolageGrotesque_600SemiBold',
    ui: 'BricolageGrotesque_500Medium',
    uiRegular: 'BricolageGrotesque_400Regular',
    reading: 'Literata_400Regular',
    readingMedium: 'Literata_500Medium',
    readingBold: 'Literata_600SemiBold',
};

export const typography = {
    fontFamily: {
        headline: FONT.headline,
        headlineMedium: FONT.headlineMedium,
        body: FONT.uiRegular,
        bodyMedium: FONT.ui,
        bodyBold: FONT.headline,
        display: FONT.display,
        reading: FONT.reading,
        readingMedium: FONT.readingMedium,
        readingBold: FONT.readingBold,
    },

    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    displayLg: { fontFamily: FONT.display, fontSize: moderateScale(34), lineHeight: moderateScale(38), letterSpacing: -0.8, color: colors.onSurface },
    displayMd: { fontFamily: FONT.display, fontSize: moderateScale(28), lineHeight: moderateScale(32), letterSpacing: -0.6, color: colors.onSurface },
    displaySm: { fontFamily: FONT.headline, fontSize: moderateScale(24), lineHeight: moderateScale(29), letterSpacing: -0.4, color: colors.onSurface },
    headlineLg: { fontFamily: FONT.headline, fontSize: moderateScale(22), lineHeight: moderateScale(27), letterSpacing: -0.3, color: colors.onSurface },
    titleLg: { fontFamily: FONT.headline, fontSize: moderateScale(20), lineHeight: moderateScale(25), letterSpacing: -0.2, color: colors.onSurface },
    titleMd: { fontFamily: FONT.headlineMedium, fontSize: moderateScale(17), lineHeight: moderateScale(22), letterSpacing: -0.1, color: colors.onSurface },

    bodyLg: { fontFamily: FONT.uiRegular, fontSize: moderateScale(16), lineHeight: moderateScale(23), letterSpacing: 0, color: colors.onSurface },
    bodyMd: { fontFamily: FONT.uiRegular, fontSize: moderateScale(14), lineHeight: moderateScale(20), letterSpacing: 0, color: colors.onSurfaceVariant },
    labelLg: { fontFamily: FONT.ui, fontSize: moderateScale(16), lineHeight: moderateScale(22), letterSpacing: 0, color: colors.onSurface },
    labelMd: { fontFamily: FONT.ui, fontSize: moderateScale(14), lineHeight: moderateScale(19), letterSpacing: 0, color: colors.onSurface },
    labelSm: { fontFamily: FONT.ui, fontSize: moderateScale(12), lineHeight: moderateScale(16), letterSpacing: 0.1, color: colors.onSurface },
    caption: { fontFamily: FONT.uiRegular, fontSize: moderateScale(12), lineHeight: moderateScale(16), letterSpacing: 0.1, color: colors.onSurfaceVariant },

    // Serif for answers and statute text, set looser for reading
    reading: { fontFamily: FONT.reading, fontSize: moderateScale(16.5), lineHeight: moderateScale(26), letterSpacing: 0, color: colors.onSurface },
    readingSm: { fontFamily: FONT.reading, fontSize: moderateScale(14.5), lineHeight: moderateScale(22), letterSpacing: 0, color: colors.onSurface },
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
    sm: 6,
    md: 10,
    lg: 14, // cards
    xl: 20, // sheets
    full: 9999,
};

// Flat design: depth comes from lines and paper vs card contrast. Only the sheet
// and the emergency button cast a shadow.
const noShadow = { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 };
export const shadows = {
    none: noShadow,
    sheet: { shadowColor: '#121838', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 12 },
    // Compat aliases for old call sites; intentionally flat now
    ambientFloat: noShadow,
    glass: noShadow,
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
