import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface Props { navigation: any; }

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By downloading, installing, or using the StoreVille application ("App"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App.',
  },
  {
    title: '2. Use of the App',
    body: 'StoreVille grants you a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes. You may not copy, modify, distribute, sell, or lease any part of our services.',
  },
  {
    title: '3. User Accounts',
    body: 'You are responsible for maintaining the confidentiality of your account credentials. You must immediately notify StoreVille of any unauthorized use of your account. StoreVille will not be liable for any loss resulting from unauthorized use of your account.',
  },
  {
    title: '4. Seller Obligations',
    body: 'Sellers on StoreVille must provide accurate product/service information, maintain adequate inventory, and fulfill orders in a timely manner. StoreVille reserves the right to suspend or terminate seller accounts that violate these obligations.',
  },
  {
    title: '5. Prohibited Activities',
    body: 'You agree not to engage in: fraudulent transactions, listing illegal products or services, harassing other users or sellers, attempting to access unauthorized areas of the App, or any activity that violates applicable laws.',
  },
  {
    title: '6. Payment & Fees',
    body: 'All prices are displayed in Ethiopian Birr (ETB). StoreVille may charge a platform fee on transactions. Payment processing is handled by certified third-party providers. StoreVille does not store full card details on its servers.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'StoreVille shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App or inability to access it. Our liability is limited to the amount paid for the transaction in dispute.',
  },
  {
    title: '8. Changes to Terms',
    body: 'StoreVille reserves the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the new terms. We will notify users of material changes via email or in-app notification.',
  },
  {
    title: '9. Contact',
    body: 'For questions about these Terms, contact us at legal@storeville.app.',
  },
];

export function TermsAndConditionsScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Text style={styles.lastUpdated}>Last updated: April 2026</Text>
        <Text style={styles.intro}>
          Please read these Terms and Conditions carefully before using the StoreVille platform.
        </Text>

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
  lastUpdated: { fontSize: 12, fontWeight: '600', color: '#9ca3af', marginBottom: 8 },
  intro: { fontSize: 15, fontWeight: '500', color: '#4b5563', lineHeight: 24, marginBottom: 24, padding: 16, backgroundColor: '#eef2ff', borderRadius: 14 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 8 },
  sectionBody: { fontSize: 14, fontWeight: '500', color: '#4b5563', lineHeight: 22 },
});
