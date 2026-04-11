import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar, Dimensions,
  ScrollView, Animated
} from 'react-native';
import { ChevronDown, ArrowRight } from 'lucide-react-native';
import { authClient } from '../../lib/auth-client';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import * as Linking from 'expo-linking';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';

const { width, height } = Dimensions.get('window');

interface Props { navigation: any; }

export function AuthScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();
  const { enterGuestMode } = useAuthStore();
  const isDark = mode === 'dark';
  const { alertState, showAlert, hideAlert } = useAlert();

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  // OTP slide animation
  const otpSlide = useRef(new Animated.Value(30)).current;
  const otpOpacity = useRef(new Animated.Value(0)).current;

  const showOtpStep = () => {
    setOtpSent(true);
    Animated.parallel([
      Animated.spring(otpSlide, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(otpOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const resetOtpStep = () => {
    setOtpSent(false);
    setOtp('');
    otpSlide.setValue(30);
    otpOpacity.setValue(0);
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 9) {
      showAlert({ title: 'Invalid Number', message: 'Enter a valid Ethiopian phone number.', variant: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    setOtpLoading(true);
    try {
      const { error } = await (authClient as any).phoneNumber.sendOtp({
        phoneNumber: `+251${phone.replace(/^0/, '')}`,
      });
      if (error) throw new Error(error.message);
      showOtpStep();
    } catch (e: any) {
      showAlert({ title: 'Send Failed', message: e.message || 'Could not send OTP. Try again.', variant: 'error', buttons: [{ text: 'OK' }] });
    } finally { setOtpLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return;
    setLoading(true);
    try {
      const { error } = await (authClient as any).phoneNumber.verify({
        phoneNumber: `+251${phone.replace(/^0/, '')}`,
        code: otp,
      });
      if (error) throw new Error(error.message);
      // RootNavigator will react to session change automatically
    } catch (e: any) {
      showAlert({ title: 'Verification Failed', message: e.message || 'Invalid OTP. Try again.', variant: 'error', buttons: [{ text: 'Try Again' }] });
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try {
      // 🌟 THE FIX: Use expo-linking to dynamically create the correct deep link.
      // In Expo Go, this creates "exp://<ip>:8081". In production, it creates "storeville://".
      // This prevents the browser from getting stuck because it doesn't know how to handle the URL.
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: Linking.createURL('/'),
      });
      if (error) throw new Error(error.message);
    } catch (e: any) {
      showAlert({ title: 'Sign-In Failed', message: e.message || 'Google sign-in failed. Try again.', variant: 'error', buttons: [{ text: 'OK' }] });
    }
  };

  const handleGuestMode = () => {
    enterGuestMode();
  };

  const accentColor = '#6366f1';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : colors.surface;
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : colors.border;
  const focusBorder = accentColor + '70';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      {/* ── Ambient glow orbs ───────────────────────────────── */}
      <View style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} pointerEvents="none">
        <View style={{
          position: 'absolute', width: width * 1.4, height: width * 1.4,
          borderRadius: width * 0.7, top: -width * 0.5, right: -width * 0.4,
          backgroundColor: accentColor, opacity: isDark ? 0.07 : 0.05,
        }} />
        <View style={{
          position: 'absolute', width: width * 0.9, height: width * 0.9,
          borderRadius: width * 0.45, bottom: height * 0.08, left: -width * 0.2,
          backgroundColor: '#a78bfa', opacity: isDark ? 0.05 : 0.03,
        }} />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 72, paddingBottom: 52 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand Wordmark ──────────────────────────────── */}
        <View style={{ marginBottom: 60 }}>
          <Text style={{ fontSize: 64, lineHeight: 58, letterSpacing: -2.5 }}>
            <Text style={{ fontWeight: '300', color: isDark ? 'rgba(255,255,255,0.45)' : colors.textSub }}>Store</Text>
            <Text style={{ fontWeight: '900', color: colors.text }}>Ville</Text>
          </Text>
          <Text style={{
            marginTop: 12, fontSize: 13, fontWeight: '700',
            letterSpacing: 0.3, color: colors.textMuted, lineHeight: 20,
          }}>
            The Digital Mall of Ethiopia
          </Text>
        </View>

        {/* ── Heading ─────────────────────────────────────── */}
        {!otpSent ? (
          <View style={{ marginBottom: 36 }}>
            <Text style={{ fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: -0.8, marginBottom: 8 }}>
              Welcome.
            </Text>
            <Text style={{ fontSize: 15, color: colors.textMuted, fontWeight: '500', lineHeight: 22 }}>
              Sign in or create your account{'\n'}to get started.
            </Text>
          </View>
        ) : null}

        {/* ── OTP VERIFICATION STEP ───────────────────────── */}
        {otpSent ? (
          <Animated.View style={{
            transform: [{ translateY: otpSlide }],
            opacity: otpOpacity,
          }}>
            {/* Heading */}
            <Text style={{
              fontSize: 28, fontWeight: '900', color: colors.text,
              letterSpacing: -0.8, marginBottom: 6
            }}>Check your phone.</Text>
            <Text style={{ fontSize: 15, color: colors.textMuted, fontWeight: '500', marginBottom: 40, lineHeight: 22 }}>
              We sent a 6-digit code to{'\n'}
              <Text style={{ color: accentColor, fontWeight: '800' }}>+251 {phone}</Text>
            </Text>

            {/* OTP Digit Input */}
            <View style={{
              backgroundColor: cardBg, borderWidth: 1.5,
              borderColor: borderColor,
              borderRadius: 24, paddingVertical: 20, paddingHorizontal: 24,
              marginBottom: 24,
            }}>
              <Text style={{
                fontSize: 10, fontWeight: '800', letterSpacing: 2,
                color: colors.textMuted, textTransform: 'uppercase', marginBottom: 10,
              }}>6-Digit Code</Text>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                placeholder="· · · · · ·"
                placeholderTextColor={colors.textMuted}
                style={{
                  fontSize: 36, fontWeight: '900', letterSpacing: 14,
                  color: colors.text, textAlign: 'center',
                }}
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              activeOpacity={0.85}
              style={{
                backgroundColor: otp.length < 6 ? (isDark ? 'rgba(255,255,255,0.08)' : colors.surfaceAlt) : accentColor,
                borderRadius: 999, paddingVertical: 18,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                shadowColor: accentColor, shadowOffset: { width: 0, height: 10 },
                shadowOpacity: otp.length >= 6 ? 0.4 : 0, shadowRadius: 20, elevation: 6,
                marginBottom: 16,
              }}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <>
                  <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>Verify & Continue</Text>
                  <ArrowRight color="#fff" size={20} />
                </>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={resetOtpStep} style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>
                Wrong number? <Text style={{ color: accentColor, fontWeight: '800' }}>Change</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            {/* ── GOOGLE BUTTON ─────────────────────────────── */}
            <TouchableOpacity
              onPress={handleGoogle}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14,
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
                borderRadius: 999, paddingVertical: 17, marginBottom: 28,
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0 : 0.06, shadowRadius: 12, elevation: 2,
              }}
            >
              {/* Google G logo using SVG-style colored squares */}
              <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900', lineHeight: 22 }}>G</Text>
              </View>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Continue with Google</Text>
            </TouchableOpacity>

            {/* ── DIVIDER ───────────────────────────────────── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: borderColor }} />
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: borderColor }} />
            </View>

            {/* ── PHONE INPUT ──────────────────────────────── */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              {/* Country Selector */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: cardBg, borderWidth: 1,
                borderColor: borderColor, borderRadius: 20,
                paddingHorizontal: 16, paddingVertical: 17,
              }}>
                <Text style={{ fontSize: 20 }}>🇪🇹</Text>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>+251</Text>
                <ChevronDown color={colors.textMuted} size={16} strokeWidth={2} />
              </View>

              {/* Phone number field */}
              <View style={{
                flex: 1, backgroundColor: cardBg, borderWidth: 1.5,
                borderColor: phoneFocused ? focusBorder : borderColor,
                borderRadius: 20, paddingHorizontal: 20, paddingVertical: 17,
              }}>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Mobile number"
                  placeholderTextColor={colors.textMuted}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}
                />
              </View>
            </View>

            {/* ── SIGN IN BUTTON ───────────────────────────── */}
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={otpLoading || phone.length < 7}
              activeOpacity={0.85}
              style={{
                backgroundColor: phone.length < 7 ? (isDark ? 'rgba(255,255,255,0.08)' : colors.surfaceAlt) : accentColor,
                borderRadius: 999, paddingVertical: 18,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                shadowColor: accentColor,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: phone.length >= 7 ? 0.45 : 0,
                shadowRadius: 24, elevation: 8,
                marginBottom: 40,
              }}
            >
              {otpLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>Sign In</Text>
              }
            </TouchableOpacity>
          </>
        )}

        {/* ── GUEST MODE ──────────────────────────────────── */}
        {!otpSent && (
          <View style={{ alignItems: 'center', gap: 20 }}>
            <TouchableOpacity onPress={handleGuestMode} activeOpacity={0.7} style={{ paddingVertical: 10 }}>
              <Text style={{
                color: colors.textMuted, fontSize: 14, fontWeight: '600',
                textDecorationLine: 'underline', textDecorationColor: colors.textMuted,
                textDecorationStyle: 'dotted',
              }}>
                Continue as Guest →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
    </KeyboardAvoidingView>
  );
}
