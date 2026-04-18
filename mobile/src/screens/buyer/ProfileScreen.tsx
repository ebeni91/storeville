import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Animated, Dimensions
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { authClient } from '../../lib/auth-client';
import { useThemeStore } from '../../store/themeStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  User, CreditCard, Clock, Info, FileText, Shield,
  RefreshCw, ChevronRight, LogIn, LogOut, Heart,
  ShoppingBag, Sun, Moon, Store
} from 'lucide-react-native';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';

const { width } = Dimensions.get('window');
const TOGGLE_W = 170;
const HALF = TOGGLE_W / 2;

  const fetchRetailFavorites = async () => { const res = await api.get('/retail/favorites/'); return res.data.results || res.data; };
const fetchFoodFavorites = async () => { const res = await api.get('/food/favorites/'); return res.data.results || res.data; };
const fetchRetailOrders = async () => { const res = await api.get('/orders/retail/'); return res.data.results || res.data; };
const fetchFoodOrders = async () => { const res = await api.get('/orders/food/'); return res.data.results || res.data; };

interface Props { navigation: any; }

// ── Beautiful animated theme toggle ──────────────────────────────────────────
function ThemeToggle() {
  const { mode, toggleTheme } = useThemeStore();
  const anim = useRef(new Animated.Value(mode === 'dark' ? 1 : 0)).current;

  const handleToggle = () => {
    const toValue = mode === 'light' ? 1 : 0;
    Animated.spring(anim, { toValue, useNativeDriver: true, tension: 90, friction: 14 }).start();
    toggleTheme();
  };

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, HALF - 2] });
  const isDark = mode === 'dark';

  return (
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.9}>
      <View style={[
        styles.toggleTrack,
        { backgroundColor: isDark ? '#1a1a2e' : '#e8eaf6' }
      ]}>
        {/* Sliding pill */}
        <Animated.View style={[
          styles.togglePill,
          {
            transform: [{ translateX }],
            backgroundColor: isDark ? '#111827' : '#ffffff',
            shadowColor: isDark ? '#111827' : '#000',
          }
        ]} />

        {/* Left option — Light */}
        <View style={styles.toggleOption}>
          <Sun size={14} color={!isDark ? '#111827' : '#9ca3af'} strokeWidth={2.5} />
          <Text style={[styles.toggleLabel, { color: !isDark ? '#111827' : '#9ca3af' }]}>Light</Text>
        </View>

        {/* Right option — Dark */}
        <View style={styles.toggleOption}>
          <Moon size={14} color={isDark ? '#ffffff' : '#9ca3af'} strokeWidth={2.5} />
          <Text style={[styles.toggleLabel, { color: isDark ? '#ffffff' : '#9ca3af' }]}>Dark</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function ProfileScreen({ navigation }: Props) {
  const { isGuest, logout, exitGuestMode } = useAuthStore();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;
  const isAuthenticated = !!user;
  const { colors, mode } = useThemeStore();

  const { data: retailFavorites = [] } = useQuery({ queryKey: ['retailFavorites'], queryFn: fetchRetailFavorites, enabled: isAuthenticated && !isGuest });
  const { alertState, showAlert, hideAlert } = useAlert();
  const { data: foodFavorites = [] } = useQuery({ queryKey: ['foodFavorites'], queryFn: fetchFoodFavorites, enabled: isAuthenticated && !isGuest });
  const { data: retailOrders = [] } = useQuery({ queryKey: ['retailOrders'], queryFn: fetchRetailOrders, enabled: isAuthenticated && !isGuest });
  const { data: foodOrders = [] } = useQuery({ queryKey: ['foodOrders'], queryFn: fetchFoodOrders, enabled: isAuthenticated && !isGuest });

  const wishlistCount = retailFavorites.length + foodFavorites.length;
  const ordersCount = retailOrders.length + foodOrders.length;

  const computedName = user?.name || user?.email?.split('@')[0] || null;
  const displayName = computedName || 'Member';
  const initial = displayName.charAt(0).toUpperCase();
  const isSeller = user?.role === 'SELLER';

  // Guest state
  if (!isAuthenticated || isGuest) {
    return (
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}  backgroundColor="transparent" translucent={true} />

        {/* Guest header — always indigo */}
        <View style={styles.guestHeader}>
          <View style={styles.guestAvatar}>
            <User color="rgba(255,255,255,0.6)" size={36} />
          </View>
          <Text style={styles.guestTitle}>Guest Mode</Text>
          <Text style={styles.guestSub}>Sign in to access your profile, orders &amp; wishlist.</Text>
        {/* Appearance toggle for guests */}
          <View style={{ width: '100%', marginTop: 32 }}>
            {/* <Text style={[styles.sectionTitle, { color: colors.textMuted, marginLeft: 4, marginBottom: 10 }]}>Appearance</Text> */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.menuRow, { borderBottomWidth: 0 }]}>
                <View style={[styles.menuIconBox, { backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.08)' : '#f3f4f6' }]}>
                  {mode === 'dark'
                    ? <Moon color="#ffffff" size={18} strokeWidth={2} />
                    : <Sun color="#111827" size={18} strokeWidth={2} />}
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Theme</Text>
                <ThemeToggle />
              </View>
            </View>
          </View>

        </View>
        

        <View style={styles.guestBody}>
          <TouchableOpacity
            onPress={exitGuestMode}
            style={styles.guestCta}
          >
            <LogIn color="#ffffff" size={20} />
            <Text style={styles.guestCtaText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleLogout = () => showAlert({
    title: 'Sign Out',
    message: 'You will be signed out of your account.',
    variant: 'danger',
    buttons: [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ],
  });

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, color: '#111827', bg: colors.accentFaint, label: 'Profile Information', route: 'ProfileInfo' },
        { icon: CreditCard, color: '#0ea5e9', bg: mode === 'dark' ? 'rgba(14,165,233,0.12)' : '#f0f9ff', label: 'Payment Methods', route: 'PaymentMethods' },
        { icon: Clock, color: '#f59e0b', bg: mode === 'dark' ? 'rgba(245,158,11,0.12)' : '#fffbeb', label: 'Transaction History', route: 'TransactionHistory' },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        { icon: Info, color: '#8b5cf6', bg: mode === 'dark' ? 'rgba(139,92,246,0.12)' : '#f5f3ff', label: 'About Us', route: 'AboutUs' },
        { icon: FileText, color: '#10b981', bg: mode === 'dark' ? 'rgba(16,185,129,0.12)' : '#ecfdf5', label: 'Terms & Conditions', route: 'TermsAndConditions' },
        { icon: Shield, color: '#3b82f6', bg: mode === 'dark' ? 'rgba(59,130,246,0.12)' : '#eff6ff', label: 'Privacy Policy', route: 'PrivacyPolicy' },
        { icon: RefreshCw, color: '#f97316', bg: mode === 'dark' ? 'rgba(249,115,22,0.12)' : '#fff7ed', label: 'Refund Policy', route: 'RefundPolicy' },
      ],
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#111827"  backgroundColor="transparent" translucent={true} />
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

        {/* ── Stat Cards ────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { icon: ShoppingBag, color: '#111827', bg: colors.accentFaint, value: ordersCount, label: 'ORDERS' },
            { icon: Heart, color: '#db2777', bg: mode === 'dark' ? 'rgba(219,39,119,0.12)' : '#fdf2f8', value: wishlistCount, label: 'WISHLIST' },
          ].map((s, i) => (
            <View key={i} style={[
              styles.statCard,
              {
                backgroundColor: mode === 'dark' ? 'rgba(28,30,43,0.95)' : colors.surface,
                borderColor: mode === 'dark' ? '#3b3f5c' : colors.border,
                borderWidth: 1
              }
            ]}>
              <View style={[styles.statIconBox, { backgroundColor: s.bg }]}>
                <s.icon color={s.color} size={20} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.body}>

          {/* ── Appearance Toggle ─────────────────────────── */}
          <View style={{ marginBottom: 24 }}>
            {/* <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text> */}
            <View style={[
              styles.sectionCard,
              {
                backgroundColor: mode === 'dark' ? 'rgba(28,30,43,0.95)' : colors.surface,
                borderColor: mode === 'dark' ? '#3b3f5c' : colors.border,
              }
            ]}>
              <View style={[styles.menuRow, { borderBottomWidth: 0 }]}>
                <View style={[styles.menuIconBox, { backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.08)' : '#f3f4f6' }]}>
                  {mode === 'dark'
                    ? <Moon color="#ffffff" size={18} strokeWidth={2} />
                    : <Sun color="#111827" size={18} strokeWidth={2} />}
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Theme</Text>
                <ThemeToggle />
              </View>
            </View>
          </View>

          {/* ── Menu Sections ─────────────────────────────── */}
          {menuSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{section.title}</Text>
              <View style={[
                styles.sectionCard,
                {
                  backgroundColor: mode === 'dark' ? 'rgba(28,30,43,0.95)' : colors.surface,
                  borderColor: mode === 'dark' ? '#3b3f5c' : colors.border,
                }
              ]}>
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

          {/* ── Launch Your Store CTA ──────────────────────── */}
          {!isSeller && (
            <TouchableOpacity
              onPress={() => navigation.navigate('StoreLaunch')}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.15)',
                borderRadius: 20, paddingVertical: 18, paddingHorizontal: 20,
                marginBottom: 28,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#111827', textTransform: 'uppercase', marginBottom: 4 }}>Become a Seller</Text>
                <Text style={{ fontSize: 17, fontWeight: '900', color: colors.text, letterSpacing: -0.3 }}>Launch Your Store →</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '500', marginTop: 2 }}>Open your digital mall in minutes</Text>
              </View>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', marginLeft: 16 }}>
                <Store color="#fff" size={20} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          )}

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            style={[styles.signOutBtn, { backgroundColor: colors.dangerFaint, borderColor: colors.dangerBorder }]}
          >
            <LogOut color={colors.danger} size={18} strokeWidth={2} />
            <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Guest
  guestHeader: { backgroundColor: '#111827', paddingTop: 80, paddingBottom: 48, paddingHorizontal: 28, alignItems: 'center' },
  guestAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  guestTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff', marginBottom: 8 },
  guestSub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center', fontWeight: '500' },
  guestBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  guestCta: { backgroundColor: '#111827', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', gap: 12 },
  guestCtaText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },

  // Header — always indigo regardless of theme
  header: { backgroundColor: '#111827', paddingTop: 56, paddingBottom: 52, paddingHorizontal: 24 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  avatarLetter: { fontSize: 28, fontWeight: '900', color: '#ffffff' },
  welcomeText: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
  nameText: { fontSize: 17, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: -28, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 20, padding: 18 },
  statIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },

  // Body
  body: { paddingHorizontal: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  sectionCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1 },

  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 18, gap: 14 },
  menuIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },

  // Sign out
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 16, marginTop: 4, borderWidth: 1 },
  signOutText: { fontSize: 15, fontWeight: '700' },

  // ── Theme Toggle ──────────────────────────────────
  toggleTrack: {
    width: TOGGLE_W,
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  togglePill: {
    position: 'absolute',
    top: 2,
    width: HALF - 4,
    height: 32,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 1,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    zIndex: 2,
  },
  toggleLabel: { fontSize: 12, fontWeight: '700' },
});
