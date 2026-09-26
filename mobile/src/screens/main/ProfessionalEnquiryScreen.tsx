import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { ToolsStackParamList } from '../../navigation/types';
import { legalService } from '../../services/legalService';
import { useTheme } from '../../contexts/ThemeContext';
import theme from '../../constants/theme';

type Route = RouteProp<ToolsStackParamList, 'ProfessionalEnquiry'>;

export const ProfessionalEnquiryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      Alert.alert('Message required', 'Tell the professional what legal help you are looking for.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await legalService.createEnquiry({
        professional_id: route.params.professionalId,
        message: trimmed,
        practice_area: route.params.practiceArea,
      });
      Alert.alert(
        'Enquiry sent',
        `Your enquiry reference is ${result.reference_number}. The verified professional can now review it.`,
        [{ text: 'Done', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert(
        'Unable to send enquiry',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surfaceContainer }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.onSurface }]}>Contact professional</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              {route.params.professionalName}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.notice, { backgroundColor: colors.surfaceContainer }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
            <Text style={[styles.noticeText, { color: colors.onSurfaceVariant }]}>
              Your message is sent through My Rights to the verified professional. Do not include passwords, payment card details, or unnecessary sensitive information.
            </Text>
          </View>

          {route.params.practiceArea ? (
            <Text style={[styles.practiceArea, { color: colors.primary }]}>
              {route.params.practiceArea}
            </Text>
          ) : null}

          <Text style={[styles.label, { color: colors.onSurface }]}>What do you need help with?</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={5000}
            placeholder="Briefly explain your legal issue and what you need from the professional."
            placeholderTextColor={colors.onSurfaceVariant}
            style={[
              styles.input,
              {
                color: colors.onSurface,
                backgroundColor: colors.surfaceContainer,
                borderColor: colors.outlineVariant,
              },
            ]}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
          <Text style={[styles.counter, { color: colors.onSurfaceVariant }]}>
            {message.length}/5000
          </Text>

          <TouchableOpacity
            style={[styles.submit, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : 1 }]}
            onPress={submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <Ionicons name="send-outline" size={18} color={colors.onPrimary} />
                <Text style={[styles.submitText, { color: colors.onPrimary }]}>Send enquiry</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: {
    ...theme.typography.titleLg,
    fontWeight: '900',
  },
  subtitle: {
    ...theme.typography.bodySm,
    marginTop: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 14,
  },
  notice: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 18,
    gap: 10,
  },
  noticeText: {
    flex: 1,
    ...theme.typography.bodySm,
    lineHeight: 20,
  },
  practiceArea: {
    ...theme.typography.labelSm,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  label: {
    ...theme.typography.titleMd,
    fontWeight: '800',
    marginTop: 4,
  },
  input: {
    minHeight: 190,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    ...theme.typography.bodyMd,
  },
  counter: {
    ...theme.typography.caption,
    textAlign: 'right',
    marginTop: -8,
  },
  submit: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  submitText: {
    ...theme.typography.labelLg,
    fontWeight: '900',
  },
});
