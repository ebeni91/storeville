import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Home, ShoppingCart, User } from 'lucide-react-native';
import { useThemeStore } from '../store/themeStore';

import { ExploreScreen } from '../screens/buyer/ExploreScreen';
import { OrdersScreen } from '../screens/buyer/OrdersScreen';
import { ProfileScreen } from '../screens/buyer/ProfileScreen';
import { StoreGatewayScreen } from '../screens/buyer/StoreGatewayScreen';
import { CheckoutScreen } from '../screens/buyer/CheckoutScreen';

// Profile sub-screens
import { ProfileInfoScreen } from '../screens/buyer/profile/ProfileInfoScreen';
import { PaymentMethodsScreen } from '../screens/buyer/profile/PaymentMethodsScreen';
import { TransactionHistoryScreen } from '../screens/buyer/profile/TransactionHistoryScreen';
import { AboutUsScreen } from '../screens/buyer/profile/AboutUsScreen';
import { TermsAndConditionsScreen } from '../screens/buyer/profile/TermsAndConditionsScreen';
import { PrivacyPolicyScreen } from '../screens/buyer/profile/PrivacyPolicyScreen';
import { RefundPolicyScreen } from '../screens/buyer/profile/RefundPolicyScreen';

const Tab = createBottomTabNavigator();
const ExploreStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
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
                size={24}
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

function ExploreStackNavigator() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <ExploreStack.Screen name="ExploreMap" component={ExploreScreen} />
      <ExploreStack.Screen name="StoreGateway" component={StoreGatewayScreen} />
      <ExploreStack.Screen name="Checkout" component={CheckoutScreen} />
    </ExploreStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="ProfileInfo" component={ProfileInfoScreen} />
      <ProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <ProfileStack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <ProfileStack.Screen name="AboutUs" component={AboutUsScreen} />
      <ProfileStack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
      <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <ProfileStack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
    </ProfileStack.Navigator>
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
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
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
    width: PILL_W / 3,
    height: PILL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
