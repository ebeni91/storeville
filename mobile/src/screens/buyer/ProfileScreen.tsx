import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { User, LogOut, ShoppingBag, Coffee, ChevronRight, LogIn, Settings, HelpCircle } from 'lucide-react-native';

interface Props {
  navigation: any;
}

export function ProfileScreen({ navigation }: Props) {
  const { user, isAuthenticated, isGuest, logout, selectedGateway, setGateway } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    // Will automatically re-render to RoleSelection via RootNavigator
  };

  const handleSwitchGateway = async () => {
    const newGateway = selectedGateway === 'FOOD' ? 'RETAIL' : 'FOOD';
    await setGateway(newGateway);
  };

  // Guest view
  if (!isAuthenticated || isGuest) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <View className="bg-gray-200 p-5 rounded-2xl mb-5">
          <User color="#9ca3af" size={32} />
        </View>
        <Text className="text-xl font-black text-gray-900 text-center">Guest Mode</Text>
        <Text className="text-gray-500 font-medium mt-2 text-center mb-8">Login to access your profile, order history, and favorites.</Text>
        <TouchableOpacity 
          onPress={() => navigation.getParent()?.navigate('Auth', { intendedRole: 'CUSTOMER' })} 
          className="bg-primary-600 px-8 py-4 rounded-2xl flex-row items-center"
        >
          <LogIn color="#ffffff" size={20} />
          <Text className="text-white font-black text-lg ml-3">Login / Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-white pt-16 pb-6 px-6 border-b border-gray-100">
        <View className="flex-row items-center">
          <View className="bg-primary-100 w-16 h-16 rounded-2xl items-center justify-center mr-4">
            <Text className="text-primary-600 text-2xl font-black">
              {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-xl font-black">
              {user?.first_name} {user?.last_name}
            </Text>
            <Text className="text-gray-500 font-medium">{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View className="px-6 mt-6">
        <Text className="text-gray-400 text-xs font-black tracking-widest uppercase mb-3">Preferences</Text>
        
        {/* Switch Gateway */}
        <TouchableOpacity 
          onPress={handleSwitchGateway}
          className="bg-white rounded-2xl p-4 flex-row items-center mb-3 border border-gray-100"
        >
          {selectedGateway === 'FOOD' ? <Coffee color="#f97316" size={22} /> : <ShoppingBag color="#4f46e5" size={22} />}
          <View className="flex-1 ml-4">
            <Text className="text-gray-900 font-bold">Active Gateway</Text>
            <Text className="text-gray-500 text-sm">{selectedGateway === 'FOOD' ? 'Food & Coffee' : 'Shop Retail'}</Text>
          </View>
          <Text className="text-primary-600 font-bold text-sm">Switch</Text>
        </TouchableOpacity>

        <Text className="text-gray-400 text-xs font-black tracking-widest uppercase mb-3 mt-6">Account</Text>
        
        <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center mb-3 border border-gray-100">
          <Settings color="#6b7280" size={22} />
          <Text className="text-gray-900 font-bold ml-4 flex-1">Account Settings</Text>
          <ChevronRight color="#d1d5db" size={20} />
        </TouchableOpacity>

        <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center mb-3 border border-gray-100">
          <HelpCircle color="#6b7280" size={22} />
          <Text className="text-gray-900 font-bold ml-4 flex-1">Help & Support</Text>
          <ChevronRight color="#d1d5db" size={20} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-50 rounded-2xl p-4 flex-row items-center mt-6 border border-red-100"
        >
          <LogOut color="#ef4444" size={22} />
          <Text className="text-red-500 font-black ml-4">Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center py-10">
        <Text className="text-gray-300 text-xs font-bold tracking-widest">STOREVILLE v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
