import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Switch,
  ActivityIndicator, Image, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Package, Plus, Edit2, Trash2, X, EyeOff } from 'lucide-react-native';
import { api } from '../../lib/api';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';
import { useThemeStore } from '../../store/themeStore';

export function SellerProductsScreen() {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';

  const [store, setStore] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alertState, showAlert, hideAlert } = useAlert();

  const cardBg = isDark ? 'rgba(28, 30, 43, 0.95)' : '#ffffff';
  const cardBorder = isDark ? '#3b3f5c' : '#f3f4f6';
  const inputBg = isDark ? 'rgba(28, 30, 43, 0.5)' : '#ffffff';
  const inputBorder = isDark ? '#3b3f5c' : '#e5e7eb';
  const headerBg = isDark ? 'rgba(28, 30, 43, 0.98)' : '#ffffff';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const storeRes = await api.get('/stores/manage');
      const currentStore = storeRes.data?.results?.[0] || storeRes.data?.[0];
      if (!currentStore) return;
      setStore(currentStore);
      const isFood = currentStore.store_type === 'FOOD';
      const [itemsRes, catRes] = await Promise.all([
        api.get(isFood ? `/food/items?store_id=${currentStore.id}` : `/retail/products?store_id=${currentStore.id}`),
        api.get(isFood ? `/food/categories?store_id=${currentStore.id}` : `/retail/categories?store_id=${currentStore.id}`)
      ]);
      setItems(itemsRes.data?.results || itemsRes.data || []);
      setCategories(catRes.data?.results || catRes.data || []);
    } catch (err) {
      console.error(err);
    } finally { setIsLoading(false); }
  };

  const isFood = store?.store_type === 'FOOD';

  const toggleVisibility = async (item: any) => {
    try {
      const endpoint = isFood ? `/food/items/${item.id}` : `/retail/products/${item.id}`;
      const field = isFood ? 'is_available' : 'is_active';
      const newValue = !item[field];
      await api.patch(endpoint, { [field]: newValue });
      setItems(items.map(i => i.id === item.id ? { ...i, [field]: newValue } : i));
    } catch {
      showAlert({ title: 'Update Failed', message: 'Failed to update visibility.', variant: 'error', buttons: [{ text: 'OK' }] });
    }
  };

  const handleDelete = (id: string) => {
    showAlert({
      title: 'Confirm Delete', message: 'Permanently delete this item?', variant: 'error',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(isFood ? `/food/items/${id}` : `/retail/products/${id}`);
            setItems(items.filter(i => i.id !== id));
          } catch {
            showAlert({ title: 'Delete Failed', message: 'Failed to delete item.', variant: 'error', buttons: [{ text: 'OK' }] });
          }
        }},
      ],
    });
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', price: '', category: '', is_available: true, is_active: true, stock_quantity: '10', preparation_time_minutes: '15', sku: '', is_vegan: false, is_spicy: false });
    setIsModalOpen(true);
  };
  const openEditModal = (item: any) => { setEditingItem(item); setFormData({ ...item, price: item.price.toString() }); setIsModalOpen(true); };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      showAlert({ title: 'Required Fields', message: 'Please fill in Name, Price, and Category.', variant: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    setIsSubmitting(true);
    try {
      const endpoint = isFood ? '/food/items' : '/retail/products';
      const targetUrl = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;
      const { id, category_name, created_at, updated_at, image, store_id, store_name, store_slug, ...submitData } = formData;
      if (editingItem) { await api.patch(targetUrl, submitData); } else { await api.post(targetUrl, submitData); }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showAlert({ title: 'Save Failed', message: 'Failed to save item.', variant: 'error', buttons: [{ text: 'OK' }] });
    } finally { setIsSubmitting(false); }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isActive = isFood ? item.is_available : item.is_active;
    return (
      <View style={{
        backgroundColor: cardBg, padding: 16, borderRadius: 28, marginBottom: 16,
        borderWidth: 1, borderColor: cardBorder, flexDirection: 'row', alignItems: 'center',
        opacity: isActive ? 1 : 0.6,
      }}>
        <View style={{ width: 64, height: 64, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: inputBorder, overflow: 'hidden' }}>
          {item.image ? <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <Package color={colors.textMuted} size={24} />}
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontWeight: '900', color: colors.text, fontSize: 17, marginBottom: 2, flex: 1 }} numberOfLines={1}>{item.name}</Text>
            {!isActive && <EyeOff size={14} color={colors.textMuted} />}
          </View>
          <Text style={{ fontWeight: '700', color: colors.textMuted, fontSize: 10, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1.5 }}>{item.category_name}</Text>
          <Text style={{ fontWeight: '900', color: '#4f46e5', fontSize: 16 }}>Br {parseFloat(item.price).toFixed(2)}</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            {!isFood ? (
              <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: item.stock_quantity > 0 ? 'rgba(5,150,105,0.12)' : 'rgba(239,68,68,0.12)' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: item.stock_quantity > 0 ? '#059669' : '#ef4444' }}>
                  {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of stock'}
                </Text>
              </View>
            ) : (
              <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(249,115,22,0.12)' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: '#ea580c' }}>{item.preparation_time_minutes}m Prep</Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', height: 80 }}>
          <Switch value={isActive} onValueChange={() => toggleVisibility(item)} trackColor={{ false: inputBorder, true: '#4f46e5' }} thumbColor="#fff" ios_backgroundColor={inputBorder} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 'auto' }}>
            <TouchableOpacity onPress={() => openEditModal(item)} style={{ padding: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f9fafb', borderRadius: 12 }}>
              <Edit2 size={16} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12 }}>
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.accent} /></View>;
  }

  return (
    <>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Header */}
        <View style={{ paddingTop: 64, paddingBottom: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: headerBg, borderBottomWidth: 1, borderBottomColor: cardBorder, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
          <View>
            <Text style={{ fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: -1 }}>Inventory</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textMuted }}>{isFood ? 'Menu Manager' : 'Product Manager'}</Text>
          </View>
          <TouchableOpacity onPress={openCreateModal} style={{ width: 48, height: 48, backgroundColor: colors.text, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
            <Plus color={colors.bg} size={24} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40, opacity: 0.7 }}>
              <Package size={48} color={colors.textMuted} />
              <Text style={{ textAlign: 'center', fontWeight: '900', fontSize: 20, color: colors.textMuted, marginTop: 16 }}>No items yet</Text>
              <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: colors.textMuted, marginTop: 8 }}>Tap the + button to add your first item.</Text>
            </View>
          }
        />

        {/* Add / Edit Modal */}
        <Modal visible={isModalOpen} animationType="slide" presentationStyle="pageSheet">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, backgroundColor: headerBg, borderBottomWidth: 1, borderBottomColor: cardBorder }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -0.5 }}>{editingItem ? 'Edit Item' : 'New Item'}</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={{ padding: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', borderRadius: 20 }}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 24 }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: 8 }}>Name *</Text>
                <TextInput value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })}
                  style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, borderRadius: 20, padding: 16, fontWeight: '700', color: colors.text }}
                  placeholder="e.g. Classic Burger" placeholderTextColor={colors.textMuted} />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: 8 }}>Description</Text>
                <TextInput value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })}
                  multiline numberOfLines={3}
                  style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, borderRadius: 20, padding: 16, fontWeight: '500', color: colors.text, minHeight: 100, textAlignVertical: 'top' }}
                  placeholder="Brief details..." placeholderTextColor={colors.textMuted} />
              </View>

              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: 8 }}>Price (Br) *</Text>
                  <TextInput value={formData.price} onChangeText={t => setFormData({ ...formData, price: t })}
                    keyboardType="numeric"
                    style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, borderRadius: 20, padding: 16, fontWeight: '900', color: '#4f46e5', fontSize: 18 }}
                    placeholder="0.00" placeholderTextColor={colors.textMuted} />
                </View>
              </View>

              {/* Category Selector */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: 8 }}>Select Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map(c => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setFormData({ ...formData, category: c.id })}
                      style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginRight: 12, backgroundColor: formData.category === c.id ? '#4f46e5' : inputBg, borderColor: formData.category === c.id ? '#4f46e5' : inputBorder }}
                    >
                      <Text style={{ fontWeight: '700', fontSize: 14, color: formData.category === c.id ? '#ffffff' : colors.textSub }}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {isFood ? (
                <View style={{ backgroundColor: 'rgba(249,115,22,0.08)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.2)', borderRadius: 28, padding: 20, marginBottom: 32 }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#ea580c', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Kitchen Details</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: '700', color: colors.textSub, fontSize: 14 }}>Prep Time (mins)</Text>
                    <TextInput value={String(formData.preparation_time_minutes || '15')} onChangeText={t => setFormData({ ...formData, preparation_time_minutes: t })}
                      keyboardType="numeric"
                      style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8, textAlign: 'center', width: 80, fontWeight: '900', color: '#ea580c' }} />
                  </View>
                </View>
              ) : (
                <View style={{ backgroundColor: 'rgba(79,70,229,0.06)', borderWidth: 1, borderColor: 'rgba(79,70,229,0.15)', borderRadius: 28, padding: 20, marginBottom: 32 }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Inventory Details</Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: colors.textSub, fontSize: 12, marginBottom: 8 }}>SKU</Text>
                      <TextInput value={formData.sku || ''} onChangeText={t => setFormData({ ...formData, sku: t })}
                        style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: 'rgba(79,70,229,0.2)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontWeight: '700', color: colors.text }} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: colors.textSub, fontSize: 12, marginBottom: 8 }}>Stock Limit</Text>
                      <TextInput value={String(formData.stock_quantity || '10')} onChangeText={t => setFormData({ ...formData, stock_quantity: t })}
                        keyboardType="numeric"
                        style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: 'rgba(79,70,229,0.2)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontWeight: '900', color: '#4f46e5' }} />
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={{ paddingVertical: 18, borderRadius: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 40, backgroundColor: isSubmitting ? colors.textMuted : colors.text }}
              >
                {isSubmitting ? <ActivityIndicator color={colors.bg} /> : <Text style={{ fontWeight: '900', color: colors.bg, fontSize: 17, letterSpacing: 1, textTransform: 'uppercase' }}>Save Item</Text>}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
      <CustomAlert visible={alertState.visible} title={alertState.title} message={alertState.message} variant={alertState.variant} buttons={alertState.buttons} onDismiss={hideAlert} />
    </>
  );
}
