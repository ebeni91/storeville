import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Coffee, ShoppingBag, Store } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

interface Props {
  navigation: any;
}

export function GatewayChoiceScreen({ navigation }: Props) {
  const setGateway = useAuthStore(state => state.setGateway);
  const user = useAuthStore(state => state.user);
  const isGuest = useAuthStore(state => state.isGuest);

  const handleGateway = async (type: 'FOOD' | 'RETAIL') => {
    await setGateway(type);
    // RootNavigator conditionally re-renders — ExploreTabs will mount automatically
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <View className="flex-1 justify-center items-center px-8">
        
        {/* Greeting */}
        <View className="items-center mb-14">
          <View className="bg-primary-100 p-4 rounded-2xl mb-5">
            <Store color="#4f46e5" size={28} />
          </View>
          <Text className="text-3xl font-black text-gray-900 tracking-tight text-center">
            {isGuest ? 'What are you\nlooking for?' : `Hey ${user?.first_name || 'there'}! 👋`}
          </Text>
          <Text className="text-gray-500 text-base font-medium mt-3 text-center max-w-xs">
            Choose your experience to discover stores near you.
          </Text>
        </View>

        {/* Gateway Cards */}
        <View className="w-full gap-5">
          
          {/* Food & Coffee */}
          <TouchableOpacity 
            onPress={() => handleGateway('FOOD')}
            className="bg-gradient-to-r rounded-3xl overflow-hidden border-2 border-orange-100"
            activeOpacity={0.8}
          >
            <View className="bg-orange-50 p-7 flex-row items-center">
              <View className="bg-orange-500 p-5 rounded-2xl mr-5 shadow-lg">
                <Coffee color="#ffffff" size={30} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-xl font-black mb-1">Order Food & Coffee</Text>
                <Text className="text-gray-500 text-sm font-medium">Cafes, Restaurants, Bakeries & Hotels</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Shop Retail */}
          <TouchableOpacity 
            onPress={() => handleGateway('RETAIL')}
            className="rounded-3xl overflow-hidden border-2 border-primary-100"
            activeOpacity={0.8}
          >
            <View className="bg-primary-50 p-7 flex-row items-center">
              <View className="bg-primary-600 p-5 rounded-2xl mr-5 shadow-lg">
                <ShoppingBag color="#ffffff" size={30} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-xl font-black mb-1">Shop Retail</Text>
                <Text className="text-gray-500 text-sm font-medium">Electronics, Fashion, Home & Art</Text>
              </View>
            </View>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}
