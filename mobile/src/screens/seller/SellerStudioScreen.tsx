import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Switch, ActivityIndicator, KeyboardAvoidingView, Platform,
  StyleSheet, StatusBar, Modal, Animated, Image,
} from 'react-native';
import {
  Palette, LayoutTemplate, Save, CheckCircle2, Eye,
  ChevronDown, ChevronRight, Image as ImageIcon, Camera, X,
} from 'lucide-react-native';
import { api } from '../../lib/api';
import { useThemeStore } from '../../store/themeStore';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';

// ─── Extended premium THEMES ──────────────────────────────────────────────────
const THEMES = [
  // Original 8
  { id: 'apple-dark',      name: 'Cupertino Dark',   desc: "Apple's signature obsidian",      bg: '#000000', text: '#F5F5F7', primary: '#2997FF',  accent2: '#30D158' },
  { id: 'apple-light',     name: 'Cupertino Light',  desc: 'Clean daylight silicon',           bg: '#F5F5F7', text: '#1D1D1F', primary: '#0066CC',  accent2: '#FF375F' },
  { id: 'stripe',          name: 'Fintech Slate',    desc: 'Bold financial confidence',        bg: '#0A2540', text: '#FFFFFF',  primary: '#635BFF',  accent2: '#00D4FF' },
  { id: 'luxury-gold',     name: 'Maison Gold',      desc: 'Parisian haute couture',           bg: '#0A0A0A', text: '#FAFAFA',  primary: '#D4AF37',  accent2: '#8B6914' },
  { id: 'minimal-mono',    name: 'Pure Minimal',     desc: 'Zen typographic clarity',          bg: '#FFFFFF', text: '#000000',  primary: '#000000',  accent2: '#555555' },
  { id: 'emerald',         name: 'Emerald Isle',     desc: 'Lush botanical luxury',            bg: '#022C22', text: '#ECFDF5',  primary: '#10B981',  accent2: '#34D399' },
  { id: 'rose-glass',      name: 'Blush Velvet',     desc: 'Romantic soft couture',            bg: '#FFF1F2', text: '#4C0519',  primary: '#E11D48',  accent2: '#FB7185' },
  { id: 'oceanic',         name: 'Deep Oceanic',     desc: 'Pacific horizon depth',            bg: '#082F49', text: '#F0F9FF',  primary: '#0EA5E9',  accent2: '#38BDF8' },
  // New premium 6
  { id: 'terracotta',      name: 'Terra Cotta',      desc: 'Warm artisan earthenware',         bg: '#2C1810', text: '#FDF4EE',  primary: '#E2714A',  accent2: '#F59E6B' },
  { id: 'midnight-cherry', name: 'Midnight Cherry',  desc: 'Sultry after-hours allure',        bg: '#1A0010', text: '#FFE4EF',  primary: '#D1006C',  accent2: '#FF4D9E' },
  { id: 'forest-sage',     name: 'Forest Sage',      desc: 'Scandinavian wellness calm',       bg: '#1C2B1E', text: '#E8F5E9',  primary: '#6DA86F',  accent2: '#A5D6A7' },
  { id: 'cosmic-purple',   name: 'Cosmic Purple',    desc: 'Deep space futurism',              bg: '#0D0719', text: '#EDE0FF',  primary: '#A855F7',  accent2: '#C084FC' },
  { id: 'warm-sand',       name: 'Warm Sand',        desc: 'Mediterranean coastal ease',       bg: '#FDF7F0', text: '#3D2B1F',  primary: '#C97B2E',  accent2: '#E9A96E' },
  { id: 'neon-cyber',      name: 'Neon Cyber',       desc: 'Tokyo streetwear digital edge',    bg: '#0A0A14', text: '#E4E4F7',  primary: '#39FF14',  accent2: '#00F0FF' },
];

