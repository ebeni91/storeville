import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, 
  Modal, ScrollView, RefreshControl, Alert 
} from 'react-native';
import { 
  ClipboardList, CheckCircle, Clock, Package, 
  Truck, X, Eye, MapPin, ChefHat 
} from 'lucide-react-native';
import { api } from '../../lib/api';

export function SellerOrdersScreen() {
  const [store, setStore] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const storeRes = await api.get('/stores/manage/');
      const currentStore = storeRes.data?.results?.[0] || storeRes.data?.[0];
      if (!currentStore) return;
      
      setStore(currentStore);
      const isFood = currentStore.store_type === 'FOOD';
      
      const res = await api.get(isFood ? '/orders/food/' : '/orders/retail/');
      setOrders(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const isFood = store?.store_type === 'FOOD';

  const foodStatuses = ['PENDING', 'ACCEPTED', 'COOKING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  const retailStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const availableStatuses = isFood ? foodStatuses : retailStatuses;

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const endpoint = isFood ? `/orders/food/${orderId}/` : `/orders/retail/${orderId}/`;
      await api.patch(endpoint, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-700';
      case 'COOKING': return 'bg-orange-100 text-orange-700';
      case 'PROCESSING': return 'bg-purple-100 text-purple-700';
      case 'READY': return 'bg-indigo-100 text-indigo-700';
      case 'SHIPPED': 
      case 'OUT_FOR_DELIVERY': return 'bg-indigo-100 text-indigo-700';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderOrder = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => setSelectedOrder(item)}
      className="bg-white p-5 rounded-[2rem] mb-4 border border-gray-100 shadow-sm flex-row justify-between items-center"
      activeOpacity={0.8}
    >
      <View>
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="font-black text-gray-900 text-xl tracking-tight">#{item.id.substring(0,8).toUpperCase()}</Text>
          {isFood && item.is_asap && (
            <View className="bg-red-100 px-2 py-0.5 rounded-full"><Text className="text-[10px] text-red-700 font-bold uppercase">ASAP</Text></View>
          )}
        </View>
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
        <View className={`px-3 py-1.5 rounded-full self-start ${getStatusColor(item.status).split(' ')[0]}`}>
          <Text className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(item.status).split(' ')[1]}`}>
            {item.status.replace(/_/g, ' ')}
          </Text>
        </View>
      </View>
      
      <View className="items-end">
        <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">User #{item.customer}</Text>
        <Text className="font-black text-gray-900 text-xl">Br {parseFloat(item.total_amount).toFixed(2)}</Text>
        <View className="bg-gray-50 p-2 rounded-xl mt-3">
          <Eye size={20} color="#4f46e5" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pt-16 pb-4 px-6 bg-white border-b border-gray-100 rounded-b-3xl">
        <View className="flex-row items-center justify-between">
           <View>
             <Text className="text-3xl font-black text-gray-900 tracking-tighter flex-row items-center">
               Fulfillment
             </Text>
             <Text className="text-sm font-semibold text-gray-500">Manage incoming orders</Text>
           </View>
           <View className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center">
             <ClipboardList size={24} color="#374151" />
           </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#4f46e5"/></View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
          ListEmptyComponent={
            <View className="items-center justify-center p-10 mt-10">
              <ClipboardList size={48} color="#9ca3af" />
              <Text className="text-center font-black text-xl text-gray-400 mt-4">No active orders</Text>
              <Text className="text-center text-sm font-semibold text-gray-400 mt-2">Orders placed by customers will appear here.</Text>
            </View>
          }
        />
      )}

      {/* Order Details Modal */}
      <Modal visible={!!selectedOrder} animationType="slide" presentationStyle="pageSheet">
        {selectedOrder && (
          <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row justify-between items-center p-6 border-b border-gray-100 bg-white">
              <View>
                <Text className="text-2xl font-black text-gray-900 tracking-tight flex-row items-center">
                  #{selectedOrder.id.substring(0,8).toUpperCase()}
                  {isFood && selectedOrder.is_asap && <Text className="text-[10px] text-red-700 bg-red-100 px-2 py-1 rounded ml-2 uppercase"> ASAP</Text>}
                </Text>
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedOrder(null)} className="p-2 bg-gray-100 rounded-full">
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6">
              {/* Status Update Block */}
              <View className="bg-gray-50 p-5 rounded-3xl border border-gray-100 mb-6">
                <Text className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">Order Status</Text>
                <View className="flex-row flex-wrap gap-2">
                  {availableStatuses.map(status => {
                    const isSelected = selectedOrder.status === status;
                    return (
                      <TouchableOpacity 
                        key={status} 
                        onPress={() => handleUpdateStatus(selectedOrder.id, status)}
                        disabled={isUpdating}
                        className={`px-4 py-2.5 rounded-xl border ${isSelected ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`}
                      >
                        <Text className={`font-bold text-xs uppercase tracking-widest ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                          {status.replace(/_/g, ' ')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {isUpdating && <ActivityIndicator color="#4f46e5" style={{ position: 'absolute', right: 20, top: 20 }}/>}
              </View>

              {/* Location Block */}
              <View className="mb-6">
                <Text className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">Location Details</Text>
                <View className="bg-white border border-gray-100 shadow-sm p-4 rounded-2xl flex-row items-start">
                  <MapPin size={20} color="#4f46e5" className="mt-1 mr-3" />
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900 text-sm leading-5">
                      {isFood ? selectedOrder.delivery_address : selectedOrder.shipping_address}
                    </Text>
                    {isFood && selectedOrder.delivery_instructions && (
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        <Text className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Instructions:</Text>
                        <Text className="text-xs font-medium text-gray-600 italic">"{selectedOrder.delivery_instructions}"</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Items Block */}
              <View className="mb-10">
                <Text className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3">Items ({selectedOrder.items?.length || 0})</Text>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <View key={idx} className="bg-white border border-gray-100 shadow-sm p-4 rounded-2xl mb-3">
                    <View className="flex-row justify-between items-start mb-1">
                      <View className="flex-1 mr-4">
                        <Text className="font-black text-gray-900 text-[15px]">{isFood ? item.menu_item_name : item.product_name}</Text>
                        <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Qty: {item.quantity}</Text>
                      </View>
                      <Text className="font-black text-gray-900">Br {parseFloat(item.price_at_time).toFixed(2)}</Text>
                    </View>
                    {isFood && item.special_requests && (
                      <View className="bg-orange-50 border border-orange-100 px-3 py-2 rounded-xl mt-2">
                        <Text className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-0.5">Note:</Text>
                        <Text className="text-xs font-bold text-orange-800">"{item.special_requests}"</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Total Footer */}
            <View className="bg-gray-900 p-6 pt-5 bg-black pb-12 rounded-t-[2rem]">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white/70 font-bold text-sm">{isFood ? 'Delivery Fee' : 'Shipping Fee'}</Text>
                <Text className="text-white/70 font-bold text-sm">Br {parseFloat(isFood ? selectedOrder.delivery_fee : selectedOrder.shipping_fee).toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between items-center border-t border-white/10 pt-3">
                <Text className="text-white font-black uppercase tracking-widest text-sm">Total</Text>
                <Text className="text-white font-black text-2xl">Br {parseFloat(selectedOrder.total_amount).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}
      </Modal>

    </View>
  );
}
