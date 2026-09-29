import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationService, AppNotification } from '../../services/notification.service';
import theme from '../../constants/theme';

export const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await notificationService.list()); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const open = async (item: AppNotification) => {
    if (!item.read_at) {
      await notificationService.markRead(item.id);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry));
    }
    if (item.type === 'legal_enquiry' || item.type === 'legal_enquiry_update') navigation.navigate('LegalEnquiries');
  };

  return <View style={[styles.container, { backgroundColor: colors.surface }]}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.back, { backgroundColor: colors.surfaceContainer }]}><Ionicons name="chevron-back" size={24} color={colors.onSurface} /></TouchableOpacity>
      <Text style={[styles.title, { color: colors.onSurface }]}>Notifications</Text>
      <TouchableOpacity onPress={() => notificationService.markAllRead().then(load)}><Text style={[styles.readAll, { color: colors.primary }]}>Read all</Text></TouchableOpacity>
    </View>
    {loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View> : <ScrollView contentContainerStyle={styles.content}>
      {items.length === 0 ? <View style={styles.empty}><Ionicons name="notifications-off-outline" size={42} color={colors.onSurfaceVariant} /><Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No notifications</Text><Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>New enquiries and account updates will appear here.</Text></View> : items.map((item) => <TouchableOpacity key={item.id} onPress={() => void open(item)} style={[styles.card, { backgroundColor: item.read_at ? colors.surfaceContainerLow : colors.primary + '10' }]}>
        <View style={[styles.icon, { backgroundColor: colors.surface }]}><Ionicons name={item.type === 'legal_enquiry' ? 'chatbubbles-outline' : 'notifications-outline'} size={21} color={colors.primary} /></View>
        <View style={styles.text}><Text style={[styles.cardTitle, { color: colors.onSurface }]}>{item.title}</Text><Text style={[styles.body, { color: colors.onSurfaceVariant }]}>{item.body}</Text><Text style={[styles.date, { color: colors.onSurfaceVariant }]}>{new Date(item.created_at).toLocaleString()}</Text></View>
        {!item.read_at && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>)}
    </ScrollView>}
  </View>;
};

const styles = StyleSheet.create({
  container: { flex: 1 }, header: { padding: 20, paddingTop: 28, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, title: { flex: 1, ...theme.typography.titleLg, fontWeight: '900' }, readAll: { ...theme.typography.labelSm, fontWeight: '900' },
  content: { padding: 20, gap: 12, paddingBottom: 50 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 18 }, icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, text: { flex: 1 }, cardTitle: { ...theme.typography.titleMd, fontWeight: '900' }, body: { ...theme.typography.bodyMd, lineHeight: 20, marginTop: 3 }, date: { ...theme.typography.caption, marginTop: 7 }, dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  empty: { alignItems: 'center', padding: 50, gap: 10 }, emptyTitle: { ...theme.typography.titleLg, fontWeight: '900' }, emptyText: { ...theme.typography.bodyMd, textAlign: 'center', lineHeight: 20 },
});
