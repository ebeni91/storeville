import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Animated, Dimensions } from 'react-native';
import { LogIn, UserPlus, Eye } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export function BuyerEntryScreen({ navigation }: Props) {
  const enterGuestMode = useAuthStore(state => state.enterGuestMode);
  const loginScale = useRef(new Animated.Value(1)).current;
  const registerScale = useRef(new Animated.Value(1)).current;

  const pressIn = (anim: Animated.Value) =>
    Animated.timing(anim, { toValue: 0.97, duration: 100, useNativeDriver: true }).start();
  const pressOut = (anim: Animated.Value) =>
    Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }).start();

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000"  backgroundColor="transparent" translucent={true} />

      {/* Ambient glow */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <View style={{
          position: 'absolute', width: width, height: width,
          borderRadius: width * 0.5, top: -width * 0.25, right: -width * 0.25,
          backgroundColor: '#111827', opacity: 0.1,
        }} />
        <View style={{
          position: 'absolute', width: width * 0.8, height: width * 0.8,
          borderRadius: width * 0.4, bottom: 0, left: -width * 0.2,
          backgroundColor: '#111827', opacity: 0.07,
        }} />
      </View>

      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>

        {/* Header */}
        <View style={{ marginBottom: 48 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: 'rgba(129,140,248,0.8)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            Marketplace Access
          </Text>
          <Text style={{ fontSize: 40, fontWeight: '900', color: '#ffffff', letterSpacing: -1.2, lineHeight: 44 }}>
            Welcome{'\n'}
            <Text style={{ color: '#ffffff' }}>Back.</Text>
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, fontWeight: '500', marginTop: 12, lineHeight: 22 }}>
            Sign in for your full experience or{'\n'}continue browsing as a guest.
          </Text>
        </View>

        {/* Login Panel */}
        <Animated.View style={{ transform: [{ scale: loginScale }], marginBottom: 12 }}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => pressIn(loginScale)}
            onPressOut={() => pressOut(loginScale)}
            onPress={() => navigation.navigate('OnboardingLogin', { intendedRole: 'CUSTOMER' })}
            style={{
              backgroundColor: '#111827',
              borderRadius: 22, padding: 22,
              flexDirection: 'row', alignItems: 'center',
            }}
          >
            <View style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center', marginRight: 16,
            }}>
              <LogIn color="#ffffff" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: -0.3 }}>Sign In</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500', marginTop: 2 }}>Access your account & orders</Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Register Panel */}
        <Animated.View style={{ transform: [{ scale: registerScale }], marginBottom: 24 }}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => pressIn(registerScale)}
            onPressOut={() => pressOut(registerScale)}
            onPress={() => navigation.navigate('OnboardingRegister', { intendedRole: 'CUSTOMER' })}
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: 22, padding: 22,
              flexDirection: 'row', alignItems: 'center',
            }}
          >
            <View style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: 'rgba(99,102,241,0.2)',
              borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)',
              alignItems: 'center', justifyContent: 'center', marginRight: 16,
            }}>
              <UserPlus color="#ffffff" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: -0.3 }}>Create Account</Text>
              <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: '500', marginTop: 2 }}>Join the marketplace</Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontWeight: '700', fontSize: 11, marginHorizontal: 16, letterSpacing: 2, textTransform: 'uppercase' }}>OR</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        </View>

        {/* Guest Mode */}
        <TouchableOpacity
          onPress={enterGuestMode}
          activeOpacity={0.7}
          style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', paddingVertical: 16 }}
        >
          <Eye color="rgba(255,255,255,0.3)" size={16} />
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontWeight: '700', fontSize: 14, marginLeft: 8 }}>
            Continue as Guest
          </Text>
        </TouchableOpacity>

      </View>

      {/* Back */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ paddingBottom: 40, alignItems: 'center' }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.2)', fontWeight: '700', fontSize: 13 }}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}
