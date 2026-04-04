import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TrendingUp, Package, ClipboardList, Clock, Store, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

export function SellerHomeScreen({ navigation }: { navigation: any }) {
  const { user } = useAuthStore();
  const identifier = user?.email || user?.phone_number || 'Seller';
  const [store, setStore] = useState<any>(null);
  const [stats, setStats] = useState({ sales: 0, pendingOrders: 0, activeItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Get Store Profile
      const storeRes = await api.get('/stores/manage/');
      const currentStore = storeRes.data?.results?.[0] || storeRes.data?.[0];
      
      if (currentStore) {
        setStore(currentStore);
        const isFood = currentStore.store_type === 'FOOD';
        
        // 2. Parallel fetch orders and products to calculate KPIs
        const ordersPromise = api.get(isFood ? '/orders/food/' : '/orders/retail/');
        const itemsPromise = api.get(isFood ? `/food/items/?store_id=${currentStore.id}` : `/retail/products/?store_id=${currentStore.id}`);

        const [ordersRes, itemsRes] = await Promise.all([ordersPromise, itemsPromise]);
        
        const orders = ordersRes.data?.results || ordersRes.data || [];
        const items = itemsRes.data?.results || itemsRes.data || [];

        // Compute KPIs
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysSales = orders
          .filter((o: any) => o.created_at.startsWith(todayStr) && o.status !== 'CANCELLED')
          .reduce((sum: number, o: any) => sum + parseFloat(o.total_amount), 0);
        
        const pending = orders.filter((o: any) => o.status === 'PENDING').length;
        const activeItemCount = items.filter((i: any) => (isFood ? i.is_available : i.is_active)).length;

        setStats({
          sales: todaysSales,
          pendingOrders: pending,
          activeItems: activeItemCount
        });
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const isFood = store?.store_type === 'FOOD';

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
    >
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-white border-b border-gray-100 rounded-b-3xl">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-black text-gray-900 tracking-tighter mb-1">Dashboard</Text>
            <Text className="text-gray-500 font-semibold text-sm">Welcome back, {identifier}</Text>
          </View>
          <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isFood ? 'bg-orange-100' : 'bg-indigo-100'}`}>
            <Store size={24} color={isFood ? '#ea580c' : '#4f46e5'} />
          </View>
        </View>
      </View>

      {/* KPI Cards */}
      <View className="p-6">
        <View className="flex-row flex-wrap justify-between">
          
          <TouchableOpacity 
            className="w-full bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 mb-4 flex-row items-center"
            activeOpacity={0.8}
          >
            <View className="w-14 h-14 bg-emerald-100 rounded-[1.25rem] items-center justify-center mr-4">
              <TrendingUp size={24} color="#059669" />
            </View>
            <View>
              <Text className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Today's Sales</Text>
              <Text className="text-2xl font-black text-gray-900">Br {stats.sales.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Orders')}
            className="w-[48%] bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 mb-4 items-start"
            activeOpacity={0.8}
          >
            <View className="w-12 h-12 bg-orange-100 rounded-2xl items-center justify-center mb-3">
              <Clock size={20} color="#ea580c" />
            </View>
            <Text className="text-2xl font-black text-gray-900 mb-1">{stats.pendingOrders}</Text>
            <Text className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Pending Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Products')}
            className="w-[48%] bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 mb-4 items-start"
            activeOpacity={0.8}
          >
            <View className="w-12 h-12 bg-indigo-100 rounded-2xl items-center justify-center mb-3">
              <Package size={20} color="#4f46e5" />
            </View>
            <Text className="text-2xl font-black text-gray-900 mb-1">{stats.activeItems}</Text>
            <Text className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Active {isFood ? 'Menu' : 'Products'}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View className="mt-4 bg-white rounded-3xl p-2 border border-gray-100 shadow-sm">
           <TouchableOpacity 
             onPress={() => navigation.navigate('Settings')}
             className="flex-row items-center justify-between p-4 border-b border-gray-50"
           >
              <View className="flex-row items-center">
                 <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-3">
                   <Store size={18} color="#6b7280" />
                 </View>
                 <Text className="font-bold text-gray-900">Store Profile Setup</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" />
           </TouchableOpacity>
           <TouchableOpacity 
             onPress={() => navigation.navigate('Orders')}
             className="flex-row items-center justify-between p-4"
           >
              <View className="flex-row items-center">
                 <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-3">
                   <ClipboardList size={18} color="#6b7280" />
                 </View>
                 <Text className="font-bold text-gray-900">Fulfillment Hub</Text>
              </View>
              <ChevronRight size={18} color="#9ca3af" />
           </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}
