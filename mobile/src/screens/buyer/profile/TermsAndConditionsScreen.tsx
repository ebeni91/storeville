import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useThemeStore } from '../../../store/themeStore';

interface Props { navigation: any; }

const sections = [
  { title: '1. Acceptance of Terms', body: 'By downloading, installing, or using the StoreVille application ("App"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App.' },
  { title: '2. Use of the App', body: 'StoreVille grants you a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes. You may not copy, modify, distribute, sell, or lease any part of our services.' },
  { title: '3. User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials. You must immediately notify StoreVille of any unauthorized use of your account.' },
  { title: '4. Seller Obligations', body: 'Sellers on StoreVille must provide accurate product/service information, maintain adequate inventory, and fulfill orders in a timely manner.' },
  { title: '5. Prohibited Activities', body: 'You agree not to engage in: fraudulent transactions, listing illegal products or services, harassing other users or sellers, or any activity that violates applicable laws.' },
  { title: '6. Payment & Fees', body: 'All prices are displayed in Ethiopian Birr (ETB). StoreVille may charge a platform fee on transactions. Payment processing is handled by certified third-party providers.' },
  { title: '7. Limitation of Liability', body: 'StoreVille shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.' },
  { title: '8. Changes to Terms', body: 'StoreVille reserves the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the new terms.' },
  { title: '9. Contact', body: 'For questions about these Terms, contact us at legal@storeville.app.' },
];

export function TermsAndConditionsScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}>
          <ArrowLeft color={colors.text} size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>Last updated: April 2026</Text>
        <View style={[styles.intro, { backgroundColor: colors.accentFaint }]}>
          <Text style={[styles.introText, { color: colors.accentText }]}>Please read these Terms and Conditions carefully before using the StoreVille platform.</Text>
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
  lastUpdated: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  intro: { borderRadius: 14, padding: 16, marginBottom: 24 },
  introText: { fontSize: 14, fontWeight: '600', lineHeight: 22 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  sectionBody: { fontSize: 14, fontWeight: '500', lineHeight: 22 },
});
