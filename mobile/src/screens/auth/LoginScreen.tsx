import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { LogIn } from 'lucide-react-native';

interface Props {
  route?: any;
  navigation?: any;
}

export function LoginScreen({ route, navigation }: Props) {
  const intendedRole = route?.params?.intendedRole || 'CUSTOMER';
  const isSeller = intendedRole === 'SELLER';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);

  // Figure out the correct Register screen name based on which navigator we're in
  const getRegisterRoute = () => {
    const state = navigation?.getState();
    const routeNames = state?.routeNames || [];
    if (routeNames.includes('OnboardingRegister')) return 'OnboardingRegister';
    if (routeNames.includes('Register')) return 'Register';
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
      
      if (!refresh) throw new Error("Security Error: No refresh token supplied by server.");
      
      const zone = user.role === 'SELLER' ? 'seller' : 'buyer';
      await login(user, access, refresh, zone);
      
      // If we are in the Marketplace branch (named 'Auth'), dismiss this screen
      // If we are in Onboarding branch, RootNavigator swaps the tree automatically
      const currentRoute = navigation?.getState()?.routes[navigation.getState().index];
      if (currentRoute?.name === 'Auth') {
        navigation.goBack();
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail 
                        || error.response?.data?.email?.[0] 
                        || error.response?.data?.non_field_errors?.[0]
                        || error?.message 
                        || 'Invalid credentials';
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-gray-900 px-6">
      <StatusBar barStyle="light-content" />
      
      <View className="items-center mb-10">
        <View className={`p-4 rounded-2xl mb-4 ${isSeller ? 'bg-amber-500/20' : 'bg-primary-500/20'}`}>
          <LogIn color={isSeller ? '#f59e0b' : '#818cf8'} size={28} />
        </View>
        <Text className="text-3xl font-black text-white">
          {isSeller ? 'Seller Login' : 'Welcome Back'}
        </Text>
        <Text className="text-gray-400 font-medium mt-2">Sign in to your account</Text>
      </View>

      <TextInput
        className="bg-gray-800 text-white px-4 py-4 rounded-xl mb-3 text-base border border-gray-700"
        placeholder="Email Address"
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        className="bg-gray-800 text-white px-4 py-4 rounded-xl mb-6 text-base border border-gray-700"
        placeholder="Password"
        placeholderTextColor="#6b7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        className={`py-5 rounded-2xl items-center ${loading ? 'bg-gray-700' : isSeller ? 'bg-amber-500' : 'bg-primary-600'}`}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-lg font-black">Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Switch to Register */}
      <TouchableOpacity 
        onPress={() => navigation?.navigate(getRegisterRoute(), { intendedRole })} 
        className="mt-6 items-center"
      >
        <Text className="text-gray-400 font-medium">
          Don't have an account? <Text className="text-primary-400 font-black">Register</Text>
        </Text>
      </TouchableOpacity>

      {/* Back */}
      <TouchableOpacity onPress={() => navigation?.goBack()} className="mt-8 items-center">
        <Text className="text-gray-600 font-bold text-sm">← Go back</Text>
      </TouchableOpacity>
    </View>
  );
}
