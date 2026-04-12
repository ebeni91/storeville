import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { ArrowLeft, MapPin, Mail, Phone, Globe } from 'lucide-react-native';
import { useThemeStore } from '../../../store/themeStore';

interface Props { navigation: any; }

export function AboutUsScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();

  const contacts = [
    { icon: MapPin, label: 'Addis Ababa, Ethiopia', color: '#10b981', bg: mode === 'dark' ? 'rgba(16,185,129,0.12)' : '#ecfdf5' },
    { icon: Mail, label: 'support@storeville.app', color: colors.accent, bg: colors.accentFaint },
    { icon: Phone, label: '+251 111 234 567', color: '#f59e0b', bg: mode === 'dark' ? 'rgba(245,158,11,0.12)' : '#fffbeb' },
    { icon: Globe, label: 'www.storeville.app', color: '#0ea5e9', bg: mode === 'dark' ? 'rgba(14,165,233,0.12)' : '#f0f9ff' },
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        <View style={styles.hero}>
          <Text style={styles.logoText}>
            <Text style={{ fontWeight: '300', color: mode === 'dark' ? 'rgba(129,140,248,0.6)' : 'rgba(99,102,241,0.6)' }}>Store</Text>
            <Text style={{ fontWeight: '900', color: colors.accent }}>Ville</Text>
          </Text>
          <Text style={[styles.heroTag, { color: colors.textMuted }]}>The Digital Mall of Ethiopia</Text>
        </View>

        <View style={[styles.card, { 
          backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
          borderColor: mode === 'dark' ? '#3b3f5c' : colors.border 
        }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Our Mission</Text>
          <Text style={[styles.cardBody, { color: colors.textSub }]}>StoreVille was founded with a simple but powerful vision: to bring Ethiopia&#39;s vibrant market ecosystem into the digital age. We believe every local retailer, restaurant, and café deserves a world-class digital storefront — and every shopper deserves a seamless, modern discovery experience.</Text>
        </View>

        <View style={[styles.card, { 
          backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
          borderColor: mode === 'dark' ? '#3b3f5c' : colors.border 
        }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>What We Offer</Text>
          {[
            { emoji: '🛍', text: 'Discover retail stores, fashion, electronics, and more across your city.' },
            { emoji: '🍕', text: 'Browse cafes, restaurants, and food vendors on an interactive map.' },
            { emoji: '📦', text: 'Place orders and track deliveries in real-time.' },
            { emoji: '💳', text: 'Secure in-app payments via cards and mobile wallets.' },
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{item.emoji}</Text>
              <Text style={[styles.featureText, { color: colors.textSub }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { 
          backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
          borderColor: mode === 'dark' ? '#3b3f5c' : colors.border 
        }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Contact Us</Text>
          {contacts.map((c, i) => (
            <View key={i} style={[styles.contactRow, i > 0 && { borderTopWidth: 1, borderTopColor: mode === 'dark' ? '#3b3f5c' : colors.border }]}>
              <View style={[styles.contactIcon, { backgroundColor: c.bg }]}><c.icon color={c.color} size={16} strokeWidth={2} /></View>
              <Text style={[styles.contactText, { color: colors.textSub }]}>{c.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>Made in Ethiopia 🇪🇹 · © 2026 StoreVille Technology</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  hero: { alignItems: 'center', paddingVertical: 32 },
  logoText: { fontSize: 48, letterSpacing: -2, marginBottom: 12 },
  heroTag: { fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  card: { borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  cardBody: { fontSize: 14, fontWeight: '500', lineHeight: 22 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  featureEmoji: { fontSize: 20 },
  featureText: { flex: 1, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
  contactIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  contactText: { fontSize: 14, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 12, fontWeight: '500', marginTop: 16 },
});
