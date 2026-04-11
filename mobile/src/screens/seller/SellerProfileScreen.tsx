import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  Switch, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Store, Megaphone, Palette, Save, LogOut, LayoutTemplate, CheckCircle2 } from 'lucide-react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';

const THEMES = [
  { id: 'apple-dark', name: 'Cupertino Dark', bg: '#000000', text: '#F5F5F7', primary: '#2997FF' },
  { id: 'apple-light', name: 'Cupertino Light', bg: '#F5F5F7', text: '#1D1D1F', primary: '#0066CC' },
  { id: 'stripe', name: 'Fintech Slate', bg: '#0A2540', text: '#FFFFFF', primary: '#635BFF' },
  { id: 'luxury-gold', name: 'Maison Gold', bg: '#0A0A0A', text: '#FAFAFA', primary: '#D4AF37' },
  { id: 'minimal-mono', name: 'Pure Minimal', bg: '#FFFFFF', text: '#000000', primary: '#000000' },
  { id: 'emerald', name: 'Emerald Isle', bg: '#022C22', text: '#ECFDF5', primary: '#10B981' },
  { id: 'rose-glass', name: 'Blush Velvet', bg: '#FFF1F2', text: '#4C0519', primary: '#E11D48' },
  { id: 'oceanic', name: 'Deep Oceanic', bg: '#082F49', text: '#F0F9FF', primary: '#0EA5E9' },
];

