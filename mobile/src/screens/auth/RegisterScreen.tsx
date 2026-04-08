import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform, StatusBar, Dimensions
} from 'react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { MapPin, Coffee, ShoppingBag, ArrowRight } from 'lucide-react-native';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

interface Props {
  route: any;
  navigation: any;
}

export function RegisterScreen({ route, navigation }: Props) {
  const intendedRole = route.params?.intendedRole || 'CUSTOMER';
  const login = useAuthStore(state => state.login);
  const { colors, mode } = useThemeStore();
  const isSeller = intendedRole === 'SELLER';
  const isDark = mode === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const [storeType, setStoreType] = useState<'RETAIL' | 'FOOD'>('RETAIL');
  const [storeDescription, setStoreDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationText, setLocationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const accentColor = isSeller ? '#f59e0b' : '#6366f1';

  const grabLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied', 'GPS access is needed to pin your store.'); return; }
    try {
      const loc = await Location.getLastKnownPositionAsync({});
      const coords = loc?.coords || (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })).coords;
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      setLocationText(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    } catch { Alert.alert('Error', 'Could not get GPS location.'); }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Missing Fields', 'Please fill in name, email and password.'); return; }
    if (isSeller && (!storeName || !storeCategory || !latitude || !longitude)) {
      Alert.alert('Missing Store Info', 'Please fill in store details and set your GPS location.'); return;
    }
    setLoading(true);
    try {
      const payload: any = { name: name.trim(), email: email.trim(), phone_number: phone.trim() || undefined, password, role: intendedRole };
      if (isSeller) {
        payload.store_data = { store_name: storeName.trim(), category: storeCategory.trim(), store_type: storeType, description: storeDescription.trim(), business_type: storeCategory.trim(), latitude, longitude };
      }
      await api.post('/accounts/register/', payload);
      const loginResponse = await api.post('/accounts/login/', { email: email.trim(), password });
      const { access, user } = loginResponse.data;
      let refresh = '';
      const setCookieHeaders = loginResponse.headers['set-cookie'];
      if (setCookieHeaders) {
        const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
        for (const h of headers) {
          if (h.includes('refresh_token=')) { refresh = h.split('refresh_token=')[1].split(';')[0]; break; }
        }
      }
      if (!refresh) throw new Error('No refresh token from server.');
      const zone = user.role === 'SELLER' ? 'seller' : 'buyer';
      await login(user, access, refresh, zone);
      const currentRoute = navigation?.getState()?.routes[navigation.getState().index];
      if (currentRoute?.name === 'Register') navigation.goBack();
    } catch (error: any) {
      const msg = error.response?.data?.email?.[0] || error.response?.data?.password?.[0] || error.response?.data?.detail || error?.message || 'Registration failed.';
      Alert.alert('Registration Failed', msg);
    } finally { setLoading(false); }
  };

  // Theme-aware field style
  const fieldStyle = (field: string) => ({
    backgroundColor: focusedField === field
      ? (isDark ? 'rgba(255,255,255,0.08)' : colors.surface)
      : (isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceAlt),
    borderWidth: 1,
    borderColor: focusedField === field
      ? accentColor + '80'
      : (isDark ? 'rgba(255,255,255,0.08)' : colors.border),
    borderRadius: 16, paddingHorizontal: 18, paddingVertical: 4, marginBottom: 10,
  });

  const inputStyle = { color: colors.text as any, fontSize: 16, fontWeight: '600' as const, paddingVertical: 10 };
  const labelStyle = {
    color: (isDark ? 'rgba(255,255,255,0.3)' : colors.textMuted) as any,
    fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.2,
    textTransform: 'uppercase' as const, marginTop: 12, marginBottom: 2,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      {/* Glow orb */}
      <View style={{
        position: 'absolute', width: width * 1.2, height: width * 1.2,
        borderRadius: width * 0.6, top: -width * 0.5, right: -width * 0.2,
        backgroundColor: accentColor, opacity: isDark ? 0.08 : 0.05,
        pointerEvents: 'none',
      } as any} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 24, paddingTop: 60 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={{ marginBottom: 40 }}>
          {/* <View style={{
            alignSelf: 'flex-start',
            backgroundColor: accentColor + '20', borderWidth: 1, borderColor: accentColor + '40',
            paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, marginBottom: 20,
          }}>
            <Text style={{ color: accentColor, fontSize: 11, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>
              {isSeller ? 'Seller Pro — New Store' : 'Join the Marketplace'}
            </Text>
          </View> */}
          <Text style={{ fontSize: 40, fontWeight: '900', color: colors.text, letterSpacing: -1.2, lineHeight: 46 }}>
            {isSeller ? 'Open Your Store.' : 'Create Account.'}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '500', marginTop: 10 }}>
            {isSeller ? 'Set up your seller profile and go live.' : 'Join thousands of buyers in Ethiopia.'}
          </Text>
        </View>

        {/* Section label */}
        <Text style={{ ...labelStyle, marginBottom: 12 }}>Your Details</Text>

        <View style={fieldStyle('name')}>
          <Text style={labelStyle}>Full Name</Text>
          <TextInput value={name} onChangeText={setName} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} placeholder="Alex Johnson" placeholderTextColor={colors.textMuted} style={inputStyle} />
        </View>

        <View style={fieldStyle('email')}>
          <Text style={labelStyle}>Email Address</Text>
          <TextInput value={email} onChangeText={setEmail} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" placeholderTextColor={colors.textMuted} style={inputStyle} />
        </View>

        <View style={fieldStyle('phone')}>
          <Text style={labelStyle}>Phone</Text>
          <TextInput value={phone} onChangeText={setPhone} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} keyboardType="phone-pad" placeholder="+251 9xx xxx xxx" placeholderTextColor={colors.textMuted} style={inputStyle} />
        </View>

        <View style={{ ...fieldStyle('password'), marginBottom: 28 }}>
          <Text style={labelStyle}>Password</Text>
          <TextInput value={password} onChangeText={setPassword} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} secureTextEntry placeholder="Min 8 characters" placeholderTextColor={colors.textMuted} style={inputStyle} />
        </View>

        {/* Seller-only section */}
        {isSeller && (
          <>
            <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 28 }} />
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 20, letterSpacing: -0.4 }}>Store Details</Text>

            <View style={fieldStyle('storeName')}>
              <Text style={labelStyle}>Store Name</Text>
              <TextInput value={storeName} onChangeText={setStoreName} onFocus={() => setFocusedField('storeName')} onBlur={() => setFocusedField(null)} placeholder="e.g. Addis Brew" placeholderTextColor={colors.textMuted} style={inputStyle} />
            </View>

            <View style={fieldStyle('category')}>
              <Text style={labelStyle}>Category</Text>
              <TextInput value={storeCategory} onChangeText={setStoreCategory} onFocus={() => setFocusedField('category')} onBlur={() => setFocusedField(null)} placeholder="e.g. Cafe, Fashion, Electronics" placeholderTextColor={colors.textMuted} style={inputStyle} />
            </View>

            <View style={{ ...fieldStyle('desc'), marginBottom: 20 }}>
              <Text style={labelStyle}>Description (optional)</Text>
              <TextInput value={storeDescription} onChangeText={setStoreDescription} onFocus={() => setFocusedField('desc')} onBlur={() => setFocusedField(null)} multiline numberOfLines={3} placeholder="A short description of your store..." placeholderTextColor={colors.textMuted} style={{ ...inputStyle, minHeight: 60 }} />
            </View>

            {/* Store Type Toggle */}
            <Text style={{ ...labelStyle, marginBottom: 12 }}>Store Type</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              {([['RETAIL', 'Shop Retail', ShoppingBag, '#6366f1'] as const, ['FOOD', 'Food & Coffee', Coffee, '#f97316'] as const]).map(([type, label, Icon, color]) => (
                <TouchableOpacity
                  key={type} onPress={() => setStoreType(type)} activeOpacity={0.8}
                  style={{
                    flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center',
                    backgroundColor: storeType === type
                      ? color + '20'
                      : (isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceAlt),
                    borderWidth: 1,
                    borderColor: storeType === type
                      ? color + '60'
                      : (isDark ? 'rgba(255,255,255,0.08)' : colors.border),
                  }}
                >
                  <Icon color={storeType === type ? color : colors.textMuted} size={20} />
                  <Text style={{ color: storeType === type ? color : colors.textMuted, fontWeight: '800', marginTop: 6, fontSize: 13 }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* GPS Pin */}
            <Text style={{ ...labelStyle, marginBottom: 12 }}>Store GPS Location</Text>
            <TouchableOpacity onPress={grabLocation} activeOpacity={0.8} style={{
              backgroundColor: latitude ? 'rgba(74,222,128,0.08)' : (isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceAlt),
              borderWidth: 1, borderColor: latitude ? 'rgba(74,222,128,0.3)' : colors.border,
              borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 32,
            }}>
              <MapPin color={latitude ? '#4ade80' : colors.textMuted} size={22} />
              <Text style={{ marginLeft: 12, fontWeight: '700', fontSize: 14, color: latitude ? '#4ade80' : colors.textMuted }}>
                {locationText || 'Tap to pin your store on the map'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Submit */}
        <TouchableOpacity
          onPress={handleRegister} disabled={loading} activeOpacity={0.85}
          style={{
            backgroundColor: loading ? colors.surfaceAlt : accentColor,
            borderRadius: 18, paddingVertical: 18,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            shadowColor: accentColor, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4, shadowRadius: 16, elevation: 8, marginBottom: 20,
          }}
        >
          {loading
            ? <ActivityIndicator color="#ffffff" />
            : <>
                <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '900', letterSpacing: -0.3, marginRight: 8 }}>
                  {isSeller ? 'Launch Store' : 'Create Account'}
                </Text>
                <ArrowRight color="#ffffff" size={20} />
              </>}
        </TouchableOpacity>

        {/* Switch to Login */}
        <TouchableOpacity
          onPress={() => {
            const routeNames = navigation.getState()?.routeNames || [];
            const loginRoute = routeNames.includes('OnboardingLogin') ? 'OnboardingLogin' : 'Auth';
            navigation.navigate(loginRoute, { intendedRole });
          }}
          style={{ alignItems: 'center', paddingVertical: 8 }}
        >
          <Text style={{ color: colors.textSub, fontSize: 14, fontWeight: '500' }}>
            Already have an account?{' '}
            <Text style={{ color: accentColor, fontWeight: '800' }}>Login</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
