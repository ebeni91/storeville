import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';

interface Props { navigation: any; }

const sections = [
  {
    title: '1. Eligibility for Refund',
    body: 'You may request a refund if: the item received is significantly different from what was described, the order was not delivered within the expected timeframe, or the order was delivered in a damaged or unusable condition.',
  },
  {
    title: '2. Non-Refundable Items',
    body: 'The following are not eligible for refund: food and beverage orders that have been delivered and accepted, digital goods or services once accessed, and items explicitly marked as "final sale" at the time of purchase.',
  },
  {
    title: '3. Refund Request Window',
    body: 'Refund requests must be submitted within 24 hours of order delivery for food orders, and within 7 days of delivery for retail orders. Requests submitted outside these windows may not be accepted.',
  },
  {
    title: '4. How to Request a Refund',
    body: 'To request a refund: go to Transaction History, select the order in question, tap "Request Refund", and describe the issue. Our support team will review your request within 1–3 business days.',
  },
  {
    title: '5. Refund Processing',
    body: 'Approved refunds will be processed back to your original payment method within 5–10 business days. For mobile wallet payments, refunds may be issued as StoreVille credits at our discretion.',
  },
  {
    title: '6. Partial Refunds',
    body: 'In some cases, a partial refund may be issued — for example, if only a portion of an order was missing or incorrect. StoreVille will determine the refund amount after reviewing evidence provided by both parties.',
  },
  {
    title: '7. Seller Disputes',
    body: 'If a seller disputes your refund claim, StoreVille will mediate the review process. Our decision is final. Sellers found to be repeatedly responsible for refund-worthy issues may have their accounts reviewed or suspended.',
  },
  {
    title: '8. Contact',
    body: 'For refund support, contact us at support@storeville.app or through the in-app support chat.',
  },
];

export function RefundPolicyScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refund Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Text style={styles.lastUpdated}>Last updated: April 2026</Text>

        {/* Notice banner */}
        <View style={styles.banner}>
          <RefreshCw color="#f97316" size={20} strokeWidth={2} />
          <Text style={styles.bannerText}>
            We stand behind every purchase. If something goes wrong, we'll make it right.
          </Text>
        </View>

        {sections.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  lastUpdated: { fontSize: 12, fontWeight: '600', color: '#9ca3af', marginBottom: 12 },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff7ed', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#fed7aa' },
  bannerText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#ea580c', lineHeight: 21 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 8 },
  sectionBody: { fontSize: 14, fontWeight: '500', color: '#4b5563', lineHeight: 22 },
});