export function SellerProfileScreen({ navigation }: { navigation: any }) {
  const { logout } = useAuthStore();
  const { alertState, showAlert, hideAlert } = useAlert();
  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'identity'>('theme');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primary_color: '#000000',
    secondary_color: '#000000',
    background_color: '#FFFFFF',
    heading_font: 'Inter',
    announcement_is_active: false,
    announcement_text: '',
    announcement_color: '#000000',
  });

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const res = await api.get('/stores/manage');
      const currentStore = res.data?.results?.[0] || res.data?.[0];
      if (currentStore) {
        setStore(currentStore);
        setFormData({
          name: currentStore.name || '',
          description: currentStore.description || '',
          primary_color: currentStore.primary_color || '#000000',
          secondary_color: currentStore.secondary_color || '#000000',
          background_color: currentStore.background_color || '#FFFFFF',
          heading_font: currentStore.heading_font || 'Inter',
          announcement_is_active: currentStore.announcement_is_active || false,
          announcement_text: currentStore.announcement_text || '',
          announcement_color: currentStore.announcement_color || '#000000',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!store?.id) return;
    setIsSaving(true);
    try {
      await api.patch(`/stores/manage/${store.id}`, formData);
      showAlert({ title: 'Changes Saved!', message: 'Store profile updated successfully.', variant: 'success', buttons: [{ text: 'Great' }] });
    } catch (err) {
      showAlert({ title: 'Save Failed', message: 'Failed to update store settings.', variant: 'error', buttons: [{ text: 'OK' }] });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <View className="flex-1 bg-gray-50 justify-center items-center"><ActivityIndicator size="large" color="#4f46e5" /></View>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        
        {/* Header */}
        <View style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }} className="pt-16 pb-6 px-6 bg-white border-b border-gray-100 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-3xl font-black text-gray-900 tracking-tighter">Studio</Text>
              <Text className="text-sm font-semibold text-gray-500">Design your luxury shopping experience.</Text>
            </View>
            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${store?.store_type === 'FOOD' ? 'bg-orange-100' : 'bg-indigo-100'}`}>
              <Store size={24} color={store?.store_type === 'FOOD' ? '#ea580c' : '#4f46e5'} />
            </View>
          </View>
          
          <View className="flex-row mt-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <TouchableOpacity 
              onPress={() => setActiveTab('theme')} 
              className="flex-1 flex-row justify-center items-center py-3 rounded-xl"
              style={activeTab === 'theme' ? { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2 } : {}}
            >
              <Palette size={18} color={activeTab === 'theme' ? '#4f46e5' : '#6b7280'} />
              <Text className="font-bold ml-2" style={{ color: activeTab === 'theme' ? '#4f46e5' : '#6b7280' }}>Theme</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('identity')} 
              className="flex-1 flex-row justify-center items-center py-3 rounded-xl"
              style={activeTab === 'identity' ? { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2 } : {}}
            >
              <LayoutTemplate size={18} color={activeTab === 'identity' ? '#4f46e5' : '#6b7280'} />
              <Text className="font-bold ml-2" style={{ color: activeTab === 'identity' ? '#4f46e5' : '#6b7280' }}>Identity</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-6">
          
          {/* THEME TAB */}
          <View style={{ display: activeTab === 'theme' ? 'flex' : 'none' }}>
            <Text className="text-xl font-black mb-4 flex-row items-center tracking-tight text-gray-900">
              Designer Palettes
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {THEMES.map(t => {
                const isActive = formData.background_color === t.bg && formData.primary_color === t.primary;
                return (
                  <TouchableOpacity 
                    key={t.id} 
                    onPress={() => setFormData({
                      ...formData, 
                      background_color: t.bg, 
                      secondary_color: t.text, 
                      primary_color: t.primary, 
                      announcement_color: t.primary 
                    })}
                    className="mb-4 bg-white p-3 rounded-3xl border-2"
                    style={{ 
                      width: '48%',
                      borderColor: isActive ? '#111827' : '#f3f4f6',
                      elevation: isActive ? 4 : 0,
                      shadowColor: isActive ? '#000' : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3
                    }}
                    activeOpacity={0.8}
                  >
                    <View className="h-16 rounded-2xl flex-row overflow-hidden border border-black/5 mb-3 shadow-sm bg-gray-100">
                       <View className="flex-1" style={{ backgroundColor: t.bg }}></View>
                       <View className="w-8 shrink-0" style={{ backgroundColor: t.primary }}></View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-bold text-gray-900">{t.name}</Text>
                      {isActive && <CheckCircle2 size={16} color="#111827" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="mt-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">
              <View className="flex-row items-center justify-between mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <View>
                  <Text className="font-bold text-gray-900">Announcement Bar</Text>
                  <Text style={{ fontSize: 10 }} className="text-gray-500 font-bold uppercase tracking-widest mt-1">Show a banner</Text>
                </View>
                <Switch 
                  value={formData.announcement_is_active} 
                  onValueChange={v => setFormData({...formData, announcement_is_active: v})} 
                  trackColor={{ false: '#e5e7eb', true: '#111827' }}
                  thumbColor={'#fff'}
                  ios_backgroundColor="#f3f4f6"
                  style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                />
              </View>

              {formData.announcement_is_active && (
                <View>
                  <Text style={{ fontSize: 10 }} className="uppercase font-black text-gray-400 tracking-widest mb-2">Banner Message</Text>
                  <TextInput 
                    value={formData.announcement_text} onChangeText={t => setFormData({...formData, announcement_text: t})}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold text-sm text-gray-900" 
                    placeholder="FREE SHIPPING ON ALL ORDERS"
                  />
                </View>
              )}
            </View>
          </View>

          {/* IDENTITY TAB */}
          <View style={{ display: activeTab === 'identity' ? 'flex' : 'none' }}>
            <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">
              <View className="mb-5">
                <Text style={{ fontSize: 10 }} className="uppercase font-black text-gray-400 tracking-widest mb-2">Store Name</Text>
                <TextInput 
                  value={formData.name} onChangeText={t => setFormData({...formData, name: t})}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-4 font-black text-lg text-gray-900" 
                />
              </View>
              
              <View className="mb-5">
                <Text style={{ fontSize: 10 }} className="uppercase font-black text-gray-400 tracking-widest mb-2">Store Description</Text>
                <TextInput 
                  value={formData.description} onChangeText={t => setFormData({...formData, description: t})}
                  multiline numberOfLines={3}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-4 font-medium text-gray-700" 
                  style={{ minHeight: 100 }}
                />
              </View>
              
              <View>
                 <Text style={{ fontSize: 10 }} className="uppercase font-black text-gray-400 tracking-widest mb-2">Heading Font (Displays on web)</Text>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border border-gray-200 rounded-2xl p-2 bg-gray-50">
                   {['Inter', 'Playfair Display', 'Space Grotesk', 'Outfit'].map(font => {
                     const isSelected = formData.heading_font === font;
                     return (
                       <TouchableOpacity 
                         key={font} onPress={() => setFormData({...formData, heading_font: font})}
                         className="px-4 py-2.5 rounded-xl border mr-2"
                         style={{
                           backgroundColor: isSelected ? '#4f46e5' : '#ffffff',
                           borderColor: isSelected ? '#4f46e5' : '#ffffff'
                         }}
                       >
                         <Text className="font-bold text-sm" style={{ color: isSelected ? '#ffffff' : '#374151' }}>
                           {font}
                         </Text>
                       </TouchableOpacity>
                     );
                   })}
                 </ScrollView>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={isSaving}
            className="py-4 rounded-2xl items-center flex-row justify-center mb-6 shadow-md"
            style={{ backgroundColor: isSaving ? '#1f2937' : '#000' }}
            activeOpacity={0.8}
          >
             {isSaving ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Save size={18} color="#ffffff" className="mr-2" />
                  <Text className="font-black text-white text-md tracking-widest uppercase shadow-sm">Commit Changes</Text>
                </>
             )}
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={logout}
            className="py-4 rounded-2xl items-center flex-row justify-center bg-gray-100 border border-gray-200 mb-6"
            activeOpacity={0.8}
          >
             <LogOut size={18} color="#4b5563" className="mr-2" />
             <Text className="font-black text-gray-500 text-sm tracking-widest uppercase">Sign Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
    </KeyboardAvoidingView>
  );
}
