import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { useTheme } from '../../contexts/ThemeContext';
import theme from '../../constants/theme';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, refreshUser } = useAuth();
  const { colors } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { Alert.alert('Name required', 'Enter your name.'); return; }
    try {
      setSaving(true);
      await authService.updateProfile({ name, phone_number: phone });
      await refreshUser();
      Alert.alert('Profile updated', 'Your account details have been saved.', [{ text: 'Done', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Unable to update profile', error instanceof Error ? error.message : 'Please try again.');
    } finally { setSaving(false); }
  };

  return <SafeAreaView style={[styles.container,{backgroundColor:colors.surface}]} edges={['top']}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={[styles.back,{backgroundColor:colors.surfaceContainer}]}><Ionicons name="chevron-back" size={24} color={colors.onSurface}/></TouchableOpacity>
        <View style={styles.headerText}><Text style={[styles.title,{color:colors.onSurface}]}>Edit profile</Text><Text style={[styles.subtitle,{color:colors.onSurfaceVariant}]}>Keep your account details current</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Text style={[styles.label,{color:colors.onSurface}]}>Name</Text>
        <TextInput testID="profile-name" accessibilityLabel="Name" value={name} onChangeText={setName} maxLength={200} placeholder="Your name" placeholderTextColor={colors.onSurfaceVariant} style={[styles.input,{color:colors.onSurface,backgroundColor:colors.surfaceContainer,borderColor:colors.outlineVariant}]}/>
        <Text style={[styles.label,{color:colors.onSurface}]}>Phone number</Text>
        <TextInput testID="profile-phone" accessibilityLabel="Phone number" value={phone} onChangeText={setPhone} maxLength={50} keyboardType="phone-pad" placeholder="Optional phone number" placeholderTextColor={colors.onSurfaceVariant} style={[styles.input,{color:colors.onSurface,backgroundColor:colors.surfaceContainer,borderColor:colors.outlineVariant}]}/>
        <Text style={[styles.email,{color:colors.onSurfaceVariant}]}>Email: {user?.email || '—'}</Text>
        <TouchableOpacity testID="profile-save" accessibilityRole="button" disabled={saving} onPress={()=>void save()} style={[styles.save,{backgroundColor:colors.primary,opacity:saving?.6:1}]}>{saving?<ActivityIndicator color={colors.onPrimary}/>:<Text style={[styles.saveText,{color:colors.onPrimary}]}>Save changes</Text>}</TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
};
const styles=StyleSheet.create({
 container:{flex:1},header:{flexDirection:'row',alignItems:'center',padding:24,gap:14},back:{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center'},headerText:{flex:1},title:{...theme.typography.titleLg,fontWeight:'900'},subtitle:{...theme.typography.bodyMd,marginTop:3},content:{padding:24,gap:10},label:{...theme.typography.labelLg,fontWeight:'800',marginTop:8},input:{minHeight:50,borderWidth:1,borderRadius:15,paddingHorizontal:14,...theme.typography.bodyMd},email:{...theme.typography.bodyMd,marginTop:8},save:{minHeight:52,borderRadius:16,alignItems:'center',justifyContent:'center',marginTop:14},saveText:{...theme.typography.labelLg,fontWeight:'900'}
});
