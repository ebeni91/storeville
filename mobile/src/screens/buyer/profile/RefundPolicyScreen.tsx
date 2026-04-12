import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useThemeStore } from '../../../store/themeStore';

interface Props { navigation: any; }

const sections = [
  { title: '1. Eligibility for Refund', body: 'You may request a refund if: the item received is significantly different from what was described, the order was not delivered within the expected timeframe, or the order was delivered in a damaged condition.' },
  { title: '2. Non-Refundable Items', body: 'The following are not eligible for refund: food and beverage orders that have been delivered and accepted, digital goods once accessed, and items explicitly marked as "final sale".' },
  { title: '3. Refund Request Window', body: 'Refund requests must be submitted within 24 hours of delivery for food orders, and within 7 days of delivery for retail orders.' },
  { title: '4. How to Request a Refund', body: 'Go to Transaction History, select the order in question, tap "Request Refund", and describe the issue. Our support team will review within 1–3 business days.' },
  { title: '5. Refund Processing', body: 'Approved refunds will be processed back to your original payment method within 5–10 business days. Mobile wallet refunds may be issued as StoreVille credits.' },
  { title: '6. Partial Refunds', body: 'A partial refund may be issued if only a portion of an order was missing or incorrect. StoreVille will determine the refund amount after reviewing evidence.' },
  { title: '7. Seller Disputes', body: 'If a seller disputes your refund claim, StoreVille will mediate the review process. Our decision is final.' },
  { title: '8. Contact', body: 'For refund support, contact us at support@storeville.app or through the in-app support chat.' },
];

export function RefundPolicyScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Refund Policy</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>Last updated: April 2026</Text>
        <View style={[styles.banner, { backgroundColor: mode === 'dark' ? 'rgba(249,115,22,0.12)' : '#fff7ed', borderColor: mode === 'dark' ? 'rgba(249,115,22,0.25)' : '#fed7aa' }]}>
          <RefreshCw color="#f97316" size={20} strokeWidth={2} />
          <Text style={[styles.bannerText, { color: '#f97316' }]}>We stand behind every purchase. If something goes wrong, we&#39;ll make it right.</Text>
        </View>
        {sections.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{s.title}</Text>
            <Text style={[styles.sectionBody, { color: colors.textSub }]}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  lastUpdated: { fontSize: 12, fontWeight: '600', marginBottom: 12 },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1 },
  bannerText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 21 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  sectionBody: { fontSize: 14, fontWeight: '500', lineHeight: 22 },
});
