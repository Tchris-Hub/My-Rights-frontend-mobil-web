import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import theme from '../../constants/theme';

type Firm = {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  practice_areas?: string[];
  service_areas?: string[];
  languages?: string[];
  fee_band?: string | null;
  verification_status?: string;
  professionals?: Array<{ id: string; display_name: string; role: string; practice_areas: string[] }>;
};

export const FirmDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const firm = route.params.firm as Firm;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.back, { backgroundColor: colors.surfaceContainer }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.onSurface }]}>Firm details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: colors.surfaceContainer }]}>
          <View style={[styles.icon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="business" size={30} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.onSurface }]}>{firm.name}</Text>
          <View style={[styles.verified, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
            <Text style={[styles.verifiedText, { color: colors.primary }]}>Verified firm</Text>
          </View>
        </View>
        {firm.description ? <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>{firm.description}</Text> : null}
        <View style={[styles.infoCard, { backgroundColor: colors.surfaceContainer }]}>
          {firm.location ? <Info icon="location-outline" label="Location" value={firm.location} colors={colors} /> : null}
          {firm.practice_areas?.length ? <Info icon="briefcase-outline" label="Practice areas" value={firm.practice_areas.join(' • ')} colors={colors} /> : null}
          {firm.service_areas?.length ? <Info icon="map-outline" label="Service areas" value={firm.service_areas.join(' • ')} colors={colors} /> : null}
          {firm.languages?.length ? <Info icon="language-outline" label="Languages" value={firm.languages.join(' • ')} colors={colors} /> : null}
          {firm.fee_band ? <Info icon="cash-outline" label="Fee band" value={firm.fee_band} colors={colors} /> : null}
        </View>
        {firm.professionals?.length ? (
          <View>
            <Text style={[styles.section, { color: colors.onSurface }]}>Verified professionals</Text>
            <View style={[styles.infoCard, { backgroundColor: colors.surfaceContainer }]}>
              {firm.professionals.map((professional) => (
                <View key={professional.id} style={styles.member}>
                  <Ionicons name="person-circle-outline" size={26} color={colors.primary} />
                  <View style={styles.memberText}>
                    <Text style={[styles.memberName, { color: colors.onSurface }]}>{professional.display_name}</Text>
                    <Text style={[styles.memberRole, { color: colors.onSurfaceVariant }]}>
                      {professional.role.replaceAll('_', ' ') + (professional.practice_areas?.length ? ' • ' + professional.practice_areas.join(', ') : '')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('ProfessionalEnquiry', {
            firmId: firm.id,
            professionalName: firm.name,
            practiceArea: firm.practice_areas?.[0],
          })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={19} color={colors.onPrimary} />
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Send enquiry to firm</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

function Info({ icon, label, value, colors }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; colors: any }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={19} color={colors.onSurfaceVariant} />
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.onSurface }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, gap: 14 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { ...theme.typography.titleLg, fontWeight: '900' },
  content: { padding: 24, gap: 16, paddingBottom: 50 },
  hero: { alignItems: 'center', padding: 24, borderRadius: 22 },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { ...theme.typography.titleLg, fontWeight: '900', textAlign: 'center' },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginTop: 10 },
  verifiedText: { ...theme.typography.caption, fontWeight: '800' },
  description: { ...theme.typography.bodyMd, lineHeight: 22 },
  infoCard: { borderRadius: 20, padding: 18, gap: 16 },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoText: { flex: 1 },
  infoLabel: { ...theme.typography.caption, fontWeight: '700' },
  infoValue: { ...theme.typography.bodyMd, marginTop: 2 },
  section: { ...theme.typography.titleMd, fontWeight: '900', marginBottom: 10 },
  member: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  memberText: { flex: 1 },
  memberName: { ...theme.typography.bodyMd, fontWeight: '800' },
  memberRole: { ...theme.typography.caption, marginTop: 2, textTransform: 'capitalize' },
  button: { minHeight: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { ...theme.typography.labelLg, fontWeight: '900' },
});
