import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export const ResetPasswordScreen: React.FC = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { updateUserPassword, error, clearError } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const handleUpdatePassword = async () => {
        setPasswordError('');
        setConfirmError('');
        clearError();

        let hasError = false;

        if (!password.trim()) {
            setPasswordError('Password is required');
            hasError = true;
        } else if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            hasError = true;
        }

        if (password !== confirmPassword) {
            setConfirmError('Passwords do not match');
            hasError = true;
        }

        if (hasError) return;

        try {
            setIsLoading(true);
            await updateUserPassword(password);
            Alert.alert(
                "Success",
                "Your password has been updated. You can now log in with your new password.",
                [{ text: "OK", onPress: () => navigation.navigate('Login' as never) }]
            );
        } catch (err: any) {
            // Error handled by context
        } finally {
            setIsLoading(false);
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
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                            <Ionicons name="lock-open" size={48} color={colors.onPrimary} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Create New Password</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Please enter your new password below
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {error && (
                            <View style={[styles.errorContainer, { backgroundColor: colors.errorLight + '20' }]}>
                                <Ionicons name="alert-circle" size={20} color={colors.error} />
                                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                            </View>
                        )}

                        <Input
                            label="New Password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setPasswordError('');
                            }}
                            placeholder="Enter new password"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            leftIcon="lock-closed"
                            rightIcon={showPassword ? 'eye-off' : 'eye'}
                            onRightIconPress={() => setShowPassword(!showPassword)}
                            error={passwordError}
                        />

                        <Input
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setConfirmError('');
                            }}
                            placeholder="Confirm new password"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            leftIcon="lock-closed"
                            error={confirmError}
                        />

                        <Button
                            title="Update Password"
                            onPress={handleUpdatePassword}
                            loading={isLoading}
                            disabled={isLoading}
                            fullWidth
                            style={styles.button}
                        />
                    </View>
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
        justifyContent: 'center',
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
        ...theme.typography.bodySmall,
        flex: 1,
    },
});
