import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator,
  StatusBar, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Eye, EyeOff, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Props {
  route?: any;
  navigation?: any;
}

export function LoginScreen({ route, navigation }: Props) {
  const intendedRole = route?.params?.intendedRole || 'CUSTOMER';
  const isSeller = intendedRole === 'SELLER';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const login = useAuthStore(state => state.login);
  const enterGuestMode = useAuthStore(state => state.enterGuestMode);
  const { colors, mode } = useThemeStore();

  const isDark = mode === 'dark';
  const accentColor = isSeller ? '#f59e0b' : '#6366f1';

  const getRegisterRoute = () => {
    const routeNames = navigation?.getState()?.routeNames || [];
    if (routeNames.includes('OnboardingRegister')) return 'OnboardingRegister';
    return 'Register';
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const response = await api.post('/accounts/login/', { email: email.trim(), password });
      const { access, user } = response.data;

      let refresh = '';
      const setCookieHeaders = response.headers['set-cookie'];
      if (setCookieHeaders) {
        const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
        for (const h of headers) {
          if (h.includes('refresh_token=')) {
            refresh = h.split('refresh_token=')[1].split(';')[0];
            break;
          }
        }
      }
      if (!refresh) throw new Error('Security Error: No refresh token supplied by server.');

      const zone = user.role === 'SELLER' ? 'seller' : 'buyer';
      await login(user, access, refresh, zone);

      const currentRoute = navigation?.getState()?.routes[navigation.getState().index];
      if (currentRoute?.name === 'Auth') navigation.goBack();
    } catch (error: any) {
      const msg = error.response?.data?.detail
        || error.response?.data?.email?.[0]
        || error.response?.data?.non_field_errors?.[0]
        || error?.message
        || 'Invalid credentials';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic field styles based on theme
  const fieldBg = (focused: boolean) => isDark
    ? (focused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)')
    : (focused ? colors.surface : colors.surfaceAlt);

  const fieldBorder = (focused: boolean) => isDark
    ? (focused ? accentColor + '60' : 'rgba(255,255,255,0.07)')
    : (focused ? accentColor + '80' : colors.border);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      {/* Glow orb */}
      <View style={{
        position: 'absolute', width: width * 1.2, height: width * 1.2,
        borderRadius: width * 0.6, top: -width * 0.5, left: -width * 0.1,
        backgroundColor: accentColor, opacity: isDark ? 0.07 : 0.05,
      }} />

      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>

        {/* Wordmark + header */}
        <View style={{ marginBottom: 44 }}>
          <Text style={{ fontSize: 38, lineHeight: 38, letterSpacing: -1.5, marginBottom: 20 }}>
            <Text style={{ fontWeight: '300', color: isDark ? 'rgba(255,255,255,0.5)' : colors.textSub }}>Store</Text>
            <Text style={{ fontWeight: '900', color: colors.text }}>Ville</Text>
          </Text>
          {/* <View style={{ width: 80, height: 1.5, backgroundColor: accentColor, borderRadius: 99, marginBottom: 16, opacity: 0.7 }} /> */}

          {/* <Text style={{ fontSize: 13, fontWeight: '600', color: accentColor, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, opacity: 0.8 }}>
            {isSeller ? 'Seller Portal' : 'Marketplace'}
          </Text> */}
          <Text style={{ fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: -0.8, lineHeight: 34 }}>
            {isSeller ? 'Welcome back' : 'Sign in to continue.'}
          </Text>

        </View>

        {/* Fields */}
        <View style={{ gap: 10, marginBottom: 24 }}>
          {/* Email */}
          <View style={{
            backgroundColor: fieldBg(focusedField === 'email'),
            borderWidth: 1,
            borderColor: fieldBorder(focusedField === 'email'),
            borderRadius: 16, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8,
          }}>
            <Text style={{ color: isDark ? 'rgba(255,255,255,0.28)' : colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
              Email
            </Text>
            <TextInput
              value={email} onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none" keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              style={{ color: colors.text, fontSize: 16, fontWeight: '600', paddingVertical: 6 }}
            />
          </View>

          {/* Password */}
          <View style={{
            backgroundColor: fieldBg(focusedField === 'password'),
            borderWidth: 1,
            borderColor: fieldBorder(focusedField === 'password'),
            borderRadius: 16, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8,
            flexDirection: 'row', alignItems: 'center',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: isDark ? 'rgba(255,255,255,0.28)' : colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                Password
              </Text>
              <TextInput
                value={password} onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={{ color: colors.text, fontSize: 16, fontWeight: '600', paddingVertical: 6 }}
              />
            </View>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingLeft: 12, paddingBottom: 2 }}>
              {showPassword
                ? <EyeOff color={colors.textMuted} size={18} />
                : <Eye color={colors.textMuted} size={18} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In CTA */}
        <TouchableOpacity
          onPress={handleLogin} disabled={loading} activeOpacity={0.85}
          style={{
            backgroundColor: loading ? colors.surfaceAlt : accentColor,
            borderRadius: 16, paddingVertical: 17,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            shadowColor: accentColor, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35, shadowRadius: 16, elevation: 8, marginBottom: 14,
          }}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <>
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '800', letterSpacing: -0.2, marginRight: 8 }}>Sign In</Text>
                <ArrowRight color="#ffffff" size={18} strokeWidth={2.5} />
              </>}
        </TouchableOpacity>

        {/* Register link */}
        <TouchableOpacity
          onPress={() => navigation?.navigate(getRegisterRoute(), { intendedRole })}
          style={{ alignItems: 'center', marginBottom: 28 }}
        >
          <Text style={{ color: colors.textSub, fontSize: 14, fontWeight: '600' }}>
            New here?{'  '}
            <Text style={{ color: accentColor, fontWeight: '800' }}>Create Account</Text>
          </Text>
        </TouchableOpacity>

        {/* Guest mode — only for buyers */}
        {!isSeller && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 10, marginHorizontal: 14, letterSpacing: 2.5, textTransform: 'uppercase' }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>
            <TouchableOpacity
              onPress={enterGuestMode}
              activeOpacity={0.7}
              style={{ alignItems: 'center', paddingVertical: 12 }}
            >
              <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 14 }}>
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Back */}
        {/* <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={{ alignItems: 'center', paddingVertical: 20, marginTop: 4 }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity> */}

      </View>
    </KeyboardAvoidingView>
  );
}
