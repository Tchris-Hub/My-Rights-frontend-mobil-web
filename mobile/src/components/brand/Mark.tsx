/**
 * My Rights mark: a speech bubble in danfo yellow with the black-stripe-turned-indigo band
 * through the middle. Your voice, on a Lagos bus. Drawn in code, no raster asset.
 */
import React from 'react';
import Svg, { Path, Rect, ClipPath, Defs } from 'react-native-svg';

interface MarkProps {
    size?: number;
    /** Bubble colour. Defaults to danfo yellow. */
    bubble?: string;
    /** Stripe colour. Defaults to brand indigo. */
    stripe?: string;
}

export const Mark: React.FC<MarkProps> = ({ size = 48, bubble = '#F5B800', stripe = '#1E2A5E' }) => {
    // 64x64 grid. Bubble body 4..60 x 6..46 with a tail dropping from the bottom-left.
    const body = 'M14 6 H50 A10 10 0 0 1 60 16 V36 A10 10 0 0 1 50 46 H30 L16 58 V46 H14 A10 10 0 0 1 4 36 V16 A10 10 0 0 1 14 6 Z';
    return (
        <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="My Rights">
            <Defs>
                <ClipPath id="bubbleClip">
                    <Path d={body} />
                </ClipPath>
            </Defs>
            <Path d={body} fill={bubble} />
            <Rect x="0" y="22" width="64" height="10" fill={stripe} clipPath="url(#bubbleClip)" />
        </Svg>
    );
};
