import React from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StatusBar, StyleSheet, Platform,
} from 'react-native';
import { ArrowLeft, Heart, ShoppingCart, ShoppingBag } from 'lucide-react-native';
import { useCartStore, WishlistItem } from '../../store/cartStore';

const hexRgb = (hex: string) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#6366f1');
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 99, g: 102, b: 241 };
};
const luma    = (hex: string) => { const c = hexRgb(hex); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; };
const onColor = (hex: string) => luma(hex) > 160 ? '#0a0a0a' : '#ffffff';

export function WishlistScreen({ route, navigation }: any) {
  const { store } = route.params;
  const accent = store.primary_color || '#6366f1';
  const fg     = onColor(accent);

  const { wishlist, removeFromWishlist, addItem, storeId } = useCartStore();

  const handleAddToCart = (item: WishlistItem) => {
    addItem(
      { id: item.id, name: item.name, base_price: item.price, quantity: 1, image: item.image },
      item.storeId,
      item.storeName,
      item.storeType,
    );
    navigation.navigate('Cart', { store });
  };

  if (wishlist.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: store.background_color || '#fff' }]}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 56 : 36 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#111827" size={20} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wishlist</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIcon, { backgroundColor: `rgba(${hexRgb(accent).r},${hexRgb(accent).g},${hexRgb(accent).b},0.08)` }]}>
            <Heart color={accent} size={44} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySub}>Tap the heart on any product to save it here</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.ctaBtn, { backgroundColor: accent }]}>
            <Text style={[styles.ctaTxt, { color: fg }]}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: store.background_color || '#fff' }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 56 : 36 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={20} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Wishlist</Text>
          <Text style={[styles.headerSub, { color: accent }]}>{wishlist.length} saved items</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {wishlist.map((item: WishlistItem) => (
          <View key={item.id} style={styles.card}>
            {/* Image */}
            <View style={styles.cardImg}>
              {item.image
                ? <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                : <ShoppingBag color="#d1d5db" size={28} />}
            </View>

            {/* Info */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
              ) : null}
              <Text style={[styles.itemPrice, { color: accent }]}>Br {item.price.toFixed(2)}</Text>
              <Text style={styles.storeName}>{item.storeName}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => removeFromWishlist(item.id)}
                style={styles.removeBtn}
              >
                <Heart color="#ef4444" size={18} fill="#ef4444" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAddToCart(item)}
                style={[styles.cartBtn, { backgroundColor: accent }]}
                activeOpacity={0.85}
              >
                <ShoppingCart color={fg} size={16} strokeWidth={2} />
                <Text style={[styles.cartBtnTxt, { color: fg }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.07)', backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111827', letterSpacing: -0.4 },
  headerSub: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  ctaBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  ctaTxt: { fontSize: 15, fontWeight: '800' },

  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, alignItems: 'center' },
  cardImg: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#f3f4f6', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 4 },
  itemDesc: { fontSize: 12, color: '#9ca3af', fontWeight: '500', marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3, marginBottom: 3 },
  storeName: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  actions: { alignItems: 'center', gap: 8 },
  removeBtn: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  cartBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12 },
  cartBtnTxt: { fontSize: 12, fontWeight: '800' },
});
