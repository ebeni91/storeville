import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Animated, Dimensions } from 'react-native';
import { ChevronRight, ShoppingBag, Store } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export function RoleSelectionScreen({ navigation }: Props) {
  const sellerScale = useRef(new Animated.Value(1)).current;
  const buyerScale = useRef(new Animated.Value(1)).current;

  const pressIn = (anim: Animated.Value) =>
    Animated.spring(anim, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = (anim: Animated.Value) =>
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  return (
    <View style={{ flex: 1, backgroundColor: '#050508' }}>
      <StatusBar barStyle="light-content" backgroundColor="#050508" />

      {/* Ambient glow orbs */}
      <View style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <View style={{
          position: 'absolute', width: width * 1.1, height: width * 1.1,
          borderRadius: width * 0.55, top: -width * 0.25, left: -width * 0.3,
          backgroundColor: '#6366f1', opacity: 0.09,
        }} />
        <View style={{
          position: 'absolute', width: width * 0.9, height: width * 0.9,
          borderRadius: width * 0.45, bottom: height * 0.1, right: -width * 0.25,
          backgroundColor: '#f59e0b', opacity: 0.07,
        }} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'center' }}>

        {/* ── Wordmark ──────────────────────────── */}
        <View style={{ marginBottom: 70, alignItems: 'flex-start' }}>
          {/* Thin rule above */}
          <View style={{ width: 32, height: 2, backgroundColor: '#6366f1', borderRadius: 99, marginBottom: 18, opacity: 0.8 }} />

          <Text style={{ fontSize: 52, lineHeight: 52, letterSpacing: -2 }}>
            <Text style={{ fontWeight: '300', color: 'rgba(255,255,255,0.55)' }}>Store</Text>
            <Text style={{ fontWeight: '900', color: '#ffffff' }}>Ville</Text>
          </Text>

          <Text style={{
            marginTop: 10, fontSize: 10, letterSpacing: 5,
            fontWeight: '600', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.22)',
          }}>
            The Digital Mall of Ethiopia
          </Text>
        </View>

        {/* ── Role Rows ─────────────────────────── */}
        <View style={{ gap: 12 }}>

          {/* Seller row */}
          <Animated.View style={{ transform: [{ scale: sellerScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={() => pressIn(sellerScale)}
              onPressOut={() => pressOut(sellerScale)}
              onPress={() => navigation.navigate('OnboardingLogin', { intendedRole: 'SELLER' })}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
                borderRadius: 20, paddingVertical: 18, paddingHorizontal: 20,
              }}
            >
              <View style={{
                width: 42, height: 42, borderRadius: 13,
                backgroundColor: 'rgba(245,158,11,0.14)',
                borderWidth: 1, borderColor: 'rgba(245,158,11,0.22)',
                alignItems: 'center', justifyContent: 'center', marginRight: 16,
              }}>
                <Store color="#f59e0b" size={19} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: -0.2, marginBottom: 2 }}>
                  Seller Portal
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12, fontWeight: '500' }}>
                  Manage your store & fulfill orders
                </Text>
              </View>
              <ChevronRight color="rgba(255,255,255,0.2)" size={18} strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>

          {/* Buyer row */}
          <Animated.View style={{ transform: [{ scale: buyerScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={() => pressIn(buyerScale)}
              onPressOut={() => pressOut(buyerScale)}
              onPress={() => navigation.navigate('OnboardingLogin', { intendedRole: 'CUSTOMER' })}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(99,102,241,0.10)',
                borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)',
                borderRadius: 20, paddingVertical: 18, paddingHorizontal: 20,
              }}
            >
              <View style={{
                width: 42, height: 42, borderRadius: 13,
                backgroundColor: 'rgba(99,102,241,0.18)',
                borderWidth: 1, borderColor: 'rgba(99,102,241,0.35)',
                alignItems: 'center', justifyContent: 'center', marginRight: 16,
              }}>
                <ShoppingBag color="#818cf8" size={19} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: -0.2, marginBottom: 2 }}>
                  Enter Marketplace
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12, fontWeight: '500' }}>
                  Discover stores, cafes & restaurants
                </Text>
              </View>
              <ChevronRight color="rgba(99,102,241,0.5)" size={18} strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>

        </View>
      </View>

      {/* Footer */}
      <View style={{ paddingBottom: 36, alignItems: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase' }}>
          © 2026 StoreVille Technology
        </Text>
      </View>
    </View>
  );
}
