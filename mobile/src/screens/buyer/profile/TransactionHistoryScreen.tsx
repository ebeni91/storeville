import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { ArrowLeft, ShoppingBag, Coffee, Package } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useThemeStore } from '../../../store/themeStore';

interface Props { navigation: any; }

const fetchRetailOrders = async () => { const res = await api.get('/orders/retail/'); return res.data.results || res.data; };
const fetchFoodOrders = async () => { const res = await api.get('/orders/food/'); return res.data.results || res.data; };

export function TransactionHistoryScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();
  const { data: retailOrders = [], isLoading: lr } = useQuery({ queryKey: ['retailOrders'], queryFn: fetchRetailOrders });
  const { data: foodOrders = [], isLoading: lf } = useQuery({ queryKey: ['foodOrders'], queryFn: fetchFoodOrders });

  const allOrders = [
    ...retailOrders.map((o: any) => ({ ...o, orderType: 'retail' })),
    ...foodOrders.map((o: any) => ({ ...o, orderType: 'food' })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
    pending:   { text: '#f59e0b', bg: mode === 'dark' ? 'rgba(245,158,11,0.15)' : '#fffbeb' },
    confirmed: { text: colors.accent, bg: colors.accentFaint },
    preparing: { text: '#0ea5e9', bg: mode === 'dark' ? 'rgba(14,165,233,0.15)' : '#f0f9ff' },
    delivered: { text: '#10b981', bg: mode === 'dark' ? 'rgba(16,185,129,0.15)' : '#ecfdf5' },
    cancelled: { text: colors.danger, bg: colors.dangerFaint },
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      {(lr || lf) ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : allOrders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <View style={[styles.emptyIconBox, { backgroundColor: colors.surfaceAlt }]}>
            <Package color={colors.textMuted} size={40} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Transactions Yet</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>Your order history will appear here once you make your first purchase.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          {allOrders.map((order: any) => {
            const status = order.status?.toLowerCase() || 'pending';
            const sc = STATUS_COLORS[status] || { text: colors.textMuted, bg: colors.surfaceAlt };
            const isFood = order.orderType === 'food';
            const shortId = order.id?.substring(0, 8).toUpperCase() || '—';
            const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const total = `ETB ${order.total_price_with_delivery || order.total_price || '—'}`;
            return (
              <View key={order.id} style={[styles.orderCard, { 
                backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
                borderColor: mode === 'dark' ? '#3b3f5c' : colors.border 
              }]}>
                <View style={[styles.orderIcon, { backgroundColor: isFood ? (mode === 'dark' ? 'rgba(249,115,22,0.15)' : '#fff7ed') : colors.accentFaint }]}>
                  {isFood ? <Coffee color="#f97316" size={20} strokeWidth={2} /> : <ShoppingBag color={colors.accent} size={20} strokeWidth={2} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={[styles.orderId, { color: colors.text }]}>ORD-{shortId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusText, { color: sc.text }]}>{status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={[styles.orderDate, { color: colors.textMuted }]}>{date}</Text>
                  <Text style={[styles.orderTotal, { color: colors.text }]}>{total}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  orderCard: { borderRadius: 18, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 14, borderWidth: 1 },
  orderIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  orderId: { fontSize: 15, fontWeight: '800' },
  orderDate: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  orderTotal: { fontSize: 16, fontWeight: '900' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  emptyIconBox: { padding: 24, borderRadius: 24, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptySub: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
});
