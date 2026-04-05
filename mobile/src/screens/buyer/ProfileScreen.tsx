import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions, LogBox } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { User, LogOut, ShoppingBag, Heart, MapPin, Settings, ChevronRight, LogIn, Coffee, Package, Truck, Clock, CheckCircle, AlertCircle, Lock, CreditCard, X } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

import { AddressModal } from '../../components/profile/AddressModal';
import { ProfileModal } from '../../components/profile/ProfileModal';
import { PaymentModal } from '../../components/profile/PaymentModal';
import { OrderDetailsModal } from '../../components/profile/OrderDetailsModal';

const { width } = Dimensions.get('window');

// Fetchers
const fetchAddresses = async () => { const res = await api.get('/accounts/addresses/'); return res.data.results || res.data; }
const fetchPaymentMethods = async () => { const res = await api.get('/accounts/payment-methods/'); return res.data.results || res.data; }
const fetchRetailFavorites = async () => { const res = await api.get('/retail/favorites/'); return res.data.results || res.data; }
const fetchFoodFavorites = async () => { const res = await api.get('/food/favorites/'); return res.data.results || res.data; }
const fetchRetailOrders = async () => { const res = await api.get('/orders/retail/'); return res.data.results || res.data; }
const fetchFoodOrders = async () => { const res = await api.get('/orders/food/'); return res.data.results || res.data; }

interface Props {
  navigation: any;
}

