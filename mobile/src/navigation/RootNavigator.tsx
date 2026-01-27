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
import { ChatScreen } from '../screens/main/ChatScreen';
import { ToolsNavigator } from './ToolsStack';
import { ProfileNavigator } from './ProfileStack';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CustomSplashScreen as SplashScreen } from '../screens/common/SplashScreen';
import { useAuth } from '../contexts/AuthContext';
import { STORAGE_KEYS } from '../constants/config';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
    const { isAuthenticated, isLoading, onboardingCompleted, isGuest } = useAuth();
    const [isSplashAnimationFinished, setIsSplashAnimationFinished] = useState(false);
    const [isInitialBoot, setIsInitialBoot] = useState(true);

    // Once the first loading is done, we mark initial boot as complete
    useEffect(() => {
        if (!isLoading && isInitialBoot) {
            setIsInitialBoot(false);
        }
    }, [isLoading, isInitialBoot]);

    // Show animated splash screen ONLY on initial boot OR while its animation is still playing
    if (isInitialBoot || !isSplashAnimationFinished) {
        return (
            <SplashScreen
                onAnimationFinish={() => setIsSplashAnimationFinished(true)}
                isAppReady={!isLoading}
            />
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={(!onboardingCompleted) ? "Onboarding" : (!isAuthenticated && !isGuest) ? "Auth" : "Chat"}
            >
                {!onboardingCompleted ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : (!isAuthenticated && !isGuest) ? (
                    <Stack.Screen name="Auth" component={AuthStack} />
                ) : (
                    <>
                        <Stack.Screen name="Chat" component={ChatScreen} />
                        <Stack.Screen name="Tools" component={ToolsNavigator} />
                        <Stack.Screen name="Profile" component={ProfileNavigator} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
