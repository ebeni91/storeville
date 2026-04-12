/**
 * StoreGatewayScreen — Premium Mobile Storefront
 *
 * Design DNA:
 *   • Header collapse + morphing nav  →  Uber Eats / Apple Maps
 *   • Editorial product grid          →  Zara / SSENSE app
 *   • Smart color theming             →  Shopify Shop app
 *   • Staggered entrance animations   →  Apple App Store
 *   • Shimmer skeleton loading        →  Instagram / Airbnb
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StatusBar, Animated, Dimensions, Platform, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import {
  ArrowLeft, ShoppingCart, Plus, Minus, MapPin, Clock,
  Leaf, Flame, Package, Star, ShoppingBag, CheckCircle,
  Zap, ChevronRight,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const HERO_H   = height * 0.52;
const CARD_W   = (width - 48) / 2;
const COLLAPSE = HERO_H - (Platform.OS === 'ios' ? 90 : 70);

// ─── Colour utilities ─────────────────────────────────────────────────────────
const hexRgb = (hex: string) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff');
  return r
    ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
    : { r: 255, g: 255, b: 255 };
};
const rgbStr   = (hex: string) => { const c = hexRgb(hex); return `${c.r},${c.g},${c.b}`; };
const luma     = (hex: string) => { const c = hexRgb(hex); return 0.299*c.r + 0.587*c.g + 0.114*c.b; };
const onColor  = (hex: string) => luma(hex) > 160 ? '#0a0a0a' : '#ffffff';

const groupBy = (items: any[]) => {
  const m: Record<string, any[]> = {};
  items.forEach(i => { const k = i.category_name || 'Other'; (m[k] ??= []).push(i); });
  return Object.entries(m).map(([title, data]) => ({ title, data }));
};

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────
function Shimmer({ w, h: ht, r = 12, style }: { w: number|string; h: number; r?: number; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] });
  return (
    <Animated.View
      style={[{ width: w as any, height: ht, borderRadius: r, backgroundColor: '#e0e0e8', opacity }, style]}
    />
  );
}

function SkeletonCard() {
  return (
    <View style={[styles.card, { width: CARD_W }]}>
      <Shimmer w="100%" h={CARD_W * 1.15} r={0} />
      <View style={{ padding: 12, gap: 8 }}>
        <Shimmer w="75%" h={12} />
        <Shimmer w="55%" h={10} />
        <Shimmer w="45%" h={14} />
      </View>
    </View>
  );
}

// ─── Marquee announcement bar ─────────────────────────────────────────────────
function AnnouncementBar({ store, accent }: { store: any; accent: string }) {
  if (!store.announcement_is_active || !store.announcement_text) return null;
  const bg  = store.announcement_color || accent;
  const rgb = rgbStr(bg);
  const fg  = onColor(bg);
  const x   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.loop(
      Animated.timing(x, { toValue: -(width * 2.4), duration: 14000, useNativeDriver: true })
    );
    a.start();
    return () => a.stop();
  }, []);

  const phrase = `${store.announcement_text}    ✦    `;
  return (
    <View style={{ backgroundColor: bg, height: 34, overflow: 'hidden', justifyContent: 'center' }}>
      <LinearGradient colors={[bg, `rgba(${rgb},0)`]} start={{x:0,y:0}} end={{x:1,y:0}}
        style={{ position:'absolute', left:0, top:0, bottom:0, width:32, zIndex:2 }} pointerEvents="none" />
      <LinearGradient colors={[`rgba(${rgb},0)`, bg]} start={{x:0,y:0}} end={{x:1,y:0}}
        style={{ position:'absolute', right:0, top:0, bottom:0, width:32, zIndex:2 }} pointerEvents="none" />
      <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: x }] }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Text key={i} style={{ color: fg, fontSize: 10, fontWeight: '800', letterSpacing: 2.5, textTransform: 'uppercase', paddingHorizontal: 12 }}>
            {phrase}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ item, accent, isFood, qty, onAdd, onRemove, index }: any) {
  const slideY  = useRef(new Animated.Value(28)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const addAnim = useRef(new Animated.Value(1)).current;
  const ooc     = !isFood && item.stock_quantity <= 0;
  const fg      = onColor(accent);
  const acRgb   = rgbStr(accent);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: index * 70, useNativeDriver: true }),
      Animated.timing(slideY,  { toValue: 0, duration: 400, delay: index * 70, useNativeDriver: true }),
    ]).start();
  }, []);

  const bounceAdd = () => {
    Animated.sequence([
      Animated.timing(addAnim, { toValue: 0.82, duration: 80, useNativeDriver: true }),
      Animated.spring(addAnim,  { toValue: 1, tension: 320, friction: 8, useNativeDriver: true }),
    ]).start();
    onAdd();
  };

  return (
    <Animated.View style={[styles.card, { width: CARD_W, opacity, transform: [{ translateY: slideY }] }]}>
      {/* Image */}
      <View style={[styles.cardImg, { backgroundColor: `rgba(${acRgb},0.08)` }]}>
        {item.image
          ? <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          : <Text style={{ fontSize: 38 }}>{isFood ? '🍽️' : '📦'}</Text>}

        {/* Gradient fade at bottom of image */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.28)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 56 }}
        />

        {/* Category chip */}
        {item.category_name && (
          <View style={styles.catChip}>
            <Text style={{ fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 1, textTransform: 'uppercase' }}>
              {item.category_name}
            </Text>
          </View>
        )}

        {/* Out of stock overlay */}
        {ooc && (
          <View style={styles.oocOverlay}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>Sold Out</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ padding: 11, paddingBottom: 13 }}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
        ) : null}

        {/* Food badges row */}
        {isFood && (item.is_vegetarian || item.is_spicy || item.preparation_time_minutes > 0) && (
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            {item.is_vegetarian && (
              <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                <Leaf color="#16a34a" size={8} /><Text style={[styles.badgeTxt, { color: '#16a34a' }]}>Veg</Text>
              </View>
            )}
            {item.is_spicy && (
              <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
                <Flame color="#dc2626" size={8} /><Text style={[styles.badgeTxt, { color: '#dc2626' }]}>Spicy</Text>
              </View>
            )}
            {item.preparation_time_minutes > 0 && (
              <View style={[styles.badge, { backgroundColor: '#f3f4f6' }]}>
                <Clock color="#6b7280" size={8} /><Text style={[styles.badgeTxt, { color: '#6b7280' }]}>{item.preparation_time_minutes}m</Text>
              </View>
            )}
          </View>
        )}

        {/* Price + ADD */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <View>
            <Text style={{ fontSize: 7, fontWeight: '700', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' }}>PRICE</Text>
            <Text style={{ fontSize: 15, fontWeight: '900', color: accent, letterSpacing: -0.4 }}>
              Br {parseFloat(item.price).toFixed(2)}
            </Text>
          </View>

          {!ooc && (
            qty === 0 ? (
              <Animated.View style={{ transform: [{ scale: addAnim }] }}>
                <TouchableOpacity onPress={bounceAdd} style={[styles.addBtn, { backgroundColor: accent }]} activeOpacity={0.85}>
                  <Plus color={fg} size={16} strokeWidth={2.5} />
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={onRemove} style={[styles.qtyBtn, { backgroundColor: `rgba(${acRgb},0.12)` }]}>
                  <Minus color={accent} size={12} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={[styles.qtyNum, { color: accent }]}>{qty}</Text>
                <TouchableOpacity onPress={bounceAdd} style={[styles.qtyBtn, { backgroundColor: accent }]}>
                  <Plus color={fg} size={12} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export function StoreGatewayScreen({ route, navigation }: { route: any; navigation: any }) {
  const { store } = route.params;
  const isFood     = store.store_type === 'FOOD';
  const accent     = store.primary_color    || (isFood ? '#f97316' : '#6366f1');
  const bg         = store.background_color || '#ffffff';
  const secondary  = store.secondary_color  || '#111827';
  const acRgb      = rgbStr(accent);
  const bgRgb      = rgbStr(bg);
  const navFg      = '#ffffff';
  const hasAnnouncement = !!(store.announcement_is_active && store.announcement_text);

  const { items: cartItems, addItem, updateQuantity, getItemCount, getTotal } = useCartStore();
  const cartCount   = getItemCount();
  const cartTotal   = getTotal();
  const [activecat, setActivecat] = useState<string | null>(null);
  const scrollY     = useRef(new Animated.Value(0)).current;
  const secOffsets  = useRef<Record<string, number>>({});
  const scrollRef   = useRef<any>(null);

  const getQty  = (id: string) => cartItems.find(i => i.id === id)?.quantity ?? 0;
  const handleAdd = (item: any) => addItem(
    { id: item.id, name: item.name, price: parseFloat(item.price), image: item.image, quantity: 1 },
    store.id, store.name, store.store_type,
  );
  const handleRemove = (id: string) => updateQuantity(id, getQty(id) - 1);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data: itemData, isLoading } = useQuery({
    queryKey: [isFood ? 'food-items' : 'retail-products', store.id],
    queryFn: async () => {
      const res = await api.get(isFood ? `/food/items/?store_id=${store.id}` : `/retail/products/?store_id=${store.id}`);
      return res.data.results ?? res.data;
    },
  });

  const sections = groupBy(itemData || []);

  // ── Animated header values ─────────────────────────────────────────────────
  const announcementH = hasAnnouncement ? 34 : 0;
  const STATUS_H      = Platform.OS === 'ios' ? 50 : 28;
  const NAV_H         = 60;
  const TOP_OFFSET    = announcementH + STATUS_H + NAV_H;

  const navBg = scrollY.interpolate({ inputRange: [COLLAPSE - 40, COLLAPSE], outputRange: [0, 1], extrapolate: 'clamp' });
  const heroParallax = scrollY.interpolate({ inputRange: [0, HERO_H], outputRange: [0, -HERO_H * 0.35], extrapolate: 'clamp' });
  const heroScale    = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1], extrapolate: 'clamp' });
  const heroOpacity  = scrollY.interpolate({ inputRange: [0, COLLAPSE * 0.6], outputRange: [1, 0.3], extrapolate: 'clamp' });
  const titleVisible = scrollY.interpolate({ inputRange: [COLLAPSE - 20, COLLAPSE + 20], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Announcement bar: pinned to very top, above status bar  ──────── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60 }}>
        <AnnouncementBar store={store} accent={accent} />
      </View>

      {/* ── MORPHING STICKY NAV ───────────────────────────────────────────── */}
      <View style={[styles.navWrap, { top: announcementH }]}>
        {/* Frosted fill fades in on scroll */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: navBg }]}>
          <LinearGradient
            colors={[`rgba(${acRgb},0.96)`, `rgba(${acRgb},0.94)`]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {/* Subtle bottom separator */}
        <Animated.View style={[styles.navSep, { opacity: navBg, borderBottomColor: `rgba(255,255,255,0.12)` }]} />

        <View style={[styles.navRow, { paddingTop: STATUS_H }]}>
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navGlass} activeOpacity={0.75}>
            <ArrowLeft color="#fff" size={19} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Store name caption: only visible once header collapses */}
          <Animated.Text style={[styles.navTitle, { opacity: titleVisible }]} numberOfLines={1}>
            {store.name}
          </Animated.Text>

          {/* Cart */}
          <TouchableOpacity
            onPress={() => cartCount > 0 && navigation.navigate('Checkout', { store })}
            style={styles.navGlass}
            activeOpacity={0.75}
          >
            <ShoppingCart color="#fff" size={19} strokeWidth={2} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── MAIN SCROLLABLE CONTENT ───────────────────────────────────────── */}
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? 130 : 48 }}
      >
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <Animated.View style={{ height: HERO_H, overflow: 'hidden', marginTop: announcementH }}>
          <Animated.View style={{ flex: 1, transform: [{ translateY: heroParallax }, { scale: heroScale }] }}>
            {store.banner_image
              ? <Image source={{ uri: store.banner_image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              : <View style={{ flex: 1, backgroundColor: accent, opacity: 0.18 }} />}
          </Animated.View>

          {/* Multi-stop gradient for deep cinematic feel */}
          <LinearGradient
            colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.78)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Hero content */}
          <Animated.View style={[styles.heroContent, { opacity: heroOpacity }]}>
            {/* Logo */}
            {store.logo && (
              <View style={styles.logoWrap}>
                <Image source={{ uri: store.logo }} style={{ width: '100%', height: '100%', borderRadius: 14 }} resizeMode="cover" />
              </View>
            )}

            {/* Trust pill row */}
            <View style={styles.trustRow}>
              <View style={styles.trustPill}>
                <Star color="#facc15" fill="#facc15" size={10} />
                <Text style={styles.trustTxt}>4.9</Text>
              </View>
              <View style={styles.trustPill}>
                <CheckCircle color="#34d399" size={10} />
                <Text style={styles.trustTxt}>Verified</Text>
              </View>
              {store.city && (
                <View style={styles.trustPill}>
                  <MapPin color="rgba(255,255,255,0.75)" size={10} />
                  <Text style={styles.trustTxt}>{store.city}</Text>
                </View>
              )}
              {isFood && (
                <View style={styles.trustPill}>
                  <Zap color="#fbbf24" size={10} />
                  <Text style={styles.trustTxt}>Fast Delivery</Text>
                </View>
              )}
            </View>

            {/* Store name */}
            <Text style={styles.heroTitle} numberOfLines={2}>{store.name}</Text>

            {/* Description */}
            {store.description ? (
              <Text style={styles.heroDesc} numberOfLines={2}>{store.description}</Text>
            ) : null}

            {/* CTA scroll hint */}
            <TouchableOpacity
              onPress={() => scrollRef.current?.scrollTo({ y: HERO_H + 20, animated: true })}
              style={[styles.heroCta, { backgroundColor: accent }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.heroCtaTxt, { color: onColor(accent) }]}>
                {isFood ? 'See Menu' : 'Shop Collection'}
              </Text>
              <ChevronRight color={onColor(accent)} size={14} strokeWidth={2.5} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* ── INFO STRIP ───────────────────────────────────────────────── */}
        <View style={[styles.infoStrip, { backgroundColor: bg, borderBottomColor: `rgba(${rgbStr(secondary)},0.07)` }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 10 }}>
            {[
              { icon: <Package color={accent} size={13} strokeWidth={2} />, label: `${(itemData || []).length} ${isFood ? 'Dishes' : 'Products'}` },
              { icon: <Clock color={accent} size={13} strokeWidth={2} />, label: isFood ? '20–35 min' : 'Same-day ready' },
              { icon: <Star color={accent} size={13} strokeWidth={2} />, label: 'Top Rated' },
              { icon: <CheckCircle color={accent} size={13} strokeWidth={2} />, label: 'Verified Store' },
            ].map((info, i) => (
              <View key={i} style={[styles.infoChip, { backgroundColor: `rgba(${acRgb},0.08)`, borderColor: `rgba(${acRgb},0.15)` }]}>
                {info.icon}
                <Text style={[styles.infoTxt, { color: secondary }]}>{info.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── CATEGORY TABS ────────────────────────────────────────────── */}
        {sections.length > 1 && (
          <View style={[styles.tabBar, { backgroundColor: bg, borderBottomColor: `rgba(${rgbStr(secondary)},0.07)` }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
              {sections.map((sec, i) => {
                const active = activecat === sec.title || (!activecat && i === 0);
                return (
                  <TouchableOpacity
                    key={sec.title}
                    onPress={() => {
                      setActivecat(sec.title);
                      const off = secOffsets.current[sec.title];
                      if (off !== undefined) scrollRef.current?.scrollTo({ y: off - TOP_OFFSET, animated: true });
                    }}
                    style={[styles.tab, {
                      backgroundColor: active ? accent : `rgba(${acRgb},0.08)`,
                      borderColor: active ? accent : `rgba(${acRgb},0.15)`,
                    }]}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.tabTxt, { color: active ? onColor(accent) : accent }]}>{sec.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── PRODUCT GRID ─────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          {isLoading ? (
            // Skeleton loading grid
            <View>
              {['A', 'B'].map(k => (
                <View key={k} style={{ marginBottom: 22 }}>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                    <Shimmer w={100} h={13} />
                    <Shimmer w={40} h={13} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 14 }}>
                    <SkeletonCard />
                    <SkeletonCard />
                  </View>
                </View>
              ))}
            </View>

          ) : sections.length === 0 ? (
            // Empty state — has polish
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: `rgba(${acRgb},0.08)` }]}>
                <ShoppingBag color={accent} size={40} strokeWidth={1.5} />
              </View>
              <Text style={[styles.emptyTitle, { color: secondary }]}>Nothing here yet</Text>
              <Text style={[styles.emptySub]}>
                This store hasn't added any {isFood ? 'menu items' : 'products'} yet.
              </Text>
            </View>

          ) : (
            // Sections
            sections.map((sec, sIdx) => {
              let globalItemIndex = 0;
              sections.slice(0, sIdx).forEach(s => { globalItemIndex += s.data.length; });

              return (
                <View
                  key={sec.title}
                  onLayout={e => { secOffsets.current[sec.title] = e.nativeEvent.layout.y; }}
                  style={{ marginBottom: 32 }}
                >
                  {/* Section header */}
                  <View style={styles.secHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.secTitle, { color: secondary }]}>{sec.title}</Text>
                    </View>
                    <View style={[styles.secCount, { backgroundColor: `rgba(${acRgb},0.1)` }]}>
                      <Text style={[styles.secCountTxt, { color: accent }]}>
                        {sec.data.length} {sec.data.length === 1 ? 'item' : 'items'}
                      </Text>
                    </View>
                  </View>

                  {/* Thin separator */}
                  <View style={[styles.secLine, { backgroundColor: `rgba(${rgbStr(secondary)},0.08)` }]} />

                  {/* 2-col grid */}
                  <View style={styles.grid}>
                    {sec.data.map((item, itemIdx) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        accent={accent}
                        isFood={isFood}
                        qty={getQty(item.id)}
                        onAdd={() => handleAdd(item)}
                        onRemove={() => handleRemove(item.id)}
                        index={globalItemIndex + itemIdx}
                      />
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </Animated.ScrollView>

      {/* ── FLOATING CART BAR ─────────────────────────────────────────────── */}
      {cartCount > 0 && (
        <View style={styles.cartBarWrap}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Checkout', { store })}
            style={[styles.cartBar, { backgroundColor: accent }]}
            activeOpacity={0.88}
          >
            {/* Left: count pill + label */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.cartPill}>
                <Text style={{ color: accent, fontSize: 13, fontWeight: '900' }}>{cartCount}</Text>
              </View>
              <Text style={[styles.cartLabel, { color: onColor(accent) }]}>View Cart</Text>
            </View>

            {/* Right: total */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: `rgba(${rgbStr(onColor(accent))},0.7)`, fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>Total</Text>
              <Text style={[styles.cartTotal, { color: onColor(accent) }]}>Br {cartTotal.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Nav
  navWrap:  { position: 'absolute', left: 0, right: 0, zIndex: 50 },
  navRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  navSep:   { position: 'absolute', bottom: 0, left: 0, right: 0, borderBottomWidth: StyleSheet.hairlineWidth },
  navGlass: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.28)', alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: -0.4, paddingHorizontal: 8 },
  cartBadge:{ position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)' },

  // Hero
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 22, paddingBottom: 26 },
  logoWrap:    { width: 58, height: 58, borderRadius: 16, backgroundColor: '#fff', padding: 2, marginBottom: 14 },
  trustRow:    { flexDirection: 'row', gap: 7, marginBottom: 12, flexWrap: 'wrap' },
  trustPill:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  trustTxt:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  heroTitle:   { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -1.2, lineHeight: 36, marginBottom: 7 },
  heroDesc:    { color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: '500', lineHeight: 18, marginBottom: 18 },
  heroCta:     { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 99 },
  heroCtaTxt:  { fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },

  // Info strip
  infoStrip: { borderBottomWidth: StyleSheet.hairlineWidth },
  infoChip:  { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1 },
  infoTxt:   { fontSize: 12, fontWeight: '600' },

  // Category tabs
  tabBar: { borderBottomWidth: StyleSheet.hairlineWidth },
  tab:    { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 99, borderWidth: 1 },
  tabTxt: { fontSize: 13, fontWeight: '700' },

  // Section
  secHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  secTitle:    { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  secCount:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  secCountTxt: { fontSize: 11, fontWeight: '700' },
  secLine:     { height: StyleSheet.hairlineWidth, marginBottom: 14 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' },

  // Card
  card:    { borderRadius: 18, overflow: 'hidden', backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.07)', marginBottom: 0 },
  cardImg: { width: '100%', height: CARD_W * 1.1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  catChip: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.52)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 },
  oocOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  cardName:{ fontSize: 13, fontWeight: '800', color: '#101827', letterSpacing: -0.2 },
  cardDesc:{ fontSize: 11, color: '#9ca3af', fontWeight: '500', marginTop: 2 },
  badge:   { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  badgeTxt:{ fontSize: 9, fontWeight: '700', marginLeft: 1 },
  addBtn:  { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  qtyRow:  { flexDirection: 'row', alignItems: 'center', gap: 7 },
  qtyBtn:  { width: 29, height: 29, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  qtyNum:  { fontSize: 14, fontWeight: '900', minWidth: 14, textAlign: 'center' },

  // Empty state
  emptyState: { paddingVertical: 80, alignItems: 'center' },
  emptyIcon:  { width: 88, height: 88, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  emptySub:   { color: '#9ca3af', textAlign: 'center', fontSize: 14, fontWeight: '500', lineHeight: 20 },

  // Cart bar
  cartBarWrap: { position: 'absolute', bottom: 24, left: 16, right: 16 },
  cartBar:     { borderRadius: 22, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartPill:    { width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  cartLabel:   { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  cartTotal:   { fontSize: 17, fontWeight: '900', letterSpacing: -0.4 },
});
