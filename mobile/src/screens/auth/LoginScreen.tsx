/**
 * Login Screen
 * Email/password authentication with micro-interactions
 */

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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export const LoginScreen: React.FC = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { login, isLoading, error, clearError, continueAsGuest } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        // Clear previous errors
        setEmailError('');
        setPasswordError('');
        clearError();

        // Validation
        let hasError = false;

        if (!email.trim()) {
            setEmailError('Email is required');
            hasError = true;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            hasError = true;
        }

        if (!password.trim()) {
            setPasswordError('Password is required');
            hasError = true;
        } else if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            hasError = true;
        }

        if (hasError) return;

        try {
            await login({ email: email.trim(), password });
            // Navigation handled by RootNavigator based on auth state
        } catch (err) {
            // Error displayed via AuthContext
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                            <Ionicons name="shield-checkmark" size={48} color={colors.onPrimary} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Sign in to access your legal companion
                        </Text>
                    </View>

                    {/* Error message */}
                    {error && (
                        <View style={[styles.errorContainer, { backgroundColor: colors.errorLight + '20' }]}>
                            <Ionicons name="alert-circle" size={20} color={colors.error} />
                            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                        </View>
                    )}

                    {/* Form */}
                    <View style={styles.form}>
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
                            autoComplete="email"
                            leftIcon="mail"
                            error={emailError}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setPasswordError('');
                            }}
                            placeholder="Enter your password"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoComplete="password"
                            leftIcon="lock-closed"
                            rightIcon={showPassword ? 'eye-off' : 'eye'}
                            onRightIconPress={() => setShowPassword(!showPassword)}
                            error={passwordError}
                        />

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={isLoading}
                            disabled={isLoading}
                            fullWidth
                            style={styles.loginButton}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Don't have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
                            <Text style={[styles.linkText, { color: colors.primary }]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.guestButton}
                        onPress={continueAsGuest}
                    >
                        <Text style={[styles.guestText, { color: colors.textSecondary }]}>
                            Continue as guest
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {isLoading && <LoadingSpinner overlay />}
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
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
        ...theme.shadows.md,
    },
    title: {
        ...theme.typography.h2,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        ...theme.typography.body,
        textAlign: 'center',
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
        ...theme.typography.bodySmall,
        flex: 1,
    },
    form: {
        marginBottom: theme.spacing.xl,
    },
    loginButton: {
        marginTop: theme.spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    footerText: {
        ...theme.typography.body,
    },
    linkText: {
        ...theme.typography.button,
    },
    guestButton: {
        alignItems: 'center',
        padding: theme.spacing.sm,
    },
    guestText: {
        ...theme.typography.bodySmall,
    },
});
