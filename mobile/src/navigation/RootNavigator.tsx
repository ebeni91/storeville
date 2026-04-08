import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';

// Screens
import { RoleSelectionScreen } from '../screens/onboarding/RoleSelectionScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { GatewayChoiceScreen } from '../screens/buyer/GatewayChoiceScreen';
import { SplashScreen } from '../screens/SplashScreen';

// Navigators
import { BuyerTabNavigator } from './BuyerTabNavigator';
import { SellerTabNavigator } from './SellerTabNavigator';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user, isAuthenticated, isGuest, selectedGateway, restoreSession } = useAuthStore();

  // Two independent flags — both must be true to remove splash
  const [showSplash, setShowSplash] = useState(true);
  const splashAnimDone  = useRef(false);
  const sessionReadyRef = useRef(false);

  // Called when either animation or session resolves — dismiss only when BOTH are done
  const maybeHide = useCallback(() => {
    if (splashAnimDone.current && sessionReadyRef.current) {
      setShowSplash(false);
    }
  }, []);

  useEffect(() => {
    restoreSession().finally(() => {
      sessionReadyRef.current = true;
      maybeHide();
    });
  }, []);

  const handleSplashFinish = useCallback(() => {
    splashAnimDone.current = true;
    maybeHide();
  }, [maybeHide]);

  const isSeller = isAuthenticated && user?.role === 'SELLER';
  const canAccessMarketplace = (isAuthenticated && user?.role !== 'SELLER') || isGuest;

  return (
    // Outer View so NavigationContainer + splash overlay can coexist
    <View style={{ flex: 1 }}>

      {/* NavigationContainer is ALWAYS mounted — no white flash on splash exit */}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>

          {isSeller ? (
            <Stack.Screen name="SellerRoot" component={SellerTabNavigator} />

          ) : canAccessMarketplace ? (
            <>
              {selectedGateway ? (
                <Stack.Screen name="MarketplaceTabs" component={BuyerTabNavigator} />
              ) : (
                <Stack.Screen name="GatewaySelect" component={GatewayChoiceScreen} />
              )}
              <Stack.Screen name="Auth" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              {!selectedGateway && <Stack.Screen name="MarketplaceTabs" component={BuyerTabNavigator} />}
              {selectedGateway  && <Stack.Screen name="GatewaySelect"   component={GatewayChoiceScreen} />}
            </>

          ) : (
            <>
              <Stack.Screen name="OnboardingRole"     component={RoleSelectionScreen} />
              <Stack.Screen name="OnboardingLogin"    component={LoginScreen} />
              <Stack.Screen name="OnboardingRegister" component={RegisterScreen} />
            </>
          )}

        </Stack.Navigator>
      </NavigationContainer>

      {/* Splash as absolute overlay — removed once animation + session are both done */}
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

    </View>
  );
}
