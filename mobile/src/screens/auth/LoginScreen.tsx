/**
 * Login Screen
 * Rebuilt 1:1 to Stitch "Authentication (Login Refresh)" Design
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
    Image,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CLASSROOM_BG = require('../../../assets/onboarding/classroom_bg.png');

export const LoginScreen: React.FC = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { login, signInWithGoogle, isLoading, error, clearError, continueAsGuest } = useAuth();

    useFocusEffect(
        React.useCallback(() => {
            clearError();
        }, [])
    );

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
        setEmailError('');
        setPasswordError('');
        clearError();

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
        } catch (err) {
            // Error managed by AuthContext
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
            {/* Background Decoration (Blobs) */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <Image 
                    source={CLASSROOM_BG}
                    style={styles.globalBackground}
                />
                <View style={[styles.blob1, { backgroundColor: colors.primary + '0A' }]} />
                <View style={[styles.blob2, { backgroundColor: colors.secondaryContainer + '0A' }]} />
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
                    <View style={styles.contentWrapper}>
                        {/* Branding Header */}
                        <View style={styles.header}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceContainerHigh }]}>
                                <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
                            </View>
                            <Text style={[styles.title, { color: colors.primary }]}>
                                My Rights
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                                Secure Access to Your Digital Jurist
                            </Text>
                        </View>

                        {/* Error message */}
                        {error && (
                            <View style={[styles.errorContainer, { backgroundColor: colors.error + '1A', borderColor: colors.error + '40' }]}>
                                <Ionicons name="alert-circle" size={18} color={colors.error} />
                                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                            </View>
                        )}

                        {/* Login Card */}
                        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow, shadowColor: '#000' }]}>
                            <View style={styles.form}>
                                <Input
                                    label="EMAIL OR USERNAME"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setEmailError('');
                                    }}
                                    placeholder="Enter your credentials"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    leftIcon="person"
                                    error={emailError}
                                />

                                <Input
                                    label="SECRET KEY"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setPasswordError('');
                                    }}
                                    placeholder="••••••••"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoComplete="password"
                                    leftIcon="lock-closed"
                                    rightIcon={showPassword ? 'eye-off' : 'eye'}
                                    onRightIconPress={() => setShowPassword(!showPassword)}
                                    error={passwordError}
                                />

                                <Button
                                    title={isLoading ? "Authenticating..." : "Secure Login"}
                                    onPress={handleLogin}
                                    loading={isLoading}
                                    disabled={isLoading}
                                    fullWidth
                                    style={styles.loginButton}
                                />
                            </View>

                            {/* Social Connect Section */}
                            <View style={styles.socialSection}>
                                <View style={styles.dividerRow}>
                                    <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant + '33' }]} />
                                    <Text style={[styles.dividerText, { color: colors.onSurfaceVariant }]}>SECURE SOCIAL CONNECT</Text>
                                    <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant + '33' }]} />
                                </View>

                                <View style={styles.socialGrid}>
                                    <TouchableOpacity 
                                        style={[styles.socialButton, { backgroundColor: colors.surfaceContainerHigh }]}
                                        onPress={() => signInWithGoogle('home')}
                                        disabled={isLoading}
                                    >
                                        <Ionicons name="logo-google" size={18} color={colors.onSurface} style={{ opacity: 0.8 }} />
                                        <Text style={[styles.socialText, { color: colors.onSurface }]}>Google</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Footer Links */}
                        <View style={styles.footerRow}>
                            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
                                <Text style={[styles.forgotPasswordText, { color: colors.onSurfaceVariant }]}>
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.registerRow}>
                                <Text style={[styles.footerText, { color: colors.onSurfaceVariant }]}>
                                    New to Legal Command?{' '}
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
                                    <Text style={[styles.linkText, { color: colors.primary }]}>
                                        Begin your defense
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <TouchableOpacity style={styles.guestLink} onPress={continueAsGuest}>
                            <Text style={[styles.guestText, { color: colors.onSurfaceVariant }]}>Continue as Guest</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Gradient Accent */}
            <LinearGradient
                colors={['transparent', colors.primary + '33', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bottomAccent}
            />

            {isLoading && <LoadingSpinner overlay />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    blob1: {
        position: 'absolute',
        top: '-15%',
        right: '-25%',
        width: 600,
        height: 600,
        borderRadius: 300,
        opacity: 0.6,
        transform: [{ scale: 1.2 }],
    },
    blob2: {
        position: 'absolute',
        bottom: '-15%',
        left: '-25%',
        width: 600,
        height: 600,
        borderRadius: 300,
        opacity: 0.6,
        transform: [{ scale: 1.2 }],
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 480,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    title: {
        fontFamily: theme.typography.displayMd.fontFamily,
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: theme.typography.bodyLg.fontFamily,
        fontWeight: '500',
        letterSpacing: 0.5,
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
    card: {
        borderRadius: 24,
        padding: 32,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
        elevation: 10,
    },
    form: {
        gap: 8, // Using gap from Input components margin internally, plus a bit more
    },
    loginButton: {
        marginTop: 16,
    },
    socialSection: {
        marginTop: 48,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        marginHorizontal: 16,
    },
    socialGrid: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 24,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 12,
    },
    socialText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 14,
        fontWeight: '500',
    },
    footerRow: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 32,
        gap: 20,
    },
    forgotPasswordText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontWeight: '500',
        fontSize: 14,
    },
    registerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontFamily: theme.typography.bodyMd.fontFamily,
        fontSize: 14,
    },
    linkText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 14,
        fontWeight: '700',
    },
    guestLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    guestText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    bottomAccent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
    },
    globalBackground: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        resizeMode: 'cover',
        opacity: 0.15, // Match onboarding watermark
    },
});
