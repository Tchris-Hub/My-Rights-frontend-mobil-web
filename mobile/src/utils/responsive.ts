import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Guideline sizes are based on standard ~5" screen mobile device (iPhone 13/14/15 size as standard)
 * 375 x 812
 */
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scale utility for width, padding, margin, etc.
 * @param size number
 * @returns number
 */
export const scale = (size: number) => (width / guidelineBaseWidth) * size;

/**
 * Vertical scale utility for height, etc.
 * @param size number
 * @returns number
 */
export const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

/**
 * Moderate scale utility for font size, etc.
 * Factor of 0.5 means it scales at half the rate of width scaling.
 * @param size number
 * @param factor number (default 0.5)
 * @returns number
 */
export const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

/**
 * PixelRatio scaling for fonts to respect system font scale settings
 * @param size number
 * @returns number
 */
export const fontScale = (size: number) =>
    PixelRatio.getFontScale() * moderateScale(size);

export { width, height };
