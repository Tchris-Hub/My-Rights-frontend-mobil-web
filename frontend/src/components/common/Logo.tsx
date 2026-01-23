import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
    primaryColor?: string;
    secondaryColor?: string;
}

export const Logo: React.FC<LogoProps> = ({
    className,
    size = 40,
    primaryColor = '#002244',
    secondaryColor = '#D4AF37'
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer Shield Shape */}
            <path
                d="M50 10 L15 25 V55 C15 75 50 90 50 90 C50 90 85 75 85 55 V25 L50 10 Z"
                stroke={primaryColor}
                strokeWidth="4"
                strokeLinejoin="round"
            />

            {/* Scales Beam */}
            <line
                x1="30" y1="45" x2="70" y2="45"
                stroke={secondaryColor}
                strokeWidth="3"
                strokeLinecap="round"
            />

            {/* Left Plate (Simplified) */}
            <path
                d="M25 45 L35 45 L30 60 Z"
                fill={primaryColor}
            />

            {/* Right Plate (Simplified) */}
            <path
                d="M65 45 L75 45 L70 60 Z"
                fill={primaryColor}
            />

            {/* Dynamic Swoosh / Checkmark for Equality */}
            <path
                d="M40 70 L48 78 L65 60"
                stroke={secondaryColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
