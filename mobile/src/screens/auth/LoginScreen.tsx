import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Mark } from '../../components/brand/Mark';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';


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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={styles.contentWrapper}>
                        <View style={styles.header}>
                            <Mark size={44} />
                            <Text style={[styles.title, { color: colors.onSurface }]}>Sign in to My Rights</Text>
                            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                                Keep your questions and documents on your account. No password to remember.
                            </Text>
                        </View>

                        {error ? (
                            <View style={[styles.errorContainer, { backgroundColor: colors.errorContainer, borderColor: colors.error }]}>
                                <Ionicons name="alert-circle" size={18} color={colors.error} />
                                <Text style={[styles.errorText, { color: colors.onErrorContainer }]}>{error}</Text>
                            </View>
                        ) : null}

                        <Input
                            testID="auth-email"
                            accessibilityLabel="Email address"
                            label="Email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setEmailError('');
                            }}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            error={emailError}
                        />
                        <Button
                            testID="auth-magic-link"
                            title="Email me a sign-in link"
                            onPress={handleMagicLink}
                            loading={isLoading}
                            disabled={isLoading}
                            size="large"
                            fullWidth
                        />

                        <View style={styles.dividerRow}>
                            <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
                            <Text style={[styles.dividerText, { color: colors.onSurfaceVariant }]}>or</Text>
                            <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
                        </View>

                        <Button
                            testID="auth-google"
                            title="Continue with Google"
                            variant="outline"
                            size="large"
                            fullWidth
                            onPress={handleGoogle}
                            disabled={isLoading}
                            icon={<Ionicons name="logo-google" size={18} color={colors.onSurface} />}
                        />

                        <Text style={[styles.consentHint, { color: colors.onSurfaceVariant }]}>
                            You will be asked to accept the Terms and Privacy Policy before using private features.
                        </Text>
                        <Button testID="auth-guest" title="Look around as a guest" variant="ghost" fullWidth onPress={continueAsGuest} disabled={isLoading} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            {isLoading && <LoadingSpinner overlay />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    contentWrapper: { width: '100%', maxWidth: 480, alignSelf: 'center' },
    header: { marginBottom: 28, gap: 12 },
    title: { ...theme.typography.displaySm, fontFamily: theme.typography.fontFamily.display },
    subtitle: { ...theme.typography.bodyLg, color: undefined },
    errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: theme.borderRadius.md, borderWidth: 1, marginBottom: 16 },
    errorText: { ...theme.typography.bodyMd, flex: 1, color: undefined },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { ...theme.typography.caption },
    consentHint: { ...theme.typography.caption, textAlign: 'center', marginTop: 18, marginBottom: 6 },
});
