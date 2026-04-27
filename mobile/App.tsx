import "./global.css";
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/store/themeStore';

const queryClient = new QueryClient();

function AppInit() {
  const loadTheme = useThemeStore(s => s.loadTheme);
  useEffect(() => {
    async function prepare() {
      try {
        await loadTheme();
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
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

