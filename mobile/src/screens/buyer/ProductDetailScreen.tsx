import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StatusBar, Animated, Dimensions, StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Heart, ShoppingCart, Plus, Check,
  Clock, Leaf, Flame, Package, ChevronRight,
} from 'lucide-react-native';
import { useCartStore, WishlistItem, SelectedExtra, SelectedOption, getItemUnitPrice } from '../../store/cartStore';
import { api } from '../../lib/api';

const { width, height } = Dimensions.get('window');

// ─── Colour helpers ────────────────────────────────────────────────────────────
const hexRgb = (hex: string) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff');
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 255, g: 255, b: 255 };
};
const rgbStr = (hex: string) => { const c = hexRgb(hex); return `${c.r},${c.g},${c.b}`; };
const luma   = (hex: string) => { const c = hexRgb(hex); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; };
const onColor= (hex: string) => luma(hex) > 160 ? '#0a0a0a' : '#ffffff';

// ─── ProductDetailScreen ───────────────────────────────────────────────────────
export function ProductDetailScreen({ route, navigation }: any) {
  const { item, store } = route.params;
  const isFood  = store.store_type === 'FOOD';
  const accent  = store.primary_color || (isFood ? '#f97316' : '#111827');
  const bg      = store.background_color || '#ffffff';
  const acRgb   = rgbStr(accent);
  const fg      = onColor(accent);

  const isDark        = luma(bg) < 128;
  const surface       = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.025)';
  const textPrimary   = isDark ? '#f9fafb' : '#0a0a0a';
  const textSecondary = isDark ? '#a5b4d4' : '#6b7280';
  const border        = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)';

  const { addItem, addToWishlist, removeFromWishlist, isInWishlist } = useCartStore();
  const wishlisted = isInWishlist(item.id);

  // ── State: options & extras ──────────────────────────────────────────────────
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [selectedExtras, setSelectedExtras]   = useState<SelectedExtra[]>([]);
  const [addedAnim]   = useState(new Animated.Value(1));
  const [heartAnim]   = useState(new Animated.Value(1));
  const scrollY = useRef(new Animated.Value(0)).current;

  const options: any[] = item.options || [];
  const extras:  any[] = item.extras  || [];

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const endpoint = isFood ? `/food/items?store_id=${store.id}` : `/retail/products?store_id=${store.id}`;
        const res = await api.get(endpoint);
        const data = res.data?.results || res.data || [];
        const filtered = data.filter((x: any) => x.id !== item.id);
        const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 4);
        setRecommendations(shuffled);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [item.id, store.id]);

  // Running total
  const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
  const unitPrice   = parseFloat(item.price) + extrasTotal;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const toggleOption = (option: any, choice: string) => {
    setSelectedOptions(prev => {
      const existing = prev.find(o => o.optionId === option.id);
      if (existing) {
        return prev.map(o => o.optionId === option.id ? { ...o, choice } : o);
      }
      return [...prev, { optionId: option.id, optionName: option.name, choice }];
    });
  };

  const toggleExtra = (extra: any) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.id === extra.id);
      if (exists) return prev.filter(e => e.id !== extra.id);
      return [...prev, { id: extra.id, name: extra.name, price: parseFloat(extra.price) }];
    });
  };

  const handleAddToCart = () => {
    Animated.sequence([
      Animated.timing(addedAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(addedAnim,  { toValue: 1, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();

    addItem(
      {
        id: item.id,
        name: item.name,
        base_price: parseFloat(item.price),
        quantity: 1,
        image: item.image,
        selectedOptions,
        selectedExtras,
      },
      store.id,
      store.name,
      store.store_type,
    );
    navigation.goBack();
  };

  const handleWishlist = () => {
    Animated.sequence([
      Animated.timing(heartAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
      Animated.spring(heartAnim,  { toValue: 1, tension: 400, friction: 6, useNativeDriver: true }),
    ]).start();

    if (wishlisted) {
      removeFromWishlist(item.id);
    } else {
      const wItem: WishlistItem = {
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        image: item.image,
        storeId: store.id,
        storeName: store.name,
        storeType: store.store_type,
        description: item.description,
      };
      addToWishlist(wItem);
    }
  };

  // ── Animated header ──────────────────────────────────────────────────────────
  const IMG_H = height * 0.42;
  const headerOpacity = scrollY.interpolate({ inputRange: [IMG_H - 80, IMG_H - 30], outputRange: [0, 1], extrapolate: 'clamp' });

  const ooc = !isFood && item.stock_quantity <= 0;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* ── Sticky header ─────────────────────────────────── */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, backgroundColor: bg, borderBottomColor: border }]}>
        <View style={[styles.stickyInner, { paddingTop: Platform.OS === 'ios' ? 52 : 36 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.glassBtn, { backgroundColor: `rgba(${rgbStr(bg === '#ffffff' ? '#000000' : bg)},0.08)` }]}>
            <ArrowLeft color={accent} size={20} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={[styles.stickyTitle, { color: accent }]} numberOfLines={1}>{item.name}</Text>
          <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
            <TouchableOpacity onPress={handleWishlist} style={[styles.glassBtn, { backgroundColor: `rgba(${rgbStr(bg === '#ffffff' ? '#000000' : bg)},0.08)` }]}>
              <Heart color={wishlisted ? '#ef4444' : accent} size={20} fill={wishlisted ? '#ef4444' : 'none'} strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ── Hero image ──────────────────────────────────────────────────── */}
        <View style={{ height: IMG_H, overflow: 'hidden' }}>
          {item.image
            ? <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <View style={{ flex: 1, backgroundColor: `rgba(${acRgb},0.12)`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 72 }}>{isFood ? '🍽️' : '📦'}</Text>
              </View>}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} locations={[0.5, 1]} style={StyleSheet.absoluteFill} />

          {/* Floating back + heart on image */}
          <View style={[styles.imageNav, { paddingTop: Platform.OS === 'ios' ? 56 : 36 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navGlass}>
              <ArrowLeft color="#fff" size={20} strokeWidth={2.5} />
            </TouchableOpacity>
            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
              <TouchableOpacity onPress={handleWishlist} style={styles.navGlass}>
                <Heart color={wishlisted ? '#ef4444' : '#fff'} size={20} fill={wishlisted ? '#ef4444' : 'none'} strokeWidth={2} />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Price pill on image */}
          <View style={[styles.pricePillOnImg, { backgroundColor: accent }]}>
            <Text style={[styles.pricePillTxt, { color: fg }]}>Br {parseFloat(item.price).toFixed(2)}</Text>
          </View>

          {ooc && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>Sold Out</Text>
            </View>
          )}
        </View>

        {/* ── Content card (rounded top) ───────────────────────────────────── */}
        <View style={[styles.contentCard, { backgroundColor: bg, marginTop: -24 }]}>
          {/* Name + badges */}
          <Text style={[styles.itemName, { color: textPrimary }]}>{item.name}</Text>

          {/* Badges row */}
          {isFood && (
            <View style={styles.badgeRow}>
              {item.is_vegetarian && (
                <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                  <Leaf color="#16a34a" size={11} />
                  <Text style={[styles.badgeTxt, { color: '#16a34a' }]}>Vegetarian</Text>
                </View>
              )}
              {item.is_spicy && (
                <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
                  <Flame color="#dc2626" size={11} />
                  <Text style={[styles.badgeTxt, { color: '#dc2626' }]}>Spicy</Text>
                </View>
              )}
              {item.preparation_time_minutes > 0 && (
                <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6' }]}>
                  <Clock color={textSecondary} size={11} />
                  <Text style={[styles.badgeTxt, { color: textSecondary }]}>{item.preparation_time_minutes} min</Text>
                </View>
              )}
            </View>
          )}
          {!isFood && (
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: item.stock_quantity > 0 ? '#dcfce7' : '#fee2e2' }]}>
                <Package color={item.stock_quantity > 0 ? '#16a34a' : '#dc2626'} size={11} />
                <Text style={[styles.badgeTxt, { color: item.stock_quantity > 0 ? '#16a34a' : '#dc2626' }]}>
                  {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of stock'}
                </Text>
              </View>
              {item.sku ? (
                <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6' }]}>
                  <Text style={[styles.badgeTxt, { color: textSecondary }]}>SKU: {item.sku}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Description */}
          {item.description ? (
            <Text style={[styles.description, { color: textSecondary }]}>{item.description}</Text>
          ) : null}

          {/* ── OPTIONS (food only) ────────────────────────────────────────── */}
          {isFood && options.length > 0 && options.map((option: any) => {
            const chosen = selectedOptions.find(o => o.optionId === option.id)?.choice;
            return (
              <View key={option.id} style={styles.section}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionLabel}>{option.name}</Text>
                  {option.is_required && (
                    <View style={[styles.reqBadge, { backgroundColor: `rgba(${acRgb},0.1)` }]}>
                      <Text style={[styles.reqTxt, { color: accent }]}>Required</Text>
                    </View>
                  )}
                </View>
                <View style={styles.pillRow}>
                  {(option.choices || []).map((choice: string) => {
                    const active = chosen === choice;
                    return (
                      <TouchableOpacity
                        key={choice}
                        onPress={() => toggleOption(option, choice)}
                        style={[styles.optionPill, {
                          backgroundColor: active ? accent : `rgba(${acRgb},0.07)`,
                          borderColor: active ? accent : `rgba(${acRgb},0.2)`,
                        }]}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.pillTxt, { color: active ? fg : textPrimary }]}>{choice}</Text>
                        {active && <Check color={fg} size={12} strokeWidth={3} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* ── EXTRAS (food only) ─────────────────────────────────────────── */}
          {isFood && extras.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Add Extras</Text>
              {extras.map((extra: any) => {
                const selected = selectedExtras.some(e => e.id === extra.id);
                return (
                  <TouchableOpacity
                    key={extra.id}
                    onPress={() => toggleExtra(extra)}
                    style={[styles.extraRow, {
                      backgroundColor: selected ? `rgba(${acRgb},0.07)` : 'transparent',
                      borderColor: selected ? `rgba(${acRgb},0.25)` : border,
                    }]}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.extraCheck, {
                      backgroundColor: selected ? accent : 'transparent',
                      borderColor: selected ? accent : '#d1d5db',
                    }]}>
                      {selected && <Check color="#fff" size={11} strokeWidth={3} />}
                    </View>
                    <Text style={[styles.extraName, { color: textPrimary }]}>{extra.name}</Text>
                    <Text style={[styles.extraPrice, { color: accent }]}>+Br {parseFloat(extra.price).toFixed(2)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ── RECOMMENDATIONS ────────────────────────────────────────────── */}
          {!loadingRecs && recommendations.length > 0 && (
            <View style={[styles.section, { marginTop: 16 }]}>
              <Text style={styles.sectionLabel}>You may also like</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 16 }}>
                {recommendations.map(rec => (
                  <TouchableOpacity
                    key={rec.id}
                    activeOpacity={0.8}
                    style={styles.recCard}
                    onPress={() => navigation.push('ProductDetail', { item: rec, store })}
                  >
                    <View style={styles.recImgWrapper}>
                      {rec.image ? (
                        <Image source={{ uri: rec.image }} style={styles.recImg} resizeMode="cover" />
                      ) : (
                        <View style={[styles.recImg, { backgroundColor: `rgba(${acRgb},0.08)`, alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={{ fontSize: 40, opacity: 0.8 }}>{isFood ? '🍽️' : '📦'}</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ marginTop: 10 }}>
                      <Text style={[styles.recName, { color: textPrimary }]} numberOfLines={1}>{rec.name}</Text>
                      <Text style={[styles.recPrice, { color: accent }]}>Br {parseFloat(rec.price).toFixed(2)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* ── Sticky bottom bar ─────────────────────────────────────────────────── */}
      {!ooc && (
        <View style={[styles.bottomBar, { backgroundColor: bg }]}>
          {/* Running total */}
          <View style={{ marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={[styles.totalLabel, { color: textSecondary }]}>Total</Text>
              {selectedExtras.length > 0 && (
                <Text style={[styles.basePrice, { color: textSecondary }]}>Base Br {parseFloat(item.price).toFixed(2)}</Text>
              )}
            </View>
            <Text style={[styles.totalAmount, { color: accent }]}>Br {unitPrice.toFixed(2)}</Text>
          </View>

          {/* Add to cart CTA */}
          <Animated.View style={{ transform: [{ scale: addedAnim }] }}>
            <TouchableOpacity
              onPress={handleAddToCart}
              style={[styles.addToCartBtn, { backgroundColor: accent }]}
              activeOpacity={0.88}
            >
              <ShoppingCart color={fg} size={20} strokeWidth={2.5} />
              <Text style={[styles.addToCartTxt, { color: fg }]}>Add to Cart</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  stickyInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  stickyTitle: { flex: 1, fontSize: 15, fontWeight: '800', letterSpacing: -0.3, marginHorizontal: 10 },
  glassBtn: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  imageNav: {
    position: 'absolute', left: 0, right: 0, top: 0,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16,
  },
  navGlass: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.32)', alignItems: 'center', justifyContent: 'center' },
  pricePillOnImg: { position: 'absolute', bottom: 36, right: 20, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99 },
  pricePillTxt: { fontSize: 16, fontWeight: '900', letterSpacing: -0.4 },

  contentCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 28 },
  itemName: { fontSize: 26, fontWeight: '900', letterSpacing: -0.8, marginBottom: 14, lineHeight: 30 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99 },
  badgeTxt: { fontSize: 12, fontWeight: '700' },
  description: { fontSize: 14, color: '#6b7280', lineHeight: 22, fontWeight: '500', marginBottom: 20 },

  section: { marginBottom: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: { fontSize: 14, fontWeight: '900', color: '#111827', letterSpacing: -0.2 },
  reqBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  reqTxt: { fontSize: 11, fontWeight: '800' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99, borderWidth: 1.5 },
  pillTxt: { fontSize: 14, fontWeight: '700' },

  extraRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1.5, marginBottom: 8 },
  extraCheck: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  extraName: { flex: 1, fontSize: 14, fontWeight: '600' },
  extraPrice: { fontSize: 14, fontWeight: '800' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.08)' },
  totalLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 },
  basePrice: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  totalAmount: { fontSize: 26, fontWeight: '900', letterSpacing: -0.8 },
  addToCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 18, paddingVertical: 17 },
  addToCartTxt: { fontSize: 17, fontWeight: '900', letterSpacing: -0.2 },
  
  recCard: { width: 140 },
  recImgWrapper: { width: 140, height: 140, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  recImg: { width: '100%', height: '100%' },
  recName: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  recPrice: { fontSize: 13, fontWeight: '700', marginTop: 2 },
});
