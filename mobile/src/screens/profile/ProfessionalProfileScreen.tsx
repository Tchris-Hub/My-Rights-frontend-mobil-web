import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { legalService } from '../../services/legalService';
import { useTheme } from '../../contexts/ThemeContext';
import theme from '../../constants/theme';

const roles = ['practising_lawyer', 'law_student', 'legal_researcher', 'legal_support'];

export const ProfessionalProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState('practising_lawyer');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [practiceAreas, setPracticeAreas] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');
  const [languages, setLanguages] = useState('');
  const [availability, setAvailability] = useState('');
  const [feeBand, setFeeBand] = useState('');
  const [publicPhone, setPublicPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [publicEmail, setPublicEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [headline, setHeadline] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [scn, setScn] = useState('');
  const [barAssociation, setBarAssociation] = useState('Nigerian Bar Association');
  const [nbaBranch, setNbaBranch] = useState('');
  const [yearOfCall, setYearOfCall] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Nigeria');
  const [organizationName, setOrganizationName] = useState('');
  const [verification, setVerification] = useState('unverified');

  useEffect(() => {
    legalService.getOwnProfessionalProfile()
      .then((profile) => {
        if (!profile) return;
        setRole(profile.role || 'practising_lawyer');
        setDisplayName(profile.display_name || '');
        setBio(profile.bio || '');
        setLocation(profile.location || '');
        setPracticeAreas(Array.isArray(profile.practice_areas) ? profile.practice_areas.join(', ') : '');
        setServiceAreas(Array.isArray(profile.service_areas) ? profile.service_areas.join(', ') : '');
        setLanguages(Array.isArray(profile.languages) ? profile.languages.join(', ') : '');
        setAvailability(profile.availability || '');
        setFeeBand(profile.fee_band || '');
        setPublicPhone(profile.public_phone || '');
        setWhatsapp(profile.whatsapp || '');
        setPublicEmail(profile.public_email || '');
        setInstagram(profile.instagram || '');
        setLinkedin(profile.linkedin || '');
        setWebsite(profile.website || '');
        setHeadline(profile.headline || '');
        setYearsExperience(profile.years_experience != null ? String(profile.years_experience) : '');
        setScn(profile.bar_admission_number || '');
        setBarAssociation(profile.bar_association || 'Nigerian Bar Association');
        setNbaBranch(profile.nba_branch || '');
        setYearOfCall(profile.year_of_call != null ? String(profile.year_of_call) : '');
        setJurisdiction(profile.jurisdiction || 'Nigeria');
        setOrganizationName(profile.organization_name || '');
        setVerification(profile.verification_status || 'unverified');
      })
      .catch((error) => Alert.alert('Unable to load profile', error instanceof Error ? error.message : 'Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!displayName.trim()) {
      Alert.alert('Name required', 'Enter the professional name that should appear in the directory.');
      return;
    }
    try {
      setSaving(true);
      const result = await legalService.updateOwnProfessionalProfile({
        role,
        display_name: displayName,
        bio,
        location,
        practice_areas: practiceAreas.split(',').map((x) => x.trim()).filter(Boolean),
        service_areas: serviceAreas.split(',').map((x) => x.trim()).filter(Boolean),
        languages: languages.split(',').map((x) => x.trim()).filter(Boolean),
        availability,
        fee_band: feeBand,
        public_phone: publicPhone,
        whatsapp,
        public_email: publicEmail,
        instagram,
        linkedin,
        website,
        headline,
        years_experience: Number(yearsExperience) || 0,
        bar_admission_number: scn,
        bar_association: barAssociation,
        nba_branch: nbaBranch,
        year_of_call: Number(yearOfCall) || undefined,
        jurisdiction,
        organization_name: organizationName,
      });
      setVerification(result.verification_status || 'unverified');
      Alert.alert('Profile saved', 'Material profile changes require verification again before the profile is presented as verified.');
    } catch (error) {
      Alert.alert('Unable to save profile', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.surface }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.back, { backgroundColor: colors.surfaceContainer }]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.onSurface }]}>Professional profile</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Directory information and verification</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <View style={[styles.notice, { backgroundColor: colors.surfaceContainer }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
            <Text style={[styles.noticeText, { color: colors.onSurfaceVariant }]}>
              Verification is controlled by My Rights administrators. A law student or legal support profile is not presented as a practising lawyer.
            </Text>
          </View>

          <Text style={[styles.label, { color: colors.onSurface }]}>Professional role</Text>
          <View style={styles.roleRow}>
            {roles.map((value) => (
              <TouchableOpacity key={value} style={[styles.role, { backgroundColor: role === value ? colors.primary : colors.surfaceContainerHighest }]} onPress={() => setRole(value)}>
                <Text style={[styles.roleText, { color: role === value ? colors.onPrimary : colors.onSurfaceVariant }]}>
                  {value.replaceAll('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {[
            ['Display name', displayName, setDisplayName, 'e.g. Ada Okafor'],
            ['Location', location, setLocation, 'City / state'],
            ['Practice areas', practiceAreas, setPracticeAreas, 'Family Law, Property Law'],
            ['Service areas', serviceAreas, setServiceAreas, 'Abuja, Lagos'],
            ['Languages', languages, setLanguages, 'English, Igbo'],
            ['Availability', availability, setAvailability, 'Weekdays, 9am–5pm'],
            ['Fee band', feeBand, setFeeBand, 'Optional factual fee range'],
          ].map(([label, value, setter, placeholder]) => (
            <View key={label as string}>
              <Text style={[styles.label, { color: colors.onSurface }]}>{label as string}</Text>
              <TextInput
                value={value as string}
                onChangeText={setter as (value: string) => void}
                placeholder={placeholder as string}
                placeholderTextColor={colors.onSurfaceVariant}
                style={[styles.input, { color: colors.onSurface, backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}
              />
            </View>
          ))}

          <Text style={[styles.label, { color: colors.onSurface }]}>Headline</Text>
          <TextInput value={headline} onChangeText={setHeadline} placeholder="e.g. Family and commercial lawyer" placeholderTextColor={colors.onSurfaceVariant} style={[styles.input, { color: colors.onSurface, backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]} />

          <Text style={[styles.label, { color: colors.onSurface }]}>Years of experience</Text>
          <TextInput value={yearsExperience} onChangeText={setYearsExperience} keyboardType="number-pad" placeholder="e.g. 8" placeholderTextColor={colors.onSurfaceVariant} style={[styles.input, { color: colors.onSurface, backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]} />

          <Text style={[styles.label, { color: colors.onSurface }]}>Nigerian Bar details</Text>
          {[
            ['Supreme Court Number', scn, setScn, 'SCN'],
            ['Year of Call', yearOfCall, setYearOfCall, 'e.g. 2018'],
            ['NBA Branch', nbaBranch, setNbaBranch, 'e.g. Abuja Branch'],
            ['Bar Association', barAssociation, setBarAssociation, 'Nigerian Bar Association'],
            ['Jurisdiction', jurisdiction, setJurisdiction, 'Nigeria'],
            ['Current firm / organisation', organizationName, setOrganizationName, 'Optional'],
          ].map(([label, value, setter, placeholder]) => (
            <View key={label as string}><Text style={[styles.label, { color: colors.onSurface }]}>{label as string}</Text><TextInput value={value as string} onChangeText={setter as any} placeholder={placeholder as string} placeholderTextColor={colors.onSurfaceVariant} style={[styles.input, { color: colors.onSurface, backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]} /></View>
          ))}

          <Text style={[styles.label, { color: colors.onSurface }]}>Client-facing contact</Text>
          {[
            ['Public phone', publicPhone, setPublicPhone, '+234...'],
            ['WhatsApp', whatsapp, setWhatsapp, '+234...'],
            ['Public email', publicEmail, setPublicEmail, 'professional@example.com'],
            ['Instagram', instagram, setInstagram, '@handle or URL'],
            ['LinkedIn', linkedin, setLinkedin, 'Profile URL'],
            ['Website', website, setWebsite, 'https://...'],
          ].map(([label, value, setter, placeholder]) => (
            <View key={label as string}><Text style={[styles.label, { color: colors.onSurface }]}>{label as string}</Text><TextInput value={value as string} onChangeText={setter as any} placeholder={placeholder as string} placeholderTextColor={colors.onSurfaceVariant} style={[styles.input, { color: colors.onSurface, backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]} /></View>
          ))}

          <Text style={[styles.label, { color: colors.onSurface }]}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={3000}
            placeholder="Factual professional biography"
            placeholderTextColor={colors.onSurfaceVariant}
            style={[styles.input, styles.bio, { color: colors.onSurface, backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}
          />

          <Text style={[styles.verification, { color: colors.onSurfaceVariant }]}>Verification status: <Text style={{ color: colors.primary, fontWeight: '800' }}>{verification}</Text></Text>

          <TouchableOpacity style={[styles.save, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]} disabled={saving} onPress={save}>
            {saving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={[styles.saveText, { color: colors.onPrimary }]}>Save professional profile</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, gap: 14 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { ...theme.typography.titleLg, fontWeight: '900' },
  subtitle: { ...theme.typography.bodyMd, marginTop: 3 },
  content: { padding: 24, gap: 12, paddingBottom: 60 },
  notice: { flexDirection: 'row', padding: 16, borderRadius: 18, gap: 10, marginBottom: 6 },
  noticeText: { flex: 1, ...theme.typography.bodyMd, lineHeight: 20 },
  label: { ...theme.typography.labelLg, fontWeight: '800', marginTop: 6 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  role: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 13 },
  roleText: { ...theme.typography.caption, fontWeight: '800', textTransform: 'capitalize' },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 12, ...theme.typography.bodyMd },
  bio: { minHeight: 130, textAlignVertical: 'top' },
  verification: { ...theme.typography.bodyMd, marginTop: 4 },
  save: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveText: { ...theme.typography.labelLg, fontWeight: '900' },
});
