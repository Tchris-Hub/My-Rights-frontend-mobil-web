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
import { BackgroundJobOverlay } from '../components/common/BackgroundJobOverlay';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
    linking?: any;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({ linking }) => {
    const { isAuthenticated, isLoading, onboardingCompleted, isGuest, needsPasswordReset, consentAccepted } = useAuth();
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
        <NavigationContainer linking={linking}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={(!onboardingCompleted) ? "Onboarding" : (!isAuthenticated && !isGuest) ? "Auth" : (isAuthenticated && !consentAccepted) ? "Auth" : "Chat"}
            >
                {!onboardingCompleted ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : needsPasswordReset ? (
                    <Stack.Screen name="Auth" component={AuthStack} />
                ) : (!isAuthenticated && !isGuest) ? (
                    <Stack.Screen name="Auth" component={AuthStack} />
                ) : (isAuthenticated && !consentAccepted) ? (
                    <Stack.Screen name="Auth" component={AuthStack} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                ) : (
                    <>
                        <Stack.Screen name="Chat" component={ChatScreen} />
                        <Stack.Screen name="Tools" component={ToolsNavigator} />
                        <Stack.Screen name="Profile" component={ProfileNavigator} />
                    </>
                )}
            </Stack.Navigator>
            <BackgroundJobOverlay />
        </NavigationContainer>
    );
};
