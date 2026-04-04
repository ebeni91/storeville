import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TrendingUp, Package, ClipboardList, Settings } from 'lucide-react-native';

import { SellerHomeScreen } from '../screens/seller/SellerHomeScreen';
import { SellerProductsScreen } from '../screens/seller/SellerProductsScreen';
import { SellerOrdersScreen } from '../screens/seller/SellerOrdersScreen';
import { SellerProfileScreen } from '../screens/seller/SellerProfileScreen';

const Tab = createBottomTabNavigator();

export function SellerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#818cf8', // Primary-400 (lighter for dark bg)
        tabBarInactiveTintColor: '#6b7280', // Gray-500
        tabBarStyle: {
          backgroundColor: '#111827', // Gray-900
          borderTopColor: '#1f2937', // Gray-800
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
        name="Dashboard" 
        component={SellerHomeScreen} 
        options={{
          tabBarIcon: ({ color }) => <TrendingUp color={color} size={22} />
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={SellerProductsScreen} 
        options={{
          tabBarIcon: ({ color }) => <Package color={color} size={22} />
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={SellerOrdersScreen} 
        options={{
          tabBarIcon: ({ color }) => <ClipboardList color={color} size={22} />
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SellerProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => <Settings color={color} size={22} />
        }}
      />
    </Tab.Navigator>
  );
}
