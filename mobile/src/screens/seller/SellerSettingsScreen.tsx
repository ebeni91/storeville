import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert
} from 'react-native';
import {
  User, MapPin, CreditCard, Star, ChevronRight, LogOut, Sun, Moon
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface Props { navigation: any; }

const fetchStore = async () => { const r = await api.get('/stores/manage/'); return r.data?.results?.[0] || r.data?.[0]; };

export function SellerSettingsScreen({ navigation }: Props) {
  const { logout, user } = useAuthStore();
  const { colors, mode, toggleTheme } = useThemeStore();
  const isDark = mode === 'dark';
  const { data: store } = useQuery({ queryKey: ['seller-store'], queryFn: fetchStore });

  const storeName = store?.name || user?.email || 'My Store';
  const isFood = store?.store_type === 'FOOD';
  const initial = storeName.charAt(0).toUpperCase();

  const handleLogout = () => Alert.alert('Sign Out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: logout },
  ]);

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User,      color: '#6366f1', bg: colors.accentFaint,                                    label: 'Account Information', route: 'AccountInfo' },
        { icon: MapPin,    color: '#10b981', bg: isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5',          label: 'Store Location',      route: 'StoreLocation' },
        { icon: CreditCard, color: '#0ea5e9', bg: isDark ? 'rgba(14,165,233,0.12)' : '#f0f9ff',         label: 'Financials',          route: 'Financials' },
        { icon: Star,      color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.12)' : '#fffbeb',          label: 'Subscription',        route: 'Subscription' },
      ],
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* Indigo header */}
        <View style={styles.header}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarCircle, { backgroundColor: isFood ? '#f97316' : '#818cf8' }]}>
              <Text style={styles.avatarLetter}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerLabel}>Seller Account</Text>
              <Text style={styles.storeName}>{storeName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>

          {/* Appearance toggle */}
          <View style={{ marginBottom: 24 }}>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7} style={[styles.menuRow, { borderBottomWidth: 0 }]}>
                <View style={[styles.menuIconBox, { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff' }]}>
                  {isDark
                    ? <Moon color="#818cf8" size={18} strokeWidth={2} />
                    : <Sun  color="#6366f1" size={18} strokeWidth={2} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>Appearance</Text>
                  <Text style={[{ fontSize: 12, fontWeight: '500', marginTop: 1 }, { color: colors.textMuted }]}>
                    {isDark ? 'Dark mode active' : 'Light mode active'}
                  </Text>
                </View>
                <View style={[styles.modeBadge, { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff' }]}>
                  <Text style={[styles.modeBadgeText, { color: colors.accent }]}>{isDark ? 'Dark' : 'Light'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings menu sections */}
          {menuSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{section.title}</Text>
              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {section.items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.route}
                    onPress={() => navigation.navigate(item.route)}
                    activeOpacity={0.7}
                    style={[
                      styles.menuRow,
                      idx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                      <item.icon color={item.color} size={18} strokeWidth={2} />
                    </View>
                    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                    <ChevronRight color={colors.textMuted} size={18} strokeWidth={2} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleLogout} activeOpacity={0.8}
            style={[styles.signOutBtn, { backgroundColor: colors.dangerFaint, borderColor: colors.dangerBorder }]}
          >
            <LogOut color={colors.danger} size={18} strokeWidth={2} />
            <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { backgroundColor: '#6366f1', paddingTop: 56, paddingBottom: 52, paddingHorizontal: 24 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  avatarLetter: { fontSize: 28, fontWeight: '900', color: '#ffffff' },
  sellerLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 3 },
  storeName: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4 },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  sectionCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 18, gap: 14 },
  menuIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  modeBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 },
  modeBadgeText: { fontSize: 12, fontWeight: '800' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 16, marginTop: 4, borderWidth: 1 },
  signOutText: { fontSize: 15, fontWeight: '700' },
});
