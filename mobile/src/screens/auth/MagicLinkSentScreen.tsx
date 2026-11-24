import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import theme from '../../constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'MagicLinkSent'>;

export const MagicLinkSentScreen: React.FC<Props> = ({ route }) => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const email = route.params.email;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                    <Ionicons name="mail-open" size={48} color={colors.onPrimary} />
                </View>

                <Text style={[styles.title, { color: colors.onSurface }]}>Check your email</Text>
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                    We sent a sign-in link to
                </Text>
                <Text style={[styles.email, { color: colors.onSurface }]}>{email}</Text>
                <Text style={[styles.help, { color: colors.onSurfaceVariant }]}>
                    Open the link on this device to continue. It works once and expires in 5 minutes.
                </Text>

                <TouchableOpacity
                    style={[styles.backButton, { borderColor: colors.outlineVariant }]}
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                >
                    <Text style={[styles.backText, { color: colors.primary }]}>Use a different email</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xl,
    },
    title: {
        ...theme.typography.displayMd,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        ...theme.typography.bodyLg,
        textAlign: 'center',
    },
    email: {
        ...theme.typography.titleLg,
        textAlign: 'center',
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
    },
    help: {
        ...theme.typography.bodyMd,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 360,
        marginBottom: theme.spacing.xl,
    },
    backButton: {
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
    },
    backText: {
        ...theme.typography.labelMd,
        fontFamily: theme.typography.fontFamily.headlineMedium,
    },
});
