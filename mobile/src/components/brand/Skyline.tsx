/**
 * Abuja-at-dusk skyline, drawn in code: Zuma Rock, the National Mosque dome and minarets,
 * the Millennium Tower, a danfo bus in the foreground. Used as the Home hero.
 * viewBox is 360x170; scales to any width.
 */
import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

interface SkylineProps {
    width: number;
    sky?: string;
    sun?: string;
    far?: string;
    mid?: string;
    near?: string;
    ground?: string;
}

export const Skyline: React.FC<SkylineProps> = ({
    width,
    sky = '#1E2A5E',
    sun = '#F5B800',
    far = '#34428A',
    mid = '#141B45',
    near = '#121838',
    ground = '#0C1029',
}) => {
    const height = (width * 170) / 360;
    return (
        <Svg width={width} height={height} viewBox="0 0 360 170" accessibilityLabel="Abuja skyline with Zuma Rock, the National Mosque and a danfo bus">
            <Rect width="360" height="170" fill={sky} />
            {/* sun */}
            <Circle cx="268" cy="86" r="34" fill={sun} />

            {/* Zuma Rock: tall monolith, rounded crown, vertical weathering streaks */}
            <Path d="M14 128 C16 98 20 70 34 56 C46 44 66 46 78 60 C92 76 98 104 102 128 Z" fill={far} />
            <Path d="M40 62 L38 128 M52 56 L52 128 M64 62 L68 128" stroke={mid} strokeWidth="2" />

            {/* far ridge */}
            <Path d="M0 128 C40 118 80 122 120 126 C170 118 220 124 280 120 C320 118 340 122 360 120 V140 H0 Z" fill={far} />

            {/* National Mosque: gold-less dome, four minarets, hall */}
            <G>
                <Rect x="126" y="108" width="84" height="32" fill={mid} />
                <Path d="M138 108 C138 84 198 84 198 108 Z" fill={mid} />
                <Rect x="166" y="76" width="4" height="10" fill={mid} />
                <Rect x="120" y="82" width="6" height="58" fill={mid} />
                <Rect x="210" y="82" width="6" height="58" fill={mid} />
                <Path d="M120 82 L123 74 L126 82 Z" fill={mid} />
                <Path d="M210 82 L213 74 L216 82 Z" fill={mid} />
                <Rect x="130" y="96" width="4" height="44" fill={mid} />
                <Rect x="202" y="96" width="4" height="44" fill={mid} />
            </G>

            {/* Millennium Tower: slim shaft with a flared base and an arched crown */}
            <G>
                <Path d="M296 140 L300 70 L306 70 L310 140 Z" fill={near} />
                <Path d="M292 140 L304 112 L316 140 Z" fill={near} />
                <Path d="M297 70 C297 56 309 56 309 70 Z" fill={near} />
                <Rect x="302" y="46" width="2" height="12" fill={near} />
            </G>

            {/* blocks of the city */}
            <Rect x="226" y="112" width="16" height="28" fill={near} />
            <Rect x="244" y="120" width="14" height="20" fill={near} />
            <Rect x="324" y="116" width="18" height="24" fill={near} />
            <Rect x="344" y="124" width="16" height="16" fill={near} />
            <Rect x="96" y="118" width="14" height="22" fill={near} />

            {/* road */}
            <Rect y="140" width="360" height="30" fill={ground} />
            <Path d="M0 156 H24 M40 156 H64 M80 156 H104 M120 156 H144 M160 156 H184 M200 156 H224 M240 156 H264 M280 156 H304 M320 156 H344" stroke={sun} strokeWidth="2" />

            {/* danfo bus: yellow body, indigo stripe, windows */}
            <G>
                <Rect x="44" y="124" width="76" height="26" rx="5" fill={sun} />
                <Rect x="44" y="134" width="76" height="6" fill={near} />
                <Rect x="50" y="128" width="10" height="6" fill={near} />
                <Rect x="64" y="128" width="10" height="6" fill={near} />
                <Rect x="78" y="128" width="10" height="6" fill={near} />
                <Rect x="92" y="128" width="10" height="6" fill={near} />
                <Rect x="106" y="128" width="10" height="6" fill={near} />
                <Circle cx="62" cy="151" r="6" fill={ground} />
                <Circle cx="62" cy="151" r="2.5" fill={sun} />
                <Circle cx="102" cy="151" r="6" fill={ground} />
                <Circle cx="102" cy="151" r="2.5" fill={sun} />
                <Ellipse cx="82" cy="123" rx="14" ry="2" fill={near} />
            </G>
        </Svg>
    );
};
