import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Alert
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  User, CreditCard, Clock, Info, FileText, Shield,
  RefreshCw, ChevronRight, LogIn, LogOut, Heart, ShoppingBag
} from 'lucide-react-native';

const fetchRetailFavorites = async () => { const res = await api.get('/retail/favorites/'); return res.data.results || res.data; };
const fetchFoodFavorites = async () => { const res = await api.get('/food/favorites/'); return res.data.results || res.data; };
const fetchRetailOrders = async () => { const res = await api.get('/orders/retail/'); return res.data.results || res.data; };
const fetchFoodOrders = async () => { const res = await api.get('/orders/food/'); return res.data.results || res.data; };

interface Props { navigation: any; }

export function ProfileScreen({ navigation }: Props) {
  const { user, isAuthenticated, isGuest, logout, accessToken } = useAuthStore();

  const { data: retailFavorites = [] } = useQuery({ queryKey: ['retailFavorites'], queryFn: fetchRetailFavorites, enabled: !!accessToken && !isGuest });
  const { data: foodFavorites = [] } = useQuery({ queryKey: ['foodFavorites'], queryFn: fetchFoodFavorites, enabled: !!accessToken && !isGuest });
  const { data: retailOrders = [] } = useQuery({ queryKey: ['retailOrders'], queryFn: fetchRetailOrders, enabled: !!accessToken && !isGuest });
  const { data: foodOrders = [] } = useQuery({ queryKey: ['foodOrders'], queryFn: fetchFoodOrders, enabled: !!accessToken && !isGuest });

  const wishlistCount = retailFavorites.length + foodFavorites.length;
  const ordersCount = retailOrders.length + foodOrders.length;

  const computedName = user?.first_name ? `${user.first_name} ${user?.last_name || ''}`.trim() : null;
  const displayName = computedName || 'Member';
  const initial = displayName.charAt(0).toUpperCase();

  // Guest state
  if (!isAuthenticated || isGuest) {
    return (
      <View style={styles.guestContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
        <View style={styles.guestHeader}>
          <View style={styles.guestAvatar}>
            <User color="rgba(255,255,255,0.6)" size={36} />
          </View>
          <Text style={styles.guestTitle}>Guest Mode</Text>
          <Text style={styles.guestSub}>Sign in to access your profile, orders &amp; wishlist.</Text>
        </View>
        <View style={styles.guestBody}>
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate('Auth', { intendedRole: 'CUSTOMER' })}
            style={styles.guestCta}
          >
            <LogIn color="#ffffff" size={20} />
            <Text style={styles.guestCtaText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleLogout = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, color: '#6366f1', bg: '#eef2ff', label: 'Profile Information', route: 'ProfileInfo' },
        { icon: CreditCard, color: '#0ea5e9', bg: '#f0f9ff', label: 'Payment Methods', route: 'PaymentMethods' },
        { icon: Clock, color: '#f59e0b', bg: '#fffbeb', label: 'Transaction History', route: 'TransactionHistory' },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        { icon: Info, color: '#8b5cf6', bg: '#f5f3ff', label: 'About Us', route: 'AboutUs' },
        { icon: FileText, color: '#10b981', bg: '#ecfdf5', label: 'Terms & Conditions', route: 'TermsAndConditions' },
        { icon: Shield, color: '#3b82f6', bg: '#eff6ff', label: 'Privacy Policy', route: 'PrivacyPolicy' },
        { icon: RefreshCw, color: '#f97316', bg: '#fff7ed', label: 'Refund Policy', route: 'RefundPolicy' },
      ],
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* ── Indigo Header ────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.nameText}>{displayName}</Text>
            </View>
          </View>
        </View>

        {/* ── Stat Cards overlapping header ────────────── */}
        <View style={styles.statsRow}>
          {[
            { icon: ShoppingBag, color: '#6366f1', bg: '#eef2ff', value: ordersCount, label: 'ORDERS' },
            { icon: Heart, color: '#db2777', bg: '#fdf2f8', value: wishlistCount, label: 'WISHLIST' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: s.bg }]}>
                <s.icon color={s.color} size={20} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Menu Sections ─────────────────────────────── */}
        <View style={styles.body}>
          {menuSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionCard}>
                {section.items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.route}
                    onPress={() => navigation.navigate(item.route)}
                    activeOpacity={0.7}
                    style={[
                      styles.menuRow,
                      idx < section.items.length - 1 && styles.menuRowDivider,
                    ]}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                      <item.icon color={item.color} size={18} strokeWidth={2} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <ChevronRight color="#d1d5db" size={18} strokeWidth={2} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Sign Out */}
          <TouchableOpacity onPress={handleLogout} style={styles.signOutBtn} activeOpacity={0.8}>
            <LogOut color="#ef4444" size={18} strokeWidth={2} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Extra spacer so button is never behind tab pill */}
        <View style={{ height: 20 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },

  // Guest
  guestContainer: { flex: 1, backgroundColor: '#f8fafc' },
  guestHeader: { backgroundColor: '#6366f1', paddingTop: 80, paddingBottom: 48, paddingHorizontal: 28, alignItems: 'center' },
  guestAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  guestTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff', marginBottom: 8 },
  guestSub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center', fontWeight: '500' },
  guestBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  guestCta: { backgroundColor: '#6366f1', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', gap: 12 },
  guestCtaText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },

  // Header
  header: { backgroundColor: '#6366f1', paddingTop: 56, paddingBottom: 52, paddingHorizontal: 24 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  avatarLetter: { fontSize: 28, fontWeight: '900', color: '#ffffff' },
  welcomeText: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
  nameText: { fontSize: 17, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: -28, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.5 },

  // Body
  body: { paddingHorizontal: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  sectionCard: { backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },

  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, gap: 14 },
  menuRowDivider: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },

  // Sign out
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff1f2', borderRadius: 16, paddingVertical: 16, marginTop: 4, borderWidth: 1, borderColor: '#fecdd3' },
  signOutText: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
});
