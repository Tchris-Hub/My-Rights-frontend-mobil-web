import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TermsModal } from '../../components/modals/TermsModal';
import { Button } from '../../components/ui/Button';
import { APP_CONFIG } from '../../constants/config';
import theme from '../../constants/theme';

export const ConsentScreen: React.FC = () => {
    const { colors } = useTheme();
    const { acceptCurrentConsent, isLoading, error } = useAuth();
    const [accepted, setAccepted] = useState(false);
    const [modalType, setModalType] = useState<'terms' | 'privacy'>('terms');
    const [modalVisible, setModalVisible] = useState(false);

    const submit = async () => {
        if (!accepted) return;
        await acceptCurrentConsent();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
                <Text style={[styles.title, { color: colors.onSurface }]}>One more step</Text>
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                    Read and accept the Terms and Privacy Policy to use your account, saved rights and lawyer enquiries.
                </Text>

                <TouchableOpacity
                    style={styles.legalRow}
                    onPress={() => { setModalType('terms'); setModalVisible(true); }}
                >
                    <Text style={[styles.link, { color: colors.primary }]}>Terms of Service ({APP_CONFIG.TERMS_VERSION})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.legalRow}
                    onPress={() => { setModalType('privacy'); setModalVisible(true); }}
                >
                    <Text style={[styles.link, { color: colors.primary }]}>Privacy Policy ({APP_CONFIG.PRIVACY_POLICY_VERSION})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setAccepted((value) => !value)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: accepted }}
                >
                    <Ionicons
                        name={accepted ? 'checkbox' : 'square-outline'}
                        size={28}
                        color={accepted ? colors.primary : colors.onSurfaceVariant}
                    />
                    <Text style={[styles.checkboxText, { color: colors.onSurface }]}>
                        I have read and agree to the current Terms of Service and Privacy Policy.
                    </Text>
                </TouchableOpacity>

                {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

                <Button
                    title="Accept and Continue"
                    onPress={submit}
                    disabled={!accepted || isLoading}
                    loading={isLoading}
                    fullWidth
                />
            </ScrollView>

            <TermsModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                type={modalType}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    title: { fontFamily: theme.typography.fontFamily.display, fontSize: 30, marginTop: 24, marginBottom: 12 },
    subtitle: { fontFamily: theme.typography.fontFamily.body, fontSize: 16, lineHeight: 24, marginBottom: 24 },
    legalRow: { paddingVertical: 10 },
    link: { fontFamily: theme.typography.fontFamily.headlineMedium, fontSize: 15, textDecorationLine: 'underline' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 28 },
    checkboxText: { fontFamily: theme.typography.fontFamily.body, flex: 1, fontSize: 15, lineHeight: 22 },
    error: { marginBottom: 16, fontSize: 14 },
});
