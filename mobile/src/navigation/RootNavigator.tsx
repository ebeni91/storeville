import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';

// Screens
import { RoleSelectionScreen } from '../screens/onboarding/RoleSelectionScreen';
import { BuyerEntryScreen } from '../screens/onboarding/BuyerEntryScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { GatewayChoiceScreen } from '../screens/buyer/GatewayChoiceScreen';

// Navigators
import { BuyerTabNavigator } from './BuyerTabNavigator';
import { SellerTabNavigator } from './SellerTabNavigator';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user, isAuthenticated, isLoading, isGuest, selectedGateway, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-primary-400 font-bold mt-4">Loading StoreVille...</Text>
      </View>
    );
  }

  const isSeller = isAuthenticated && user?.role === 'SELLER';
  const canAccessMarketplace = (isAuthenticated && user?.role !== 'SELLER') || isGuest;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        
        {isSeller ? (
          // ===== SELLER ROOT =====
          <Stack.Screen name="SellerRoot" component={SellerTabNavigator} />
        
        ) : canAccessMarketplace ? (
          // ===== BUYER / GUEST ROOT =====
          <>
            {selectedGateway ? (
              <Stack.Screen name="MarketplaceTabs" component={BuyerTabNavigator} />
            ) : (
              <Stack.Screen name="GatewaySelect" component={GatewayChoiceScreen} />
            )}
            
            {/* Global screens for the Marketplace branch */}
            <Stack.Screen name="Auth" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />

            {/* Redundant safety for branch swaps */}
            {!selectedGateway && <Stack.Screen name="MarketplaceTabs" component={BuyerTabNavigator} />}
            {selectedGateway && <Stack.Screen name="GatewaySelect" component={GatewayChoiceScreen} />}
          </>
        
        ) : (
          // ===== ONBOARDING (not authenticated, not guest) =====
          <>
            <Stack.Screen name="OnboardingRole" component={RoleSelectionScreen} />
            <Stack.Screen name="OnboardingBuyerEntry" component={BuyerEntryScreen} />
            <Stack.Screen name="OnboardingLogin" component={LoginScreen} />
            <Stack.Screen name="OnboardingRegister" component={RegisterScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
