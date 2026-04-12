import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { ArrowLeft, CreditCard, Plus, Lock, Smartphone, Building } from 'lucide-react-native';
import { useThemeStore } from '../../../store/themeStore';

interface Props { navigation: any; }

const mockCards = [
  { id: '1', type: 'visa', last4: '4242', expiry: '12/27', holder: 'E. Hailu', primary: true },
  { id: '2', type: 'mastercard', last4: '8891', expiry: '09/26', holder: 'E. Hailu', primary: false },
];

export function PaymentMethodsScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();

  const wallets = [
    { icon: Smartphone, label: 'Telebirr', color: '#7c3aed', bg: mode === 'dark' ? 'rgba(124,58,237,0.12)' : '#f5f3ff' },
    { icon: Building, label: 'Bank Transfer', color: '#0ea5e9', bg: mode === 'dark' ? 'rgba(14,165,233,0.12)' : '#f0f9ff' },
    { icon: CreditCard, label: 'CBE Birr', color: '#10b981', bg: mode === 'dark' ? 'rgba(16,185,129,0.12)' : '#ecfdf5' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { 
        backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.98)' : colors.surface, 
        borderBottomColor: mode === 'dark' ? '#3b3f5c' : colors.border 
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}>
          <ArrowLeft color={colors.text} size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Saved Cards</Text>
        <View style={[styles.section, { 
          backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
          borderColor: mode === 'dark' ? '#3b3f5c' : colors.border 
        }]}>
          {mockCards.map((card, i) => (
            <View key={card.id} style={[styles.cardRow, i > 0 && { borderTopWidth: 1, borderTopColor: mode === 'dark' ? '#3b3f5c' : colors.border }]}>
              <View style={styles.cardVisual}>
                <Text style={styles.cardType}>{card.type.toUpperCase()}</Text>
                <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={styles.cardSub}>{card.holder}</Text>
                  <Text style={styles.cardSub}>{card.expiry}</Text>
                </View>
              </View>
              {card.primary && <View style={styles.primaryBadge}><Text style={styles.primaryText}>Primary</Text></View>}
            </View>
          ))}
          <TouchableOpacity style={[styles.addBtn, { borderTopColor: mode === 'dark' ? '#3b3f5c' : colors.border }]}>
            <Plus color={colors.accent} size={20} strokeWidth={2.5} />
            <Text style={[styles.addText, { color: colors.accent }]}>Add New Card</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Mobile Wallets & Banks</Text>
        <View style={[styles.section, { 
          backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
          borderColor: mode === 'dark' ? '#3b3f5c' : colors.border 
        }]}>
          {wallets.map((m, i) => (
            <TouchableOpacity key={m.label} style={[styles.walletRow, i < wallets.length - 1 && { borderBottomWidth: 1, borderBottomColor: mode === 'dark' ? '#3b3f5c' : colors.border }]}>
              <View style={[styles.walletIcon, { backgroundColor: m.bg }]}><m.icon color={m.color} size={18} strokeWidth={2} /></View>
              <Text style={[styles.walletLabel, { color: colors.text }]}>{m.label}</Text>
              <View style={[styles.comingSoon, { backgroundColor: colors.surfaceAlt }]}><Text style={[styles.comingSoonText, { color: colors.textMuted }]}>Coming Soon</Text></View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.notice, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Lock color={colors.textMuted} size={14} strokeWidth={2} />
          <Text style={[styles.noticeText, { color: colors.textSub }]}>All payment data is encrypted end-to-end and never stored on our servers.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },
  section: { borderRadius: 20, marginBottom: 24, borderWidth: 1, overflow: 'hidden' },
  cardRow: { padding: 16 },
  cardVisual: { backgroundColor: '#6366f1', borderRadius: 16, padding: 20 },
  cardType: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 16 },
  cardNumber: { fontSize: 18, fontWeight: '700', color: '#ffffff', letterSpacing: 2 },
  cardSub: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  primaryBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, alignSelf: 'flex-start', marginTop: 10 },
  primaryText: { fontSize: 11, fontWeight: '800', color: '#16a34a' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, borderTopWidth: 1 },
  addText: { fontSize: 14, fontWeight: '700' },
  walletRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, gap: 14 },
  walletIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  walletLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  comingSoon: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  comingSoonText: { fontSize: 11, fontWeight: '700' },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 14, padding: 16, borderWidth: 1 },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '500', lineHeight: 18 },
});
