import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TrendingUp, Package, ClipboardList, Clock, Store, ChevronRight } from 'lucide-react-native';
import { authClient } from '../../lib/auth-client';
import { api } from '../../lib/api';
import { useThemeStore } from '../../store/themeStore';

export function SellerHomeScreen({ navigation }: { navigation: any }) {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';
  const { data: session } = authClient.useSession();
  const user = session?.user as any;
  const identifier = user?.email || user?.phone_number || 'Seller';
  const [store, setStore] = useState<any>(null);
  const [stats, setStats] = useState({ sales: 0, pendingOrders: 0, activeItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cardBg = isDark ? 'rgba(28, 30, 43, 0.95)' : '#ffffff';
  const cardBorder = isDark ? '#3b3f5c' : '#f3f4f6';
  const headerBg = isDark ? 'rgba(28, 30, 43, 0.98)' : '#ffffff';
  const headerBorder = isDark ? '#3b3f5c' : '#f3f4f6';

  const fetchData = async () => {
    try {
      const storeRes = await api.get('/stores/manage');
      const currentStore = storeRes.data?.results?.[0] || storeRes.data?.[0];
      if (currentStore) {
        setStore(currentStore);
        const isFood = currentStore.store_type === 'FOOD';
        const ordersPromise = api.get(isFood ? '/orders/food/' : '/orders/retail/');
        const itemsPromise = api.get(isFood ? `/food/items?store_id=${currentStore.id}` : `/retail/products?store_id=${currentStore.id}`);
        const [ordersRes, itemsRes] = await Promise.all([ordersPromise, itemsPromise]);
        const orders = ordersRes.data?.results || ordersRes.data || [];
        const items = itemsRes.data?.results || itemsRes.data || [];
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysSales = orders
          .filter((o: any) => o.created_at.startsWith(todayStr) && o.status !== 'CANCELLED')
          .reduce((sum: number, o: any) => sum + parseFloat(o.total_amount), 0);
        const pending = orders.filter((o: any) => o.status === 'PENDING').length;
        const activeItemCount = items.filter((i: any) => (isFood ? i.is_available : i.is_active)).length;
        setStats({ sales: todaysSales, pendingOrders: pending, activeItems: activeItemCount });
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const isFood = store?.store_type === 'FOOD';
  const accent = isFood ? '#f97316' : '#4f46e5';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* Header */}
      <View style={{
        paddingTop: 64, paddingBottom: 24, paddingHorizontal: 24, marginBottom: 8,
        backgroundColor: headerBg, borderBottomWidth: 1, borderBottomColor: headerBorder,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: -1, marginBottom: 4 }}>Dashboard</Text>
            <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 14 }}>Welcome back, {identifier}</Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 18, backgroundColor: isFood ? 'rgba(249,115,22,0.12)' : 'rgba(79,70,229,0.12)', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={24} color={accent} />
          </View>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={{ padding: 24 }}>
        {/* Today's Sales - full width */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            backgroundColor: cardBg, padding: 20, borderRadius: 28, marginBottom: 16,
            borderWidth: 1, borderColor: cardBorder, flexDirection: 'row', alignItems: 'center',
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0 : 0.04, shadowRadius: 8, elevation: 1,
          }}
        >
          <View style={{ width: 56, height: 56, backgroundColor: 'rgba(5,150,105,0.12)', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
            <TrendingUp size={24} color="#059669" />
          </View>
          <View>
            <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: 4 }}>Today's Sales</Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text }}>Br {stats.sales.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>

        {/* 2-column row */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.8}
            style={{ flex: 1, backgroundColor: cardBg, padding: 20, borderRadius: 28, borderWidth: 1, borderColor: cardBorder }}
          >
            <View style={{ width: 48, height: 48, backgroundColor: 'rgba(249,115,22,0.12)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Clock size={20} color="#ea580c" />
            </View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 4 }}>{stats.pendingOrders}</Text>
            <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: colors.textMuted, letterSpacing: 2 }}>Pending Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Products')}
            activeOpacity={0.8}
            style={{ flex: 1, backgroundColor: cardBg, padding: 20, borderRadius: 28, borderWidth: 1, borderColor: cardBorder }}
          >
            <View style={{ width: 48, height: 48, backgroundColor: 'rgba(79,70,229,0.12)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Package size={20} color="#4f46e5" />
            </View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 4 }}>{stats.activeItems}</Text>
            <Text style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: colors.textMuted, letterSpacing: 2 }}>
              Active {isFood ? 'Menu' : 'Products'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View style={{ backgroundColor: cardBg, borderRadius: 28, padding: 8, borderWidth: 1, borderColor: cardBorder }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: cardBorder }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f9fafb', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Store size={18} color={colors.textMuted} />
              </View>
              <Text style={{ fontWeight: '700', color: colors.text, fontSize: 15 }}>Store Profile Setup</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Orders')}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f9fafb', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <ClipboardList size={18} color={colors.textMuted} />
              </View>
              <Text style={{ fontWeight: '700', color: colors.text, fontSize: 15 }}>Fulfillment Hub</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
