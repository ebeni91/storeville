import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { authClient } from '../../lib/auth-client';
import { useThemeStore } from '../../store/themeStore';
import { Package, Clock, CheckCircle, XCircle, Truck, LogIn } from 'lucide-react-native';

export function OrdersScreen() {
  const { isGuest } = useAuthStore();
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;
  const selectedGateway = 'FOOD';
  const { colors, mode } = useThemeStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['buyer-orders', selectedGateway],
    enabled: isAuthenticated && !isGuest,
    queryFn: async () => {
      const endpoint = selectedGateway === 'FOOD' ? '/orders/food/' : '/orders/retail/';
      const response = await api.get(endpoint);
      return response.data.results || response.data;
    }
  });

  if (!isAuthenticated || isGuest) {
    return (
      <View style={[styles.root, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
          <LogIn color={colors.textMuted} size={32} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Login to View Orders</Text>
        <Text style={[styles.emptySub, { color: colors.textMuted }]}>Sign in to see your order history and track deliveries.</Text>
      </View>
    );
  }

  const STATUS_MAP: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    PENDING:          { color: '#f59e0b', bg: mode === 'dark' ? 'rgba(245,158,11,0.15)' : '#fffbeb', icon: Clock,         label: 'Pending' },
    ACCEPTED:         { color: '#111827', bg: mode === 'dark' ? 'rgba(0,0,0,0.08)' : '#f3f4f6', icon: CheckCircle,   label: 'Accepted' },
    COOKING:          { color: '#f97316', bg: mode === 'dark' ? 'rgba(249,115,22,0.15)' : '#fff7ed',  icon: Clock,        label: 'In Kitchen' },
    PROCESSING:       { color: '#0ea5e9', bg: mode === 'dark' ? 'rgba(14,165,233,0.15)' : '#f0f9ff', icon: Package,       label: 'Processing' },
    SHIPPED:          { color: '#8b5cf6', bg: mode === 'dark' ? 'rgba(139,92,246,0.15)' : '#f5f3ff', icon: Truck,         label: 'Shipped' },
    READY:            { color: '#10b981', bg: mode === 'dark' ? 'rgba(16,185,129,0.15)' : '#ecfdf5', icon: CheckCircle,   label: 'Ready' },
    OUT_FOR_DELIVERY: { color: '#8b5cf6', bg: mode === 'dark' ? 'rgba(139,92,246,0.15)' : '#f5f3ff', icon: Truck,        label: 'On the Way' },
    DELIVERED:        { color: '#10b981', bg: mode === 'dark' ? 'rgba(16,185,129,0.15)' : '#ecfdf5', icon: CheckCircle,   label: 'Delivered' },
    CANCELLED:        { color: '#ef4444', bg: mode === 'dark' ? 'rgba(239,68,68,0.15)'  : '#fff1f2', icon: XCircle,       label: 'Cancelled' },
  };

  const renderOrder = ({ item }: { item: any }) => {
    const s = STATUS_MAP[item.status] || { color: colors.textMuted, bg: colors.surfaceAlt, icon: Clock, label: item.status };
    const StatusIcon = s.icon;
    // Explore-style soft dark card
    const cardBg = mode === 'dark' ? 'rgba(28,30,43,0.95)' : colors.surface;
    const cardBorder = mode === 'dark' ? '#3b3f5c' : colors.border;
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.storeName, { color: colors.text }]}>{item.store_name || 'Store Order'}</Text>
            <Text style={[styles.orderDate, { color: colors.textMuted }]}>
              {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <StatusIcon color={s.color} size={13} strokeWidth={2} />
            <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.cardBottom}>
          <Text style={[styles.itemCount, { color: colors.textSub }]}>{item.items?.length || 0} items</Text>
          <Text style={[styles.total, { color: colors.accent }]}>{parseFloat(item.total_amount || 0).toFixed(2)} Birr</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}  backgroundColor="transparent" translucent={true} />
      <View style={[
        styles.header,
        {
          backgroundColor: mode === 'dark' ? 'rgba(28,30,43,0.98)' : colors.surface,
          borderBottomColor: mode === 'dark' ? '#3b3f5c' : colors.border,
        }
      ]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>
          {selectedGateway === 'FOOD' ? 'Food & Coffee Orders' : 'Retail Orders'}
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={orders || []}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
                <Package color={colors.textMuted} size={36} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>Your orders will appear here.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900' },
  headerSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  card: { borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  storeName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  orderDate: { fontSize: 12, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
  statusText: { fontSize: 11, fontWeight: '800' },
  divider: { height: 1, marginBottom: 12 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCount: { fontSize: 14, fontWeight: '500' },
  total: { fontSize: 17, fontWeight: '900' },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptySub: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
});

