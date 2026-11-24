import React, { useCallback, useState } from 'react';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { accountService, SavedRight } from '../../services/account.service';
import { useTheme } from '../../contexts/ThemeContext';
import theme from '../../constants/theme';

export const SavedRightsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [items, setItems] = useState<SavedRight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try { setItems(await accountService.getSavedRights()); }
    catch (error) { Alert.alert('Unable to load saved rights', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const remove = (item: SavedRight) => {
    Alert.alert('Remove saved right?', item.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try { await accountService.deleteSavedRight(item.id); await load(true); }
        catch (error) { Alert.alert('Unable to remove', error instanceof Error ? error.message : 'Please try again.'); }
      }},
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScreenHeader title="Saved rights" />
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View> :
        items.length === 0 ? <View style={styles.center}>
          <Ionicons name="bookmark-outline" size={52} color={colors.onSurfaceVariant} />
          <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No saved rights yet</Text>
          <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>Save a citation from the Constitution Explorer and it will appear here.</Text>
        </View> :
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1 }]}>
              <View style={styles.row}>
                <Ionicons name="bookmark" size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{item.title}</Text>
              </View>
              {item.citation ? <Text style={[styles.citation, { color: colors.primary }]}>{item.citation}</Text> : null}
              {item.summary ? <Text style={[styles.summary, { color: colors.onSurfaceVariant }]}>{item.summary}</Text> : null}
              <TouchableOpacity onPress={() => remove(item)} style={[styles.remove, { borderColor: colors.outlineVariant }]}>
                <Text style={[styles.removeText, { color: colors.error }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />}
    </View>
  );
};

const styles = StyleSheet.create({
  container:{flex:1}, header:{flexDirection:'row',alignItems:'center',padding:24,gap:14}, back:{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center'}, headerText:{flex:1},
  title:{...theme.typography.titleLg}, subtitle:{...theme.typography.bodyMd,marginTop:3}, list:{padding:16,gap:14,paddingBottom:50},
  card:{borderRadius:14,padding:18,gap:9}, row:{flexDirection:'row',alignItems:'center',gap:10}, cardTitle:{...theme.typography.titleMd,flex:1},
  citation:{...theme.typography.labelSm}, summary:{...theme.typography.bodyMd,lineHeight:20}, remove:{alignSelf:'flex-start',paddingHorizontal:14,paddingVertical:9,borderWidth:1,borderRadius:12,marginTop:4},
  removeText:{...theme.typography.labelSm}, center:{flex:1,alignItems:'center',justifyContent:'center',padding:40,gap:12}, emptyTitle:{...theme.typography.titleMd}, empty:{...theme.typography.bodyMd,textAlign:'center'}
});
