import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { ArrowLeft, CreditCard, Plus, Lock, Smartphone, Building } from 'lucide-react-native';

interface Props { navigation: any; }

const mockCards = [
  { id: '1', type: 'visa', last4: '4242', expiry: '12/27', holder: 'E. Hailu', primary: true },
  { id: '2', type: 'mastercard', last4: '8891', expiry: '09/26', holder: 'E. Hailu', primary: false },
];

const methodIcons = [
  { icon: Smartphone, label: 'Telebirr', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: Building, label: 'Bank Transfer', color: '#0ea5e9', bg: '#f0f9ff' },
  { icon: CreditCard, label: 'CBE Birr', color: '#10b981', bg: '#ecfdf5' },
];

export function PaymentMethodsScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>

        {/* Saved Cards */}
        <Text style={styles.sectionLabel}>Saved Cards</Text>
        <View style={styles.section}>
          {mockCards.map((card) => (
            <View key={card.id} style={styles.cardRow}>
              <View style={styles.cardVisual}>
                <Text style={styles.cardType}>{card.type.toUpperCase()}</Text>
                <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={styles.cardSub}>{card.holder}</Text>
                  <Text style={styles.cardSub}>{card.expiry}</Text>
                </View>
              </View>
              {card.primary && (
                <View style={styles.primaryBadge}><Text style={styles.primaryText}>Primary</Text></View>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn}>
            <Plus color="#6366f1" size={20} strokeWidth={2.5} />
            <Text style={styles.addText}>Add New Card</Text>
          </TouchableOpacity>
        </View>

        {/* Mobile Wallets */}
        <Text style={styles.sectionLabel}>Mobile Wallets & Banks</Text>
        <View style={[styles.section, { padding: 4 }]}>
          {methodIcons.map((m, i) => (
            <TouchableOpacity key={m.label} style={[styles.walletRow, i < methodIcons.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }]}>
              <View style={[styles.walletIcon, { backgroundColor: m.bg }]}>
                <m.icon color={m.color} size={18} strokeWidth={2} />
              </View>
              <Text style={styles.walletLabel}>{m.label}</Text>
              <View style={styles.comingSoon}><Text style={styles.comingSoonText}>Coming Soon</Text></View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security notice */}
        <View style={styles.notice}>
          <Lock color="#6b7280" size={14} strokeWidth={2} />
          <Text style={styles.noticeText}>All payment data is encrypted end-to-end and never stored on our servers.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },
  section: { backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, overflow: 'hidden' },
  cardRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  cardVisual: { backgroundColor: '#6366f1', borderRadius: 16, padding: 20 },
  cardType: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 16 },
  cardNumber: { fontSize: 18, fontWeight: '700', color: '#ffffff', letterSpacing: 2 },
  cardSub: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  primaryBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, alignSelf: 'flex-start', marginTop: 10 },
  primaryText: { fontSize: 11, fontWeight: '800', color: '#16a34a' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  addText: { fontSize: 14, fontWeight: '700', color: '#6366f1' },
  walletRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, gap: 14 },
  walletIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  walletLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },
  comingSoon: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  comingSoonText: { fontSize: 11, fontWeight: '700', color: '#9ca3af' },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#f9fafb', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '500', color: '#6b7280', lineHeight: 18 },
});
