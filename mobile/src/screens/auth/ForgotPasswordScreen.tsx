import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export const ForgotPasswordScreen: React.FC = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { resetPasswordForEmail, error, clearError } = useAuth();

    // Clear error when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            clearError();
        }, [])
    );

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string) => {
        // Stricter regex ensuring valid domain part and at least 2 char TLD
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email.trim());
    };

    const handleResetRequest = async () => {
        setEmailError('');
        clearError();

        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            return;
        }

        try {
            setIsLoading(true);
            await resetPasswordForEmail(email.trim());
            setIsSuccess(true);
        } catch (err: any) {
            // Error handled by context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                            <Ionicons name="mail-open" size={48} color={colors.onPrimary} />
                        </View>
                        <Text style={[styles.title, { color: colors.onSurface }]}>Forgot Password</Text>
                        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                            Enter your email to receive a recovery link.
                            {"\n\n"}
                            <Text style={{ fontSize: 12, fontStyle: 'italic' }}>
                                Note: For your security, if an account exists, a link will be sent. We won't disclose if your email is registered.
                            </Text>
                        </Text>
                    </View>

                    {isSuccess ? (
                        <View style={styles.successContainer}>
                            <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
                            <Text style={[styles.successTitle, { color: colors.onSurface }]}>Link Sent!</Text>
                            <Text style={[styles.successText, { color: colors.onSurfaceVariant }]}>
                                Please check your email inbox for instructions on how to reset your password.
                            </Text>
                            <Button
                                title="Back to Login"
                                onPress={() => navigation.navigate('Login' as never)}
                                fullWidth
                                style={styles.button}
                            />
                        </View>
                    ) : (
                        <View style={styles.form}>
                            {error && (
                                <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                                    <Ionicons name="alert-circle" size={20} color={colors.error} />
                                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                                </View>
                            )}

                            <Input
                                label="Email"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setEmailError('');
                                }}
                                placeholder="your.email@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                leftIcon="mail"
                                error={emailError}
                            />

                            <Button
                                title="Send Reset Link"
                                onPress={handleResetRequest}
                                loading={isLoading}
                                disabled={isLoading}
                                fullWidth
                                style={styles.button}
                            />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: theme.spacing.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
        ...theme.shadows.glass,
    },
    title: {
        ...theme.typography.displayMd,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        ...theme.typography.bodyLg,
        textAlign: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    form: {
        width: '100%',
    },
    button: {
        marginTop: theme.spacing.md,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    errorText: {
        ...theme.typography.labelMd,
        flex: 1,
    },
    successContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    successTitle: {
        ...theme.typography.titleLg,
        marginVertical: theme.spacing.md,
    },
    successText: {
        ...theme.typography.bodyLg,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.lg,
    },
});
