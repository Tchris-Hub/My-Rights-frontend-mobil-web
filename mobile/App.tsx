/**
 * My Rights Mobile App
 * Premium, investor-grade legal assistant
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Literata_400Regular,
  Literata_500Medium,
  Literata_600SemiBold,
} from '@expo-google-fonts/literata';

import * as Linking from 'expo-linking';
// React Native LogBox suppression
LogBox.ignoreLogs(['[expo-av]', 'Expo AV has been deprecated']);

// GLOBAL PRODUCTION LOG GUARD
// Mutes all console logging in production to prevent data leakage and improve performance
if (!__DEV__) {
  console.log = () => { };
  console.info = () => { };
  console.warn = () => { };
  console.error = () => { };
}

import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { JobProvider } from './src/contexts/JobContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { BackgroundJobOverlay } from './src/components/common/BackgroundJobOverlay';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// React Navigation Linking Configuration
const linking = {
  prefixes: [
    Linking.createURL('/'),
    'myrights://',
  ],
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Literata_400Regular,
    Literata_500Medium,
    Literata_600SemiBold,
  });

  // Fonts are bundled, so this resolves in well under a second. On error, fall through to system fonts.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemeProvider>
            <JobProvider>
              <AuthProvider>
                <ThemedStatusBar />
                <RootNavigator linking={linking} />
              </AuthProvider>
            </JobProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}


function ThemedStatusBar() {
  try {
    const { useTheme } = require('./src/contexts/ThemeContext');
    const { isDark } = useTheme();
    return <StatusBar style={isDark ? 'light' : 'dark'} />;
  } catch (e) {
    return <StatusBar style="auto" />;
  }
}
