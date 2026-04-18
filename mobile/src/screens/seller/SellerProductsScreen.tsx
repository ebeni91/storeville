import React, { useState, useEffect } from 'react';
import {
  View, Text, SectionList, TouchableOpacity, Switch,
  ActivityIndicator, Image, Modal, TextInput, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet,
} from 'react-native';
import {
  Package, Plus, Edit2, Trash2, X, EyeOff, UploadCloud,
  Flame, Leaf, Tag, ChevronDown, ChevronUp,
} from 'lucide-react-native';
import { api } from '../../lib/api';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';
import { useThemeStore } from '../../store/themeStore';

export function SellerProductsScreen() {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';

  const [store, setStore]         = useState<any>(null);
  const [items, setItems]         = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Collapsed sections for the SectionList
  const [collapsed, setCollapsed]  = useState<Set<string>>(new Set());

  // Product Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData]       = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options & Extras for food items
  const [newOptionName, setNewOptionName]     = useState('');
  const [newOptionChoices, setNewOptionChoices] = useState('');
  const [newOptionRequired, setNewOptionRequired] = useState(false);
  const [pendingOptions, setPendingOptions]   = useState<any[]>([]);

  const [newExtraName, setNewExtraName]   = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState('');
  const [pendingExtras, setPendingExtras] = useState<any[]>([]);

  // Category Form States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName]   = useState('');
  const [catOrder, setCatOrder] = useState('0');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  const { alertState, showAlert, hideAlert } = useAlert();

  const cardBg    = isDark ? 'rgba(28, 30, 43, 0.95)' : '#ffffff';
  const cardBorder= isDark ? '#3b3f5c' : '#f3f4f6';
  const inputBg   = isDark ? 'rgba(28, 30, 43, 0.5)' : '#ffffff';
  const inputBorder = isDark ? '#3b3f5c' : '#e5e7eb';
  const headerBg  = isDark ? 'rgba(28, 30, 43, 0.98)' : '#ffffff';

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
        api.get(isFood ? `/food/categories?store_id=${currentStore.id}&limit=100` : `/retail/categories?store_id=${currentStore.id}&limit=100`),
      ]);
      setItems(itemsRes.data?.results || itemsRes.data || []);
      setCategories(catRes.data?.results || catRes.data || []);
    } catch (err) {
      console.error(err);
    } finally { setIsLoading(false); }
  };

  const isFood = store?.store_type === 'FOOD';

  // ── Build sections from items grouped by category ────────────────────────────
  const sections = (() => {
    const map: Record<string, any[]> = {};
    items.forEach(item => {
      const key = item.category_name || 'Uncategorized';
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return Object.entries(map).map(([title, data]) => ({ title, data }));
  })();

  const toggleCollapse = (title: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  // ── Visibility & delete ───────────────────────────────────────────────────────
  const toggleVisibility = async (item: any) => {
    try {
      const endpoint = isFood ? `/food/items/${item.id}` : `/retail/products/${item.id}`;
      const field    = isFood ? 'is_available' : 'is_active';
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

  // ── Category management ───────────────────────────────────────────────────────
  const openCategoryModal = () => { setCatName(''); setCatOrder('0'); setIsCategoryModalOpen(true); };

  const handleCategorySubmit = async () => {
    if (!catName.trim()) {
      showAlert({ title: 'Missing Info', message: 'Category name is required.', variant: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    setIsSubmittingCat(true);
    try {
      const payload: any = { name: catName, store_id: store.id };
      if (isFood) { payload.order = parseInt(catOrder) || 0; }
      else { payload.slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''); }
      await api.post(isFood ? '/food/categories' : '/retail/categories', payload);
      setIsCategoryModalOpen(false);
      fetchData();
    } catch {
      showAlert({ title: 'Save Failed', message: 'Could not create category.', variant: 'error', buttons: [{ text: 'OK' }] });
    } finally { setIsSubmittingCat(false); }
  };

  // ── Product management ────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '', description: '', price: '', category: '',
      is_available: true, is_active: true, stock_quantity: '10',
      preparation_time_minutes: '15', sku: '', is_vegan: false, is_spicy: false,
      image: null,
    });
    setPendingOptions([]);
    setPendingExtras([]);
    setNewOptionName(''); setNewOptionChoices(''); setNewOptionRequired(false);
    setNewExtraName(''); setNewExtraPrice('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item, price: item.price.toString() });
    setPendingOptions(item.options || []);
    setPendingExtras(item.extras || []);
    setNewOptionName(''); setNewOptionChoices(''); setNewOptionRequired(false);
    setNewExtraName(''); setNewExtraPrice('');
    setIsModalOpen(true);
  };

  const pickImage = async () => {
    showAlert({ title: 'Testing Mode', message: 'Image picking requires the Custom Dev Client. Expo Go does not support this.', variant: 'info', buttons: [{ text: 'Got it' }] });
  };

  // Add pending option (locally, submitted with item save)
  const addPendingOption = () => {
    if (!newOptionName.trim() || !newOptionChoices.trim()) {
      showAlert({ title: 'Incomplete', message: 'Enter option name and at least one choice.', variant: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    const choices = newOptionChoices.split(',').map(c => c.trim()).filter(Boolean);
    setPendingOptions(prev => [...prev, { id: `new-${Date.now()}`, name: newOptionName.trim(), choices, is_required: newOptionRequired, _new: true }]);
    setNewOptionName(''); setNewOptionChoices(''); setNewOptionRequired(false);
  };

  const addPendingExtra = () => {
    if (!newExtraName.trim() || !newExtraPrice.trim()) {
      showAlert({ title: 'Incomplete', message: 'Enter extra name and price.', variant: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    setPendingExtras(prev => [...prev, { id: `new-${Date.now()}`, name: newExtraName.trim(), price: newExtraPrice.trim(), _new: true }]);
    setNewExtraName(''); setNewExtraPrice('');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      showAlert({ title: 'Required Fields', message: 'Please fill in Name, Price, and Category.', variant: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    setIsSubmitting(true);
    try {
      const endpoint   = isFood ? '/food/items' : '/retail/products';
      const targetUrl  = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;
      const submitData = new FormData() as any;
      submitData.append('store_id', store.id);

      Object.keys(formData).forEach(key => {
        if (['category_name', 'id', 'created_at', 'updated_at', 'store_id', 'store_name', 'store_slug', 'options', 'extras'].includes(key)) return;
        if (key === 'image') {
          if (!formData[key] || typeof formData[key] === 'string') return;
          const file = formData.image;
          const uriParts = file.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          submitData.append('image', { uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri, name: `photo.${fileType}`, type: `image/${fileType}` });
          return;
        }
        if (formData[key] !== undefined && formData[key] !== null) {
          if (typeof formData[key] === 'boolean') submitData.append(key, formData[key] ? 'true' : 'false');
          else submitData.append(key, String(formData[key]));
        }
      });

      let savedItem: any;
      if (editingItem) { const r = await api.patch(targetUrl, submitData, { headers: { 'Content-Type': 'multipart/form-data' } }); savedItem = r.data; }
      else { const r = await api.post(targetUrl, submitData, { headers: { 'Content-Type': 'multipart/form-data' } }); savedItem = r.data; }

      // For food items: save pending options and extras
      if (isFood && savedItem?.id) {
        const optionBase = `/food/items/${savedItem.id}/options`;
        const extraBase  = `/food/items/${savedItem.id}/extras`;

        // Clear existing options/extras if editing
        if (editingItem) {
          const oldOptions = (editingItem.options || []).filter((o: any) => !o._new);
          const oldExtras  = (editingItem.extras  || []).filter((e: any) => !e._new);
          await Promise.allSettled([
            ...oldOptions.map((o: any) => api.delete(`${optionBase}/${o.id}`)),
            ...oldExtras.map((e: any) => api.delete(`${extraBase}/${e.id}`)),
          ]);
        }
        await Promise.allSettled([
          ...pendingOptions.filter(o => o._new).map(o => api.post(optionBase, { name: o.name, choices: o.choices, is_required: o.is_required })),
          ...pendingExtras.filter(e => e._new).map(e => api.post(extraBase, { name: e.name, price: parseFloat(e.price) })),
        ]);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showAlert({ title: 'Save Failed', message: err.response?.data?.detail || 'Failed to save item.', variant: 'error', buttons: [{ text: 'OK' }] });
    } finally { setIsSubmitting(false); }
  };

  // ── Render product row ────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: any }) => {
    const isActive = isFood ? item.is_available : item.is_active;
    return (
      <View style={[styles.itemCard, { backgroundColor: cardBg, borderColor: cardBorder, opacity: isActive ? 1 : 0.6 }]}>
        <View style={[styles.itemImg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', borderColor: inputBorder }]}>
          {item.image ? <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <Package color={colors.textMuted} size={24} />}
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            {!isActive && <EyeOff size={14} color={colors.textMuted} />}
          </View>
          <Text style={[styles.itemPrice, { color: '#4f46e5' }]}>Br {parseFloat(item.price).toFixed(2)}</Text>
          <View style={{ flexDirection: 'row', marginTop: 6, gap: 6, flexWrap: 'wrap' }}>
            {!isFood ? (
              <View style={[styles.badge, { backgroundColor: item.stock_quantity > 0 ? 'rgba(5,150,105,0.12)' : 'rgba(239,68,68,0.12)' }]}>
                <Text style={[styles.badgeTxt, { color: item.stock_quantity > 0 ? '#059669' : '#ef4444' }]}>{item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of stock'}</Text>
              </View>
            ) : (
              <>
                <View style={[styles.badge, { backgroundColor: 'rgba(249,115,22,0.12)' }]}>
                  <Text style={[styles.badgeTxt, { color: '#ea580c' }]}>{item.preparation_time_minutes}m Prep</Text>
                </View>
                {item.is_vegan   && <View style={[styles.badge, { backgroundColor: 'rgba(5,150,105,0.12)' }]}><Text style={[styles.badgeTxt, { color: '#059669' }]}>Vegan</Text></View>}
                {item.is_spicy   && <View style={[styles.badge, { backgroundColor: 'rgba(239,68,68,0.12)' }]}><Text style={[styles.badgeTxt, { color: '#ef4444' }]}>Spicy</Text></View>}
                {(item.options || []).length > 0 && <View style={[styles.badge, { backgroundColor: 'rgba(99,102,241,0.12)' }]}><Text style={[styles.badgeTxt, { color: '#111827' }]}>{(item.options || []).length} option{(item.options || []).length > 1 ? 's' : ''}</Text></View>}
                {(item.extras  || []).length > 0 && <View style={[styles.badge, { backgroundColor: 'rgba(168,85,247,0.12)' }]}><Text style={[styles.badgeTxt, { color: '#a855f7' }]}>{(item.extras  || []).length} extra{(item.extras  || []).length > 1 ? 's' : ''}</Text></View>}
              </>
            )}
          </View>
        </View>
        <View style={styles.itemActions}>
          <Switch value={isActive} onValueChange={() => toggleVisibility(item)} trackColor={{ false: inputBorder, true: '#4f46e5' }} thumbColor="#fff" ios_backgroundColor={inputBorder} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 'auto' }}>
            <TouchableOpacity onPress={() => openEditModal(item)} style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f9fafb' }]}>
              <Edit2 size={16} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.iconBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ── Render section header ─────────────────────────────────────────────────────
  const renderSectionHeader = ({ section }: { section: any }) => {
    const isCollapsed = collapsed.has(section.title);
    return (
      <TouchableOpacity onPress={() => toggleCollapse(section.title)} activeOpacity={0.75}
        style={[styles.sectionHeader, { backgroundColor: isDark ? 'rgba(28,30,43,0.98)' : colors.bg, borderBottomColor: cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
        <View style={[styles.sectionCount, { backgroundColor: 'rgba(79,70,229,0.1)' }]}>
          <Text style={[styles.sectionCountTxt, { color: '#4f46e5' }]}>{section.data.length}</Text>
        </View>
        {isCollapsed ? <ChevronDown color={colors.textMuted} size={18} /> : <ChevronUp color={colors.textMuted} size={18} />}
      </TouchableOpacity>
    );
  };

  if (isLoading) return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.accent} /></View>;

  return (
    <>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: cardBorder }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Inventory</Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>{isFood ? 'Menu Manager' : 'Product Manager'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={openCategoryModal} style={[styles.catBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', borderColor: cardBorder }]}>
              <Tag color={colors.text} size={15} />
              <Text style={[styles.catBtnTxt, { color: colors.text }]}>Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openCreateModal} style={[styles.addBtn, { backgroundColor: colors.text }]}>
              <Plus color={colors.bg} size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {sections.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, opacity: 0.7 }}>
            <Package size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textMuted }]}>No items yet</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>Tap the + button to add your first item.</Text>
          </View>
        ) : (
          <SectionList
            sections={sections.map(s => ({ ...s, data: collapsed.has(s.title) ? [] : s.data }))}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            stickySectionHeadersEnabled
          />
        )}

        {/* ── PRODUCT MODAL ─────────────────────────────────────────────────── */}
        <Modal visible={isModalOpen} animationType="slide" presentationStyle="pageSheet">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
            <View style={[styles.modalHeader, { backgroundColor: headerBg, borderBottomColor: cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{editingItem ? 'Edit Item' : 'New Item'}</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6' }]}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 24 }}>
              {/* Image */}
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8}
                style={[styles.imageUpload, { backgroundColor: inputBg, borderColor: inputBorder, overflow: 'hidden' }]}>
                {formData.image ? (
                  <Image source={{ uri: typeof formData.image === 'string' ? formData.image : formData.image.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <UploadCloud color={colors.textMuted} size={32} />
                    <Text style={{ marginTop: 10, fontWeight: '700', color: colors.textMuted, fontSize: 13 }}>Tap to attach a photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Name */}
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Name *</Text>
                <TextInput value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })}
                  style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: colors.text }]}
                  placeholder="e.g. Classic Burger" placeholderTextColor={colors.textMuted} />
              </View>

              {/* Description */}
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Description</Text>
                <TextInput value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })}
                  multiline numberOfLines={3}
                  style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: colors.text, minHeight: 100, textAlignVertical: 'top' }]}
                  placeholder="Brief details..." placeholderTextColor={colors.textMuted} />
              </View>

              {/* Price */}
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Price (Br) *</Text>
                <TextInput value={formData.price} onChangeText={t => setFormData({ ...formData, price: t })}
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: '#4f46e5', fontSize: 18, fontWeight: '900' }]}
                  placeholder="0.00" placeholderTextColor={colors.textMuted} />
              </View>

              {/* Category selector */}
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Category *</Text>
                {categories.length === 0 ? (
                  <TouchableOpacity onPress={openCategoryModal} style={styles.createCatBtn}>
                    <Text style={{ color: '#4f46e5', fontWeight: '800', fontSize: 13 }}>+ Create your first category</Text>
                  </TouchableOpacity>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map(c => (
                      <TouchableOpacity
                        key={c.id}
                        onPress={() => setFormData({ ...formData, category: c.id })}
                        style={[styles.catChip, { backgroundColor: formData.category === c.id ? '#4f46e5' : inputBg, borderColor: formData.category === c.id ? '#4f46e5' : inputBorder }]}
                      >
                        <Text style={{ fontWeight: '700', fontSize: 14, color: formData.category === c.id ? '#fff' : colors.textSub }}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* ── Food-specific: Kitchen details ─────────────────────────────── */}
              {isFood ? (
                <>
                  <View style={[styles.kitchenCard, { backgroundColor: 'rgba(249,115,22,0.06)', borderColor: 'rgba(249,115,22,0.15)' }]}>
                    <Text style={[styles.kitchenLabel, { color: '#ea580c' }]}>Kitchen Details</Text>
                    <View style={styles.kitchenRow}>
                      <Text style={[styles.kitchenField, { color: colors.textSub }]}>Prep Time (mins)</Text>
                      <TextInput value={String(formData.preparation_time_minutes || '15')} onChangeText={t => setFormData({ ...formData, preparation_time_minutes: t })}
                        keyboardType="numeric"
                        style={[styles.kitchenInput, { backgroundColor: inputBg, borderColor: 'rgba(249,115,22,0.3)', color: '#ea580c' }]} />
                    </View>
                    <View style={styles.kitchenRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Leaf color="#059669" size={18} />
                        <Text style={[styles.kitchenField, { color: colors.textSub }]}>Vegan Friendly</Text>
                      </View>
                      <Switch value={!!formData.is_vegan} onValueChange={v => setFormData({ ...formData, is_vegan: v })} trackColor={{ false: inputBorder, true: '#059669' }} thumbColor="#fff" />
                    </View>
                    <View style={styles.kitchenRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Flame color="#ef4444" size={18} />
                        <Text style={[styles.kitchenField, { color: colors.textSub }]}>Spicy Option</Text>
                      </View>
                      <Switch value={!!formData.is_spicy} onValueChange={v => setFormData({ ...formData, is_spicy: v })} trackColor={{ false: inputBorder, true: '#ef4444' }} thumbColor="#fff" />
                    </View>
                  </View>

                  {/* ── Options section ──────────────────────────────────────── */}
                  <View style={[styles.optionsCard, { backgroundColor: 'rgba(99,102,241,0.05)', borderColor: 'rgba(0,0,0,0.08)' }]}>
                    <Text style={[styles.optionsLabel, { color: '#111827' }]}>Size / Variant Options <Text style={{ fontSize: 10, fontWeight: '600' }}>(Optional)</Text></Text>

                    {/* Existing options */}
                    {pendingOptions.map((opt, idx) => (
                      <View key={opt.id} style={[styles.optionRow, { borderColor: 'rgba(99,102,241,0.2)' }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.optionName, { color: colors.text }]}>{opt.name} {opt.is_required ? '(required)' : ''}</Text>
                          <Text style={[styles.optionChoices, { color: '#111827' }]}>{(opt.choices || []).join(', ')}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setPendingOptions(p => p.filter((_, i) => i !== idx))} style={styles.removeBtn}>
                          <X size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Add new option */}
                    <View style={[styles.addOptionArea, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                      <TextInput value={newOptionName} onChangeText={setNewOptionName}
                        placeholder="Option name (e.g. Size)" placeholderTextColor={colors.textMuted}
                        style={[styles.optionInput, { color: colors.text, borderColor: inputBorder }]} />
                      <TextInput value={newOptionChoices} onChangeText={setNewOptionChoices}
                        placeholder="Choices separated by commas (e.g. Small, Medium, Large)" placeholderTextColor={colors.textMuted}
                        style={[styles.optionInput, { color: colors.text, borderColor: inputBorder, marginTop: 8 }]} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Switch value={newOptionRequired} onValueChange={setNewOptionRequired} trackColor={{ false: inputBorder, true: '#111827' }} thumbColor="#fff" style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
                          <Text style={[{ fontSize: 13, fontWeight: '600' }, { color: colors.textSub }]}>Required</Text>
                        </View>
                        <TouchableOpacity onPress={addPendingOption} style={[styles.addSmallBtn, { backgroundColor: '#111827' }]}>
                          <Plus color="#fff" size={14} strokeWidth={2.5} />
                          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>Add Option</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* ── Extras section ───────────────────────────────────────── */}
                  <View style={[styles.optionsCard, { backgroundColor: 'rgba(168,85,247,0.05)', borderColor: 'rgba(168,85,247,0.15)', marginBottom: 32 }]}>
                    <Text style={[styles.optionsLabel, { color: '#a855f7' }]}>Extras & Add-ons <Text style={{ fontSize: 10, fontWeight: '600' }}>(Optional)</Text></Text>

                    {/* Existing extras */}
                    {pendingExtras.map((extra, idx) => (
                      <View key={extra.id} style={[styles.optionRow, { borderColor: 'rgba(168,85,247,0.2)' }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.optionName, { color: colors.text }]}>{extra.name}</Text>
                          <Text style={[styles.optionChoices, { color: '#a855f7' }]}>+Br {parseFloat(extra.price).toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setPendingExtras(p => p.filter((_, i) => i !== idx))} style={styles.removeBtn}>
                          <X size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Add new extra */}
                    <View style={[styles.addOptionArea, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                      <TextInput value={newExtraName} onChangeText={setNewExtraName}
                        placeholder="Extra name (e.g. Extra Cheese)" placeholderTextColor={colors.textMuted}
                        style={[styles.optionInput, { color: colors.text, borderColor: inputBorder }]} />
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' }}>
                        <TextInput value={newExtraPrice} onChangeText={setNewExtraPrice}
                          placeholder="Price (Br)" keyboardType="numeric" placeholderTextColor={colors.textMuted}
                          style={[styles.optionInput, { flex: 1, color: '#a855f7', fontWeight: '800', borderColor: inputBorder }]} />
                        <TouchableOpacity onPress={addPendingExtra} style={[styles.addSmallBtn, { backgroundColor: '#a855f7' }]}>
                          <Plus color="#fff" size={14} strokeWidth={2.5} />
                          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>Add Extra</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                // ── Retail: Inventory details ─────────────────────────────────
                <View style={[styles.kitchenCard, { backgroundColor: 'rgba(79,70,229,0.06)', borderColor: 'rgba(79,70,229,0.15)', marginBottom: 32 }]}>
                  <Text style={[styles.kitchenLabel, { color: '#4f46e5' }]}>Inventory Details</Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[{ fontWeight: '700', color: colors.textSub, fontSize: 12, marginBottom: 8 }]}>SKU</Text>
                      <TextInput value={formData.sku || ''} onChangeText={t => setFormData({ ...formData, sku: t })}
                        style={[styles.input, { backgroundColor: inputBg, borderColor: 'rgba(79,70,229,0.2)', color: colors.text }]} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[{ fontWeight: '700', color: colors.textSub, fontSize: 12, marginBottom: 8 }]}>Stock Limit</Text>
                      <TextInput value={String(formData.stock_quantity || '10')} onChangeText={t => setFormData({ ...formData, stock_quantity: t })}
                        keyboardType="numeric"
                        style={[styles.input, { backgroundColor: inputBg, borderColor: 'rgba(79,70,229,0.2)', color: '#4f46e5', fontWeight: '900' }]} />
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}
                style={[styles.saveBtn, { backgroundColor: isSubmitting ? colors.textMuted : colors.text, marginBottom: 80 }]}>
                {isSubmitting ? <ActivityIndicator color={colors.bg} /> : <Text style={[styles.saveBtnTxt, { color: colors.bg }]}>Save Item</Text>}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        {/* ── CATEGORY MODAL ─────────────────────────────────────────────────── */}
        <Modal visible={isCategoryModalOpen} animationType="slide" transparent>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.catModalWrap}>
            <View style={[styles.catModalSheet, { backgroundColor: cardBg }]}>
              <View style={styles.catModalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Categories</Text>
                <TouchableOpacity onPress={() => setIsCategoryModalOpen(false)} style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6' }]}>
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {categories.length > 0 && (
                  <View style={{ marginBottom: 24 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textMuted, marginBottom: 12 }]}>Existing Categories</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {categories.map(c => (
                        <View key={c.id} style={[styles.catChip, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                          <Text style={{ fontWeight: '700', fontSize: 13, color: colors.textSub }}>{c.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                <View style={[styles.field, { borderTopWidth: 1, borderTopColor: cardBorder, paddingTop: 20 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text, fontSize: 14 }]}>Create New</Text>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Category Name</Text>
                  <TextInput value={catName} onChangeText={setCatName}
                    style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: colors.text, marginBottom: 12 }]}
                    placeholder={isFood ? 'e.g. Appetizers' : 'e.g. Shoes'} placeholderTextColor={colors.textMuted} />
                  {isFood && (
                    <>
                      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Sort Order (Optional)</Text>
                      <TextInput value={catOrder} onChangeText={setCatOrder} keyboardType="numeric"
                        style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: colors.text }]}
                        placeholder="0" placeholderTextColor={colors.textMuted} />
                    </>
                  )}
                </View>
                <TouchableOpacity onPress={handleCategorySubmit} disabled={isSubmittingCat || !catName.trim()}
                  style={[styles.saveBtn, { backgroundColor: isSubmittingCat || !catName.trim() ? colors.textMuted : colors.text, marginTop: 12, marginBottom: 40 }]}>
                  {isSubmittingCat ? <ActivityIndicator color={colors.bg} /> : <Text style={[styles.saveBtnTxt, { color: colors.bg }]}>Create Category</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
      <CustomAlert visible={alertState.visible} title={alertState.title} message={alertState.message} variant={alertState.variant} buttons={alertState.buttons} onDismiss={hideAlert} />
    </>
  );
}

const styles = StyleSheet.create({
  // Header
  header: { paddingTop: 64, paddingBottom: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, zIndex: 10 },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  headerSub: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  catBtn: { paddingHorizontal: 14, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, borderWidth: 1 },
  catBtnTxt: { fontWeight: '800', fontSize: 12 },
  addBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  // Section list
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 12, gap: 10, borderBottomWidth: 1 },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '900', letterSpacing: -0.3, textTransform: 'uppercase' },
  sectionCount: { minWidth: 26, height: 22, borderRadius: 99, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  sectionCountTxt: { fontSize: 12, fontWeight: '800' },

  // Item card
  itemCard: { padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  itemImg: { width: 70, height: 70, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, overflow: 'hidden' },
  itemName: { fontWeight: '900', fontSize: 15, flex: 1 },
  itemPrice: { fontWeight: '900', fontSize: 15, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeTxt: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  itemActions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 80 },
  iconBtn: { padding: 8, borderRadius: 12 },

  // Empty
  emptyTitle: { textAlign: 'center', fontWeight: '900', fontSize: 20, marginTop: 16 },
  emptySub: { textAlign: 'center', fontSize: 14, fontWeight: '600', marginTop: 8 },

  // Modal
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1 },
  modalTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  closeBtn: { padding: 8, borderRadius: 20 },
  imageUpload: { width: '100%', height: 160, borderRadius: 24, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 10, textTransform: 'uppercase', fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 20, padding: 16, fontWeight: '700' },
  createCatBtn: { padding: 16, borderRadius: 16, backgroundColor: 'rgba(79,70,229,0.1)', borderWidth: 1, borderColor: 'rgba(79,70,229,0.3)', alignItems: 'center' },
  catChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginRight: 12 },
  saveBtn: { paddingVertical: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  saveBtnTxt: { fontWeight: '900', fontSize: 17, letterSpacing: 1, textTransform: 'uppercase' },

  // Kitchen/food
  kitchenCard: { borderWidth: 1, borderRadius: 28, padding: 20, marginBottom: 20 },
  kitchenLabel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 },
  kitchenRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  kitchenField: { fontWeight: '700', fontSize: 14 },
  kitchenInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8, textAlign: 'center', width: 80, fontWeight: '900' },

  // Options
  optionsCard: { borderWidth: 1, borderRadius: 24, padding: 18, marginBottom: 20 },
  optionsLabel: { fontSize: 13, fontWeight: '900', marginBottom: 12 },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: 14, marginBottom: 8 },
  optionName: { fontSize: 13, fontWeight: '800' },
  optionChoices: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  addOptionArea: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 8 },
  addSmallBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  optionInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, fontWeight: '600' },
  removeBtn: { width: 28, height: 28, borderRadius: 9, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

  // Category modal
  catModalWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  catModalSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '85%' },
  catModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
});
