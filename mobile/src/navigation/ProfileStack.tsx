/**
 * Profile Stack Navigator
 * User profile, settings, and account management
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileHomeScreen } from '../screens/profile/ProfileHomeScreen';
import { ProfessionalDashboardScreen } from '../screens/profile/ProfessionalDashboardScreen';
import { useAuth } from '../contexts/AuthContext';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChatHistoryScreen } from '../screens/profile/ChatHistoryScreen';
import { LegalEnquiriesScreen } from '../screens/profile/LegalEnquiriesScreen';
import { ProfessionalProfileScreen } from '../screens/profile/ProfessionalProfileScreen';
import { SavedRightsScreen } from '../screens/profile/SavedRightsScreen';
import { PrivacyCenterScreen } from '../screens/profile/PrivacyCenterScreen';
import { SupportCenterScreen } from '../screens/profile/SupportCenterScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  const { accountType } = useAuth();
  const Home = accountType === 'legal_professional' ? ProfessionalDashboardScreen : ProfileHomeScreen;
  return (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileHome" component={Home} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} options={{ title: 'Chat History' }} />
    <Stack.Screen name="LegalEnquiries" component={LegalEnquiriesScreen} options={{ title: 'Legal Enquiries' }} />
    <Stack.Screen name="ProfessionalProfile" component={ProfessionalProfileScreen} options={{ title: 'Professional Profile' }} />
    <Stack.Screen name="SavedRights" component={SavedRightsScreen} options={{ title: 'Saved Rights' }} />
    <Stack.Screen name="PrivacyCenter" component={PrivacyCenterScreen} options={{ title: 'Privacy Center' }} />
    <Stack.Screen name="SupportCenter" component={SupportCenterScreen} options={{ title: 'Support Center' }} />
  </Stack.Navigator>
  );
};