export function SellerStudioScreen({ navigation }: any) {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';
  const { alertState, showAlert, hideAlert } = useAlert();

  const [store, setStore]         = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'identity'>('theme');
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(600)).current;

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
    working_days: '',
    delivery_hours: '',
    // Images are stored as existing URL strings (for display) or null (no change)
    logo: null as string | null,
    banner_image: null as string | null,
  });


  // ── Derived current theme ──────────────────────────────────────────────────
  const currentTheme = THEMES.find(
    t => t.bg === formData.background_color && t.primary === formData.primary_color
  ) || null;

  useEffect(() => { fetchStore(); }, []);

  // ── Animate theme picker ───────────────────────────────────────────────────
  const openThemePicker = () => {
    setThemePickerOpen(true);
    Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }).start();
  };
  const closeThemePicker = () => {
    Animated.timing(slideAnim, { toValue: 600, duration: 260, useNativeDriver: true }).start(() => setThemePickerOpen(false));
  };

  const fetchStore = async () => {
    try {
      const res = await api.get('/stores/manage');
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
          working_days: s.working_days || '',
          delivery_hours: s.delivery_hours || '',
          logo: s.logo || null,
          banner_image: s.banner_image || null,
        });
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!store?.id) return;
    setIsSaving(true);
    try {
      // Use JSON patch for text fields — image uploads require APK build
      const payload = {
        name: formData.name,
        description: formData.description,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        background_color: formData.background_color,
        heading_font: formData.heading_font,
        announcement_is_active: formData.announcement_is_active,
        announcement_text: formData.announcement_text,
        announcement_color: formData.announcement_color,
        working_days: formData.working_days,
        delivery_hours: formData.delivery_hours,
      };
      await api.patch(`/stores/manage/${store.id}`, payload);
      showAlert({ title: 'Changes Saved!', message: 'Your store design is live instantly.', variant: 'success', buttons: [{ text: 'Great' }] });
    } catch {
      showAlert({ title: 'Save Failed', message: 'Could not save changes. Please try again.', variant: 'error', buttons: [{ text: 'OK' }] });
    } finally { setIsSaving(false); }
  };

  const handleImagePick = (field: 'logo' | 'banner_image') => {
    showAlert({
      title: 'Testing Mode',
      message: 'Image uploads require the production APK or Custom Dev Client. You\'re currently using Expo Go — build a release APK to enable this!',
      variant: 'info',
      buttons: [{ text: 'Got it' }],
    });
  };

  const applyTheme = (t: typeof THEMES[0]) => {
    setFormData(prev => ({
      ...prev,
      background_color: t.bg as string,
      secondary_color: t.text as string,
      primary_color: t.primary as string,
      announcement_color: t.primary as string,
    }));
    closeThemePicker();
  };

  const card = isDark ? 'rgba(28, 30, 43, 0.95)' : colors.surface;
  const cardBorder = isDark ? '#3b3f5c' : colors.border;
  const inputBg = isDark ? 'rgba(28, 30, 43, 0.5)' : colors.surfaceAlt;

  if (isLoading) return (
    <View style={[styles.root, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <View style={[styles.header, { backgroundColor: isDark ? 'rgba(28, 30, 43, 0.98)' : colors.surface, borderBottomColor: cardBorder }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Studio</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Design your luxury shopping experience.</Text>
            </View>
            {/* Preview Button */}
            {store && (
              <TouchableOpacity
                onPress={() => navigation.navigate('StorePreview', { store, pendingChanges: formData })}
                style={[styles.previewBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.surfaceAlt, borderColor: cardBorder }]}
                activeOpacity={0.8}
              >
                <Eye size={15} color={colors.accent} strokeWidth={2} />
                <Text style={[styles.previewBtnText, { color: colors.accent }]}>Preview</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Segmented tabs */}
          <View style={[styles.segmentWrap, { backgroundColor: inputBg, borderColor: cardBorder }]}>
            {(['theme', 'identity'] as const).map(tab => {
              const active = activeTab === tab;
              const Icon = tab === 'theme' ? Palette : LayoutTemplate;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.segment, active && { backgroundColor: isDark ? 'rgba(28, 30, 43, 0.95)' : colors.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }]}
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

          {/* ── THEME TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'theme' && (
            <>
              {/* Current Theme Row */}
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Active Theme</Text>
              <TouchableOpacity
                onPress={openThemePicker}
                style={[styles.themeRow, { backgroundColor: card, borderColor: cardBorder }]}
                activeOpacity={0.85}
              >
                {/* Color preview swatches */}
                <View style={styles.themeSwatchMini}>
                  <View style={{ flex: 1, backgroundColor: formData.background_color }} />
                  <View style={{ width: 20, backgroundColor: formData.primary_color }} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.themeRowName, { color: colors.text }]}>
                    {currentTheme?.name ?? 'Custom Theme'}
                  </Text>
                  <Text style={[styles.themeRowDesc, { color: colors.textMuted }]}>
                    {currentTheme?.desc ?? 'Tap to pick a designer palette'}
                  </Text>
                </View>
                <View style={[styles.changeBtn, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '40' }]}>
                  <Text style={[styles.changeBtnText, { color: colors.accent }]}>Change</Text>
                  <ChevronDown size={13} color={colors.accent} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>

              {/* Announcement bar */}
              <View style={[styles.card, { backgroundColor: card, borderColor: cardBorder }]}>
                <View style={[styles.announcementRow, { backgroundColor: inputBg, borderColor: cardBorder }]}>
                  <View>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Announcement Bar</Text>
                    <Text style={[styles.fieldSub, { color: colors.textMuted }]}>Show a banner on your storefront</Text>
                  </View>
                  <Switch
                    value={formData.announcement_is_active}
                    onValueChange={v => setFormData({ ...formData, announcement_is_active: v })}
                    trackColor={{ false: cardBorder, true: colors.accent }}
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
                      style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: cardBorder }]}
                    />
                  </View>
                )}
              </View>
            </>
          )}

          {/* ── IDENTITY TAB ──────────────────────────────────────────────── */}
          {activeTab === 'identity' && (
            <>
              {/* Banner image */}
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Store Images</Text>
              <View style={[styles.card, { backgroundColor: card, borderColor: cardBorder, padding: 0, overflow: 'hidden', marginBottom: 14 }]}>
                {/* Banner */}
                <TouchableOpacity onPress={() => handleImagePick('banner_image')} activeOpacity={0.85}>
                  <View style={[styles.bannerUploadArea, { backgroundColor: inputBg }]}>
                    {formData.banner_image ? (
                      <Image source={{ uri: formData.banner_image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    ) : null}
                    {/* Overlay */}
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.38)', alignItems: 'center', justifyContent: 'center', gap: 8 }]}>
                      <View style={styles.uploadIconCircle}>
                        <Camera size={22} color="#fff" strokeWidth={2} />
                      </View>
                      <Text style={styles.uploadLabel}>Banner Image</Text>
                      <Text style={styles.uploadSub}>Tap to change · 3:1 ratio recommended</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Logo */}
                <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <TouchableOpacity onPress={() => handleImagePick('logo')} activeOpacity={0.85}>
                    <View style={[styles.logoUploadCircle, { backgroundColor: inputBg, borderColor: cardBorder }]}>
                      {formData.logo ? (
                        <Image source={{ uri: formData.logo }} style={{ width: '100%', height: '100%', borderRadius: 36 }} resizeMode="cover" />
                      ) : (
                        <ImageIcon size={24} color={colors.textMuted} strokeWidth={1.5} />
                      )}
                      <View style={[styles.logoEditBadge, { backgroundColor: colors.accent }]}>
                        <Camera size={10} color="#fff" strokeWidth={2.5} />
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View>
                    <Text style={{ fontWeight: '800', fontSize: 14, color: colors.text }}>Store Logo</Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Square image · Shown on your storefront</Text>
                    <TouchableOpacity onPress={() => handleImagePick('logo')} style={{ marginTop: 6 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent }}>Upload Logo →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Text Identity */}
              <View style={[styles.card, { backgroundColor: card, borderColor: cardBorder }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Store Name</Text>
                <TextInput
                  value={formData.name}
                  onChangeText={v => setFormData({ ...formData, name: v })}
                  style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: cardBorder, fontSize: 17, fontWeight: '800' }]}
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.inputLabel, { color: colors.textMuted, marginTop: 16 }]}>Store Description</Text>
                <TextInput
                  value={formData.description}
                  onChangeText={v => setFormData({ ...formData, description: v })}
                  multiline numberOfLines={3}
                  style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: cardBorder, minHeight: 90, textAlignVertical: 'top' }]}
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
                        style={[styles.fontChip, { backgroundColor: sel ? colors.accent : inputBg, borderColor: sel ? colors.accent : cardBorder }]}
                      >
                        <Text style={{ color: sel ? '#fff' : colors.textSub, fontWeight: '700', fontSize: 13 }}>{font}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Business Hours */}
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Business Hours</Text>
              <View style={[styles.card, { backgroundColor: card, borderColor: cardBorder }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Working Days</Text>
                <TextInput
                  value={formData.working_days}
                  onChangeText={v => setFormData({ ...formData, working_days: v })}
                  placeholder="e.g. Monday – Saturday"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: cardBorder }]}
                />
                <Text style={[styles.inputLabel, { color: colors.textMuted, marginTop: 16 }]}>
                  {store?.store_type === 'FOOD' ? 'Delivery Hours' : 'Opening Hours'}
                </Text>
                <TextInput
                  value={formData.delivery_hours}
                  onChangeText={v => setFormData({ ...formData, delivery_hours: v })}
                  placeholder="e.g. 09:00 – 22:00"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: cardBorder }]}
                />
                <Text style={[{ fontSize: 11, fontWeight: '500', marginTop: 8 }, { color: colors.textMuted }]}>
                  Use 24h format (HH:MM – HH:MM) for the Open/Closed badge to work on your storefront.
                </Text>
              </View>

            </>
          )}

          {/* ── Save Button ────────────────────────────────────────────────── */}
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

      {/* ── THEME PICKER MODAL ──────────────────────────────────────────────── */}
      <Modal visible={themePickerOpen} transparent animationType="none" onRequestClose={closeThemePicker}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeThemePicker} />
          <Animated.View
            style={[styles.modalSheet, { backgroundColor: isDark ? '#1a1c2b' : '#fff', transform: [{ translateY: slideAnim }] }]}
          >
            {/* Handle */}
            <View style={[styles.modalHandle, { backgroundColor: isDark ? '#3b3f5c' : '#e5e7eb' }]} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 16 }}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.5 }}>Choose Theme</Text>
              <TouchableOpacity onPress={closeThemePicker} style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6' }]}>
                <X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 60, gap: 12 }}>
              {THEMES.map(t => {
                const isActive = formData.background_color === t.bg && formData.primary_color === t.primary;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => applyTheme(t)}
                    activeOpacity={0.85}
                    style={[styles.themePickerCard, {
                      backgroundColor: t.bg,
                      borderColor: isActive ? t.primary : 'transparent',
                      borderWidth: isActive ? 2 : 1,
                    }]}
                  >
                    {/* Color accent bar */}
                    <View style={{ width: 6, alignSelf: 'stretch', backgroundColor: t.primary, borderRadius: 99, marginRight: 14 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '900', color: t.text, letterSpacing: -0.3 }}>{t.name}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '500', color: t.text, opacity: 0.65, marginTop: 2 }}>{t.desc}</Text>
                      {/* Swatch row */}
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.primary, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' }} />
                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.accent2, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' }} />
                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.text, opacity: 0.6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' }} />
                      </View>
                    </View>
                    {isActive && (
                      <View style={[styles.activeCheck, { backgroundColor: t.primary }]}>
                        <CheckCircle2 size={18} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

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

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, gap: 14 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 2 },
  subtitle: { fontSize: 13, fontWeight: '500' },
  previewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, borderWidth: 1,
  },
  previewBtnText: { fontSize: 13, fontWeight: '800' },
  segmentWrap: { flexDirection: 'row', borderRadius: 14, padding: 4, borderWidth: 1 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 11 },
  segmentLabel: { fontSize: 13, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginLeft: 2 },

  // Theme row
  themeRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 14, borderWidth: 1, marginBottom: 20 },
  themeSwatchMini: { width: 64, height: 44, borderRadius: 12, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  themeRowName: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  themeRowDesc: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1 },
  changeBtnText: { fontSize: 12, fontWeight: '800' },

  // Cards
  card: { borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1 },
  announcementRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, borderWidth: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  fieldSub: { fontSize: 11, fontWeight: '500' },
  inputLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  input: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: '600', borderWidth: 1 },
  fontChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginRight: 8 },

  // Image upload
  bannerUploadArea: { height: 150, position: 'relative' },
  uploadIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  uploadLabel: { color: '#fff', fontSize: 14, fontWeight: '800' },
  uploadSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '500' },
  logoUploadCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoEditBadge: { position: 'absolute', bottom: 2, right: 2, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // Save
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 18, paddingVertical: 17, marginBottom: 8 },
  saveBtnText: { fontSize: 14, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },

  // Theme picker modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 14, maxHeight: '82%' },
  modalHandle: { width: 38, height: 4, borderRadius: 99, alignSelf: 'center', marginBottom: 18 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  themePickerCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, padding: 16, minHeight: 90,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  activeCheck: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
