import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Switch, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Store, Palette, Save, LogOut, LayoutTemplate, CheckCircle2 } from 'lucide-react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';

const THEMES = [
  { id: 'apple-dark',   name: 'Cupertino Dark',  bg: '#000000', text: '#F5F5F7', primary: '#2997FF' },
  { id: 'apple-light',  name: 'Cupertino Light', bg: '#F5F5F7', text: '#1D1D1F', primary: '#0066CC' },
  { id: 'stripe',       name: 'Fintech Slate',   bg: '#0A2540', text: '#FFFFFF', primary: '#635BFF' },
  { id: 'luxury-gold',  name: 'Maison Gold',     bg: '#0A0A0A', text: '#FAFAFA', primary: '#D4AF37' },
  { id: 'minimal-mono', name: 'Pure Minimal',    bg: '#FFFFFF', text: '#000000', primary: '#000000' },
  { id: 'emerald',      name: 'Emerald Isle',    bg: '#022C22', text: '#ECFDF5', primary: '#10B981' },
  { id: 'rose-glass',   name: 'Blush Velvet',    bg: '#FFF1F2', text: '#4C0519', primary: '#E11D48' },
  { id: 'oceanic',      name: 'Deep Oceanic',    bg: '#082F49', text: '#F0F9FF', primary: '#0EA5E9' },
];

