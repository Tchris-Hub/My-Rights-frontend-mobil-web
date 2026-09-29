import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { legalService } from '../../services/legalService';
import theme from '../../constants/theme';

const roles = [
  { value: 'practising_lawyer', label: 'Practising lawyer' },
  { value: 'law_student', label: 'Law student' },
  { value: 'legal_researcher', label: 'Legal researcher' },
  { value: 'legal_support', label: 'Legal support' },
];

const splitLines = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);

export const PractitionerOnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, setAccountType } = useAuth();
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState('practising_lawyer');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [practiceAreas, setPracticeAreas] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');
  const [languages, setLanguages] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [certifications, setCertifications] = useState('');
  const [skills, setSkills] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [nbaBranch, setNbaBranch] = useState('');
  const [yearOfCall, setYearOfCall] = useState('');
  const [scn, setScn] = useState('');
  const [barAssociation, setBarAssociation] = useState('Nigerian Bar Association');
  const [jurisdiction, setJurisdiction] = useState('Nigeria');
  const [publicPhone, setPublicPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [publicEmail, setPublicEmail] = useState(user?.email || '');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [availability, setAvailability] = useState('');
  const [feeBand, setFeeBand] = useState('');

  const field = (label: string, value: string, setter: (value: string) => void, placeholder: string, multiline = false) => (
    <View>
      <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant + '99'}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, { color: colors.onSurface, backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}
      />
    </View>
  );

  const save = async () => {
    if (!displayName.trim()) return;
    try {
      setSaving(true);
      await legalService.updateOwnProfessionalProfile({
        role,
        display_name: displayName,
        headline,
        bio,
        location,
        practice_areas: splitLines(practiceAreas.replace(/,/g, '\n')),
        service_areas: splitLines(serviceAreas.replace(/,/g, '\n')),
        languages: splitLines(languages.replace(/,/g, '\n')),
        years_experience: Number(yearsExperience) || 0,
        education: splitLines(education),
        experience: splitLines(experience),
        certifications: splitLines(certifications),
        skills: splitLines(skills.replace(/,/g, '\n')),
        organization_name: organizationName,
        nba_branch: nbaBranch,
        year_of_call: Number(yearOfCall) || undefined,
        bar_admission_number: scn,
        bar_association: barAssociation,
        jurisdiction,
        public_phone: publicPhone,
        whatsapp,
        public_email: publicEmail,
        instagram,
        linkedin,
        website,
        availability,
        fee_band: feeBand,
      });
      await setAccountType('legal_professional');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.back, { backgroundColor: colors.surfaceContainer }]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.onSurface }]}>Professional profile</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Build your My Rights legal profile</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <View style={[styles.notice, { backgroundColor: colors.primary + '10' }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
            <Text style={[styles.noticeText, { color: colors.onSurfaceVariant }]}>
              Complete the profile as you would a professional directory profile. My Rights administrators verify practising credentials separately before clients see a verified badge.
            </Text>
          </View>

          <Text style={[styles.section, { color: colors.onSurface }]}>Professional identity</Text>
          <Text style={[styles.label, { color: colors.onSurface }]}>Professional role</Text>
          <View style={styles.chips}>
            {roles.map((item) => (
              <TouchableOpacity key={item.value} onPress={() => setRole(item.value)} style={[styles.chip, { backgroundColor: role === item.value ? colors.primary : colors.surfaceContainerHighest }]}>
                <Text style={[styles.chipText, { color: role === item.value ? colors.onPrimary : colors.onSurfaceVariant }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {field('Professional name', displayName, setDisplayName, 'Name clients should see')}
          {field('Headline', headline, setHeadline, 'e.g. Family and commercial lawyer')}
          {field('About', bio, setBio, 'Short professional biography', true)}
          {field('Location', location, setLocation, 'City / State / Country')}
          {field('Practice areas', practiceAreas, setPracticeAreas, 'One per line or comma-separated')}
          {field('Service areas', serviceAreas, setServiceAreas, 'Cities, states or regions')}
          {field('Languages', languages, setLanguages, 'English, Igbo, Hausa...')}
          {field('Years of experience', yearsExperience, setYearsExperience, 'e.g. 8')}

          <Text style={[styles.section, { color: colors.onSurface }]}>Professional background</Text>
          {field('Education', education, setEducation, 'One qualification per line', true)}
          {field('Experience', experience, setExperience, 'Role — organisation — years, one per line', true)}
          {field('Certifications / licences', certifications, setCertifications, 'One credential per line', true)}
          {field('Skills', skills, setSkills, 'Contract law, litigation, mediation...')}
          {field('Current firm / organisation', organizationName, setOrganizationName, 'Optional')}

          <Text style={[styles.section, { color: colors.onSurface }]}>Nigerian Bar details</Text>
          {field('Supreme Court Number (SCN)', scn, setScn, 'Enter your SCN if applicable')}
          {field('Year of Call', yearOfCall, setYearOfCall, 'e.g. 2018')}
          {field('NBA Branch', nbaBranch, setNbaBranch, 'e.g. Abuja Branch')}
          {field('Bar association', barAssociation, setBarAssociation, 'Nigerian Bar Association')}
          {field('Jurisdiction', jurisdiction, setJurisdiction, 'Nigeria')}

          <Text style={[styles.section, { color: colors.onSurface }]}>Client-facing contact information</Text>
          <Text style={[styles.helper, { color: colors.onSurfaceVariant }]}>Only provide channels you are comfortable publishing to clients.</Text>
          {field('Public phone', publicPhone, setPublicPhone, '+234...')}
          {field('WhatsApp', whatsapp, setWhatsapp, '+234...')}
          {field('Public email', publicEmail, setPublicEmail, 'professional@example.com')}
          {field('Instagram', instagram, setInstagram, '@handle or profile URL')}
          {field('LinkedIn', linkedin, setLinkedin, 'Profile URL')}
          {field('Website', website, setWebsite, 'https://...')}
          {field('Availability', availability, setAvailability, 'e.g. Mon–Fri, 9am–5pm')}
          {field('Fee band', feeBand, setFeeBand, 'Optional factual fee range')}

          <TouchableOpacity disabled={saving || !displayName.trim()} onPress={() => void save()} style={[styles.save, { backgroundColor: colors.primary, opacity: saving || !displayName.trim() ? 0.55 : 1 }]}>
            {saving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={[styles.saveText, { color: colors.onPrimary }]}>Create professional profile</Text>}
          </TouchableOpacity>

          <Text style={[styles.footer, { color: colors.onSurfaceVariant }]}>
            Your profile starts as unverified. Verification status is controlled by My Rights administrators and changes to verified profiles trigger re-review.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, gap: 14 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { ...theme.typography.titleLg, fontWeight: '900' },
  subtitle: { ...theme.typography.bodyMd, marginTop: 3 },
  content: { padding: 24, gap: 12, paddingBottom: 70 },
  notice: { flexDirection: 'row', padding: 16, borderRadius: 18, gap: 10, marginBottom: 8 },
  noticeText: { flex: 1, ...theme.typography.bodyMd, lineHeight: 20 },
  section: { ...theme.typography.titleLg, fontWeight: '900', marginTop: 18, marginBottom: 2 },
  helper: { ...theme.typography.caption, lineHeight: 18, marginBottom: 2 },
  label: { ...theme.typography.labelLg, fontWeight: '800', marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 13 },
  chipText: { ...theme.typography.caption, fontWeight: '800' },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 12, ...theme.typography.bodyMd },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  save: { minHeight: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  saveText: { ...theme.typography.labelLg, fontWeight: '900' },
  footer: { ...theme.typography.caption, lineHeight: 18, textAlign: 'center', marginTop: 8 },
});
