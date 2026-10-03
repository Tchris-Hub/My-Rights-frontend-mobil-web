import { useWindowDimensions, PixelRatio } from 'react-native';

const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;
const MIN_CONTENT_GUTTER = 16;
const MAX_CONTENT_GUTTER = 32;

export type ResponsiveLayout = 'compact' | 'regular' | 'expanded';

export function useResponsive() {
    const { width, height, fontScale: systemFontScale } = useWindowDimensions();

    // These are logical React Native points, not physical screenshot pixels.
    const widthRatio = width / GUIDELINE_BASE_WIDTH;
    const heightRatio = height / GUIDELINE_BASE_HEIGHT;

    const layout: ResponsiveLayout =
        width < 380 ? 'compact' :
        width < 600 ? 'regular' :
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

    const getColumns = (minimumCardWidth = 220, gap = 16) => {
        if (!contentMaxWidth) return 1;

        const availableWidth = Math.min(width - horizontalPadding * 2, contentMaxWidth);
        return availableWidth >= minimumCardWidth * 2 + gap ? 2 : 1;
    };

    return {
        width,
        height,
        widthRatio,
        heightRatio,
        layout,
        compact: layout === 'compact',
        narrow: width < 380,
        regular: layout === 'regular',
        expanded: layout === 'expanded',
        isTablet: width >= 600,
        horizontalPadding,
        contentMaxWidth,
        // Backwards-compatible alias used by existing screens.
        contentWidth: contentMaxWidth ?? width - horizontalPadding * 2,
        getColumns,
        scale: (size: number) => size * widthRatio,
        verticalScale: (size: number) => size * heightRatio,
        moderateScale: (size: number, factor = 0.5) =>
            size + (size * Math.min(1.15, Math.max(0.9, widthRatio)) - size) * factor,
        fontScale: (size: number) =>
            PixelRatio.getFontScale() *
            (size + (size * Math.min(1.1, Math.max(0.92, widthRatio)) - size) * 0.5),
        systemFontScale,
    };
}

/**
 * Backwards-compatible static helpers for code that does not render a component.
 * Layout code should prefer useResponsive() so it reacts to window-size changes.
 */
export const width = 375;
export const height = 812;
export const scale = (size: number) => size;
export const verticalScale = (size: number) => size;
export const moderateScale = (size: number, factor = 0.5) => size;
export const fontScale = (size: number) => PixelRatio.getFontScale() * size;
