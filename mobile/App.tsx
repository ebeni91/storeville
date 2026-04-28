import "./global.css";
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Drop the native blank splash screen as fast as possible —
// the custom SplashScreen.tsx takes over immediately after.
SplashScreen.preventAutoHideAsync();
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/store/themeStore';

const queryClient = new QueryClient();

function AppInit() {
  const loadTheme = useThemeStore(s => s.loadTheme);
  useEffect(() => {
    // Fire hideAsync immediately — do NOT wait for loadTheme.
    // The custom SplashScreen component handles the visual experience
    // while loadTheme runs in the background.
    SplashScreen.hideAsync();
    loadTheme();
  }, []);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppInit />
        <RootNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