export function ProfileScreen({ navigation }: Props) {
  const { user, isAuthenticated, isGuest, logout, selectedGateway, setGateway, accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  // Modals state
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<any>(null);
  
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<any>(null);

  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Queries
  const { data: addresses = [], isLoading: isLoadingA } = useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses, enabled: !!accessToken && !isGuest });
  const { data: paymentMethods = [] } = useQuery({ queryKey: ['paymentMethods'], queryFn: fetchPaymentMethods, enabled: !!accessToken && !isGuest });
  const { data: retailFavorites = [], isLoading: isLoadingRF } = useQuery({ queryKey: ['retailFavorites'], queryFn: fetchRetailFavorites, enabled: !!accessToken && !isGuest });
  const { data: foodFavorites = [], isLoading: isLoadingFF } = useQuery({ queryKey: ['foodFavorites'], queryFn: fetchFoodFavorites, enabled: !!accessToken && !isGuest });
  const { data: retailOrders = [], isLoading: isLoadingRO } = useQuery({ queryKey: ['retailOrders'], queryFn: fetchRetailOrders, enabled: !!accessToken && !isGuest });
  const { data: foodOrders = [], isLoading: isLoadingFO } = useQuery({ queryKey: ['foodOrders'], queryFn: fetchFoodOrders, enabled: !!accessToken && !isGuest });

  // Mutations
  const removeRetailFav = useMutation({
    mutationFn: (id: string) => api.delete(`/retail/favorites/${id}/`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['retailFavorites'] }); }
  });
  
  const removeFoodFav = useMutation({
    mutationFn: (id: string) => api.delete(`/food/favorites/${id}/`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['foodFavorites'] }); }
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleSwitchGateway = async () => {
    const newGateway = selectedGateway === 'FOOD' ? 'RETAIL' : 'FOOD';
    await setGateway(newGateway);
  };

  if (!isAuthenticated || isGuest) {
    return (
      <View className="flex-1 bg-gray-50 text-gray-900 justify-center items-center px-6">
        <View className="bg-gray-200 p-5 rounded-2xl mb-5">
          <User color="#9ca3af" size={32} />
        </View>
        <Text className="text-xl font-black text-gray-900 text-center">Guest Mode</Text>
        <Text className="text-gray-500 font-medium mt-2 text-center mb-8">Login to access your profile, order history, and favorites.</Text>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Auth', { intendedRole: 'CUSTOMER' })} className="bg-indigo-600 px-8 py-4 rounded-2xl flex-row items-center shadow-md shadow-indigo-600/30">
          <LogIn color="#ffffff" size={20} />
          <Text className="text-white font-black text-lg ml-3">Login / Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLoading = isLoadingA || isLoadingRF || isLoadingFF || isLoadingRO || isLoadingFO;
  
  if (isLoading) {
    return <View className="flex-1 bg-gray-50 text-gray-900 justify-center items-center"><ActivityIndicator size="large" color="#4f46e5" /></View>;
  }

  const computedName = user?.first_name ? `${user.first_name} ${user?.last_name || ''}`.trim() : null;
  const displayName = computedName || 'Member';

  // Data mapping
  const allWishlist = [
    ...retailFavorites.map((f: any) => ({ 
      id: f.id, rawId: f.id, name: f.product_details.name, price: `ETB ${f.product_details.price}`, type: 'retail', baseIcon: ShoppingBag, storeName: f.product_details?.store_name
    })),
    ...foodFavorites.map((f: any) => ({ 
      id: f.id, rawId: f.id, name: f.menu_item_details.name, price: `ETB ${f.menu_item_details.price}`, type: 'food', baseIcon: Heart, storeName: f.menu_item_details?.store_name
    }))
  ];

  const allOrders = [
    ...retailOrders.map((o: any) => ({ id: o.id.substring(0, 8).toUpperCase(), rawId: o.id, rawDate: new Date(o.created_at), date: new Date(o.created_at).toLocaleDateString(), total: `ETB ${o.total_price_with_delivery || o.total_price}`, status: o.status.toLowerCase(), type: 'retail' })),
    ...foodOrders.map((o: any) => ({ id: o.id.substring(0, 8).toUpperCase(), rawId: o.id, rawDate: new Date(o.created_at), date: new Date(o.created_at).toLocaleDateString(), total: `ETB ${o.total_price_with_delivery || o.total_price}`, status: o.status.toLowerCase(), type: 'food' }))
  ].sort((a,b) => b.rawDate.getTime() - a.rawDate.getTime()).slice(0, 5);

  const primaryAddress = addresses.find((a: any) => a.is_primary) || addresses[0];

  return (
    <View className="flex-1 bg-gray-50">
      
      <AddressModal visible={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} addressToEdit={addressToEdit} />
      <ProfileModal visible={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <PaymentModal visible={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} paymentToEdit={paymentToEdit} />
      <OrderDetailsModal visible={isOrderModalOpen} onClose={() => setOrderModalOpen(false)} order={selectedOrder} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Header Component */}
        <View className="bg-indigo-600 px-6 pt-16 pb-20">
           <View className="flex-row items-center">
             <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center border border-white/40 mr-4">
               <Text className="text-3xl font-black text-white">{displayName.charAt(0).toUpperCase()}</Text>
             </View>
             <View className="flex-1">
               <Text className="text-white text-3xl font-black tracking-tighter">Welcome,</Text>
               <Text className="text-indigo-100 text-xl font-bold">{displayName}</Text>
             </View>
           </View>
        </View>

        {/* Stats Section Overlayed on header */}
        <View className="px-5 -mt-10 mb-6">
           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
             {[
               { label: 'Orders', value: retailOrders.length + foodOrders.length, icon: ShoppingBag, color: '#4f46e5' },
               { label: 'Wishlist', value: allWishlist.length, icon: Heart, color: '#db2777' },
               { label: 'Addresses', value: addresses.length, icon: MapPin, color: '#059669' },
             ].map((s, i) => (
               <View key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mr-4" style={{ width: width * 0.4 }}>
                 <View className="w-10 h-10 rounded-xl mb-3 items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                   <s.icon size={18} color={s.color} />
                 </View>
                 <Text className="text-3xl font-black text-gray-900">{s.value}</Text>
                 <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">{s.label}</Text>
               </View>
             ))}
           </ScrollView>
        </View>

        {/* Main Content Sections */}
        <View className="px-6 space-y-6 pb-24 text-gray-900">
           
           {/* Active Gateway Switcher Component */}
           <View className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 mb-2 mt-2">
             <Text className="text-xs font-black text-gray-400 tracking-widest uppercase mb-4">Preferences</Text>
             <TouchableOpacity 
               onPress={handleSwitchGateway}
               className="bg-gray-50 rounded-2xl p-4 flex-row items-center border border-gray-200"
             >
               {selectedGateway === 'FOOD' ? <Coffee color="#ea580c" size={22} /> : <ShoppingBag color="#6366f1" size={22} />}
               <View className="flex-1 ml-4 justify-center">
                 <Text className="text-gray-900 font-bold mb-0.5">Active Gateway</Text>
                 <Text className="text-gray-500 text-xs font-medium">{selectedGateway === 'FOOD' ? 'Food & Coffee' : 'Shop Retail'}</Text>
               </View>
               <View className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                 <Text className="text-indigo-600 font-black text-xs uppercase">Switch</Text>
               </View>
             </TouchableOpacity>
           </View>

           {/* Recent Orders Component */}
           <View className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-2">
             <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <Package size={20} color="#4f46e5" />
                  <Text className="text-xl font-bold text-gray-900 ml-3">Recent Orders</Text>
                </View>
                <Text className="text-xs font-black text-indigo-600 uppercase tracking-widest">View All</Text>
             </View>
             
             {allOrders.length === 0 ? (
                <Text className="text-center text-gray-400 font-bold py-4">No recent orders found.</Text>
             ) : (
                allOrders.map((order, i) => (
                  <TouchableOpacity 
                    key={i} onPress={() => { setSelectedOrder(order); setOrderModalOpen(true); }}
                    className="mb-4 bg-gray-50 p-4 rounded-3xl flex-row items-center border border-gray-100"
                  >
                     <View style={{ backgroundColor: order.type === 'food' ? '#fff7ed' : '#eef2ff' }} className="w-12 h-12 rounded-xl items-center justify-center mr-4 border border-black/5">
                        <Text style={{ color: order.type === 'food' ? '#ea580c' : '#4f46e5' }} className="font-black text-lg text-gray-900">{order.type === 'food' ? 'F' : 'R'}</Text>
                     </View>
                     <View className="flex-1">
                       <Text className="font-bold text-gray-900 text-base mb-0.5 text-gray-900">ORD-{order.id}</Text>
                       <Text className="font-semibold text-gray-500 text-xs">{order.date}</Text>
                     </View>
                     <View className="items-end mr-3">
                       <Text className="font-black text-gray-900 text-base mb-0.5">{order.total}</Text>
                       <Text className="text-[10px] font-black uppercase" style={{ color: order.status === 'delivered' ? '#059669' : order.status === 'cancelled' ? '#dc2626' : '#ea580c' }}>
                         {order.status}
                       </Text>
                     </View>
                     <ChevronRight color="#d1d5db" size={20} />
                  </TouchableOpacity>
                ))
             )}
           </View>

           {/* Saved Addresses */}
           <View className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-2">
             <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <MapPin size={20} color="#059669" />
                  <Text className="text-xl font-bold text-gray-900 ml-3">Saved Addresses</Text>
                </View>
             </View>

             {primaryAddress ? (
               <View className="bg-gray-50 p-5 rounded-3xl border border-gray-200 mb-4 items-start">
                 <View className="bg-emerald-100 px-3 py-1 rounded-full mb-3">
                   <Text className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Primary</Text>
                 </View>
                 <Text className="text-lg font-black text-gray-900 mb-1">{primaryAddress.label}</Text>
                 <Text className="text-sm font-semibold text-gray-500 mb-4">{primaryAddress.street_address}{'\n'}{primaryAddress.city_subcity}</Text>
                 
                 <TouchableOpacity onPress={() => { setAddressToEdit(primaryAddress); setAddressModalOpen(true); }} className="flex-row items-center">
                   <MapPin size={12} color="#059669" />
                   <Text className="text-xs font-bold text-emerald-600 uppercase tracking-widest ml-1">Edit Address</Text>
                 </TouchableOpacity>
               </View>
             ) : (
                <Text className="text-center text-gray-400 font-bold py-4">No addresses saved.</Text>
             )}

             <TouchableOpacity onPress={() => { setAddressToEdit(null); setAddressModalOpen(true); }} className="p-4 rounded-2xl border-2 border-dashed border-gray-200 items-center justify-center">
               <Text className="text-sm font-black text-gray-500 uppercase tracking-widest">+ Add New Address</Text>
             </TouchableOpacity>
           </View>

           {/* Wishlist */}
           <View className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-2">
             <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center flex-1 pr-4">
                  <Heart size={20} color="#db2777" />
                  <Text className="text-xl font-bold text-gray-900 ml-3" numberOfLines={1}>Saved Wishlist</Text>
                </View>
             </View>

             {allWishlist.length === 0 ? (
                <Text className="text-center text-gray-400 font-bold py-4">No items saved yet.</Text>
             ) : (
                allWishlist.map((item, i) => (
                  <View key={i} className="mb-4 bg-gray-50 p-3 rounded-[1.5rem] flex-row items-center border border-gray-100">
                     <View className="w-12 h-12 rounded-xl bg-white items-center justify-center mr-4 border border-black/5 shadow-sm">
                        <item.baseIcon size={18} color="#db2777" />
                     </View>
                     <View className="flex-1">
                       <Text className="font-bold text-gray-900 text-sm mb-1" numberOfLines={1}>{item.name}</Text>
                       {item.storeName && (
                          <Text className="text-[10px] font-semibold text-indigo-600">From: {item.storeName}</Text>
                       )}
                       <Text className="font-black text-gray-500 text-xs mt-1">{item.price}</Text>
                     </View>
                     <TouchableOpacity 
                       onPress={() => item.type === 'retail' ? removeRetailFav.mutate(item.rawId) : removeFoodFav.mutate(item.rawId)}
                       disabled={removeRetailFav.isPending || removeFoodFav.isPending}
                       className="p-3 bg-red-50 rounded-full ml-2"
                     >
                        <X size={16} color="#ef4444" />
                     </TouchableOpacity>
                  </View>
                ))
             )}
           </View>

           {/* Settings Box */}
           <View className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-6">
             <Text className="text-xs font-black text-gray-400 tracking-widest uppercase mb-4">Account Config</Text>
             
             <TouchableOpacity onPress={() => setProfileModalOpen(true)} className="bg-gray-50 p-5 rounded-2xl flex-row items-center border border-gray-100 mb-3">
               <User size={20} color="#6366f1" />
               <Text className="flex-1 ml-4 font-bold text-gray-900 text-base">Profile Information</Text>
               <ChevronRight size={18} color="#d1d5db" />
             </TouchableOpacity>

             <TouchableOpacity onPress={() => setPaymentModalOpen(true)} className="bg-gray-50 p-5 rounded-2xl flex-row items-center border border-gray-100 mb-3">
               <CreditCard size={20} color="#6366f1" />
               <Text className="flex-1 ml-4 font-bold text-gray-900 text-base">Payment Methods</Text>
               <ChevronRight size={18} color="#d1d5db" />
             </TouchableOpacity>

             <TouchableOpacity className="bg-gray-50 p-5 rounded-2xl flex-row items-center border border-gray-100 border-gray-900">
               <Lock size={20} color="#6366f1" />
               <Text className="flex-1 ml-4 font-bold text-gray-900 text-base">Security Settings</Text>
               <ChevronRight size={18} color="#d1d5db" />
             </TouchableOpacity>
           </View>

           {/* Logout Button */}
           <TouchableOpacity onPress={handleLogout} className="bg-red-50 rounded-[2rem] p-5 flex-row justify-center items-center mb-8 border border-red-100 shadow-sm">
             <LogOut color="#ef4444" size={20} />
             <Text className="text-red-500 font-black text-lg ml-3 text-gray-900 tracking-wide">Sign Out Securely</Text>
           </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}
