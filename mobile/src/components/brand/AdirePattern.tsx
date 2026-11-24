/**
 * Procedural adire (Yoruba resist-dyed indigo cloth) pattern.
 * Tiles of concentric rings and diamonds on a half-drop grid, like adire eleko stamps.
 * Pure SVG, deterministic, around 100 shapes for a phone-width banner.
 */
import React, { useMemo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface AdireProps {
    width: number;
    height: number;
    /** Dye colour, drawn as the ground. */
    ground?: string;
    /** Resist colour, drawn as the motif. */
    motif?: string;
    /** Size of one tile in px. */
    tile?: number;
}

export const AdirePattern: React.FC<AdireProps> = ({ width, height, ground = '#1E2A5E', motif = '#34428A', tile = 36 }) => {
    const shapes = useMemo(() => {
        const out: React.ReactElement[] = [];
        const cols = Math.ceil(width / tile) + 1;
        const rows = Math.ceil(height / tile) + 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const half = r % 2 === 1 ? tile / 2 : 0; // half-drop
                const cx = c * tile + half;
                const cy = r * tile;
                const key = `${r}-${c}`;
                if ((r + c) % 2 === 0) {
                    // ring motif: three concentric rings with a dot
                    out.push(<Circle key={`a${key}`} cx={cx} cy={cy} r={tile * 0.34} stroke={motif} strokeWidth={2} fill="none" />);
                    out.push(<Circle key={`b${key}`} cx={cx} cy={cy} r={tile * 0.2} stroke={motif} strokeWidth={2} fill="none" />);
                    out.push(<Circle key={`c${key}`} cx={cx} cy={cy} r={tile * 0.06} fill={motif} />);
                } else {
                    // diamond motif with inner cross
                    const d = tile * 0.3;
                    out.push(
                        <Path
                            key={`d${key}`}
                            d={`M${cx} ${cy - d} L${cx + d} ${cy} L${cx} ${cy + d} L${cx - d} ${cy} Z`}
                            stroke={motif}
                            strokeWidth={2}
                            fill="none"
                        />,
                    );
                    out.push(<Path key={`e${key}`} d={`M${cx - d * 0.5} ${cy} H${cx + d * 0.5} M${cx} ${cy - d * 0.5} V${cy + d * 0.5}`} stroke={motif} strokeWidth={2} />);
                }
            }
        }
        return out;
    }, [width, height, motif, tile]);

    return (
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <Rect width={width} height={height} fill={ground} />
            {shapes}
        </Svg>
    );
};
