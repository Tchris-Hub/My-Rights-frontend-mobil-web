import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { accountService, DataRequest } from '../../services/account.service';
import { authService } from '../../services/auth.service';
import { APP_CONFIG } from '../../constants/config';
import { useTheme } from '../../contexts/ThemeContext';
import theme from '../../constants/theme';
import { useResponsive } from '../../utils/responsive';

export const PrivacyCenterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { horizontalPadding, contentWidth } = useResponsive();
  const [consents, setConsents] = useState<Array<{ terms_version:string; privacy_version:string; accepted_at:string }>>([]);
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [consentData, requestData] = await Promise.all([authService.getConsents(), accountService.getDataRequests()]);
      setConsents(consentData);
      setRequests(requestData);
    } catch (error) { Alert.alert('Unable to load privacy data', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const request = async (type: 'export'|'deletion') => {
    try {
      await accountService.createDataRequest(type, type === 'deletion' ? 'User requested account/data deletion review.' : 'User requested a copy of their account data.');
      await load();
      Alert.alert(type === 'deletion' ? 'Deletion request submitted' : 'Data request submitted', 'Your request is now recorded for processing.');
    } catch (error) { Alert.alert('Request failed', error instanceof Error ? error.message : 'Please try again.'); }
  };

  return <SafeAreaView style={[styles.container,{backgroundColor:colors.surface}]} edges={['top']}>
    <View style={[styles.header, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, width: "100%", alignSelf: "center" }]}>
      <TouchableOpacity onPress={()=>navigation.goBack()} style={[styles.back,{backgroundColor:colors.surfaceContainer}]}><Ionicons name="chevron-back" size={24} color={colors.onSurface}/></TouchableOpacity>
      <View style={styles.headerText}><Text style={[styles.title,{color:colors.onSurface}]}>Privacy Center</Text><Text style={[styles.subtitle,{color:colors.onSurfaceVariant}]}>Consent, data access and account privacy</Text></View>
    </View>
    {loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.primary}/></View> :
    <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, width: "100%", alignSelf: "center" }]}>
      <View style={[styles.card,{backgroundColor:colors.surfaceContainer}]}>
        <Text style={[styles.cardTitle,{color:colors.onSurface}]}>Current policies</Text>
        <Text style={[styles.body,{color:colors.onSurfaceVariant}]}>Terms {APP_CONFIG.TERMS_VERSION} • Privacy {APP_CONFIG.PRIVACY_POLICY_VERSION}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={()=>void Linking.openURL(APP_CONFIG.PRIVACY_URL)}><Text style={[styles.link,{color:colors.primary}]}>Open Privacy Policy</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>void Linking.openURL(APP_CONFIG.TERMS_URL)}><Text style={[styles.link,{color:colors.primary}]}>Open Terms</Text></TouchableOpacity>
        </View>
      </View>
      <View style={[styles.card,{backgroundColor:colors.surfaceContainer}]}>
        <Text style={[styles.cardTitle,{color:colors.onSurface}]}>Consent history</Text>
        {consents.length===0 ? <Text style={[styles.body,{color:colors.onSurfaceVariant}]}>No consent records found.</Text> : consents.map((c,i)=><Text key={i} style={[styles.body,{color:colors.onSurfaceVariant}]}>Accepted {new Date(c.accepted_at).toLocaleString()} • Terms {c.terms_version} • Privacy {c.privacy_version}</Text>)}
      </View>
      <View style={[styles.card,{backgroundColor:colors.surfaceContainer}]}>
        <Text style={[styles.cardTitle,{color:colors.onSurface}]}>Your data</Text>
        <TouchableOpacity testID="privacy-export" accessibilityRole="button" accessibilityLabel="Request my data" style={[styles.action,{backgroundColor:colors.primary}]} onPress={()=>void request('export')}><Text style={[styles.actionText,{color:colors.onPrimary}]}>Request my data</Text></TouchableOpacity>
        <TouchableOpacity testID="privacy-delete" accessibilityRole="button" accessibilityLabel="Request data deletion" style={[styles.secondary,{borderColor:colors.outlineVariant}]} onPress={()=>void request('deletion')}><Text style={[styles.secondaryText,{color:colors.error}]}>Request data deletion</Text></TouchableOpacity>
      </View>
      {requests.length>0 && <View style={[styles.card,{backgroundColor:colors.surfaceContainer}]}>
        <Text style={[styles.cardTitle,{color:colors.onSurface}]}>Request history</Text>
        {requests.map(r=><Text key={r.id} style={[styles.body,{color:colors.onSurfaceVariant}]}>{r.request_type} • {r.status} • {new Date(r.created_at).toLocaleString()}</Text>)}
      </View>}
    </ScrollView>}
  </SafeAreaView>;
};
const styles=StyleSheet.create({
 container:{flex:1},header:{flexDirection:'row',alignItems:'center',padding:0,gap:14},back:{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center'},headerText:{flex:1},title:{...theme.typography.titleLg,fontWeight:'900'},subtitle:{...theme.typography.bodyMd,marginTop:3},
 content:{padding:24,gap:14,paddingBottom:50},card:{borderRadius:20,padding:18,gap:12},cardTitle:{...theme.typography.titleMd,fontWeight:'900'},body:{...theme.typography.bodyMd,lineHeight:21},actions:{gap:10},link:{...theme.typography.labelLg,fontWeight:'900'},action:{minHeight:48,borderRadius:14,alignItems:'center',justifyContent:'center',padding:12},actionText:{...theme.typography.labelLg,fontWeight:'900'},secondary:{minHeight:48,borderRadius:14,borderWidth:1,alignItems:'center',justifyContent:'center',padding:12},secondaryText:{...theme.typography.labelLg,fontWeight:'900'},center:{flex:1,alignItems:'center',justifyContent:'center'}
});
