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
            My Rights is not liable for actions taken based on AI responses. Use the platform for informational enrichment only.
        </Text>
    </View>
);

const PrivacyContent = ({ colors }: any) => (
    <View>
        <Text style={[styles.text, { color: colors.onSurface }]}>
            Your privacy is our priority. Here is how we handle your data:
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>1. Data Collection</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            We collect your email, full name, and chat history (if authenticated) to provide a personalized experience.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>2. Encryption</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            All your data is encrypted at rest and in transit. Your chat history is private and accessible only by you.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>3. Third Parties</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            We do not sell your personal data. We use OpenRouter/NVIDIA for AI processing, and no personal identifiers are sent to them.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>4. Data Deletion</Text>
        <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
            You can request data deletion at any time via the Settings menu.
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
