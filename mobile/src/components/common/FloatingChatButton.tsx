import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { BlurView } from 'expo-blur';

export const FloatingChatButton: React.FC = () => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => { show.remove(); hide.remove(); };
    }, []);

    if (keyboardVisible) return null;

    const onPress = () => {
        navigation.navigate('Chat');
    };

    return (
        <TouchableOpacity
            testID="floating-chat"
            accessibilityRole="button"
            accessibilityLabel="Open chat"
            style={[styles.container, { backgroundColor: colors.secondary }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <BlurView intensity={20} tint="dark" style={styles.blur}>
                <Ionicons name="chatbubble" size={24} color={colors.onSecondary} />
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: theme.spacing.xl,
        right: theme.spacing.md,
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        ...theme.shadows.glass,
        zIndex: theme.zIndex.fixed,
    },
    blur: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
