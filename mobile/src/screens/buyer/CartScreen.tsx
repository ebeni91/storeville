import React from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StatusBar, StyleSheet, Platform,
} from 'react-native';
import {
  ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ChevronRight, Heart,
} from 'lucide-react-native';
import { useCartStore, getItemTotal, getItemUnitPrice } from '../../store/cartStore';

const hexRgb = (hex: string) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff');
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 255, g: 255, b: 255 };
};
const luma    = (hex: string) => { const c = hexRgb(hex); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; };
const onColor = (hex: string) => luma(hex) > 160 ? '#0a0a0a' : '#ffffff';

export function CartScreen({ route, navigation }: any) {
  const { store } = route.params;
  const accent = store.primary_color || (store.store_type === 'FOOD' ? '#f97316' : '#6366f1');
  const bg     = store.background_color || '#ffffff';
  const fg     = onColor(accent);

  const { items, updateQuantity, removeItem, getTotal, getItemCount, wishlist } = useCartStore();
  const wishlistCount = wishlist.length;

  if (items.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: bg }]}>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: 'rgba(0,0,0,0.07)' }]}>
          <View style={[styles.headerInner, { paddingTop: Platform.OS === 'ios' ? 56 : 36 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ArrowLeft color="#111827" size={20} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Wishlist', { store })} style={styles.backBtn}>
              <Heart color={wishlistCount > 0 ? '#ef4444' : '#9ca3af'} size={20} fill={wishlistCount > 0 ? '#ef4444' : 'none'} strokeWidth={2} />
              {wishlistCount > 0 && (
                <View style={styles.badge}><Text style={styles.badgeTxt}>{wishlistCount}</Text></View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty state */}
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIcon, { backgroundColor: `rgba(${hexRgb(accent).r},${hexRgb(accent).g},${hexRgb(accent).b},0.08)` }]}>
            <ShoppingBag color={accent} size={44} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items from the store to get started</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.shopBtn, { backgroundColor: accent }]}>
            <Text style={[styles.shopBtnTxt, { color: fg }]}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: 'rgba(0,0,0,0.07)' }]}>
        <View style={[styles.headerInner, { paddingTop: Platform.OS === 'ios' ? 56 : 36 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#111827" size={20} strokeWidth={2.5} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <Text style={[styles.headerSub, { color: accent }]}>{store.name}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Wishlist', { store })} style={styles.backBtn}>
            <Heart color={wishlistCount > 0 ? '#ef4444' : '#9ca3af'} size={20} fill={wishlistCount > 0 ? '#ef4444' : 'none'} strokeWidth={2} />
            {wishlistCount > 0 && (
              <View style={styles.badge}><Text style={styles.badgeTxt}>{wishlistCount}</Text></View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200 }}>
        <Text style={styles.sectionLabel}>{getItemCount()} items from {store.name}</Text>

        {items.map(item => {
          const unitPrice  = getItemUnitPrice(item);
          const totalPrice = getItemTotal(item);
          return (
            <View key={item.id} style={styles.itemCard}>
              {/* Image */}
              <View style={styles.itemImg}>
                {item.image
                  ? <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  : <ShoppingBag color="#d1d5db" size={24} />}
              </View>

              {/* Info */}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>

                {/* Options */}
                {(item.selectedOptions || []).length > 0 && (
                  <Text style={styles.itemMeta} numberOfLines={1}>
                    {item.selectedOptions!.map(o => `${o.optionName}: ${o.choice}`).join(' · ')}
                  </Text>
                )}
                {/* Extras */}
                {(item.selectedExtras || []).length > 0 && (
                  <View style={{ marginTop: 3 }}>
                    {item.selectedExtras!.map(e => (
                      <Text key={e.id} style={[styles.itemExtra, { color: accent }]}>+ {e.name} (+Br {e.price.toFixed(2)})</Text>
                    ))}
                  </View>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  {/* Price */}
                  <View>
                    <Text style={[styles.itemPrice, { color: accent }]}>Br {totalPrice.toFixed(2)}</Text>
                    {(item.selectedExtras || []).length > 0 && (
                      <Text style={styles.itemBasePrice}>Br {unitPrice.toFixed(2)} ea.</Text>
                    )}
                  </View>

                  {/* Qty controls */}
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      style={[styles.qtyBtn, { backgroundColor: '#f3f4f6' }]}
                    >
                      <Minus color="#374151" size={12} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text style={styles.qtyNum}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      style={[styles.qtyBtn, { backgroundColor: accent }]}
                    >
                      <Plus color={fg} size={12} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={[styles.qtyBtn, { backgroundColor: '#fee2e2' }]}
                    >
                      <Trash2 color="#ef4444" size={12} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Order summary */}
        <View style={styles.summaryCard}>
          <Text style={[styles.sectionLabel, { marginBottom: 14 }]}>Order Summary</Text>
          {items.map(item => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={styles.summaryItem}>{item.name} ×{item.quantity}</Text>
              <Text style={styles.summaryPrice}>Br {getItemTotal(item).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryItem}>{store.store_type === 'FOOD' ? 'Delivery Fee' : 'Shipping Fee'}</Text>
            <Text style={{ color: '#22c55e', fontWeight: '700' }}>Free</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={[styles.totalAmt, { color: accent }]}>Br {getTotal().toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { backgroundColor: bg }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Checkout', { store })}
          style={[styles.checkoutBtn, { backgroundColor: accent }]}
          activeOpacity={0.88}
        >
          <Text style={[styles.checkoutTxt, { color: fg }]}>Proceed to Checkout</Text>
          <ChevronRight color={fg} size={20} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, backgroundColor: '#fff' },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111827', letterSpacing: -0.4 },
  headerSub: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  badgeTxt: { color: '#fff', fontSize: 9, fontWeight: '900' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  shopBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  shopBtnTxt: { fontSize: 15, fontWeight: '800' },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },

  itemCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  itemImg: { width: 72, height: 72, borderRadius: 14, backgroundColor: '#f3f4f6', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 15, fontWeight: '800', color: '#111827' },
  itemMeta: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginTop: 3 },
  itemExtra: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  itemBasePrice: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontSize: 15, fontWeight: '900', color: '#111827', minWidth: 18, textAlign: 'center' },

  summaryCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginTop: 8, borderWidth: 1, borderColor: '#f3f4f6' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryItem: { color: '#6b7280', fontSize: 14, fontWeight: '600', flex: 1 },
  summaryPrice: { color: '#374151', fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '900', color: '#111827' },
  totalAmt: { fontSize: 18, fontWeight: '900', letterSpacing: -0.4 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 28, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.07)' },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 18, paddingVertical: 17 },
  checkoutTxt: { fontSize: 17, fontWeight: '900', letterSpacing: -0.2 },
});
