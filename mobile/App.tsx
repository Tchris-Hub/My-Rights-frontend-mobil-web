/**
 * My Rights Mobile App
 * Premium, investor-grade legal assistant
 */

import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Maintenance Note:
// Suppressing "Expo AV has been deprecated" warning.
// We are currently using `expo-av` for voice recording features. 
// Migration to `expo-audio` is planned for Q3 2026.
// This suppression is safe as the library still functions correctly in SDK 52.
LogBox.ignoreLogs(['[expo-av]', 'Expo AV has been deprecated']);

import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <ThemedStatusBar />
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
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
