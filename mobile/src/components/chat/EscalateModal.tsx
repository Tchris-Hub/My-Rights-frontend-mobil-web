/**
 * Escalation Modal Component
 * Allows users to request human legal assistance.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { chatService } from '../../services/chat.service';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface EscalateModalProps {
    visible: boolean;
    onClose: () => void;
    conversationId: string | null;
}

type Urgency = 'low' | 'medium' | 'high' | 'critical';

const urgencyOptions: { label: string; value: Urgency; color: string }[] = [
    { label: 'Low', value: 'low', color: '#10B981' },
    { label: 'Medium', value: 'medium', color: '#F59E0B' },
    { label: 'High', value: 'high', color: '#EF4444' },
    { label: 'Critical', value: 'critical', color: '#991B1B' },
];

export const EscalateModal: React.FC<EscalateModalProps> = ({ visible, onClose, conversationId }) => {
    const { colors, isDark } = useTheme();
    const [reason, setReason] = useState('');
    const [urgency, setUrgency] = useState<Urgency>('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            Alert.alert('Missing Information', 'Please describe why you need human assistance.');
            return;
        }
        if (!conversationId) {
            Alert.alert('No Active Conversation', 'Please send at least one message before escalating.');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsSubmitting(true);

        try {
            const response = await chatService.escalateConversation(conversationId, reason.trim(), urgency);
            Alert.alert(
                '✅ Escalation Submitted',
                `Your reference number is: ${response.reference_number}\n\nA legal professional will contact you ${response.estimated_response_time}.`,
                [{ text: 'Okay', onPress: onClose }]
            );
            setReason('');
            setUrgency('medium');
        } catch (error) {
            console.error('Escalation failed:', error);
            Alert.alert('Escalation Failed', 'Could not submit your request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <BlurView intensity={isDark ? 40 : 80} style={styles.overlay} tint="dark">
                <View style={[styles.modal, { backgroundColor: colors.surfaceContainer }]}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Ionicons name="close" size={24} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.error + '20' }]}>
                            <Ionicons name="call" size={32} color={theme.colors.error} />
                        </View>
                        <Text style={[styles.title, { color: colors.onSurface }]}>Talk to a Lawyer</Text>
                        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                            Connect with a licensed legal aid partner for personalized help.
                        </Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.onSurface }]}>Why do you need help?</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: colors.surface, color: colors.onSurface, borderColor: colors.outline }]}
                            placeholder="Describe your situation briefly..."
                            placeholderTextColor={colors.onSurfaceVariant}
                            value={reason}
                            onChangeText={setReason}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.onSurface }]}>Urgency Level</Text>
                        <View style={styles.urgencyGrid}>
                            {urgencyOptions.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                        styles.urgencyBtn,
                                        { borderColor: colors.outline },
                                        urgency === opt.value && { backgroundColor: opt.color + '20', borderColor: opt.color },
                                    ]}
                                    onPress={() => setUrgency(opt.value)}
                                >
                                    <Text style={[styles.urgencyText, urgency === opt.value && { color: opt.color, fontWeight: '800' }]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.colors.error }]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                <Text style={styles.submitText}>Submit Escalation</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modal: {
        width: '100%',
        borderRadius: 32,
        padding: 24,
        ...theme.shadows.glass,
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        ...theme.typography.titleLg,
        marginBottom: 4,
    },
    subtitle: {
        ...theme.typography.bodyMd,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        ...theme.typography.bodyLg,
        fontWeight: '700',
        marginBottom: 8,
    },
    textArea: {
        minHeight: 100,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        ...theme.typography.bodyMd,
    },
    urgencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    urgencyBtn: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    urgencyText: {
        ...theme.typography.bodyMd,
        fontWeight: '600',
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 20,
        gap: 10,
        marginTop: 8,
    },
    submitText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
