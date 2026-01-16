/**
 * Root Navigator
 * Conditional routing based on onboarding and authentication state
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { STORAGE_KEYS } from '../constants/config';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
    const { isAuthenticated, isLoading, onboardingCompleted, isGuest } = useAuth();

    // Show loading while checking onboarding and auth status
    if (isLoading) {
        return <LoadingSpinner overlay />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!onboardingCompleted ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : (!isAuthenticated && !isGuest) ? (
                    <Stack.Screen name="Auth" component={AuthStack} />
                ) : (
                    <Stack.Screen name="Main" component={MainTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
