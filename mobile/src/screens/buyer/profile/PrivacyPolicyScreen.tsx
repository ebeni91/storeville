import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface Props { navigation: any; }

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly: name, email address, phone number, and delivery addresses. We also collect usage data such as pages viewed, search queries, and order history to improve the App experience.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your information is used to: process orders and payments, provide customer support, personalize your experience, send important updates about your orders, and improve our services through analytics.',
  },
  {
    title: '3. Information Sharing',
    body: 'We do not sell your personal data. We share information only with: sellers to fulfill your orders (limited to necessary details), payment processors (encrypted), and service providers acting on our behalf under confidentiality agreements.',
  },
  {
    title: '4. Data Storage & Security',
    body: 'Your data is stored on secure servers with encryption at rest and in transit. We use industry-standard TLS/SSL protocols. Access to personal data is restricted to authorized personnel only.',
  },
  {
    title: '5. Cookies & Tracking',
    body: 'We use session tokens to keep you logged in and analytics to understand how the App is used. We do not use third-party advertising trackers. You can clear app data at any time through your device settings.',
  },
  {
    title: '6. Your Rights',
    body: 'You have the right to: access the personal data we hold about you, request correction of inaccurate data, request deletion of your account and associated data, and withdraw consent for marketing communications at any time.',
  },
  {
    title: '7. Data Retention',
    body: 'We retain your data for as long as your account is active or as needed for legal and operational purposes. Upon account deletion, personal data is purged within 30 days, except where retention is required by law.',
  },
  {
    title: '8. Children\'s Privacy',
    body: 'StoreVille is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.',
  },
  {
    title: '9. Contact',
    body: 'For privacy-related inquiries or to exercise your rights, contact us at privacy@storeville.app.',
  },
];

export function PrivacyPolicyScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Text style={styles.lastUpdated}>Last updated: April 2026</Text>
        <Text style={styles.intro}>
          Your privacy matters to us. This policy explains what data we collect, why we collect it, and how we protect it.
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
  intro: { fontSize: 15, fontWeight: '500', color: '#4b5563', lineHeight: 24, marginBottom: 24, padding: 16, backgroundColor: '#eff6ff', borderRadius: 14 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 8 },
  sectionBody: { fontSize: 14, fontWeight: '500', color: '#4b5563', lineHeight: 22 },
});
