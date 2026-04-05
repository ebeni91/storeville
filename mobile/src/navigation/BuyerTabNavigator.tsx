import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Home, ShoppingCart, User } from 'lucide-react-native';

import { ExploreScreen } from '../screens/buyer/ExploreScreen';
import { OrdersScreen } from '../screens/buyer/OrdersScreen';
import { ProfileScreen } from '../screens/buyer/ProfileScreen';
import { StoreGatewayScreen } from '../screens/buyer/StoreGatewayScreen';
import { CheckoutScreen } from '../screens/buyer/CheckoutScreen';

const Tab = createBottomTabNavigator();
const ExploreStack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

const PILL_H = 66;
const PILL_W = width * 0.68;
const PILL_R = PILL_H / 2;

const ICON_MAP: Record<string, any> = {
  Explore: Home,
  Orders: ShoppingCart,
  Profile: User,
};

function WhiteTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.outerWrapper} pointerEvents="box-none">
      <View style={styles.pill}>
        {/* Icon row — equal thirds, perfectly centered */}
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
                size={24}
                color={focused ? '#1a1a2e' : '#b8bcc8'}
                strokeWidth={focused ? 2.4 : 1.7}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

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
      tabBar={(props) => <WhiteTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Explore" component={ExploreStackNavigator} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
    backgroundColor: '#ffffff',
    // Subtle border ring — the only edge definition
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    // No shadow — clean and flat
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },

  tab: {
    width: PILL_W / 3,
    height: PILL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
