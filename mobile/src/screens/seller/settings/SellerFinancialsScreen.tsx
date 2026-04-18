import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar
} from 'react-native';
import { ChevronLeft, CreditCard, Smartphone, Building2, Plus } from 'lucide-react-native';
import { useThemeStore } from '../../../store/themeStore';

interface Props { navigation: any; }

const METHODS = [
  {
    id: 'chapa',
    label: 'Chapa',
    sub: 'Accept payments via Chapa gateway',
    icon: CreditCard,
    color: '#111827',
    bg: 'rgba(99,102,241,0.12)',
    bgLight: '#f3f4f6',
    status: 'connected',
  },
  {
    id: 'telebirr',
    label: 'Telebirr',
    sub: 'Ethiopias leading mobile money',
    icon: Smartphone,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    bgLight: '#fffbeb',
    status: 'not_connected',
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    sub: 'CBE, Awash, Abyssinia & more',
    icon: Building2,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    bgLight: '#ecfdf5',
    status: 'not_connected',
  },
];

export function SellerFinancialsScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'}  backgroundColor="transparent" translucent={true} />
      <View style={[styles.topBar, { 
        backgroundColor: isDark ? 'rgba(28, 30, 43, 0.98)' : colors.surface, 
        borderBottomColor: isDark ? '#3b3f5c' : colors.border 
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Financials</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>

        {/* Earnings summary */}
        <View style={[styles.summaryCard, { backgroundColor: '#111827' }]}>
          <Text style={styles.summaryLabel}>Available Balance</Text>
          <Text style={styles.summaryAmount}>Br 0.00</Text>
          <Text style={styles.summaryNote}>Payouts available after integration</Text>
        </View>

        {/* Payment methods */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Payment Methods</Text>
        <View style={[styles.card, { 
          backgroundColor: isDark ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
          borderColor: isDark ? '#3b3f5c' : colors.border 
        }]}>
          {METHODS.map((m, idx) => (
            <View
              key={m.id}
              style={[
                styles.methodRow, 
                idx < METHODS.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#3b3f5c' : colors.border }
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: isDark ? m.bg : m.bgLight }]}>
                <m.icon color={m.color} size={18} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodLabel, { color: colors.text }]}>{m.label}</Text>
                <Text style={[styles.methodSub, { color: colors.textMuted }]}>{m.sub}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                m.status === 'connected'
                  ? { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5' }
                  : { backgroundColor: colors.surfaceAlt },
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: m.status === 'connected' ? '#10b981' : colors.textMuted }
                ]}>
                  {m.status === 'connected' ? 'Connected' : 'Add'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Integration notice */}
        <View style={[styles.noticeCard, { 
          backgroundColor: isDark ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
          borderColor: isDark ? '#3b3f5c' : colors.border 
        }]}>
          <View style={[styles.iconBox, { backgroundColor: colors.accentFaint }]}>
            <Plus color={colors.accent} size={18} strokeWidth={2} />
          </View>
          <Text style={[styles.noticeText, { color: colors.textSub }]}>
            Full payment integrations go live with Chapa API keys. Contact support to activate your payout account.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  summaryCard: { borderRadius: 24, padding: 24, marginBottom: 28 },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  summaryAmount: { color: '#ffffff', fontSize: 40, fontWeight: '900', letterSpacing: -1.5, marginBottom: 6 },
  summaryNote: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '500' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 18 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodLabel: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  methodSub: { fontSize: 12, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  statusText: { fontSize: 12, fontWeight: '800' },
  noticeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, borderRadius: 18, padding: 16, borderWidth: 1 },
  noticeText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 19 },
});
