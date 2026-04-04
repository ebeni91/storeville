import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { LogIn, UserPlus, Eye, Store } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

interface Props {
  navigation: any;
}

export function BuyerEntryScreen({ navigation }: Props) {
  const enterGuestMode = useAuthStore(state => state.enterGuestMode);

  const handleGuestMode = () => {
    enterGuestMode();
    // RootNavigator re-renders automatically when isGuest becomes true
  };

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" />
      
      <View className="flex-1 justify-center items-center px-8">

        {/* Header */}
        <View className="items-center mb-16">
          <View className="bg-primary-600 p-4 rounded-2xl mb-5">
            <Store color="#ffffff" size={28} />
          </View>
          <Text className="text-3xl font-black text-white tracking-tight text-center">
            Welcome to the{'\n'}Marketplace
          </Text>
          <Text className="text-gray-400 text-base font-medium mt-3 text-center max-w-xs">
            Login for the full experience, or browse as a guest.
          </Text>
        </View>

        {/* Action Cards */}
        <View className="w-full gap-4">
          
          {/* Login */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('OnboardingLogin', { intendedRole: 'CUSTOMER' })}
            className="bg-primary-600 rounded-2xl p-5 flex-row items-center"
            activeOpacity={0.7}
          >
            <View className="bg-white/20 p-3 rounded-xl mr-4">
              <LogIn color="#ffffff" size={22} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-black">Login</Text>
              <Text className="text-primary-200 text-sm font-medium">Access your account</Text>
            </View>
          </TouchableOpacity>

          {/* Register */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('OnboardingRegister', { intendedRole: 'CUSTOMER' })}
            className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex-row items-center"
            activeOpacity={0.7}
          >
            <View className="bg-primary-500/20 p-3 rounded-xl mr-4">
              <UserPlus color="#818cf8" size={22} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-black">Register</Text>
              <Text className="text-gray-400 text-sm font-medium">Create a new account</Text>
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-2">
            <View className="flex-1 h-px bg-gray-700" />
            <Text className="text-gray-500 font-bold text-xs mx-4 tracking-widest uppercase">OR</Text>
            <View className="flex-1 h-px bg-gray-700" />
          </View>

          {/* Guest Mode */}
          <TouchableOpacity 
            onPress={handleGuestMode}
            className="border-2 border-dashed border-gray-600 rounded-2xl p-5 flex-row items-center"
            activeOpacity={0.7}
          >
            <View className="bg-gray-700 p-3 rounded-xl mr-4">
              <Eye color="#9ca3af" size={22} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-300 text-lg font-black">Continue as Guest</Text>
              <Text className="text-gray-500 text-sm font-medium">Browse stores, login later to buy</Text>
            </View>
          </TouchableOpacity>

        </View>
      </View>

      {/* Back button */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="pb-10 items-center"
      >
        <Text className="text-gray-500 font-bold text-sm">← Back to role selection</Text>
      </TouchableOpacity>
    </View>
  );
}
