import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authClient } from '../lib/auth-client';
import { useAuthStore } from '../store/authStore';

// Screens
import { AuthScreen } from '../screens/auth/AuthScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { GlobalLoadingOverlay } from '../components/ui/GlobalLoadingOverlay';

// Navigators
import { BuyerTabNavigator } from './BuyerTabNavigator';
import { SellerTabNavigator } from './SellerTabNavigator';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { isGuest } = useAuthStore();

  // better-auth session — handles restore automatically via SecureStore cache
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [splashDone, setSplashDone] = useState(false);

  // ── Splash overlay ──────────────────────────────────────────────────────────
  const splashAnimDone = React.useRef(false);
  const sessionReadyRef = React.useRef(false);

  React.useEffect(() => {
    if (!sessionLoading) {
      sessionReadyRef.current = true;
      if (splashAnimDone.current) setSplashDone(true);
    }
  }, [sessionLoading]);

  const handleSplashFinish = () => {
    splashAnimDone.current = true;
    if (sessionReadyRef.current) setSplashDone(true);
  };

  // ── Derive auth state from session ──────────────────────────────────────────
  const user = session?.user as any;
  const isAuthenticated = !!user;
  const isSeller = isAuthenticated && user?.role === 'SELLER';
  const canBrowse = isAuthenticated || isGuest;

  return (
    <View style={{ flex: 1 }}>
      {/* NavigationContainer always mounted — no white flash */}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>

          {isSeller ? (
            // 🏪 Seller: route to their dashboard
            <Stack.Screen name="SellerRoot" component={SellerTabNavigator} />

          ) : canBrowse ? (
            // 🛍️ Authenticated customer or guest: marketplace access
            <Stack.Screen name="MarketplaceTabs" component={BuyerTabNavigator} />

          ) : (
            // 🔐 Unauthenticated: single unified auth screen
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}

        </Stack.Navigator>
      </NavigationContainer>

      {/* Splash overlay — removed when both animation + session are ready */}
      {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
      
      {/* Auth transition overlay (shows on OAuth return or initial deep link loading) */}
      {splashDone && sessionLoading && <GlobalLoadingOverlay />}
    </View>
  );
}
