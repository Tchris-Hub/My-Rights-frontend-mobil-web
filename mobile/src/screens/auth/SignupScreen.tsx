/**
 * Signup Screen
 * Rebuilt 1:1 to Stitch "Sign Up" Design
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
    Dimensions,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TermsModal } from '../../components/modals/TermsModal';
import { APP_CONFIG } from '../../constants/config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CLASSROOM_BG = require('../../../assets/onboarding/classroom_bg.png');

export const SignupScreen: React.FC = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { register, signInWithGoogle, isLoading, error, clearError } = useAuth();

    useFocusEffect(
        React.useCallback(() => {
            clearError();
        }, [])
    );

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

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
    });

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getPasswordStrengthIndex = (pass: string): number => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (pass.length >= 12) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
        return Math.min(score, 4);
    };

    const passwordStrength = getPasswordStrengthIndex(password);

    const handleSignup = async () => {
        clearError();
        const newErrors = {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
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
            newErrors.password = 'Must be at least 8 characters';
            hasError = true;
        }

        if (!acceptedTerms) {
            hasError = true;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;

        try {
            await register({
                email: email.trim(),
                password,
                name: fullName.trim(),
                accept_terms: acceptedTerms,
                terms_version: APP_CONFIG.TERMS_VERSION,
                privacy_version: APP_CONFIG.PRIVACY_POLICY_VERSION,
                phone_number: phone.trim() || undefined,
            });
        } catch (err) {
            // Error managed by AuthContext
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
            {/* Background Blob Effects */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <Image 
                    source={CLASSROOM_BG}
                    style={styles.globalBackground}
                />
                <View style={[styles.blob1, { backgroundColor: colors.primary + '1A' }]} />
                <View style={[styles.blob2, { backgroundColor: colors.secondaryContainer + '1A' }]} />
            </View>

            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.navText, { color: colors.primary }]}>Sign Up</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header - Left Aligned Design */}
                    <View style={styles.headerArea}>
                        <Text style={[styles.eyebrow, { color: colors.secondary }]}>YOUR VOICE MATTERS</Text>
                        <Text style={[styles.title, { color: colors.onSurface }]}>Empowerment</Text>
                        <Text style={[styles.title, { color: colors.primary }]}>Starts Here.</Text>
                    </View>

                    {error && (
                        <View style={[styles.errorContainer, { backgroundColor: colors.error + '1A', borderColor: colors.error + '40' }]}>
                            <Ionicons name="alert-circle" size={18} color={colors.error} />
                            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                        </View>
                    )}

                    {/* Glass Form Panel */}
                    <BlurView intensity={24} tint="dark" style={[styles.glassForm, { backgroundColor: 'rgba(34, 42, 61, 0.7)' }]}>
                        <View style={styles.formHeader}>
                            <Text style={[styles.formTitle, { color: colors.onSurface }]}>Create Account</Text>
                            <Text style={[styles.formSubtitle, { color: colors.onSurfaceVariant }]}>Join the digital legal revolution.</Text>
                        </View>

                        <View style={styles.form}>
                            <Input
                                label="FULL NAME"
                                value={fullName}
                                onChangeText={(text) => {
                                    setFullName(text);
                                    setErrors({ ...errors, fullName: '' });
                                }}
                                placeholder="John Doe"
                                autoCapitalize="words"
                                error={errors.fullName}
                            />

                            <Input
                                label="EMAIL ADDRESS"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setErrors({ ...errors, email: '' });
                                }}
                                placeholder="john@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                error={errors.email}
                            />

                            <View style={styles.passwordGroup}>
                                <Input
                                    label="PASSWORD"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setErrors({ ...errors, password: '' });
                                    }}
                                    placeholder="••••••••"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    rightIcon={showPassword ? 'eye-off' : 'eye'}
                                    onRightIconPress={() => setShowPassword(!showPassword)}
                                    error={errors.password}
                                />
                                {/* Password Strength Meter */}
                                <View style={styles.strengthMeter}>
                                    {[1, 2, 3, 4].map((level) => (
                                        <View 
                                            key={level} 
                                            style={[
                                                styles.strengthBar, 
                                                { 
                                                    backgroundColor: level <= passwordStrength 
                                                        ? colors.primary 
                                                        : colors.surfaceContainerHighest 
                                                }
                                            ]} 
                                        />
                                    ))}
                                </View>
                                {passwordStrength > 0 && (
                                    <Text style={[styles.strengthText, { color: colors.primary }]}>
                                        {passwordStrength >= 3 ? 'Strong Password' : 'Weak Password'}
                                    </Text>
                                )}
                            </View>

                            <Input
                                label="CONFIRM PASSWORD"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setErrors({ ...errors, confirmPassword: '' });
                                }}
                                placeholder="••••••••"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                error={errors.confirmPassword}
                            />

                            <Input
                                label="PHONE (OPTIONAL)"
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+1 (555) 000-0000"
                                keyboardType="phone-pad"
                            />

                            <TouchableOpacity
                                style={styles.consentRow}
                                onPress={() => setAcceptedTerms((value) => !value)}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: acceptedTerms }}
                            >
                                <Ionicons
                                    name={acceptedTerms ? 'checkbox' : 'square-outline'}
                                    size={24}
                                    color={acceptedTerms ? colors.primary : colors.onSurfaceVariant}
                                />
                                <Text style={[styles.consentText, { color: colors.onSurfaceVariant }]}>I agree to the current <Text onPress={() => openTerms('terms')} style={{ color: colors.primary }}>Terms of Service</Text> and <Text onPress={() => openTerms('privacy')} style={{ color: colors.primary }}>Privacy Policy</Text>.</Text>
                            </TouchableOpacity>

                            <Button
                                title="CREATE ACCOUNT"
                                onPress={handleSignup}
                                loading={isLoading}
                                disabled={isLoading}
                                fullWidth
                                style={styles.submitButton}
                            />
                        </View>

                        {/* Social Auth */}
                        <View style={styles.socialAuthContainer}>
                            <View style={styles.dividerRow}>
                                <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant + '4D' }]} />
                                <Text style={[styles.dividerText, { color: colors.onSurfaceVariant }]}>OR CONTINUE WITH</Text>
                                <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant + '4D' }]} />
                            </View>

                            <View style={styles.socialGrid}>
                                <TouchableOpacity 
                                    style={[styles.socialButton, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' }]}
                                    onPress={() => signInWithGoogle('home')}
                                    disabled={isLoading}
                                >
                                    <Ionicons name="logo-google" size={18} color={colors.onSurface} style={{ opacity: 0.9 }} />
                                    <Text style={[styles.socialText, { color: colors.onSurface }]}>Google</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.footerRedirect}>
                            <Text style={[styles.footerRedirectText, { color: colors.onSurfaceVariant }]}>
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                                <Text style={[styles.linkText, { color: colors.primary }]}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer Legal Credit */}
            <SafeAreaView edges={['bottom']} style={styles.legalFooter}>
                <Text style={[styles.legalText, { color: colors.outline }]}>
                    INSTITUTIONAL INTEGRITY • DIGITAL EXCELLENCE • 2024
                </Text>
            </SafeAreaView>

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
    topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
        zIndex: 50,
    },
    navText: {
        fontFamily: theme.typography.labelLg.fontFamily,
        fontWeight: '700',
    },
    blob1: {
        position: 'absolute',
        top: '10%',
        right: '-10%',
        width: 400,
        height: 400,
        borderRadius: 200,
        opacity: 0.6,
        transform: [{ scale: 1.2 }],
    },
    blob2: {
        position: 'absolute',
        bottom: '10%',
        left: '-10%',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.5,
        transform: [{ scale: 1.2 }],
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 64, // Space for the absolute legal footer
        paddingTop: 16,
    },
    headerArea: {
        marginBottom: 32,
    },
    eyebrow: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 16,
    },
    title: {
        fontFamily: theme.typography.displayMd.fontFamily,
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: -1,
        lineHeight: 52,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
        gap: 8,
    },
    errorText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 14,
        flex: 1,
    },
    glassForm: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    formHeader: {
        marginBottom: 32,
    },
    formTitle: {
        fontFamily: theme.typography.displaySm.fontFamily,
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    formSubtitle: {
        fontFamily: theme.typography.bodyMd.fontFamily,
        fontSize: 14,
    },
    form: {
        gap: 16, // Use react-native gap equivalent here to space fields out
    },
    passwordGroup: {
        position: 'relative',
    },
    strengthMeter: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 8,
        paddingHorizontal: 4,
    },
    strengthBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
    },
    strengthText: {
        fontFamily: theme.typography.labelSm.fontFamily,
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'right',
        marginTop: 4,
    },
    consentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
        marginBottom: 8,
    },
    consentText: {
        flex: 1,
        fontFamily: theme.typography.bodyMd.fontFamily,
        fontSize: 13,
        lineHeight: 19,
    },
    submitButton: {
        marginTop: 16,
    },
    socialAuthContainer: {
        marginTop: 32,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 2,
        marginHorizontal: 16,
    },
    socialGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
    },
    socialText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 14,
        fontWeight: '600',
    },
    footerRedirect: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerRedirectText: {
        fontFamily: theme.typography.bodyMd.fontFamily,
        fontSize: 14,
    },
    linkText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 14,
        fontWeight: '700',
    },
    legalFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingVertical: 24,
    },
    legalText: {
        fontFamily: theme.typography.labelSm.fontFamily,
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 2,
    },
    globalBackground: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        resizeMode: 'cover',
        opacity: 0.15, // Match onboarding watermark
    },
});
