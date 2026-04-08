import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { TrendingUp, Package, ClipboardList, Palette, Settings } from 'lucide-react-native';
import { useThemeStore } from '../store/themeStore';

import { SellerHomeScreen } from '../screens/seller/SellerHomeScreen';
import { SellerProductsScreen } from '../screens/seller/SellerProductsScreen';
import { SellerOrdersScreen } from '../screens/seller/SellerOrdersScreen';
import { SellerStudioScreen } from '../screens/seller/SellerStudioScreen';
import { SellerSettingsScreen } from '../screens/seller/SellerSettingsScreen';

// Settings sub-screens
import { SellerAccountInfoScreen } from '../screens/seller/settings/SellerAccountInfoScreen';
import { SellerStoreLocationScreen } from '../screens/seller/settings/SellerStoreLocationScreen';
import { SellerFinancialsScreen } from '../screens/seller/settings/SellerFinancialsScreen';
import { SellerSubscriptionScreen } from '../screens/seller/settings/SellerSubscriptionScreen';

const Tab = createBottomTabNavigator();
const SettingsStack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

const PILL_H = 66;
const PILL_W = width * 0.82;
const PILL_R = PILL_H / 2;

const ICON_MAP: Record<string, any> = {
  Dashboard: TrendingUp,
  Products:  Package,
  Orders:    ClipboardList,
  Studio:    Palette,
  Settings:  Settings,
};

function SellerTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useThemeStore();
  return (
    <View style={styles.outerWrapper} pointerEvents="box-none">
      <View style={[styles.pill, { backgroundColor: colors.tabPill, borderColor: colors.tabBorder }]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const Icon = ICON_MAP[route.name];
          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => { if (!focused) navigation.navigate(route.name as never); }}
              activeOpacity={0.6}
              style={styles.tab}
            >
              <Icon
                size={22}
                color={focused ? colors.tabIconFocus : colors.tabIcon}
                strokeWidth={focused ? 2.4 : 1.7}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <SettingsStack.Screen name="SettingsHome"     component={SellerSettingsScreen} />
      <SettingsStack.Screen name="AccountInfo"      component={SellerAccountInfoScreen} />
      <SettingsStack.Screen name="StoreLocation"    component={SellerStoreLocationScreen} />
      <SettingsStack.Screen name="Financials"       component={SellerFinancialsScreen} />
      <SettingsStack.Screen name="Subscription"     component={SellerSubscriptionScreen} />
    </SettingsStack.Navigator>
  );
}

export function SellerTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <SellerTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={SellerHomeScreen} />
      <Tab.Screen name="Products"  component={SellerProductsScreen} />
      <Tab.Screen name="Orders"    component={SellerOrdersScreen} />
      <Tab.Screen name="Studio"    component={SellerStudioScreen} />
      <Tab.Screen name="Settings"  component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    pointerEvents: 'box-none',
  },
  pill: {
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_R,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  tab: {
    flex: 1,
    height: PILL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
