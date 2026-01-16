/**
 * My Rights Mobile App
 * Premium, investor-grade legal assistant
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

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
