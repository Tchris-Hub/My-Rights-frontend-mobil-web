import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TermsModal } from '../../components/modals/TermsModal';
import { Button } from '../../components/ui/Button';
import { APP_CONFIG } from '../../constants/config';

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
                <Ionicons name="shield-checkmark" size={56} color={colors.primary} />
                <Text style={[styles.title, { color: colors.onSurface }]}>One more step</Text>
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                    Please review and accept the current Terms of Service and Privacy Policy before using private My Rights features.
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
                    testID="consent-checkbox"
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

                {error ? <Text testID="consent-error" style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

                <Button
                    testID="consent-accept"
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
    title: { fontSize: 30, fontWeight: '800', marginTop: 24, marginBottom: 12 },
    subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 24 },
    legalRow: { paddingVertical: 10 },
    link: { fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 28 },
    checkboxText: { flex: 1, fontSize: 15, lineHeight: 22 },
    error: { marginBottom: 16, fontSize: 14 },
});
