import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Animated, Dimensions } from 'react-native';
import { ChevronRight, ShoppingBag, Store } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';

const { width, height } = Dimensions.get('window');

interface Props { navigation: any; }

export function RoleSelectionScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();
  const sellerScale = useRef(new Animated.Value(1)).current;
  const buyerScale  = useRef(new Animated.Value(1)).current;

  const pressIn  = (anim: Animated.Value) =>
    Animated.spring(anim, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = (anim: Animated.Value) =>
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  const isDark = mode === 'dark';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      {/* Ambient glow orbs — subtle in both modes */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        <View style={{
          position: 'absolute', width: width * 1.1, height: width * 1.1,
          borderRadius: width * 0.55, top: -width * 0.25, left: -width * 0.3,
          backgroundColor: '#6366f1', opacity: isDark ? 0.09 : 0.06,
        }} />
        <View style={{
          position: 'absolute', width: width * 0.9, height: width * 0.9,
          borderRadius: width * 0.45, bottom: height * 0.1, right: -width * 0.25,
          backgroundColor: '#f59e0b', opacity: isDark ? 0.07 : 0.05,
        }} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'center' }}>

        {/* ── Wordmark ──────────────────────────── */}
        <View style={{ marginBottom: 70, alignItems: 'flex-start' }}>
          {/* <View style={{ width: 32, height: 2, backgroundColor: '#6366f1', borderRadius: 99, marginBottom: 18, opacity: 0.8 }} /> */}

          <Text style={{ fontSize: 60, lineHeight: 52, letterSpacing: -2 }}>
            <Text style={{ fontWeight: '300', color: isDark ? 'rgba(255,255,255,0.55)' : colors.textSub }}> Store</Text>
            <Text style={{ fontWeight: '900', color: colors.text }}>Ville</Text>
          </Text>

          <Text style={{
            marginTop: 10, fontSize: 10, letterSpacing: 5,
            fontWeight: '600', textTransform: 'uppercase',
            color: colors.textMuted,
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
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surface,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.09)' : colors.border,
                borderRadius: 20, paddingVertical: 18, paddingHorizontal: 20,
              }}
            >
              <View style={{
                width: 42, height: 42, borderRadius: 13,
                backgroundColor: isDark ? 'rgba(245,158,11,0.14)' : 'rgba(245,158,11,0.1)',
                borderWidth: 1, borderColor: isDark ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.2)',
                alignItems: 'center', justifyContent: 'center', marginRight: 16,
              }}>
                <Store color="#f59e0b" size={19} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.2, marginBottom: 2 }}>
                  I'm a Seller
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '500' }}>
                  Manage your store & fulfill orders
                </Text>
              </View>
              <ChevronRight color={colors.textMuted} size={18} strokeWidth={2} />
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
                backgroundColor: isDark ? 'rgba(99,102,241,0.10)' : colors.accentFaint,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)',
                borderRadius: 20, paddingVertical: 18, paddingHorizontal: 20,
              }}
            >
              <View style={{
                width: 42, height: 42, borderRadius: 13,
                backgroundColor: isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.12)',
                borderWidth: 1, borderColor: isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.22)',
                alignItems: 'center', justifyContent: 'center', marginRight: 16,
              }}>
                <ShoppingBag color={colors.accent} size={19} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.2, marginBottom: 2 }}>
                  I'm a Buyer
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '500' }}>
                  Discover stores, cafes & restaurants
                </Text>
              </View>
              <ChevronRight color={colors.accent} size={18} strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>

        </View>
      </View>

      {/* Footer */}
      <View style={{ paddingBottom: 36, alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase' }}>
          © 2026 StoreVille Technology
        </Text>
      </View>
    </View>
  );
}
