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
    Dimensions,
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
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const { requestMagicLink, signInWithGoogle, isLoading, error, clearError, continueAsGuest } = useAuth();

    useFocusEffect(
        React.useCallback(() => {
            clearError();
        }, [clearError]),
    );

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    const handleMagicLink = async () => {
        setEmailError('');
        clearError();

        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        }
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            return;
        }

        try {
            await requestMagicLink(email);
            navigation.navigate('MagicLinkSent', { email: email.trim().toLowerCase() });
        } catch {
            // Error is managed by AuthContext.
        }
    };

    const handleGoogle = async () => {
        try {
            await signInWithGoogle();
        } catch {
            // Error is managed by AuthContext.
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Image source={CLASSROOM_BG} style={styles.globalBackground} />
                <View style={[styles.blob1, { backgroundColor: colors.primary + '0A' }]} />
                <View style={[styles.blob2, { backgroundColor: colors.secondaryContainer + '0A' }]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentWrapper}>
                        <View style={styles.header}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceContainerHigh }]}>
                                <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
                            </View>
                            <Text style={[styles.title, { color: colors.primary }]}>My Rights</Text>
                            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                                Secure access without passwords
                            </Text>
                        </View>

                        {error && (
                            <View style={[styles.errorContainer, { backgroundColor: colors.error + '1A', borderColor: colors.error + '40' }]}>
                                <Ionicons name="alert-circle" size={18} color={colors.error} />
                                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                            </View>
                        )}

                        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow, shadowColor: '#000' }]}>
                            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Continue with email</Text>
                            <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
                                We'll email you a one-time sign-in link. No password is created or stored for login.
                            </Text>

                            <Input
                                label="EMAIL ADDRESS"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setEmailError('');
                                }}
                                placeholder="you@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                leftIcon="mail"
                                error={emailError}
                            />

                            <Button
                                title="Email me a sign-in link"
                                onPress={handleMagicLink}
                                loading={isLoading}
                                disabled={isLoading}
                                fullWidth
                                style={styles.loginButton}
                            />

                            <View style={styles.dividerRow}>
                                <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant + '33' }]} />
                                <Text style={[styles.dividerText, { color: colors.onSurfaceVariant }]}>OR</Text>
                                <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant + '33' }]} />
                            </View>

                            <TouchableOpacity
                                style={[styles.googleButton, { backgroundColor: colors.surfaceContainerHigh }]}
                                onPress={handleGoogle}
                                disabled={isLoading}
                            >
                                <Ionicons name="logo-google" size={18} color={colors.onSurface} />
                                <Text style={[styles.googleText, { color: colors.onSurface }]}>Continue with Google</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.consentHint, { color: colors.onSurfaceVariant }]}>
                            After authentication, you'll be asked to accept the current Terms of Service and Privacy Policy before using private features.
                        </Text>

                        <TouchableOpacity style={styles.guestLink} onPress={continueAsGuest} disabled={isLoading}>
                            <Text style={[styles.guestText, { color: colors.onSurfaceVariant }]}>Continue as Guest</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

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
    container: { flex: 1 },
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
    keyboardView: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    contentWrapper: { width: '100%', maxWidth: 480 },
    header: { alignItems: 'center', marginBottom: 40 },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
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
    cardTitle: {
        ...theme.typography.titleLg,
        marginBottom: 8,
    },
    cardSubtitle: {
        ...theme.typography.bodyMd,
        lineHeight: 21,
        marginBottom: 24,
    },
    loginButton: { marginTop: 12 },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 28,
    },
    dividerLine: { flex: 1, height: 1 },
    dividerText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 11,
        fontWeight: '700',
        marginHorizontal: 16,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 12,
    },
    googleText: {
        fontFamily: theme.typography.labelMd.fontFamily,
        fontSize: 14,
        fontWeight: '600',
    },
    consentHint: {
        fontFamily: theme.typography.bodyMd.fontFamily,
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 18,
        marginTop: 24,
        paddingHorizontal: 12,
    },
    guestLink: { marginTop: 24, alignItems: 'center' },
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
        opacity: 0.15,
    },
});
