import { useWindowDimensions, PixelRatio } from 'react-native';

const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;
const MIN_CONTENT_PADDING = 16;
const MAX_CONTENT_PADDING = 32;

/**
 * Responsive layout helpers for React Native.
 *
 * IMPORTANT: dimensions are read through useWindowDimensions inside components
 * so layouts respond to the actual device window rather than a module-load snapshot.
 */
export function useResponsive() {
    const { width, height, fontScale: systemFontScale } = useWindowDimensions();

    const widthRatio = width / GUIDELINE_BASE_WIDTH;
    const heightRatio = height / GUIDELINE_BASE_HEIGHT;

    return {
        width,
        height,
        widthRatio,
        heightRatio,
        compact: width < 360,
        narrow: width < 380,
        horizontalPadding: Math.min(MAX_CONTENT_PADDING, Math.max(MIN_CONTENT_PADDING, width * 0.06)),
        scale: (size: number) => size * widthRatio,
        verticalScale: (size: number) => size * heightRatio,
        moderateScale: (size: number, factor = 0.5) =>
            size + (size * widthRatio - size) * factor,
        fontScale: (size: number) =>
            PixelRatio.getFontScale() * (size + (size * widthRatio - size) * 0.5),
        systemFontScale,
    };
}

/**
 * Backwards-compatible static helpers for code that does not render a component.
 * Prefer useResponsive() in screen/component layout code.
 */
export const width = 375;
export const height = 812;
export const scale = (size: number) => size;
export const verticalScale = (size: number) => size;
export const moderateScale = (size: number, factor = 0.5) => size;
export const fontScale = (size: number) => PixelRatio.getFontScale() * size;
