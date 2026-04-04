import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Package, Clock, CheckCircle, XCircle, Truck, LogIn } from 'lucide-react-native';

export function OrdersScreen() {
  const { isAuthenticated, isGuest } = useAuthStore();
  const selectedGateway = useAuthStore(state => state.selectedGateway);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['buyer-orders', selectedGateway],
    enabled: isAuthenticated && !isGuest,
    queryFn: async () => {
      const endpoint = selectedGateway === 'FOOD' ? '/orders/food/' : '/orders/retail/';
      const response = await api.get(endpoint);
      return response.data.results || response.data;
    }
  });

  if (!isAuthenticated || isGuest) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="bg-gray-200 p-5 rounded-2xl mb-5">
          <LogIn color="#9ca3af" size={32} />
        </View>
        <Text className="text-xl font-black text-gray-900 text-center">Login to View Orders</Text>
        <Text className="text-gray-500 font-medium mt-2 text-center">Sign in to see your order history and track deliveries.</Text>
      </View>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' };
      case 'ACCEPTED': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle, label: 'Accepted' };
      case 'COOKING': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock, label: 'In Kitchen' };
      case 'PROCESSING': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package, label: 'Processing' };
      case 'SHIPPED': return { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Truck, label: 'Shipped' };
      case 'READY': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Ready' };
      case 'OUT_FOR_DELIVERY': return { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Truck, label: 'On the Way' };
      case 'DELIVERED': return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Delivered' };
      case 'CANCELLED': return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Cancelled' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: status };
    }
  };

  const renderOrder = ({ item }: { item: any }) => {
    const statusInfo = getStatusStyle(item.status);
    const StatusIcon = statusInfo.icon;
    return (
      <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-gray-900 text-lg font-black">{item.store_name || 'Store Order'}</Text>
            <Text className="text-gray-400 text-xs font-medium mt-1">
              {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <View className={`flex-row items-center px-3 py-1.5 rounded-full ${statusInfo.bg}`}>
            <StatusIcon color="currentColor" size={14} />
            <Text className={`font-bold text-xs ml-1 ${statusInfo.text}`}>{statusInfo.label}</Text>
          </View>
        </View>
        <View className="h-px bg-gray-100 my-2" />
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-gray-500 font-medium">{item.items?.length || 0} items</Text>
          <Text className="text-primary-600 text-lg font-black">{parseFloat(item.total_amount).toFixed(2)} Birr</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pt-16 pb-4 px-6 bg-white border-b border-gray-100">
        <Text className="text-2xl font-black text-gray-900">My Orders</Text>
        <Text className="text-gray-400 font-medium mt-1">
          {selectedGateway === 'FOOD' ? 'Food & Coffee Orders' : 'Retail Orders'}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={orders || []}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Package color="#d1d5db" size={48} />
              <Text className="text-gray-400 text-lg font-bold mt-4">No orders yet</Text>
              <Text className="text-gray-400 mt-1">Your orders will appear here.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
