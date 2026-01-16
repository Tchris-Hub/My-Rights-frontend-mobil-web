/**
 * Onboarding Screen
 * 3-slide carousel with swipeable slides
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const slides: OnboardingSlide[] = [
    {
        id: '1',
        title: 'Know Your Rights',
        description: 'Access legal information based on the Nigerian Constitution. Understand your rights in simple, clear language.',
        icon: 'shield-checkmark',
    },
    {
        id: '2',
        title: 'Get Legal Guidance',
        description: 'Chat with our AI assistant, review contracts, and generate legal documents instantly.',
        icon: 'chatbubbles',
    },
    {
        id: '3',
        title: 'Access Justice',
        description: 'Free, accessible legal help for everyone. Connect with legal aid organizations when you need more support.',
        icon: 'people',
    },
];

export const OnboardingScreen: React.FC = () => {
    const { colors } = useTheme();
    const { completeOnboarding } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        }
    };

    const handleSkip = async () => {
        await completeOnboarding();
    };

    const handleGetStarted = async () => {
        await completeOnboarding();
    };

    const renderSlide = ({ item }: { item: OnboardingSlide }) => (
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                <Ionicons name={item.icon} size={80} color={colors.onPrimary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
                {item.description}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Skip button */}
            {currentIndex < slides.length - 1 && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
                </TouchableOpacity>
            )}

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id}
            />

            {/* Page indicators */}
            <View style={styles.pagination}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                backgroundColor: index === currentIndex ? colors.primary : colors.border,
                                width: index === currentIndex ? 24 : 8,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Bottom buttons */}
            <View style={styles.footer}>
                {currentIndex === slides.length - 1 ? (
                    <Button
                        title="Get Started"
                        onPress={handleGetStarted}
                        fullWidth
                        icon={<Ionicons name="arrow-forward" size={20} color={theme.colors.onPrimary} />}
                        iconPosition="right"
                    />
                ) : (
                    <Button
                        title="Next"
                        onPress={handleNext}
                        fullWidth
                        icon={<Ionicons name="arrow-forward" size={20} color={theme.colors.onPrimary} />}
                        iconPosition="right"
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: theme.spacing.lg,
        zIndex: 10,
        padding: theme.spacing.sm,
    },
    skipText: {
        ...theme.typography.button,
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xl,
        ...theme.shadows.lg,
    },
    title: {
        ...theme.typography.h2,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    description: {
        ...theme.typography.body,
        textAlign: 'center',
        maxWidth: 320,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xl,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    footer: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
});

