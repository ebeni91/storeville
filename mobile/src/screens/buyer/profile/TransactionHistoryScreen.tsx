import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { ArrowLeft, ShoppingBag, Coffee, ChevronRight, Package } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

interface Props { navigation: any; }

const fetchRetailOrders = async () => { const res = await api.get('/orders/retail/'); return res.data.results || res.data; };
const fetchFoodOrders = async () => { const res = await api.get('/orders/food/'); return res.data.results || res.data; };

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  pending:   { text: '#f59e0b', bg: '#fffbeb' },
  confirmed: { text: '#6366f1', bg: '#eef2ff' },
  preparing: { text: '#0ea5e9', bg: '#f0f9ff' },
  delivered: { text: '#10b981', bg: '#ecfdf5' },
  cancelled: { text: '#ef4444', bg: '#fff1f2' },
};

export function TransactionHistoryScreen({ navigation }: Props) {
  const { data: retailOrders = [], isLoading: lr } = useQuery({ queryKey: ['retailOrders'], queryFn: fetchRetailOrders });
  const { data: foodOrders = [], isLoading: lf } = useQuery({ queryKey: ['foodOrders'], queryFn: fetchFoodOrders });

  const allOrders = [
    ...retailOrders.map((o: any) => ({ ...o, orderType: 'retail' })),
    ...foodOrders.map((o: any) => ({ ...o, orderType: 'food' })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const isLoading = lr || lf;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={22} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : allOrders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <View style={{ backgroundColor: '#f3f4f6', padding: 24, borderRadius: 24, marginBottom: 16 }}>
            <Package color="#9ca3af" size={40} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#374151', marginBottom: 8 }}>No Transactions Yet</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#9ca3af', textAlign: 'center' }}>Your order history will appear here once you make your first purchase.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          {allOrders.map((order: any) => {
            const status = order.status?.toLowerCase() || 'pending';
            const sc = STATUS_COLORS[status] || STATUS_COLORS.pending;
            const isFood = order.orderType === 'food';
            const shortId = order.id?.substring(0, 8).toUpperCase() || '—';
            const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const total = `ETB ${order.total_price_with_delivery || order.total_price || '—'}`;

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={[styles.orderIcon, { backgroundColor: isFood ? '#fff7ed' : '#eef2ff' }]}>
                  {isFood ? <Coffee color="#f97316" size={20} strokeWidth={2} /> : <ShoppingBag color="#6366f1" size={20} strokeWidth={2} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.orderId}>ORD-{shortId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusText, { color: sc.text }]}>{status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.orderDate}>{date}</Text>
                  <Text style={styles.orderTotal}>{total}</Text>
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
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  orderCard: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  orderIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  orderId: { fontSize: 15, fontWeight: '800', color: '#111827' },
  orderDate: { fontSize: 12, fontWeight: '500', color: '#9ca3af', marginBottom: 6 },
  orderTotal: { fontSize: 16, fontWeight: '900', color: '#111827' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
