import { useWindowDimensions, PixelRatio } from 'react-native';

const MIN_CONTENT_GUTTER = 16;
const MAX_CONTENT_GUTTER = 32;

export type ResponsiveLayout = 'compact' | 'regular' | 'expanded';

/**
 * Adaptive layout primitives for React Native.
 *
 * Important: breakpoints describe the width available to the app, not a
 * particular physical device. A phone in split-screen and a tablet can
 * therefore land in the same class.
 */
export function useResponsive() {
    const { width, height, fontScale: systemFontScale } = useWindowDimensions();

    const layout: ResponsiveLayout =
        width < 600 ? 'compact' :
        width < 840 ? 'regular' :
        'expanded';

    const horizontalPadding = Math.min(
        MAX_CONTENT_GUTTER,
        Math.max(MIN_CONTENT_GUTTER, width * 0.06),
    );

    const contentMaxWidth = layout === 'expanded'
        ? 960
        : layout === 'regular'
            ? 640
            : undefined;

    const availableContentWidth = Math.max(0, width - horizontalPadding * 2);

    const getColumns = (minimumCardWidth = 220, gap = 16) => {
        const maxWidth = contentMaxWidth ?? availableContentWidth;
        const availableWidth = Math.min(availableContentWidth, maxWidth);
        return Math.max(1, Math.floor((availableWidth + gap) / (minimumCardWidth + gap)));
    };

    /**
     * Fluidly interpolate a value between two bounds as the app window grows.
     * This is for visual scale (type, spacing, artwork), not for accessibility
     * text scaling. React Native Text continues to respect the user's system
     * font-size setting separately.
     */
    const fluid = (
        min: number,
        max: number,
        minWidth = 320,
        maxWidth = 840,
    ) => {
        if (maxWidth <= minWidth) return min;
        const progress = Math.max(0, Math.min(1, (width - minWidth) / (maxWidth - minWidth)));
        return min + (max - min) * progress;
    };

    return {
        width,
        height,
        layout,
        compact: layout === 'compact',
        narrow: width < 380,
        regular: layout === 'regular',
        expanded: layout === 'expanded',
        isTablet: width >= 600,
        horizontalPadding,
        contentMaxWidth,
        availableContentWidth,
        // Backwards-compatible alias used by existing screens.
        contentWidth: contentMaxWidth ?? availableContentWidth,
        getColumns,
        fluid,
        systemFontScale,
        pixelRatio: PixelRatio.get(),
    };
}

/**
 * Static helpers retained for non-rendering code.
 * Layout code should prefer useResponsive() so it reacts to window-size
 * and font-scale changes.
 */
export const width = 375;
export const height = 812;
export const scale = (size: number) => size;
export const verticalScale = (size: number) => size;
export const moderateScale = (size: number, factor = 0.5) => size;
export const fontScale = (size: number) => PixelRatio.getFontScale() * size;
