import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Switch, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, StatusBar
} from 'react-native';
import { Palette, LayoutTemplate, Save, CheckCircle2 } from 'lucide-react-native';
import { api } from '../../lib/api';
import { useThemeStore } from '../../store/themeStore';

const THEMES = [
  { id: 'apple-dark',   name: 'Cupertino Dark',  bg: '#000000', text: '#F5F5F7', primary: '#2997FF' },
  { id: 'apple-light',  name: 'Cupertino Light', bg: '#F5F5F7', text: '#1D1D1F', primary: '#0066CC' },
  { id: 'stripe',       name: 'Fintech Slate',   bg: '#0A2540', text: '#FFFFFF',  primary: '#635BFF' },
  { id: 'luxury-gold',  name: 'Maison Gold',     bg: '#0A0A0A', text: '#FAFAFA',  primary: '#D4AF37' },
  { id: 'minimal-mono', name: 'Pure Minimal',    bg: '#FFFFFF', text: '#000000',  primary: '#000000' },
  { id: 'emerald',      name: 'Emerald Isle',    bg: '#022C22', text: '#ECFDF5',  primary: '#10B981' },
  { id: 'rose-glass',   name: 'Blush Velvet',    bg: '#FFF1F2', text: '#4C0519',  primary: '#E11D48' },
  { id: 'oceanic',      name: 'Deep Oceanic',    bg: '#082F49', text: '#F0F9FF',  primary: '#0EA5E9' },
];

export function SellerStudioScreen() {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';

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

  useEffect(() => { fetchStore(); }, []);

  const fetchStore = async () => {
    try {
      const res = await api.get('/stores/manage/');
      const s = res.data?.results?.[0] || res.data?.[0];
      if (s) {
        setStore(s);
        setFormData({
          name: s.name || '',
          description: s.description || '',
          primary_color: s.primary_color || '#000000',
          secondary_color: s.secondary_color || '#000000',
          background_color: s.background_color || '#FFFFFF',
          heading_font: s.heading_font || 'Inter',
          announcement_is_active: s.announcement_is_active || false,
          announcement_text: s.announcement_text || '',
          announcement_color: s.announcement_color || '#000000',
        });
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!store?.id) return;
    setIsSaving(true);
    try {
      await api.patch(`/stores/manage/${store.id}/`, formData);
      Alert.alert('Saved', 'Store design updated successfully!');
    } catch { Alert.alert('Error', 'Failed to save changes.'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <View style={[styles.root, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Studio</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Design your luxury shopping experience.</Text>
          </View>
          {/* Segmented control */}
          <View style={[styles.segmentWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            {(['theme', 'identity'] as const).map(tab => {
              const active = activeTab === tab;
              const Icon = tab === 'theme' ? Palette : LayoutTemplate;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.segment, active && { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }]}
                >
                  <Icon size={16} color={active ? colors.accent : colors.textMuted} strokeWidth={2} />
                  <Text style={[styles.segmentLabel, { color: active ? colors.accent : colors.textMuted }]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>

          {/* THEME TAB */}
          {activeTab === 'theme' && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Designer Palettes</Text>
              <View style={styles.paletteGrid}>
                {THEMES.map(t => {
                  const isActive = formData.background_color === t.bg && formData.primary_color === t.primary;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setFormData({ ...formData, background_color: t.bg, secondary_color: t.text, primary_color: t.primary, announcement_color: t.primary })}
                      style={[styles.paletteCard, { backgroundColor: colors.surface, borderColor: isActive ? colors.text : colors.border, borderWidth: isActive ? 2 : 1 }]}
                      activeOpacity={0.8}
                    >
                      <View style={styles.paletteSwatch}>
                        <View style={{ flex: 1, backgroundColor: t.bg }} />
                        <View style={{ width: 28, backgroundColor: t.primary }} />
                      </View>
                      <View style={styles.paletteRow}>
                        <Text style={[styles.paletteName, { color: colors.text }]}>{t.name}</Text>
                        {isActive && <CheckCircle2 size={15} color={colors.accent} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Announcement bar */}
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.announcementRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <View>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Announcement Bar</Text>
                    <Text style={[styles.fieldSub, { color: colors.textMuted }]}>Show a banner on your storefront</Text>
                  </View>
                  <Switch
                    value={formData.announcement_is_active}
                    onValueChange={v => setFormData({ ...formData, announcement_is_active: v })}
                    trackColor={{ false: colors.border, true: colors.accent }}
                    thumbColor="#fff"
                  />
                </View>
                {formData.announcement_is_active && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Banner Message</Text>
                    <TextInput
                      value={formData.announcement_text}
                      onChangeText={v => setFormData({ ...formData, announcement_text: v })}
                      placeholder="FREE SHIPPING ON ALL ORDERS"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                    />
                  </View>
                )}
              </View>
            </>
          )}

          {/* IDENTITY TAB */}
          {activeTab === 'identity' && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Store Name</Text>
              <TextInput
                value={formData.name}
                onChangeText={v => setFormData({ ...formData, name: v })}
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border, fontSize: 17, fontWeight: '800' }]}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.inputLabel, { color: colors.textMuted, marginTop: 16 }]}>Store Description</Text>
              <TextInput
                value={formData.description}
                onChangeText={v => setFormData({ ...formData, description: v })}
                multiline numberOfLines={3}
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border, minHeight: 90, textAlignVertical: 'top' }]}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.inputLabel, { color: colors.textMuted, marginTop: 16 }]}>Heading Font</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {['Inter', 'Playfair Display', 'Space Grotesk', 'Outfit'].map(font => {
                  const sel = formData.heading_font === font;
                  return (
                    <TouchableOpacity
                      key={font}
                      onPress={() => setFormData({ ...formData, heading_font: font })}
                      style={[styles.fontChip, { backgroundColor: sel ? colors.accent : colors.surfaceAlt, borderColor: sel ? colors.accent : colors.border }]}
                    >
                      <Text style={{ color: sel ? '#fff' : colors.textSub, fontWeight: '700', fontSize: 13 }}>{font}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Save */}
          <TouchableOpacity
            onPress={handleSave} disabled={isSaving} activeOpacity={0.85}
            style={[styles.saveBtn, { backgroundColor: isSaving ? colors.surfaceAlt : colors.text }]}
          >
            {isSaving
              ? <ActivityIndicator color={colors.surface} />
              : <><Save size={17} color={colors.surface} strokeWidth={2} /><Text style={[styles.saveBtnText, { color: colors.surface }]}>Commit Changes</Text></>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, gap: 16 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, fontWeight: '500' },
  segmentWrap: { flexDirection: 'row', borderRadius: 14, padding: 4, borderWidth: 1 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 11 },
  segmentLabel: { fontSize: 13, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14, marginLeft: 2 },
  paletteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  paletteCard: { width: '47%', borderRadius: 20, padding: 12 },
  paletteSwatch: { height: 60, borderRadius: 14, flexDirection: 'row', overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  paletteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  paletteName: { fontSize: 12, fontWeight: '700' },
  card: { borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1 },
  announcementRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, borderWidth: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  fieldSub: { fontSize: 11, fontWeight: '500' },
  inputLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  input: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: '600', borderWidth: 1 },
  fontChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 18, paddingVertical: 17, marginBottom: 8 },
  saveBtnText: { fontSize: 14, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
});
