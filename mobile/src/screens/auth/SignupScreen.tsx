/**
 * Signup Screen
 * User registration with real-time validation
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
import { TermsModal } from '../../components/modals/TermsModal';

export const SignupScreen: React.FC = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { register, isLoading, error, clearError } = useAuth();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // Modal states
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsType, setTermsType] = useState<'terms' | 'privacy'>('terms');

    const openTerms = (type: 'terms' | 'privacy') => {
        setTermsType(type);
        setShowTermsModal(true);
    };

    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: '',
    });

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getPasswordStrength = (password: string): string => {
        if (password.length < 8) return 'Too short';
        if (password.length < 12) return 'Weak';
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            return 'Medium';
        }
        return 'Strong';
    };

    const handleSignup = async () => {
        clearError();
        const newErrors = {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: '',
        };

        let hasError = false;

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
            hasError = true;
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            hasError = true;
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email';
            hasError = true;
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
            hasError = true;
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            hasError = true;
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
            hasError = true;
        } else if (!/[0-9]/.test(password)) {
            newErrors.password = 'Password must contain at least one digit';
            hasError = true;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            hasError = true;
        }

        if (!acceptedTerms) {
            newErrors.terms = 'You must accept the terms and conditions';
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;

        try {
            await register({
                email: email.trim(),
                password,
                full_name: fullName.trim(),
                accept_terms: acceptedTerms,
            });
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
                    <View style={styles.header}>
                        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                            <Ionicons name="person-add" size={48} color={colors.onPrimary} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Join thousands of Nigerians knowing their rights
                        </Text>
                    </View>

                    {error && (
                        <View style={[styles.errorContainer, { backgroundColor: colors.errorLight + '20' }]}>
                            <Ionicons name="alert-circle" size={20} color={colors.error} />
                            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                        </View>
                    )}

                    <View style={styles.form}>
                        <Input
                            label="Full Name"
                            value={fullName}
                            onChangeText={(text) => {
                                setFullName(text);
                                setErrors({ ...errors, fullName: '' });
                            }}
                            placeholder="John Doe"
                            autoCapitalize="words"
                            leftIcon="person"
                            error={errors.fullName}
                        />

                        <Input
                            label="Email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrors({ ...errors, email: '' });
                            }}
                            placeholder="your.email@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            leftIcon="mail"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrors({ ...errors, password: '' });
                            }}
                            placeholder="Create a strong password"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            leftIcon="lock-closed"
                            rightIcon={showPassword ? 'eye-off' : 'eye'}
                            onRightIconPress={() => setShowPassword(!showPassword)}
                            error={errors.password}
                        />

                        {password.length > 0 && (
                            <Text style={[styles.passwordStrength, { color: colors.textSecondary }]}>
                                Strength: {getPasswordStrength(password)}
                            </Text>
                        )}

                        <Input
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setErrors({ ...errors, confirmPassword: '' });
                            }}
                            placeholder="Re-enter your password"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            leftIcon="lock-closed"
                            error={errors.confirmPassword}
                        />

                        <TouchableOpacity
                            style={styles.termsContainer}
                            onPress={() => setAcceptedTerms(!acceptedTerms)}
                        >
                            <View style={[styles.checkbox, { borderColor: colors.border }]}>
                                {acceptedTerms && (
                                    <Ionicons name="checkmark" size={16} color={colors.primary} />
                                )}
                            </View>
                            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                                I agree to the{' '}
                                <Text
                                    style={{ color: colors.primary }}
                                    onPress={() => openTerms('terms')}
                                >
                                    Terms of Service
                                </Text>{' '}
                                and{' '}
                                <Text
                                    style={{ color: colors.primary }}
                                    onPress={() => openTerms('privacy')}
                                >
                                    Privacy Policy
                                </Text>
                            </Text>
                        </TouchableOpacity>

                        {errors.terms && (
                            <Text style={[styles.errorTextSmall, { color: colors.error }]}>
                                {errors.terms}
                            </Text>
                        )}

                        <Button
                            title="Create Account"
                            onPress={handleSignup}
                            loading={isLoading}
                            disabled={isLoading}
                            fullWidth
                            style={styles.signupButton}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                            <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {isLoading && <LoadingSpinner overlay />}

            <TermsModal
                visible={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                type={termsType}
            />
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
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        marginTop: theme.spacing.xl,
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
        marginBottom: theme.spacing.lg,
    },
    passwordStrength: {
        ...theme.typography.caption,
        marginTop: -theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        marginLeft: theme.spacing.md,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    termsText: {
        ...theme.typography.bodySmall,
        flex: 1,
    },
    errorTextSmall: {
        ...theme.typography.caption,
        marginTop: -theme.spacing.sm,
        marginLeft: theme.spacing.md,
    },
    signupButton: {
        marginTop: theme.spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    footerText: {
        ...theme.typography.body,
    },
    linkText: {
        ...theme.typography.button,
    },
});

