import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Linking } from 'react-native';
import { ArrowLeft, MapPin, Mail, Phone, Globe } from 'lucide-react-native';

interface Props { navigation: any; }

export function AboutUsScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>
              <Text style={{ fontWeight: '300', color: 'rgba(99,102,241,0.7)' }}>Store</Text>
              <Text style={{ fontWeight: '900', color: '#6366f1' }}>Ville</Text>
            </Text>
          </View>
          <Text style={styles.heroTag}>The Digital Mall of Ethiopia</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardBody}>
            StoreVille was founded with a simple but powerful vision: to bring Ethiopia's vibrant market ecosystem into the digital age. We believe every local retailer, restaurant, and café deserves a world-class digital storefront — and every shopper deserves a seamless, modern discovery experience.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What We Offer</Text>
          {[
            { emoji: '🛍', text: 'Discover retail stores, fashion, electronics, and more across your city.' },
            { emoji: '🍕', text: 'Browse cafes, restaurants, and food vendors on an interactive map.' },
            { emoji: '📦', text: 'Place orders and track deliveries in real-time.' },
            { emoji: '💳', text: 'Secure in-app payments via cards and mobile wallets.' },
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{item.emoji}</Text>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Us</Text>
          {[
            { icon: MapPin, label: 'Addis Ababa, Ethiopia', color: '#10b981', bg: '#ecfdf5' },
            { icon: Mail, label: 'support@storeville.app', color: '#6366f1', bg: '#eef2ff' },
            { icon: Phone, label: '+251 111 234 567', color: '#f59e0b', bg: '#fffbeb' },
            { icon: Globe, label: 'www.storeville.app', color: '#0ea5e9', bg: '#f0f9ff' },
          ].map((c, i) => (
            <View key={i} style={[styles.contactRow, i > 0 && { borderTopWidth: 1, borderTopColor: '#f3f4f6' }]}>
              <View style={[styles.contactIcon, { backgroundColor: c.bg }]}>
                <c.icon color={c.color} size={16} strokeWidth={2} />
              </View>
              <Text style={styles.contactText}>{c.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Made in Ethiopia 🇪🇹 · © 2026 StoreVille Technology</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  hero: { alignItems: 'center', paddingVertical: 32 },
  logoBox: { marginBottom: 12 },
  logoText: { fontSize: 48, letterSpacing: -2 },
  heroTag: { fontSize: 13, fontWeight: '600', color: '#9ca3af', letterSpacing: 1 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },
  cardBody: { fontSize: 14, fontWeight: '500', color: '#4b5563', lineHeight: 22 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  featureEmoji: { fontSize: 20 },
  featureText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#4b5563', lineHeight: 20 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
  contactIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  contactText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  footer: { textAlign: 'center', fontSize: 12, fontWeight: '500', color: '#9ca3af', marginTop: 16 },
});
