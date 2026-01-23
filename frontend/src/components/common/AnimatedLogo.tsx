"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
    size?: number;
    primaryColor?: string;
    secondaryColor?: string;
    className?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
    size = 120,
    primaryColor = '#002244',
    secondaryColor = '#D4AF37',
    className = ""
}) => {
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                duration: 1.5,
                ease: [0.42, 0, 0.58, 1] as any, // easeInOut
            }
        }
    };

    const fillVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                delay: 1,
                duration: 0.8,
                ease: [0, 0, 0.2, 1] as any, // easeOut
            }
        }
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <motion.svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Outer Shield Shape */}
                <motion.path
                    d="M50 10 L15 25 V55 C15 75 50 90 50 90 C50 90 85 75 85 55 V25 L50 10 Z"
                    stroke={primaryColor}
                    strokeWidth="4"
                    strokeLinejoin="round"
                    variants={pathVariants}
                    initial="hidden"
                    animate="visible"
                />

                {/* Scales Beam */}
                <motion.line
                    x1="30" y1="45" x2="70" y2="45"
                    stroke={secondaryColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    variants={pathVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5, duration: 1, ease: [0.42, 0, 0.58, 1] as any }}
                />

                {/* Left Plate */}
                <motion.path
                    d="M25 45 L35 45 L30 60 Z"
                    fill={primaryColor}
                    variants={fillVariants}
                    initial="hidden"
                    animate="visible"
                />

                {/* Right Plate */}
                <motion.path
                    d="M65 45 L75 45 L70 60 Z"
                    fill={primaryColor}
                    variants={fillVariants}
                    initial="hidden"
                    animate="visible"
                />

                {/* Dynamic Swoosh / Checkmark */}
                <motion.path
                    d="M40 70 L48 78 L65 60"
                    stroke={secondaryColor}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={pathVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 1.2, duration: 0.8, ease: [0, 0, 0.2, 1] as any }}
                />
            </motion.svg>

            {/* Brand Name Animation */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="absolute -bottom-10 whitespace-nowrap"
            >
                <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                    My <span style={{ color: secondaryColor }}>Rights</span>
                </span>
            </motion.div>
        </div>
    );
};