export function SellerProfileScreen({ navigation }: { navigation: any }) {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';
  const { logout } = useAuthStore();
  const { alertState, showAlert, hideAlert } = useAlert();

  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'identity'>('theme');

  const [formData, setFormData] = useState({
    name: '', description: '', primary_color: '#000000', secondary_color: '#000000',
    background_color: '#FFFFFF', heading_font: 'Inter',
    announcement_is_active: false, announcement_text: '', announcement_color: '#000000',
  });

  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : '#f9fafb';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';

  useEffect(() => { fetchStore(); }, []);

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
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!store?.id) return;
    setIsSaving(true);
    try {
      await api.patch(`/stores/manage/${store.id}`, formData);
      showAlert({ title: 'Changes Saved!', message: 'Store profile updated successfully.', variant: 'success', buttons: [{ text: 'Great' }] });
    } catch (err) {
      showAlert({ title: 'Save Failed', message: 'Failed to update store settings.', variant: 'error', buttons: [{ text: 'OK' }] });
    } finally { setIsSaving(false); }
  };

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.accent} /></View>;
  }

  const isFood = store?.store_type === 'FOOD';
  const accent = '#4f46e5';
  const tabBg = isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb';
  const activeTabBg = isDark ? 'rgba(255,255,255,0.1)' : '#ffffff';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingTop: 64, paddingBottom: 24, paddingHorizontal: 24, backgroundColor: isDark ? colors.surface : '#ffffff', borderBottomWidth: 1, borderBottomColor: cardBorder, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: -1 }}>Studio</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textMuted }}>Design your luxury shopping experience.</Text>
            </View>
            <View style={{ width: 48, height: 48, borderRadius: 18, backgroundColor: isFood ? 'rgba(249,115,22,0.12)' : 'rgba(79,70,229,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={24} color={isFood ? '#ea580c' : accent} />
            </View>
          </View>

          {/* Tab Switcher */}
          <View style={{ flexDirection: 'row', backgroundColor: tabBg, padding: 4, borderRadius: 20, borderWidth: 1, borderColor: cardBorder }}>
            {([['theme', 'Theme', Palette], ['identity', 'Identity', LayoutTemplate]] as const).map(([key, label, Icon]) => {
              const active = activeTab === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setActiveTab(key)}
                  style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 16, backgroundColor: active ? activeTabBg : 'transparent', shadowColor: active ? '#000' : 'transparent', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: active ? 2 : 0 }}
                >
                  <Icon size={18} color={active ? accent : colors.textMuted} />
                  <Text style={{ fontWeight: '700', marginLeft: 8, color: active ? accent : colors.textMuted }}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ padding: 24 }}>
          {/* THEME TAB */}
          <View style={{ display: activeTab === 'theme' ? 'flex' : 'none' }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.5, marginBottom: 16 }}>Designer Palettes</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {THEMES.map(t => {
                const isActive = formData.background_color === t.bg && formData.primary_color === t.primary;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setFormData({ ...formData, background_color: t.bg, secondary_color: t.text, primary_color: t.primary, announcement_color: t.primary })}
                    style={{ width: '48%', marginBottom: 16, backgroundColor: cardBg, padding: 12, borderRadius: 24, borderWidth: 2, borderColor: isActive ? colors.text : cardBorder }}
                    activeOpacity={0.8}
                  >
                    <View style={{ height: 64, borderRadius: 16, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', marginBottom: 12 }}>
                      <View style={{ flex: 1, backgroundColor: t.bg }} />
                      <View style={{ width: 32, backgroundColor: t.primary }} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{t.name}</Text>
                      {isActive && <CheckCircle2 size={16} color={colors.text} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Announcement banner */}
            <View style={{ backgroundColor: cardBg, padding: 20, borderRadius: 28, borderWidth: 1, borderColor: cardBorder, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: inputBg, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: inputBorder }}>
                <View>
                  <Text style={{ fontWeight: '700', color: colors.text, fontSize: 15 }}>Announcement Bar</Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>Show a banner</Text>
                </View>
                <Switch value={formData.announcement_is_active} onValueChange={v => setFormData({ ...formData, announcement_is_active: v })}
                  trackColor={{ false: inputBorder, true: '#111827' }} thumbColor="#fff" ios_backgroundColor={inputBorder}
                  style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }} />
              </View>
              {formData.announcement_is_active && (
                <View>
                  <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: 8 }}>Banner Message</Text>
                  <TextInput value={formData.announcement_text} onChangeText={t => setFormData({ ...formData, announcement_text: t })}
                    style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, borderRadius: 20, padding: 16, fontWeight: '700', fontSize: 14, color: colors.text }}
                    placeholder="FREE SHIPPING ON ALL ORDERS" placeholderTextColor={colors.textMuted} />
                </View>
              )}
            </View>
          </View>

          {/* IDENTITY TAB */}
          <View style={{ display: activeTab === 'identity' ? 'flex' : 'none' }}>
            <View style={{ backgroundColor: cardBg, padding: 20, borderRadius: 28, borderWidth: 1, borderColor: cardBorder, marginBottom: 24 }}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: 8 }}>Store Name</Text>
                <TextInput value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })}
                  style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, borderRadius: 20, padding: 16, fontWeight: '900', fontSize: 18, color: colors.text }}
                  placeholderTextColor={colors.textMuted} />
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: 8 }}>Store Description</Text>
                <TextInput value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })}
                  multiline numberOfLines={3}
                  style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, borderRadius: 20, padding: 16, fontWeight: '500', color: colors.text, minHeight: 100, textAlignVertical: 'top' }}
                  placeholder="Brief details about your store..." placeholderTextColor={colors.textMuted} />
              </View>
              <View>
                <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: 8 }}>Heading Font (for web)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderWidth: 1, borderColor: inputBorder, borderRadius: 20, padding: 8, backgroundColor: inputBg }}>
                  {['Inter', 'Playfair Display', 'Space Grotesk', 'Outfit'].map(font => {
                    const isSelected = formData.heading_font === font;
                    return (
                      <TouchableOpacity key={font} onPress={() => setFormData({ ...formData, heading_font: font })}
                        style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, marginRight: 8, backgroundColor: isSelected ? accent : (isDark ? 'rgba(255,255,255,0.06)' : '#ffffff'), borderWidth: 1, borderColor: isSelected ? accent : (isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb') }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: isSelected ? '#ffffff' : colors.textSub }}>{font}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Save */}
          <TouchableOpacity onPress={handleSave} disabled={isSaving} style={{ paddingVertical: 18, borderRadius: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 16, backgroundColor: '#111827' }} activeOpacity={0.8}>
            {isSaving ? <ActivityIndicator color="#fff" /> : (
              <>
                <Save size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ fontWeight: '900', color: '#ffffff', fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase' }}>Commit Changes</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity onPress={logout} style={{ paddingVertical: 18, borderRadius: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', borderWidth: 1, borderColor: cardBorder, marginBottom: 100 }} activeOpacity={0.8}>
            <LogOut size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
            <Text style={{ fontWeight: '900', color: colors.textMuted, fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase' }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert visible={alertState.visible} title={alertState.title} message={alertState.message} variant={alertState.variant} buttons={alertState.buttons} onDismiss={hideAlert} />
    </KeyboardAvoidingView>
  );
}
