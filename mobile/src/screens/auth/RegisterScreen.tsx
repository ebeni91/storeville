import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';

interface Props {
  route: any;
  navigation: any;
}

export function RegisterScreen({ route, navigation }: Props) {
  const intendedRole = route.params?.intendedRole || 'CUSTOMER';
  const login = useAuthStore(state => state.login);

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Seller-specific store fields
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const [storeType, setStoreType] = useState<'RETAIL' | 'FOOD'>('RETAIL');
  const [storeDescription, setStoreDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationText, setLocationText] = useState('');

  const [loading, setLoading] = useState(false);

  const grabLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'GPS access is needed to pin your store on the map.');
      return;
    }
    try {
      const loc = await Location.getLastKnownPositionAsync({});
      if (loc) {
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
        setLocationText(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      } else {
        const fresh = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLatitude(fresh.coords.latitude);
        setLongitude(fresh.coords.longitude);
        setLocationText(`${fresh.coords.latitude.toFixed(4)}, ${fresh.coords.longitude.toFixed(4)}`);
      }
    } catch {
      Alert.alert('Error', 'Could not get GPS location.');
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in your name, email, and password.');
      return;
    }

    if (intendedRole === 'SELLER' && (!storeName || !storeCategory || !latitude || !longitude)) {
      Alert.alert('Missing Store Info', 'Please fill in store details and set your GPS location.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        phone_number: phone.trim() || undefined,
        password,
        role: intendedRole,
      };

      if (intendedRole === 'SELLER') {
        payload.store_data = {
          store_name: storeName.trim(),
          category: storeCategory.trim(),
          store_type: storeType,
          description: storeDescription.trim(),
          business_type: storeCategory.trim(),
          latitude,
          longitude,
        };
      }

      // Register
      await api.post('/accounts/register/', payload);

      // Auto-login after registration
      const loginResponse = await api.post('/accounts/login/', { 
        email: email.trim(), 
        password 
      });
      
      const { access, user } = loginResponse.data;

      // Extract refresh from set-cookie header
      let refresh = '';
      const setCookieHeaders = loginResponse.headers['set-cookie'];
      if (setCookieHeaders) {
        const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
        for (const h of headers) {
          if (h.includes('refresh_token=')) {
            refresh = h.split('refresh_token=')[1].split(';')[0];
            break;
          }
        }
      }
      if (!refresh) throw new Error('No refresh token from server.');

      const zone = user.role === 'SELLER' ? 'seller' : 'buyer';
      await login(user, access, refresh, zone);

      // If we are in the Marketplace branch (named 'Register'), dismiss this screen
      // If we are in Onboarding branch, RootNavigator swaps the tree automatically
      const currentRoute = navigation?.getState()?.routes[navigation.getState().index];
      if (currentRoute?.name === 'Register') {
        navigation.goBack();
      }

    } catch (error: any) {
      const msg = error.response?.data?.email?.[0]
               || error.response?.data?.password?.[0]
               || error.response?.data?.detail
               || error.response?.data?.non_field_errors?.[0]
               || error?.message
               || 'Registration failed.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const isSeller = intendedRole === 'SELLER';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-gray-900">
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} className="flex-1 px-6 pt-16">
        
        {/* Header */}
        <Text className="text-3xl font-black text-white mb-2">
          {isSeller ? 'Open Your Store' : 'Create Account'}
        </Text>
        <Text className="text-gray-400 font-medium text-base mb-8">
          {isSeller ? 'Set up your seller profile and store.' : 'Join the marketplace as a buyer.'}
        </Text>

        {/* Common Fields */}
        <Text className="text-gray-400 text-xs font-black tracking-widest uppercase mb-3">Your Details</Text>
        
        <TextInput
          className="bg-gray-800 text-white px-4 py-4 rounded-xl mb-3 text-base border border-gray-700"
          placeholder="Full Name"
          placeholderTextColor="#6b7280"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="bg-gray-800 text-white px-4 py-4 rounded-xl mb-3 text-base border border-gray-700"
          placeholder="Email Address"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          className="bg-gray-800 text-white px-4 py-4 rounded-xl mb-3 text-base border border-gray-700"
          placeholder="Phone Number (optional)"
          placeholderTextColor="#6b7280"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          className="bg-gray-800 text-white px-4 py-4 rounded-xl mb-6 text-base border border-gray-700"
          placeholder="Password (min 8 characters)"
          placeholderTextColor="#6b7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Seller-Only: Store Setup */}
        {isSeller && (
          <>
            <Text className="text-gray-400 text-xs font-black tracking-widest uppercase mb-3 mt-2">Store Details</Text>
            
            <TextInput
              className="bg-gray-800 text-white px-4 py-4 rounded-xl mb-3 text-base border border-gray-700"
              placeholder="Store Name"
              placeholderTextColor="#6b7280"
              value={storeName}
              onChangeText={setStoreName}
            />
            <TextInput
              className="bg-gray-800 text-white px-4 py-4 rounded-xl mb-3 text-base border border-gray-700"
              placeholder="Category (e.g., Fashion, Cafe, Electronics)"
              placeholderTextColor="#6b7280"
              value={storeCategory}
              onChangeText={setStoreCategory}
            />
            <TextInput
              className="bg-gray-800 text-white px-4 py-4 rounded-xl mb-4 text-base border border-gray-700"
              placeholder="Short Description (optional)"
              placeholderTextColor="#6b7280"
              value={storeDescription}
              onChangeText={setStoreDescription}
              multiline
            />

            {/* Store Type Toggle */}
            <Text className="text-gray-400 text-xs font-black tracking-widest uppercase mb-3">Store Type</Text>
            <View className="flex-row gap-3 mb-5">
              <TouchableOpacity 
                onPress={() => setStoreType('RETAIL')}
                className={`flex-1 py-4 rounded-xl items-center border-2 ${storeType === 'RETAIL' ? 'bg-primary-600 border-primary-500' : 'bg-gray-800 border-gray-700'}`}
              >
                <Text className={`font-black ${storeType === 'RETAIL' ? 'text-white' : 'text-gray-400'}`}>Shop Retail</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setStoreType('FOOD')}
                className={`flex-1 py-4 rounded-xl items-center border-2 ${storeType === 'FOOD' ? 'bg-orange-500 border-orange-400' : 'bg-gray-800 border-gray-700'}`}
              >
                <Text className={`font-black ${storeType === 'FOOD' ? 'text-white' : 'text-gray-400'}`}>Food & Coffee</Text>
              </TouchableOpacity>
            </View>

            {/* GPS Location */}
            <Text className="text-gray-400 text-xs font-black tracking-widest uppercase mb-3">Store Location</Text>
            <TouchableOpacity 
              onPress={grabLocation}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex-row items-center mb-6"
            >
              <MapPin color={latitude ? '#4ade80' : '#6b7280'} size={22} />
              <Text className={`ml-3 font-bold text-base ${latitude ? 'text-green-400' : 'text-gray-500'}`}>
                {locationText || 'Tap to get GPS coordinates'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Submit Button */}
        <TouchableOpacity 
          onPress={handleRegister}
          disabled={loading}
          className={`py-5 rounded-2xl items-center ${loading ? 'bg-gray-700' : isSeller ? 'bg-amber-500' : 'bg-primary-600'}`}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-lg font-black">
              {isSeller ? 'Create Store & Register' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Switch to Login */}
        <TouchableOpacity onPress={() => {
          const state = navigation.getState();
          const routeNames = state?.routeNames || [];
          const loginRoute = routeNames.includes('OnboardingLogin') ? 'OnboardingLogin' : 'Auth';
          navigation.navigate(loginRoute, { intendedRole });
        }} className="mt-6 items-center">
          <Text className="text-gray-400 font-medium">
            Already have an account? <Text className="text-primary-400 font-black">Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
