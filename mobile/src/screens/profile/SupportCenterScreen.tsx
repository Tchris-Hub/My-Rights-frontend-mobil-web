import React, { useState } from 'react';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ActivityIndicator, Alert, Linking, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { accountService } from '../../services/account.service';
import { APP_CONFIG } from '../../constants/config';
import { useTheme } from '../../contexts/ThemeContext';
import theme from '../../constants/theme';

export const SupportCenterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!message.trim()) { Alert.alert('Message required', 'Tell us what you need help with.'); return; }
    try {
      setSending(true);
      await accountService.createReport({ category, message: message.trim() });
      setMessage('');
      Alert.alert('Report submitted', 'Your support report has been recorded.');
    } catch (error) { Alert.alert('Unable to submit report', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setSending(false); }
  };

  return <View style={[styles.container, { backgroundColor: colors.surface }]}>
    <ScreenHeader title="Help and feedback" />
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <View style={[styles.card,{backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1 }]}>
        <Text style={[styles.cardTitle,{color:colors.onSurface}]}>Contact support</Text>
        <Text style={[styles.body,{color:colors.onSurfaceVariant}]}>For account or app assistance, email our support team.</Text>
        <TouchableOpacity onPress={()=>void Linking.openURL(`mailto:${APP_CONFIG.SUPPORT_EMAIL}`)}><Text style={[styles.link,{color:colors.primary}]}>{APP_CONFIG.SUPPORT_EMAIL}</Text></TouchableOpacity>
      </View>
      <View style={[styles.card,{backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1 }]}>
        <Text style={[styles.cardTitle,{color:colors.onSurface}]}>Report a problem</Text>
        <View style={styles.categoryRow}>{['general','content','privacy','professional'].map(value=><TouchableOpacity key={value} onPress={()=>setCategory(value)} style={[styles.category,{backgroundColor:category===value?colors.primary:colors.surfaceContainerHighest}]}><Text style={[styles.categoryText,{color:category===value?colors.onPrimary:colors.onSurfaceVariant}]}>{value}</Text></TouchableOpacity>)}</View>
        <TextInput value={message} onChangeText={setMessage} multiline maxLength={4000} placeholder="Describe the issue..." placeholderTextColor={colors.onSurfaceVariant} style={[styles.input,{color:colors.onSurface,backgroundColor:colors.surface,borderColor:colors.outlineVariant}]}/>
        <TouchableOpacity disabled={sending} onPress={()=>void submit()} style={[styles.action,{backgroundColor:colors.primary,opacity:sending?.6:1}]}>{sending?<ActivityIndicator color={colors.onPrimary}/>:<Text style={[styles.actionText,{color:colors.onPrimary}]}>Submit report</Text>}</TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  </View>;
};
const styles=StyleSheet.create({
 container:{flex:1},header:{flexDirection:'row',alignItems:'center',padding:24,gap:14},back:{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center'},headerText:{flex:1},title:{...theme.typography.titleLg},subtitle:{...theme.typography.bodyMd,marginTop:3},
 content:{padding:16,gap:14,paddingBottom:50},card:{borderRadius:14,padding:18,gap:12},cardTitle:{...theme.typography.titleMd},body:{...theme.typography.bodyMd,lineHeight:21},link:{...theme.typography.labelLg},categoryRow:{flexDirection:'row',flexWrap:'wrap',gap:8},category:{paddingHorizontal:12,paddingVertical:10,borderRadius:13},categoryText:{...theme.typography.caption,textTransform:'capitalize'},input:{minHeight:130,borderWidth:1,borderRadius:14,padding:12,...theme.typography.bodyMd,textAlignVertical:'top'},action:{minHeight:50,borderRadius:15,alignItems:'center',justifyContent:'center'},actionText:{...theme.typography.labelLg}
});
