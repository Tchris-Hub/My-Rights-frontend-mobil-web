/**
 * Profile Stack Navigator
 * User profile, settings, and account management
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileHomeScreen } from '../screens/profile/ProfileHomeScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { ChatHistoryScreen } from '../screens/profile/ChatHistoryScreen';
import { LegalEnquiriesScreen } from '../screens/profile/LegalEnquiriesScreen';
import { ProfessionalProfileScreen } from '../screens/profile/ProfessionalProfileScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
            />
            <Stack.Screen
                name="ChatHistory"
                component={ChatHistoryScreen}
                options={{ title: 'Chat History' }}
            />
            <Stack.Screen
                name="LegalEnquiries"
                component={LegalEnquiriesScreen}
                options={{ title: 'Legal Enquiries' }}
            />
            <Stack.Screen
                name="ProfessionalProfile"
                component={ProfessionalProfileScreen}
                options={{ title: 'Professional Profile' }}
            />
        </Stack.Navigator>
    );
};
