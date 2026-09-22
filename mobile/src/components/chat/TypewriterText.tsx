import React, { useEffect, useState, useRef } from 'react';
import { Text, TextStyle, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';

interface TypewriterTextProps {
    text: string;
    style?: TextStyle | TextStyle[];
    onComplete?: () => void;
    animate?: boolean;
    typingSpeed?: number; // Base speed in ms
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
    text,
    style,
    onComplete,
    animate = true,
    typingSpeed = 35, // Default sweet spot
}) => {
    const [displayedText, setDisplayedText] = useState(animate ? '' : text);
    const [isComplete, setIsComplete] = useState(!animate);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Blinking cursor opacity
    const cursorOpacity = useSharedValue(1);

    useEffect(() => {
        // Start cursor blinking
        cursorOpacity.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 400, easing: Easing.linear }),
                withTiming(1, { duration: 400, easing: Easing.linear })
            ),
            -1, // Infinite
            true // Reverse
        );
    }, []);

    useEffect(() => {
        if (!animate) {
            setDisplayedText(text);
            setIsComplete(true);
            return;
        }

        // If 'text' prop updates (e.g. streaming chunks), we need to continue from current length
        let currentIndex = displayedText.length;

        // Skip animation logic: if text shrinks suddenly or animate turns false
        if (currentIndex > text.length) {
            setDisplayedText(text);
            setIsComplete(true);
            return;
        }

        const typeNextChar = () => {
            if (currentIndex < text.length) {
                // Add next chunk (handling surrogate pairs / emojis correctly can be tricky, simple char for now)
                setDisplayedText(text.slice(0, currentIndex + 1));
                currentIndex++;

                // Organic speed: randomize slightly (±10ms)
                const jitter = Math.floor(Math.random() * 20) - 10;
                const nextDelay = Math.max(10, typingSpeed + jitter);

                timerRef.current = setTimeout(typeNextChar, nextDelay);
            } else {
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        };

        if (currentIndex < text.length) {
            setIsComplete(false);
            typeNextChar();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [text, animate]);

    const animatedCursorStyle = useAnimatedStyle(() => ({
        opacity: isComplete ? 0 : cursorOpacity.value,
    }));

    return (
        <Text style={[styles.text, style]}>
            {displayedText}
            {/* Blinking Cursor - Only render if not complete */}
            {!isComplete && (
                <Animated.Text style={[styles.cursor, animatedCursorStyle, style]}>
                    ▋
                </Animated.Text>
            )}
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        // Inherits from parent
    },
    cursor: {
        // Ensure cursor inherits parent font properties, but override specific ones if needed
        fontWeight: '900',
    }
});
