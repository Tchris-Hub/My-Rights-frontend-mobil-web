import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { legalService } from '../../services/legalService';
import { useTheme } from '../../contexts/ThemeContext';
import theme from '../../constants/theme';

type Enquiry = {
  id: string;
  reference_number: string;
  message: string;
  practice_area?: string | null;
  status: string;
  response_message?: string | null;
  created_at: string;
  professional?: { display_name: string; role: string } | null;
  firm?: { name: string } | null;
};

export const LegalEnquiriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [tab, setTab] = useState<'sent' | 'received'>('sent');
  const [sent, setSent] = useState<Enquiry[]>([]);
  const [received, setReceived] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      const [sentData, receivedData] = await Promise.all([
        legalService.getMyEnquiries(),
        legalService.getReceivedEnquiries(),
      ]);
      setSent(sentData as Enquiry[]);
      setReceived(receivedData as Enquiry[]);
    } catch (error) {
      Alert.alert('Unable to load enquiries', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const update = async (id: string, status: 'accepted' | 'declined' | 'closed', response_message?: string) => {
    try {
      await legalService.updateEnquiry(id, { status, ...(response_message?.trim() ? { response_message: response_message.trim() } : {}) });
      await load(true);
    } catch (error) {
      Alert.alert('Unable to update enquiry', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const items = tab === 'sent' ? sent : received;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.back, { backgroundColor: colors.surfaceContainer }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.onSurface }]}>Legal enquiries</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Your sent requests and professional inbox</Text>
        </View>
      </View>

      <View style={[styles.tabs, { backgroundColor: colors.surfaceContainer }]}>
        {(['sent', 'received'] as const).map((value) => (
          <TouchableOpacity
            key={value}
            style={[styles.tab, tab === value && { backgroundColor: colors.primary }]}
            onPress={() => setTab(value)}
          >
            <Text style={[styles.tabText, { color: tab === value ? colors.onPrimary : colors.onSurfaceVariant }]}>
              {value === 'sent' ? 'Sent' : 'Received'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        >
          {items.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.onSurfaceVariant} />
              <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>
                {tab === 'sent' ? 'No enquiries sent yet.' : 'No enquiries received.'}
              </Text>
            </View>
          ) : items.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.surfaceContainer }]}>
              <View style={styles.row}>
                <View style={styles.target}>
                  <Text style={[styles.targetName, { color: colors.onSurface }]}>
                    {tab === 'sent' ? (item.professional?.display_name || item.firm?.name || 'Recipient') : (item.professional?.display_name || item.firm?.name || 'Client enquiry')}
                  </Text>
                  <Text style={[styles.reference, { color: colors.onSurfaceVariant }]}>{item.reference_number}</Text>
                </View>
                <View style={[styles.status, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.statusText, { color: colors.primary }]}>{item.status}</Text>
                </View>
              </View>

              {item.practice_area ? <Text style={[styles.practice, { color: colors.primary }]}>{item.practice_area}</Text> : null}
              <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>{item.message}</Text>

              {item.response_message ? (
                <View style={[styles.response, { borderLeftColor: colors.primary, backgroundColor: colors.surfaceContainerHighest }]}>
                  <Text style={[styles.responseLabel, { color: colors.onSurface }]}>Response</Text>
                  <Text style={[styles.responseText, { color: colors.onSurfaceVariant }]}>{item.response_message}</Text>
                </View>
              ) : null}

              {tab === 'received' && (item.status === 'accepted' || item.status === 'declined') ? (
                <View style={styles.responseComposer}>
                  <TextInput
                    value={responseDrafts[item.id] || ''}
                    onChangeText={(value) => setResponseDrafts((current) => ({ ...current, [item.id]: value }))}
                    placeholder="Optional response to the client"
                    placeholderTextColor={colors.onSurfaceVariant}
                    multiline
                    maxLength={3000}
                    style={[styles.responseInput, { color: colors.onSurface, backgroundColor: colors.surfaceContainerHighest, borderColor: colors.outlineVariant }]}
                  />
                  <TouchableOpacity
                    style={[styles.action, { backgroundColor: colors.primary }]}
                    onPress={() => update(item.id, item.status as 'accepted' | 'declined', responseDrafts[item.id])}
                  >
                    <Text style={[styles.actionText, { color: colors.onPrimary }]}>Send response</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {tab === 'received' && item.status === 'pending' ? (
                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.action, { backgroundColor: colors.primary }]} onPress={() => update(item.id, 'accepted')}>
                    <Text style={[styles.actionText, { color: colors.onPrimary }]}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.action, { backgroundColor: colors.surfaceContainerHighest }]} onPress={() => update(item.id, 'declined')}>
                    <Text style={[styles.actionText, { color: colors.onSurface }]}>Decline</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {tab === 'received' && (item.status === 'accepted' || item.status === 'declined') ? (
                <TouchableOpacity style={[styles.action, { backgroundColor: colors.surfaceContainerHighest }]} onPress={() => update(item.id, 'closed')}>
                  <Text style={[styles.actionText, { color: colors.onSurface }]}>Close enquiry</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </ScrollView>
        </KeyboardAvoidingView>
      )}
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
  tabs: { flexDirection: 'row', marginHorizontal: 24, padding: 4, borderRadius: 16 },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 13 },
  tabText: { ...theme.typography.labelLg, fontWeight: '800' },
  content: { padding: 24, gap: 14, paddingBottom: 50 },
  card: { borderRadius: 20, padding: 18, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  target: { flex: 1 },
  targetName: { ...theme.typography.titleMd, fontWeight: '800' },
  reference: { ...theme.typography.caption, marginTop: 3 },
  status: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  statusText: { ...theme.typography.caption, fontWeight: '800', textTransform: 'capitalize' },
  practice: { ...theme.typography.labelSm, fontWeight: '800', textTransform: 'uppercase' },
  message: { ...theme.typography.bodyMd, lineHeight: 21 },
  response: { borderLeftWidth: 3, padding: 12, borderRadius: 8 },
  responseLabel: { ...theme.typography.labelSm, fontWeight: '800', marginBottom: 4 },
  responseText: { ...theme.typography.bodyMd, lineHeight: 19 },
  responseComposer: { gap: 8 },
  responseInput: { minHeight: 90, borderWidth: 1, borderRadius: 14, padding: 12, ...theme.typography.bodyMd, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1, minHeight: 44, paddingHorizontal: 16, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  actionText: { ...theme.typography.labelLg, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  empty: { ...theme.typography.bodyMd, textAlign: 'center' },
});
