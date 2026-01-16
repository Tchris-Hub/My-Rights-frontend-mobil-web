import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '../../constants/theme';
import { BlurView } from 'expo-blur';

export const FloatingChatButton: React.FC = () => {
    const navigation = useNavigation<any>();

    const onPress = () => {
        navigation.navigate('Chat');
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <BlurView intensity={20} tint="light" style={styles.blur}>
                <Ionicons name="chatbubble" size={24} color={theme.colors.onSecondary} />
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
        ...theme.shadows.lg,
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
