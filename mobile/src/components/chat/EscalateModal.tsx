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
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
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
    { label: 'Can wait', value: 'low', color: '#1F7A4D' },
    { label: 'This week', value: 'medium', color: '#B7791F' },
    { label: 'Within a day', value: 'high', color: '#D7332B' },
    { label: 'Right now', value: 'critical', color: '#9B1C16' },
];

export const EscalateModal: React.FC<EscalateModalProps> = ({ visible, onClose, conversationId }) => {
    const { colors } = useTheme();
    const [reason, setReason] = useState('');
    const [urgency, setUrgency] = useState<Urgency>('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            Alert.alert('Tell us what happened', 'Add a few lines about why you need a lawyer.');
            return;
        }
        if (!conversationId) {
            Alert.alert('Ask a question first', 'Send at least one message so the lawyer has something to read.');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsSubmitting(true);

        try {
            const response = await chatService.escalateConversation(conversationId, reason.trim(), urgency);
            Alert.alert(
                'Request sent',
                `Your reference number is ${response.reference_number}. Keep it. If a legal-aid provider accepts, they will follow their own process to reach you.`,
                [{ text: 'OK', onPress: onClose }]
            );
            setReason('');
            setUrgency('medium');
        } catch (error) {
            console.error('Escalation failed:', error);
            Alert.alert('Request not sent', 'We could not send it. Check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                    <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                <View style={[styles.modal, { backgroundColor: colors.card }]}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: colors.onSurface }]}>Talk to a lawyer</Text>
                        <TouchableOpacity onPress={onClose} accessibilityLabel="Close" style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.onSurfaceVariant} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                        We pass your request to a legal-aid provider. Whether and how fast they reply depends on the provider.
                    </Text>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.onSurface }]}>What happened?</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: colors.surface, color: colors.onSurface, borderColor: colors.line }]}
                            placeholder="Say it in a few lines. Leave out ID numbers."
                            placeholderTextColor={colors.onSurfaceVariant}
                            value={reason}
                            onChangeText={setReason}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.onSurface }]}>How soon do you need help?</Text>
                        <View style={styles.urgencyGrid}>
                            {urgencyOptions.map((opt) => {
                                const active = urgency === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={opt.value}
                                        accessibilityRole="radio"
                                        accessibilityState={{ selected: active }}
                                        style={[
                                            styles.urgencyBtn,
                                            { borderColor: colors.line },
                                            active && { backgroundColor: opt.color + '1A', borderColor: opt.color },
                                        ]}
                                        onPress={() => setUrgency(opt.value)}
                                    >
                                        <Text style={[styles.urgencyText, { color: active ? opt.color : colors.onSurfaceVariant }]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <Button title="Send request" onPress={handleSubmit} loading={isSubmitting} fullWidth />
                </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18,24,56,0.55)' },
    keyboardView: { width: '100%', maxHeight: '100%' },
    modalScroll: { flexGrow: 1, justifyContent: 'flex-end' },
    modal: { width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 28 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    closeBtn: { padding: 6, marginRight: -6 },
    title: { ...theme.typography.titleLg },
    subtitle: { ...theme.typography.bodyMd, marginTop: 4, marginBottom: 18 },
    formGroup: { marginBottom: 18 },
    label: { ...theme.typography.titleMd, marginBottom: 8 },
    textArea: { minHeight: 110, borderWidth: 1, borderRadius: 12, padding: 14, ...theme.typography.bodyMd },
    urgencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    urgencyBtn: { flexGrow: 1, flexBasis: '45%', minHeight: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    urgencyText: { ...theme.typography.labelMd },
});
