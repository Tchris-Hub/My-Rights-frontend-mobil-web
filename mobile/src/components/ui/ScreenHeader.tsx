/**
 * ScreenHeader. One header for every detail screen: back arrow, title, optional right action.
 * Sits in normal layout flow (never absolutely positioned), so it cannot overlap content.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    /** Hide the back arrow on root screens of a tab. */
    root?: boolean;
    onBack?: () => void;
    right?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, root, onBack, right }) => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card }}>
            <View style={[styles.bar, { borderBottomColor: colors.line }]}>
                {root ? (
                    <View style={styles.side} />
                ) : (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        hitSlop={8}
                        onPress={onBack ?? (() => navigation.goBack())}
                        style={({ pressed }) => [styles.side, styles.back, pressed && { backgroundColor: colors.surfaceContainer }]}
                    >
                        <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
                    </Pressable>
                )}
                <View style={styles.titles}>
                    <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>{title}</Text>
                    {subtitle ? <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{subtitle}</Text> : null}
                </View>
                <View style={[styles.side, styles.right]}>{right}</View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    bar: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingHorizontal: 8, borderBottomWidth: 1 },
    side: { width: 44, height: 44 },
    back: { alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
    right: { alignItems: 'center', justifyContent: 'center' },
    titles: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
    title: { ...theme.typography.titleMd },
    subtitle: { ...theme.typography.caption },
});
