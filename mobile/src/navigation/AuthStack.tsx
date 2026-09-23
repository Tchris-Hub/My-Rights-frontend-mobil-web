/**
 * Passwordless authentication stack.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { MagicLinkSentScreen } from '../screens/auth/MagicLinkSentScreen';
import { ConsentScreen } from '../screens/auth/ConsentScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = () => {
    const { isAuthenticated, consentAccepted } = useAuth();

    return (
        <Stack.Navigator
            initialRouteName={isAuthenticated && !consentAccepted ? 'Consent' : 'Login'}
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MagicLinkSent" component={MagicLinkSentScreen} />
            <Stack.Screen name="Consent" component={ConsentScreen} />
        </Stack.Navigator>
    );
};
