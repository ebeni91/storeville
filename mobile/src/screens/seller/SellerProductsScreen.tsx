import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, Switch, Alert, 
  ActivityIndicator, Image, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { Package, Plus, Edit2, Trash2, X, EyeOff } from 'lucide-react-native';
import { api } from '../../lib/api';

export function SellerProductsScreen() {
  const [store, setStore] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storeRes = await api.get('/stores/manage/');
      const currentStore = storeRes.data?.results?.[0] || storeRes.data?.[0];
      if (!currentStore) return;
      
      setStore(currentStore);
      const isFood = currentStore.store_type === 'FOOD';
      
      const [itemsRes, catRes] = await Promise.all([
        api.get(isFood ? `/food/items/?store_id=${currentStore.id}` : `/retail/products/?store_id=${currentStore.id}`),
        api.get(isFood ? `/food/categories/?store_id=${currentStore.id}` : `/retail/categories/?store_id=${currentStore.id}`)
      ]);
      
      setItems(itemsRes.data?.results || itemsRes.data || []);
      setCategories(catRes.data?.results || catRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFood = store?.store_type === 'FOOD';

  // Toggle Visibility Status
  const toggleVisibility = async (item: any) => {
    try {
      const endpoint = isFood ? `/food/items/${item.id}/` : `/retail/products/${item.id}/`;
      const field = isFood ? 'is_available' : 'is_active';
      const newValue = !item[field];
      
      await api.patch(endpoint, { [field]: newValue });
      setItems(items.map(i => i.id === item.id ? { ...i, [field]: newValue } : i));
    } catch (err) {
      Alert.alert('Error', 'Failed to update visibility');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const endpoint = isFood ? `/food/items/${id}/` : `/retail/products/${id}/`;
          await api.delete(endpoint);
          setItems(items.filter(i => i.id !== id));
        } catch (err) {
          Alert.alert('Error', 'Failed to delete item');
        }
      }}
    ]);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ 
      name: '', description: '', price: '', category: '', 
      is_available: true, is_active: true,
      stock_quantity: '10', preparation_time_minutes: '15',
      sku: '', is_vegan: false, is_spicy: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item, price: item.price.toString() });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert('Required Fields', 'Please fill in Name, Price, and Category.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const endpoint = isFood ? '/food/items/' : '/retail/products/';
      const targetUrl = editingItem ? `${endpoint}${editingItem.id}/` : endpoint;
      
      // Filter out readonly fields
      const { id, category_name, created_at, updated_at, image, store_id, store_name, store_slug, ...submitData } = formData;
      
      if (editingItem) {
        await api.patch(targetUrl, submitData);
      } else {
        await api.post(targetUrl, submitData);
      }
      
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err: any) {
      console.error(err.response?.data);
      Alert.alert('Error', 'Failed to save item. Check the input formats.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isActive = isFood ? item.is_available : item.is_active;

    return (
      <View className={`bg-white p-4 rounded-3xl mb-4 border border-gray-100 shadow-sm flex-row items-center ${!isActive ? 'opacity-60' : ''}`}>
        {/* Image / Placeholder */}
        <View className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center border border-gray-200 overflow-hidden mr-4">
          {item.image ? (
            <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Package color="#9ca3af" size={24} />
          )}
        </View>

        {/* Info */}
        <View className="flex-1 mr-2">
          <View className="flex-row items-center gap-2">
             <Text className="font-black text-gray-900 text-lg mb-1" numberOfLines={1}>{item.name}</Text>
             {!isActive && <EyeOff size={14} color="#9ca3af" />}
          </View>
          <Text className="font-bold text-gray-500 text-xs mb-1 uppercase tracking-widest">{item.category_name}</Text>
          <Text className="font-black text-indigo-600 text-lg">Br {parseFloat(item.price).toFixed(2)}</Text>
          
          {/* Badges */}
          <View className="flex-row items-center gap-2 mt-2">
            {!isFood ? (
              <View className={`px-2 py-1 rounded-md ${item.stock_quantity > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text className={`text-[10px] uppercase font-black tracking-widest ${item.stock_quantity > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of stock'}
                </Text>
              </View>
            ) : (
              <View className="bg-orange-100 px-2 py-1 rounded-md">
                <Text className="text-[10px] text-orange-700 uppercase font-black tracking-widest align-middle">
                  {item.preparation_time_minutes}m Prep
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions Context Menu */}
        <View className="items-end justify-between h-20">
          <Switch 
            value={isActive} 
            onValueChange={() => toggleVisibility(item)} 
            trackColor={{ false: '#f3f4f6', true: '#4f46e5' }}
            thumbColor={'#fff'}
            ios_backgroundColor="#e5e7eb"
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
          <View className="flex-row gap-2 mt-auto">
            <TouchableOpacity onPress={() => openEditModal(item)} className="p-2 bg-gray-50 rounded-xl">
              <Edit2 size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2 bg-red-50 rounded-xl">
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <View className="flex-1 bg-gray-50 justify-center items-center"><ActivityIndicator size="large" color="#4f46e5"/></View>;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pt-16 pb-4 px-6 flex-row justify-between items-center bg-white border-b border-gray-100 rounded-b-3xl">
        <View>
          <Text className="text-3xl font-black text-gray-900 tracking-tighter">Inventory</Text>
          <Text className="text-sm font-semibold text-gray-500">{isFood ? 'Menu Manager' : 'Product Manager'}</Text>
        </View>
        <TouchableOpacity 
          onPress={openCreateModal}
          className="bg-gray-900 w-12 h-12 rounded-2xl items-center justify-center shadow-md shadow-gray-900/20"
        >
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center p-10 mt-10 opacity-70">
            <Package size={48} color="#9ca3af" />
            <Text className="text-center font-black text-xl text-gray-400 mt-4">No items yet</Text>
            <Text className="text-center text-sm font-semibold text-gray-400 mt-2">Tap the + button to add your first item.</Text>
          </View>
        }
      />

      {/* Add / Edit Modal */}
      <Modal visible={isModalOpen} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-gray-50">
          <View className="flex-row justify-between items-center p-6 bg-white border-b border-gray-100">
            <Text className="text-2xl font-black text-gray-900 tracking-tighter">
              {editingItem ? 'Edit Item' : 'New Item'}
            </Text>
            <TouchableOpacity onPress={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="mb-4">
              <Text className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-2">Name *</Text>
              <TextInput 
                value={formData.name} onChangeText={t => setFormData({...formData, name: t})}
                className="bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-900" placeholder="e.g. Classic Burger"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-2">Description</Text>
              <TextInput 
                value={formData.description} onChangeText={t => setFormData({...formData, description: t})}
                multiline numberOfLines={3}
                className="bg-white border border-gray-200 rounded-2xl p-4 font-medium text-gray-700 min-h-[100px]" placeholder="Brief details..."
              />
            </View>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-2">Price (Br) *</Text>
                <TextInput 
                  value={formData.price} onChangeText={t => setFormData({...formData, price: t})}
                  keyboardType="numeric"
                  className="bg-white border border-gray-200 rounded-2xl p-4 font-black text-indigo-600 text-lg" placeholder="0.00"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-2">Category *</Text>
                <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-[58px] justify-center">
                  <Text className="font-bold px-4 text-gray-900 opacity-60">Uses category list</Text>
                  {/* React Native specific: We'd typically use @react-native-picker/picker here, but since it's not guaranteed installed, building a mini-selector or using plain mapping if we had a Custom Picker. For simplicity, we assume one is selected or we'll text-input ID. Wait, I should make it functional. */}
                  {/* We will map categories into a simple horizontal scroll instead */}
                </View>
              </View>
            </View>

            {/* Category Selector implementation */}
            <View className="mb-6">
               <Text className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-2">Select Category *</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                 {categories.map(c => (
                   <TouchableOpacity 
                     key={c.id} 
                     onPress={() => setFormData({...formData, category: c.id})}
                     className={`px-4 py-3 rounded-xl border mr-3 ${formData.category === c.id ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
                   >
                     <Text className={`font-bold text-sm ${formData.category === c.id ? 'text-white' : 'text-gray-600'}`}>{c.name}</Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>
            </View>

            {isFood ? (
              <View className="bg-orange-50 border border-orange-100 rounded-3xl p-5 mb-8">
                <Text className="text-xs font-black text-orange-900 tracking-widest uppercase mb-4">Kitchen Details</Text>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="font-bold text-orange-900/70 text-sm">Prep Time (mins)</Text>
                  <TextInput 
                    value={String(formData.preparation_time_minutes || '15')} onChangeText={t => setFormData({...formData, preparation_time_minutes: t})}
                    keyboardType="numeric"
                    className="bg-white border border-orange-200 rounded-xl px-4 py-2 text-center w-20 font-black text-orange-900" 
                  />
                </View>
              </View>
            ) : (
              <View className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 mb-8">
                <Text className="text-xs font-black text-indigo-900 tracking-widest uppercase mb-4">Inventory Details</Text>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="font-bold text-indigo-900/70 text-xs mb-2">SKU</Text>
                    <TextInput 
                      value={formData.sku || ''} onChangeText={t => setFormData({...formData, sku: t})}
                      className="bg-white border border-indigo-200 rounded-xl px-4 py-3 font-bold text-indigo-900" 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-indigo-900/70 text-xs mb-2">Stock Limit</Text>
                    <TextInput 
                      value={String(formData.stock_quantity || '10')} onChangeText={t => setFormData({...formData, stock_quantity: t})}
                      keyboardType="numeric"
                      className="bg-white border border-indigo-200 rounded-xl px-4 py-3 font-black text-indigo-900" 
                    />
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`py-4 rounded-2xl items-center flex-row justify-center mb-10 ${isSubmitting ? 'bg-gray-400' : 'bg-gray-900'}`}
            >
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="font-black text-white text-lg tracking-widest uppercase">Save Item</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}
