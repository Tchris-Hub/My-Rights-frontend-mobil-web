import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import theme from '../../constants/theme';

export const AccountTypeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { setAccountType } = useAuth();

  const choose = async (type: 'client' | 'legal_professional') => {
    if (type === 'legal_professional') {
      navigation.navigate('PractitionerOnboarding');
      return;
    }
    await setAccountType(type);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.icon, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="people-outline" size={34} color={colors.primary} />
        </View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>ACCOUNT SETUP</Text>
        <Text style={[styles.title, { color: colors.onSurface }]}>How will you use My Rights?</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Your choice determines the workspace and profile tools you see. You can change this later through account support.
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          testID="account-type-client"
          style={[styles.option, { backgroundColor: colors.surfaceContainer }]}
          onPress={() => void choose('client')}
        >
          <View style={[styles.optionIcon, { backgroundColor: colors.primary + '12' }]}>
            <Ionicons name="person-outline" size={26} color={colors.primary} />
          </View>
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: colors.onSurface }]}>I need legal help</Text>
            <Text style={[styles.optionSub, { color: colors.onSurfaceVariant }]}>
              Browse rights, review documents, find legal professionals and send enquiries.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          testID="account-type-professional"
          style={[styles.option, { backgroundColor: colors.surfaceContainer }]}
          onPress={() => void choose('legal_professional')}
        >
          <View style={[styles.optionIcon, { backgroundColor: colors.secondary + '12' }]}>
            <Ionicons name="briefcase-outline" size={26} color={colors.secondary} />
          </View>
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: colors.onSurface }]}>I'm a legal professional</Text>
            <Text style={[styles.optionSub, { color: colors.onSurfaceVariant }]}>
              Build a professional profile, receive client enquiries and manage your legal-services presence.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <Text style={[styles.note, { color: colors.onSurfaceVariant }]}>
          Professional profiles are reviewed separately. Completing this form does not by itself make a practitioner verified.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 },
  icon: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  eyebrow: { ...theme.typography.labelSm, fontWeight: '900', letterSpacing: 2 },
  title: { ...theme.typography.displayMd, fontSize: 34, lineHeight: 40, fontWeight: '900' },
  subtitle: { ...theme.typography.bodyLg, lineHeight: 24, marginBottom: 12 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 22, gap: 14 },
  optionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1 },
  optionTitle: { ...theme.typography.titleMd, fontWeight: '900' },
  optionSub: { ...theme.typography.bodyMd, lineHeight: 20, marginTop: 5 },
  note: { ...theme.typography.caption, lineHeight: 18, marginTop: 8 },
});
