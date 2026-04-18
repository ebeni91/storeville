import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useThemeStore } from '../../../store/themeStore';

interface Props { navigation: any; }

const sections = [
  { title: '1. Information We Collect', body: 'We collect information you provide directly: name, email address, phone number, and delivery addresses. We also collect usage data such as pages viewed, search queries, and order history.' },
  { title: '2. How We Use Your Information', body: 'Your information is used to: process orders and payments, provide customer support, personalize your experience, send order updates, and improve our services through analytics.' },
  { title: '3. Information Sharing', body: 'We do not sell your personal data. We share information only with sellers to fulfill orders, payment processors, and service providers under confidentiality agreements.' },
  { title: '4. Data Storage & Security', body: 'Your data is stored on secure servers with encryption at rest and in transit. We use industry-standard TLS/SSL protocols. Access is restricted to authorized personnel only.' },
  { title: '5. Cookies & Tracking', body: 'We use session tokens to keep you logged in and analytics to understand App usage. We do not use third-party advertising trackers.' },
  { title: '6. Your Rights', body: 'You have the right to: access the personal data we hold about you, request correction of inaccurate data, request deletion of your account, and withdraw consent for marketing.' },
  { title: '7. Data Retention', body: 'We retain your data for as long as your account is active. Upon account deletion, personal data is purged within 30 days, except where retention is required by law.' },
  { title: "8. Children's Privacy", body: 'StoreVille is not directed at children under 13. We do not knowingly collect personal information from children.' },
  { title: '9. Contact', body: 'For privacy-related inquiries, contact us at privacy@storeville.app.' },
];

export function PrivacyPolicyScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}  backgroundColor="transparent" translucent={true} />
      <View style={[styles.header, { 
        backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.98)' : colors.surface, 
        borderBottomColor: mode === 'dark' ? '#3b3f5c' : colors.border 
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}>
          <ArrowLeft color={colors.text} size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>Last updated: April 2026</Text>
        <View style={[styles.intro, { backgroundColor: mode === 'dark' ? 'rgba(59,130,246,0.12)' : '#eff6ff' }]}>
          <Text style={[styles.introText, { color: mode === 'dark' ? '#60a5fa' : '#2563eb' }]}>Your privacy matters to us. This policy explains what data we collect, why we collect it, and how we protect it.</Text>
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
