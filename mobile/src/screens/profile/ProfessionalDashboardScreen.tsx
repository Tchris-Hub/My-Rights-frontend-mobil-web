import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { legalService } from '../../services/legalService';
import { notificationService } from '../../services/notification.service';
import theme from '../../constants/theme';

export const ProfessionalDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<any>(null);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextProfile, received, unread] = await Promise.all([
        legalService.getOwnProfessionalProfile(),
        legalService.getReceivedEnquiries(),
        notificationService.unreadCount(),
      ]);
      setProfile(nextProfile);
      setEnquiries(received);
      setUnreadNotifications(unread);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (loading) return <View style={[styles.center, { backgroundColor: colors.surface }]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const completeness = [
    profile?.display_name,
    profile?.bio,
    profile?.location,
    profile?.practice_areas?.length,
    profile?.experience?.length,
    profile?.certifications?.length,
    profile?.public_phone || profile?.whatsapp || profile?.public_email,
  ].filter(Boolean).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>PROFESSIONAL WORKSPACE</Text>
            <Text style={[styles.title, { color: colors.onSurface }]}>{user?.name?.split(' ')[0] || 'Professional'}</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Manage your legal-services presence and client enquiries.</Text>
          </View>
          <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.notificationButton, { backgroundColor: colors.surfaceContainer }]} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={21} color={colors.onSurface} />
            {unreadNotifications > 0 && <View style={[styles.badge, { backgroundColor: colors.error }]}><Text style={styles.badgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settings, { backgroundColor: colors.surfaceContainer }]} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={20} color={colors.onSurface} />
          </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.statusCard, { backgroundColor: colors.surfaceContainer }]}>
          <View style={[styles.statusIcon, { backgroundColor: profile?.verification_status === 'verified' ? colors.primary + '15' : colors.warning + '15' }]}>
            <Ionicons name={profile?.verification_status === 'verified' ? 'shield-checkmark' : 'time-outline'} size={25} color={profile?.verification_status === 'verified' ? colors.primary : colors.warning} />
          </View>
          <View style={styles.statusText}>
            <Text style={[styles.statusTitle, { color: colors.onSurface }]}>{profile?.verification_status === 'verified' ? 'Verified marketplace profile' : 'Verification pending'}</Text>
            <Text style={[styles.statusSub, { color: colors.onSurfaceVariant }]}>
              {profile?.verification_status === 'verified' ? 'Clients can discover your verified profile.' : 'Complete your profile and wait for administrator verification.'}
            </Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: colors.surfaceContainerLow }]}><Text style={[styles.statValue, { color: colors.onSurface }]}>{enquiries.filter((item) => item.status === 'pending').length}</Text><Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>New enquiries</Text></View>
          <View style={[styles.stat, { backgroundColor: colors.surfaceContainerLow }]}><Text style={[styles.statValue, { color: colors.onSurface }]}>{completeness}/7</Text><Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Profile sections</Text></View>
        </View>

        <TouchableOpacity style={[styles.primaryAction, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('ProfessionalProfile')}>
          <Ionicons name="create-outline" size={20} color={colors.onPrimary} />
          <Text style={[styles.primaryText, { color: colors.onPrimary }]}>Edit professional profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.secondaryAction, { backgroundColor: colors.surfaceContainer }]} onPress={() => navigation.navigate('LegalEnquiries')}>
          <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
          <Text style={[styles.secondaryText, { color: colors.onSurface }]}>Open client enquiries</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <Text style={[styles.section, { color: colors.onSurface }]}>Your public profile</Text>
        <View style={[styles.profileCard, { backgroundColor: colors.surfaceContainer }]}>
          <Text style={[styles.profileName, { color: colors.onSurface }]}>{profile?.display_name || 'Profile not completed'}</Text>
          <Text style={[styles.headline, { color: colors.primary }]}>{profile?.headline || profile?.role?.replaceAll('_', ' ') || 'Legal professional'}</Text>
          <Text style={[styles.bio, { color: colors.onSurfaceVariant }]} numberOfLines={4}>{profile?.bio || 'Add a professional biography so clients understand your practice.'}</Text>
          {profile?.practice_areas?.length ? <Text style={[styles.meta, { color: colors.onSurfaceVariant }]}>{profile.practice_areas.join(' • ')}</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 50, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 10 },
  eyebrow: { ...theme.typography.labelSm, fontWeight: '900', letterSpacing: 1.8 },
  title: { ...theme.typography.displayMd, fontSize: 38, fontWeight: '900', marginTop: 4 },
  subtitle: { ...theme.typography.bodyMd, lineHeight: 20, marginTop: 4, maxWidth: 300 },
  headerActions: { flexDirection: 'row', gap: 8 },
  notificationButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', right: -2, top: -3, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  settings: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statusCard: { flexDirection: 'row', padding: 18, borderRadius: 20, gap: 12 },
  statusIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  statusText: { flex: 1 },
  statusTitle: { ...theme.typography.titleMd, fontWeight: '900' },
  statusSub: { ...theme.typography.caption, lineHeight: 18, marginTop: 3 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, borderRadius: 18, padding: 18 },
  statValue: { ...theme.typography.displayMd, fontSize: 28, fontWeight: '900' },
  statLabel: { ...theme.typography.caption, marginTop: 3 },
  primaryAction: { minHeight: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { ...theme.typography.labelLg, fontWeight: '900' },
  secondaryAction: { minHeight: 52, borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  secondaryText: { flex: 1, ...theme.typography.labelLg, fontWeight: '800' },
  section: { ...theme.typography.titleMd, fontWeight: '900', marginTop: 14 },
  profileCard: { padding: 20, borderRadius: 22 },
  profileName: { ...theme.typography.titleLg, fontWeight: '900' },
  headline: { ...theme.typography.labelLg, fontWeight: '800', marginTop: 4 },
  bio: { ...theme.typography.bodyMd, lineHeight: 20, marginTop: 10 },
  meta: { ...theme.typography.caption, lineHeight: 18, marginTop: 10 },
});
