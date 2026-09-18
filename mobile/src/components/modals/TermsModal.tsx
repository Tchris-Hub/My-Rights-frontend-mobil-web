/**
 * Terms and Conditions Modal
 * Premium, scrollable modal for legal documents
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import theme from '../../constants/theme';
import { APP_CONFIG } from '../../constants/config';
import { useTheme } from '../../contexts/ThemeContext';

interface TermsModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'terms' | 'privacy';
}

export const TermsModal: React.FC<TermsModalProps> = ({ visible, onClose, type }) => {
    const { colors, isDark } = useTheme();

    const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <BlurView intensity={isDark ? 40 : 80} style={styles.overlay} tint="dark">
                <View style={[styles.modal, { backgroundColor: colors.surfaceContainer }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {type === 'terms' ? (
                            <TermsContent colors={colors} />
                        ) : (
                            <PrivacyContent colors={colors} />
                        )}
                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                        onPress={onClose}
                    >
                        <Text style={[styles.actionText, { color: colors.onPrimary }]}>Understood</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
};

const TermsContent = ({ colors }: any) => (
    <View>
        <Text style={[styles.text, { color: colors.onSurface }]}>
            Welcome to My Rights. By using our platform, you agree to these terms:
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>1. General Information</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            My Rights is an AI-powered legal information service. We provide educational information based on Nigerian law.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>2. No Legal Advice</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            The information provided by the AI is NOT legal advice and does not create an attorney-client relationship. Always consult a licensed lawyer for specific legal issues.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>3. User Conduct</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            Users must not use the service for illegal purposes or to generate fraudulent documents.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>4. Limitation of Liability</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            My Rights is not liable for actions taken based on AI-generated information. The service is informational and does not create an attorney-client relationship.
        </Text>
    </View>
);

const PrivacyContent = ({ colors }: any) => (
    <View>
        <Text style={[styles.text, { color: colors.onSurface }]}>
            {'This notice describes the current data flow and privacy baseline. Effective date: ' + APP_CONFIG.PRIVACY_POLICY_VERSION}
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>1. Data Collection</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            We may collect account information such as your email and name, authenticated chat history, and technical/security metadata needed to operate and protect the service.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>2. Encryption</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            Data is protected in transit and by access controls appropriate to the service. Authenticated chat history is intended to be account-scoped; do not treat the AI service as a confidential attorney-client channel.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>3. Third Parties</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            We do not sell your personal data. Legal queries are routed through OpenRouter to the configured AI provider for processing. The provider chain may process data outside Nigeria. We do not promise zero provider retention or zero logging. Do not include unnecessary personal identifiers in a query.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>4. Data Deletion</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            {'You may request access, correction, or deletion through the published support channel. Automated account deletion is not yet verified in this release, so a request is not an instant-erasure guarantee. Support: ' + APP_CONFIG.SUPPORT_EMAIL}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modal: {
        height: '85%',
        width: '100%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        ...theme.shadows.glass,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        ...theme.typography.titleLg,
    },
    closeBtn: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    sectionTitle: {
        ...theme.typography.titleMd,
        marginTop: 20,
        marginBottom: 8,
    },
    text: {
        ...theme.typography.bodyLg,
        lineHeight: 22,
    },
    actionBtn: {
        paddingVertical: 16,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    actionText: {
        ...theme.typography.bodyLg,
        fontWeight: '800',
    },
});
