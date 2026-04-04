import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Store, ShoppingBag, ChefHat } from 'lucide-react-native';

interface Props {
  navigation: any;
}

export function RoleSelectionScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" />
      
      {/* Background gradient overlay */}
      <View className="absolute inset-0 bg-gray-900" />
      
      {/* Content */}
      <View className="flex-1 justify-center items-center px-8">
        
        {/* Logo & Branding */}
        <View className="items-center mb-16">
          <View className="bg-primary-600 p-5 rounded-3xl shadow-lg mb-6">
            <Store color="#ffffff" size={36} />
          </View>
          <Text className="text-4xl font-black text-white tracking-tight">
            Store<Text className="text-primary-400">Ville</Text>
          </Text>
          <Text className="text-gray-400 text-base font-semibold mt-3 text-center">
            The Digital Mall of Ethiopia
          </Text>
        </View>

        {/* Role Selection Cards */}
        <View className="w-full gap-5">
          
          {/* Seller Card */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('OnboardingLogin', { intendedRole: 'SELLER' })}
            className="bg-gray-800 border-2 border-gray-700 rounded-3xl p-6 flex-row items-center"
            activeOpacity={0.7}
          >
            <View className="bg-amber-500/20 p-4 rounded-2xl mr-5">
              <ChefHat color="#f59e0b" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-black mb-1">I'm a Seller</Text>
              <Text className="text-gray-400 text-sm font-medium">Manage your store & fulfill orders</Text>
            </View>
            <Text className="text-gray-500 text-2xl">›</Text>
          </TouchableOpacity>

          {/* Buyer Card */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('OnboardingBuyerEntry')}
            className="bg-primary-600 border-2 border-primary-500 rounded-3xl p-6 flex-row items-center"
            activeOpacity={0.7}
          >
            <View className="bg-white/20 p-4 rounded-2xl mr-5">
              <ShoppingBag color="#ffffff" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-black mb-1">I'm a Buyer</Text>
              <Text className="text-primary-200 text-sm font-medium">Discover stores & shop locally</Text>
            </View>
            <Text className="text-primary-300 text-2xl">›</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Footer */}
      <View className="pb-10 items-center">
        <Text className="text-gray-600 text-xs font-bold tracking-widest uppercase">
          © 2026 StoreVille Technology
        </Text>
      </View>
    </View>
  );
}
