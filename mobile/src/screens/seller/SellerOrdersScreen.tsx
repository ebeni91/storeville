import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  Modal, ScrollView, RefreshControl
} from 'react-native';
import { ClipboardList, Clock, Eye, MapPin, X } from 'lucide-react-native';
import { api } from '../../lib/api';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';
import { useThemeStore } from '../../store/themeStore';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING:           { bg: 'rgba(234,179,8,0.12)',   text: '#ca8a04' },
  ACCEPTED:          { bg: 'rgba(59,130,246,0.12)',   text: '#2563eb' },
  COOKING:           { bg: 'rgba(249,115,22,0.12)',   text: '#ea580c' },
  PROCESSING:        { bg: 'rgba(168,85,247,0.12)',   text: '#9333ea' },
  READY:             { bg: 'rgba(99,102,241,0.12)',   text: '#4f46e5' },
  SHIPPED:           { bg: 'rgba(99,102,241,0.12)',   text: '#4f46e5' },
  OUT_FOR_DELIVERY:  { bg: 'rgba(99,102,241,0.12)',   text: '#4f46e5' },
  DELIVERED:         { bg: 'rgba(5,150,105,0.12)',    text: '#059669' },
  CANCELLED:         { bg: 'rgba(239,68,68,0.12)',    text: '#dc2626' },
};

