import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Map, ClipboardList, User } from 'lucide-react-native';

import { ExploreScreen } from '../screens/buyer/ExploreScreen';
import { OrdersScreen } from '../screens/buyer/OrdersScreen';
import { ProfileScreen } from '../screens/buyer/ProfileScreen';
import { StoreGatewayScreen } from '../screens/buyer/StoreGatewayScreen';
import { CheckoutScreen } from '../screens/buyer/CheckoutScreen';

const Tab = createBottomTabNavigator();
const ExploreStack = createNativeStackNavigator();

/**
 * ExploreStackNavigator: Map → Store Gateway → Checkout
 * Tabs disappear when deep in the stack (Store -> Checkout).
 * Login/Register (Auth/Register) are now handled by the RootNavigator for global accessibility.
 */
function ExploreStackNavigator() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <ExploreStack.Screen name="ExploreMap" component={ExploreScreen} />
      <ExploreStack.Screen name="StoreGateway" component={StoreGatewayScreen} />
      <ExploreStack.Screen name="Checkout" component={CheckoutScreen} />
    </ExploreStack.Navigator>
  );
}

export function BuyerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f3f4f6',
          elevation: 0,
          shadowOpacity: 0,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        }
      }}
    >
      <Tab.Screen 
        name="Explore" 
        component={ExploreStackNavigator} 
        options={{
          tabBarIcon: ({ color }) => <Map color={color} size={22} />,
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{
          tabBarIcon: ({ color }) => <ClipboardList color={color} size={22} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => <User color={color} size={22} />,
        }}
      />
    </Tab.Navigator>
  );
}
