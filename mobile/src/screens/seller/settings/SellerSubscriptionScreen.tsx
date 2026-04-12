import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar
} from 'react-native';
import { ChevronLeft, Star, Zap, Crown, ArrowRight } from 'lucide-react-native';
import { useThemeStore } from '../../../store/themeStore';

interface Props { navigation: any; }

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    priceSub: 'forever',
    icon: Star,
    color: '#6b7280',
    accent: 'rgba(107,114,128,0.12)',
    accentLight: '#f9fafb',
    features: ['Up to 10 products', 'Basic analytics', 'Standard map pin', 'StoreVille branding'],
    current: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'Br 299',
    priceSub: 'per month',
    icon: Zap,
    color: '#6366f1',
    accent: 'rgba(99,102,241,0.12)',
    accentLight: '#eef2ff',
    features: ['Unlimited products', 'Advanced analytics', 'Priority map listing', 'Remove branding', 'Announcement bar'],
    current: false,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 'Br 799',
    priceSub: 'per month',
    icon: Crown,
    color: '#f59e0b',
    accent: 'rgba(245,158,11,0.12)',
    accentLight: '#fffbeb',
    features: ['Everything in Pro', 'Custom domain', 'Dedicated support', 'Revenue insights', 'Multi-store'],
    current: false,
  },
];

export function SellerSubscriptionScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.topBar, { 
        backgroundColor: isDark ? 'rgba(28, 30, 43, 0.98)' : colors.surface, 
        borderBottomColor: isDark ? '#3b3f5c' : colors.border 
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>

        <Text style={[styles.heading, { color: colors.text }]}>Choose your plan</Text>
        <Text style={[styles.headingSub, { color: colors.textMuted }]}>
          Scale your store with the right tools. Upgrade or downgrade at any time.
        </Text>

        {PLANS.map((plan) => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              {
                backgroundColor: plan.current ? plan.color : (isDark ? 'rgba(28, 30, 43, 0.95)' : colors.surface),
                borderColor: plan.current ? plan.color : (isDark ? '#3b3f5c' : colors.border),
                borderWidth: plan.current ? 0 : 1,
              },
            ]}
          >
            {/* Plan header */}
            <View style={styles.planHeader}>
              <View style={[
                styles.planIconBox,
                { backgroundColor: plan.current ? 'rgba(255,255,255,0.2)' : (isDark ? plan.accent : plan.accentLight) },
              ]}>
                <plan.icon
                  color={plan.current ? '#ffffff' : plan.color}
                  size={18} strokeWidth={2}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.planName, { color: plan.current ? '#ffffff' : colors.text }]}>
                  {plan.name}
                  {plan.current && <Text style={styles.currentBadge}>  · Current</Text>}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={[styles.planPrice, { color: plan.current ? '#ffffff' : colors.text }]}>{plan.price}</Text>
                  <Text style={[styles.planPriceNote, { color: plan.current ? 'rgba(255,255,255,0.65)' : colors.textMuted }]}>{plan.priceSub}</Text>
                </View>
              </View>
            </View>

            {/* Features */}
            <View style={styles.featureList}>
              {plan.features.map(f => (
                <View key={f} style={styles.featureRow}>
                  <View style={[styles.featureDot, { backgroundColor: plan.current ? 'rgba(255,255,255,0.7)' : plan.color }]} />
                  <Text style={[styles.featureText, { color: plan.current ? 'rgba(255,255,255,0.85)' : colors.textSub }]}>{f}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            {!plan.current && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.planCta, { backgroundColor: plan.color }]}
              >
                <Text style={styles.planCtaText}>Upgrade to {plan.name}</Text>
                <ArrowRight color="#ffffff" size={16} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <Text style={[styles.billingNote, { color: colors.textMuted }]}>
          All plans are billed monthly. No hidden fees. Cancel anytime.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  heading: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8, marginBottom: 8 },
  headingSub: { fontSize: 14, fontWeight: '500', lineHeight: 20, marginBottom: 28 },
  planCard: { borderRadius: 24, padding: 20, marginBottom: 16 },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  planIconBox: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  currentBadge: { fontSize: 13, fontWeight: '600', opacity: 0.75 },
  planPrice: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  planPriceNote: { fontSize: 13, fontWeight: '500' },
  featureList: { gap: 10, marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureDot: { width: 5, height: 5, borderRadius: 99 },
  featureText: { fontSize: 14, fontWeight: '500' },
  planCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14 },
  planCtaText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  billingNote: { fontSize: 12, fontWeight: '500', textAlign: 'center', marginTop: 8 },
});
