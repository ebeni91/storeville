import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar, Dimensions,
  ScrollView, Animated, Image, StyleSheet
} from 'react-native';
import { Phone, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authClient } from '../../lib/auth-client';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '1094916744734-hdl3nhf5a65poheorak33fpa87qpgrhe.apps.googleusercontent.com',
});

const { width, height } = Dimensions.get('window');

// Load images statically
const mapImageDark = require('../../../assets/images/isometric-dark.jpg');
const mapImageLight = require('../../../assets/images/isometric-light.jpg');

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
  const [socialLoading, setSocialLoading] = useState(false);
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
    } catch (e: any) {
      setLoading(false);
      showAlert({ title: 'Verification Failed', message: e.message || 'Invalid OTP. Try again.', variant: 'error', buttons: [{ text: 'Try Again' }] });
    }
  };

  const handleGoogle = async () => {
    try {
      setSocialLoading(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut().catch(() => {});
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || (userInfo as any).idToken;
      
      if (!idToken) throw new Error("Could not retrieve Google ID Token");

      const { error } = await authClient.signIn.social({
        provider: 'google',
        idToken: { token: idToken },
      });

      if (error) throw new Error(error.message);
      
      // Deliberately NOT setting socialLoading to false here so the spinner 
      // remains perfectly smooth until RootNavigator unmounts this screen.
    } catch (e: any) {
      setSocialLoading(false);
      if (e.code === 'SIGN_IN_CANCELLED' || e.message?.includes('cancel')) {
        return;
      }
      showAlert({ title: 'Sign-In Failed', message: e.message || 'Google sign-in failed. Try again.', variant: 'error', buttons: [{ text: 'OK' }] });
    }
  };

  const accentColor = '#34d399'; // Emerald-mint green based on the prompt design
  const inputBg = isDark ? 'rgba(28, 30, 43, 0.95)' : colors.surfaceAlt;
  const borderColor = isDark ? '#3b3f5c' : colors.border;
  const focusBorder = accentColor;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      {/* ── Background Hero Image ───────────────────────────── */}
      <View style={{ height: height * 0.55, width: '100%', position: 'absolute', top: 0 }}>
        <Image 
          source={isDark ? mapImageDark : mapImageLight} 
          style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
        />
        {/* Gradient overlay to seamlessly blend the image into the background color */}
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.1)', colors.bg]} 
          locations={[0, 0.4, 1]}
          style={{ position: 'absolute', inset: 0 }} 
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 28, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Spacer to push content down below the map */}
          <View style={{ height: height * 0.4 }} />

          {/* ── Heading ─────────────────────────────────────── */}
          {!otpSent ? (
            <View style={{ marginBottom: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.5 }}>
                Get shopping with <Text style={{ color: accentColor, fontWeight: '900' }}>StoreVille</Text>
              </Text>
            </View>
          ) : null}

          {/* ── OTP VERIFICATION STEP ───────────────────────── */}
          {otpSent ? (
            <Animated.View style={{
              transform: [{ translateY: otpSlide }],
              opacity: otpOpacity,
              alignItems: 'center'
            }}>
              <Text style={{
                fontSize: 26, fontWeight: '900', color: colors.text,
                letterSpacing: -0.5, marginBottom: 8
              }}>Check your phone.</Text>
              <Text style={{ fontSize: 16, color: colors.textMuted, fontWeight: '500', marginBottom: 32, lineHeight: 24, textAlign: 'center' }}>
                We sent a 6-digit code to{'\n'}
                <Text style={{ color: accentColor, fontWeight: '800' }}>+251 {phone}</Text>
              </Text>

              {/* OTP Digit Input */}
              <View style={{
                backgroundColor: inputBg, borderWidth: 1.5,
                borderColor: borderColor, width: '100%',
                borderRadius: 999, paddingVertical: 18, paddingHorizontal: 24,
                marginBottom: 24, alignItems: 'center'
              }}>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  placeholder="· · · · · ·"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    fontSize: 32, fontWeight: '900', letterSpacing: 14,
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
                  borderRadius: 999, paddingVertical: 18, width: '100%',
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                  shadowColor: accentColor, shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: otp.length >= 6 ? 0.3 : 0, shadowRadius: 16, elevation: 4,
                  marginBottom: 16,
                }}
              >
                {loading
                  ? <ActivityIndicator color="#000" />
                  : <>
                    <Text style={{ color: '#000', fontSize: 17, fontWeight: '900' }}>Verify & Continue</Text>
                    <ArrowRight color="#000" size={20} />
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
              {/* ── PHONE INPUT ──────────────────────────────── */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
                <View style={{
                  flex: 1, backgroundColor: inputBg, borderWidth: 1.5,
                  borderColor: phoneFocused ? focusBorder : borderColor,
                  borderRadius: 999, paddingHorizontal: 24, paddingVertical: 16,
                  flexDirection: 'row', gap: 14, alignItems: 'center'
                }}>
                  <Phone color={phoneFocused ? accentColor : colors.textMuted} size={22} strokeWidth={2.5} />
                  
                  {/* Phone number field */}
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="Enter your phone number"
                    placeholderTextColor={colors.textSub}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    onSubmitEditing={handleSendOtp}
                    returnKeyType="done"
                    style={{ flex: 1, color: colors.text, fontSize: 16, fontWeight: '600' }}
                  />

                  {phone.length >= 9 && !otpLoading && (
                    <TouchableOpacity onPress={handleSendOtp} hitSlop={10} style={{ padding: 4 }}>
                       <ArrowRight color={accentColor} size={24} />
                    </TouchableOpacity>
                  )}
                  {otpLoading && <ActivityIndicator color={accentColor} size="small" />}

                </View>
              </View>

              {/* ── DIVIDER ───────────────────────────────────── */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28, paddingHorizontal: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: borderColor }} />
                <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600' }}>Or continue with</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: borderColor }} />
              </View>

              {/* ── SOCIAL BUTTONS ROW ────────────────────────── */}
              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
                
                {/* Google Button */}
                <TouchableOpacity
                  onPress={handleGoogle}
                  disabled={socialLoading || loading || otpLoading}
                  activeOpacity={0.85}
                  style={{
                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                    backgroundColor: '#ffffff', borderRadius: 999, paddingVertical: 15,
                    borderWidth: 1, borderColor: '#e5e7eb',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
                    opacity: socialLoading ? 0.7 : 1
                  }}
                >
                  {socialLoading ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <>
                      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900', lineHeight: 22 }}>G</Text>
                      </View>
                      <Text style={{ color: '#000', fontSize: 15, fontWeight: '800' }}>Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Apple Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={{
                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                    backgroundColor: '#ffffff', borderRadius: 999, paddingVertical: 15,
                    borderWidth: 1, borderColor: '#e5e7eb',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
                  }}
                >
                  <Text style={{ color: '#000', fontSize: 18, fontWeight: '900', lineHeight: 22, marginTop: -2 }}></Text>
                  <Text style={{ color: '#000', fontSize: 15, fontWeight: '800' }}>Apple</Text>
                </TouchableOpacity>
              </View>
              
              {/* ── GUEST MODE ──────────────────────────────────── */}
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity onPress={enterGuestMode} activeOpacity={0.7} style={{ paddingVertical: 10 }}>
                  <Text style={{
                    color: colors.textMuted, fontSize: 15, fontWeight: '600',
                    textDecorationColor: colors.textMuted,
                  }}>
                    Continue as Guest
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
    </View>
  );
}