export function SellerOrdersScreen() {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';

  const [store, setStore] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { alertState, showAlert, hideAlert } = useAlert();

  const cardBg = isDark ? 'rgba(28, 30, 43, 0.95)' : '#ffffff';
  const cardBorder = isDark ? '#3b3f5c' : '#f3f4f6';
  const headerBg = isDark ? 'rgba(28, 30, 43, 0.98)' : '#ffffff';
  const modalBg = isDark ? 'rgba(28, 30, 43, 0.99)' : '#ffffff';

  const fetchData = async () => {
    try {
      const storeRes = await api.get('/stores/manage');
      const currentStore = storeRes.data?.results?.[0] || storeRes.data?.[0];
      if (!currentStore) return;
      setStore(currentStore);
      const isFood = currentStore.store_type === 'FOOD';
      const res = await api.get(isFood ? '/orders/food/' : '/orders/retail/');
      setOrders(res.data?.results || res.data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };
  const isFood = store?.store_type === 'FOOD';

  const foodStatuses = ['PENDING', 'ACCEPTED', 'COOKING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  const retailStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const availableStatuses = isFood ? foodStatuses : retailStatuses;

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const endpoint = isFood ? `/orders/food/${orderId}` : `/orders/retail/${orderId}`;
      await api.patch(endpoint, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch {
      showAlert({ title: 'Update Failed', message: 'Failed to update order status.', variant: 'error', buttons: [{ text: 'OK' }] });
    } finally { setIsUpdating(false); }
  };

  const renderOrder = ({ item }: { item: any }) => {
    const sc = STATUS_COLORS[item.status] || { bg: 'rgba(107,114,128,0.1)', text: '#6b7280' };
    return (
      <TouchableOpacity
        onPress={() => setSelectedOrder(item)}
        style={{ backgroundColor: cardBg, padding: 20, borderRadius: 28, marginBottom: 16, borderWidth: 1, borderColor: cardBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        activeOpacity={0.8}
      >
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Text style={{ fontWeight: '900', color: colors.text, fontSize: 20, letterSpacing: -0.5 }}>
              #{item.id.substring(0, 8).toUpperCase()}
            </Text>
            {isFood && item.is_asap && (
              <View style={{ backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 }}>
                <Text style={{ fontSize: 10, color: '#dc2626', fontWeight: '800', textTransform: 'uppercase' }}>ASAP</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <View style={{ backgroundColor: sc.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, alignSelf: 'flex-start' }}>
            <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, color: sc.text }}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            User #{item.customer}
          </Text>
          <Text style={{ fontWeight: '900', color: colors.text, fontSize: 20 }}>
            Br {parseFloat(item.total_amount).toFixed(2)}
          </Text>
          <View style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.08)' : '#f3f4f6', padding: 8, borderRadius: 14, marginTop: 12 }}>
            <Eye size={20} color="#4f46e5" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Header */}
        <View style={{ paddingTop: 64, paddingBottom: 16, paddingHorizontal: 24, backgroundColor: headerBg, borderBottomWidth: 1, borderBottomColor: cardBorder, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: -1 }}>Fulfillment</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textMuted }}>Manage incoming orders</Text>
            </View>
            <View style={{ width: 48, height: 48, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={24} color={colors.text} />
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrder}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 }}>
                <ClipboardList size={48} color={colors.textMuted} />
                <Text style={{ textAlign: 'center', fontWeight: '900', fontSize: 20, color: colors.textMuted, marginTop: 16 }}>No active orders</Text>
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: colors.textMuted, marginTop: 8 }}>Orders placed by customers will appear here.</Text>
              </View>
            }
          />
        )}

        {/* Order Details Modal */}
        <Modal visible={!!selectedOrder} animationType="slide" presentationStyle="pageSheet">
          {selectedOrder && (
            <View style={{ flex: 1, backgroundColor: modalBg }}>
              {/* Modal Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: cardBorder }}>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -0.5 }}>
                    #{selectedOrder.id.substring(0, 8).toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedOrder(null)} style={{ padding: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', borderRadius: 20 }}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1, padding: 24 }}>
                {/* Status Update */}
                <View style={{ backgroundColor: isDark ? 'rgba(28, 30, 43, 0.5)' : '#f9fafb', padding: 20, borderRadius: 28, borderWidth: 1, borderColor: cardBorder, marginBottom: 24 }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Order Status</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {availableStatuses.map(status => {
                      const isSelected = selectedOrder.status === status;
                      return (
                        <TouchableOpacity
                          key={status}
                          onPress={() => handleUpdateStatus(selectedOrder.id, status)}
                          disabled={isUpdating}
                          style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1, backgroundColor: isSelected ? colors.text : (isDark ? 'rgba(255,255,255,0.06)' : '#ffffff'), borderColor: isSelected ? colors.text : cardBorder }}
                        >
                          <Text style={{ fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: isSelected ? colors.bg : colors.textSub }}>
                            {status.replace(/_/g, ' ')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {isUpdating && <ActivityIndicator color={colors.accent} style={{ position: 'absolute', right: 20, top: 20 }} />}
                </View>

                {/* Location */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Location Details</Text>
                  <View style={{ backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder, padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'flex-start' }}>
                    <MapPin size={20} color="#4f46e5" style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: colors.text, fontSize: 14, lineHeight: 22 }}>
                        {isFood ? selectedOrder.delivery_address : selectedOrder.shipping_address}
                      </Text>
                      {isFood && selectedOrder.delivery_instructions && (
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: cardBorder }}>
                          <Text style={{ fontSize: 10, fontWeight: '900', color: '#ea580c', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Instructions:</Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSub, fontStyle: 'italic' }}>"{selectedOrder.delivery_instructions}"</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Items */}
                <View style={{ marginBottom: 40 }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Items ({selectedOrder.items?.length || 0})</Text>
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <View key={idx} style={{ backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder, padding: 16, borderRadius: 20, marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <View style={{ flex: 1, marginRight: 16 }}>
                          <Text style={{ fontWeight: '900', color: colors.text, fontSize: 15 }}>{isFood ? item.menu_item_name : item.product_name}</Text>
                          <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>Qty: {item.quantity}</Text>
                        </View>
                        <Text style={{ fontWeight: '900', color: colors.text }}>Br {parseFloat(item.price_at_time).toFixed(2)}</Text>
                      </View>
                      {isFood && item.special_requests && (
                        <View style={{ backgroundColor: 'rgba(249,115,22,0.08)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, marginTop: 8 }}>
                          <Text style={{ fontSize: 9, fontWeight: '900', color: '#ea580c', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Note:</Text>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#c2410c' }}>"{item.special_requests}"</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Total Footer */}
              <View style={{ backgroundColor: '#111827', padding: 24, paddingBottom: 40, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 14 }}>{isFood ? 'Delivery Fee' : 'Shipping Fee'}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 14 }}>
                    Br {parseFloat(isFood ? selectedOrder.delivery_fee : selectedOrder.shipping_fee).toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 12 }}>
                  <Text style={{ color: '#ffffff', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 14 }}>Total</Text>
                  <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 24 }}>Br {parseFloat(selectedOrder.total_amount).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        </Modal>
      </View>
      <CustomAlert visible={alertState.visible} title={alertState.title} message={alertState.message} variant={alertState.variant} buttons={alertState.buttons} onDismiss={hideAlert} />
    </>
  );
}
