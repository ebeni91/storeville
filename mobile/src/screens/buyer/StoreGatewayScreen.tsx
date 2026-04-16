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
  ArrowLeft, ShoppingCart, Heart, MapPin, Clock,
  Package, Star, ShoppingBag, CheckCircle,
  Zap, ChevronRight, AlertCircle,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const HERO_H  = height * 0.50;
const FOOD_CARD_W = width * 0.52;
const RETAIL_CARD_W = (width - 48) / 2;
const COLLAPSE = HERO_H - (Platform.OS === 'ios' ? 90 : 70);

// ─── Colour utilities ──────────────────────────────────────────────────────────
const hexRgb = (hex: string) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff');
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 255, g: 255, b: 255 };
};
const rgbStr  = (hex: string) => { const c = hexRgb(hex); return `${c.r},${c.g},${c.b}`; };
const luma    = (hex: string) => { const c = hexRgb(hex); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; };
const onColor = (hex: string) => luma(hex) > 160 ? '#0a0a0a' : '#ffffff';

const groupBy = (items: any[]) => {
  const m: Record<string, any[]> = {};
  items.forEach(i => { const k = i.category_name || 'Other'; (m[k] ??= []).push(i); });
  return Object.entries(m).map(([title, data]) => ({ title, data }));
};

/** Determine if store is currently open based on delivery_hours string like "09:00 – 22:00" */
const parseOpenStatus = (deliveryHours: string): boolean | null => {
  if (!deliveryHours) return null;
  const match = deliveryHours.match(/(\d{1,2}):(\d{2})\s*[–\-]\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const open  = parseInt(match[1]) * 60 + parseInt(match[2]);
  const close = parseInt(match[3]) * 60 + parseInt(match[4]);
  return cur >= open && cur < close;
};

// ─── Shimmer skeleton ──────────────────────────────────────────────────────────
function Shimmer({ w, h: ht, r = 12, style }: { w: number | string; h: number; r?: number; style?: any }) {
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
  return <Animated.View style={[{ width: w as any, height: ht, borderRadius: r, backgroundColor: '#e0e0e8', opacity }, style]} />;
}

// ─── Announcement bar ──────────────────────────────────────────────────────────
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
      <LinearGradient colors={[bg, `rgba(${rgb},0)`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 32, zIndex: 2 }} pointerEvents="none" />
      <LinearGradient colors={[`rgba(${rgb},0)`, bg]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, zIndex: 2 }} pointerEvents="none" />
      <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: x }] }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Text key={i} style={{ color: fg, fontSize: 10, fontWeight: '800', letterSpacing: 2.5, textTransform: 'uppercase', paddingHorizontal: 12 }}>{phrase}</Text>
        ))}
      </Animated.View>
    </View>
  );
}

// ─── Shared minimal product card (heart + tap to detail) ─────────────────────
function SharedProductCard({ item, accent, isFood, onPress, onWishlist, wishlisted, index }: any) {
  const slideY  = useRef(new Animated.Value(28)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;
  const acRgb = rgbStr(accent);
  const fg    = onColor(accent);
  const ooc   = !isFood && item.stock_quantity <= 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay: index * 55, useNativeDriver: true }),
      Animated.timing(slideY,  { toValue: 0, duration: 380, delay: index * 55, useNativeDriver: true }),
    ]).start();
  }, []);

  const bounceHeart = () => {
    Animated.sequence([
      Animated.timing(heartAnim, { toValue: 0.7, duration: 90, useNativeDriver: true }),
      Animated.spring(heartAnim,  { toValue: 1, tension: 400, friction: 6, useNativeDriver: true }),
    ]).start();
    onWishlist();
  };

  const CARD_W = isFood ? FOOD_CARD_W : RETAIL_CARD_W;
  const IMG_H  = isFood ? FOOD_CARD_W * 1.3 : RETAIL_CARD_W * 1.1;

  return (
    <Animated.View style={{ width: CARD_W, opacity, transform: [{ translateY: slideY }] }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={[styles.card, { width: CARD_W }]}>
        {/* Image */}
        <View style={[styles.cardImg, { height: IMG_H, backgroundColor: `rgba(${acRgb},0.07)` }]}>
          {item.image
            ? <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <Text style={{ fontSize: 36 }}>{isFood ? '🍽️' : '📦'}</Text>}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.25)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50 }} />
          {ooc && <View style={styles.oocOverlay}><Text style={styles.oocTxt}>Sold Out</Text></View>}
          {/* Wishlist heart */}
          <Animated.View style={[styles.heartWrap, { transform: [{ scale: heartAnim }] }]}>
            <TouchableOpacity onPress={bounceHeart} style={styles.heartBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Heart color={wishlisted ? '#ef4444' : '#fff'} size={16} fill={wishlisted ? '#ef4444' : 'none'} strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>
        </View>
        {/* Info */}
        <View style={{ padding: 11, paddingBottom: 13 }}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.cardPrice, { color: accent }]}>Br {parseFloat(item.price).toFixed(2)}</Text>
          {/* Food extras hint */}
          {isFood && (item.extras || []).length > 0 && (
            <Text style={[styles.cardExtrasHint, { color: accent }]}>{(item.extras || []).length} extra{(item.extras || []).length > 1 ? 's' : ''} available</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export function StoreGatewayScreen({ route, navigation, previewMode = false }: { route: any; navigation: any; previewMode?: boolean }) {
  const { store } = route.params;
  const isFood    = store.store_type === 'FOOD';
  const accent    = store.primary_color    || (isFood ? '#f97316' : '#6366f1');
  const bg        = store.background_color || '#ffffff';
  const secondary = store.secondary_color  || '#111827';
  const acRgb     = rgbStr(accent);
  const bgRgb     = rgbStr(bg);
  const hasAnnouncement = !!(store.announcement_is_active && store.announcement_text);

  // Open/closed badge
  const openStatus = parseOpenStatus(store.delivery_hours || '');

  const { getItemCount, isInWishlist, addToWishlist, removeFromWishlist, wishlist } = useCartStore();
  const cartCount    = getItemCount();
  const wishlistCount = wishlist.length;
  const [activecat, setActivecat] = useState<string | null>(null); // food: section scroll; retail: filter
  const scrollY     = useRef(new Animated.Value(0)).current;
  const secOffsets  = useRef<Record<string, number>>({});
  const scrollRef   = useRef<any>(null);

  const { data: itemData, isLoading } = useQuery({
    queryKey: [isFood ? 'food-items' : 'retail-products', store.id],
    queryFn: async () => {
      const res = await api.get(isFood ? `/food/items?store_id=${store.id}` : `/retail/products?store_id=${store.id}`);
      return res.data?.results || res.data || [];
    },
  });

  const allSections = groupBy(itemData || []);

  // For retail: apply category filter client-side
  const visibleSections = isFood
    ? allSections
    : (activecat ? allSections.filter(s => s.title === activecat) : allSections);

  // Animated header values
  const announcementH = hasAnnouncement ? 34 : 0;
  const STATUS_H      = Platform.OS === 'ios' ? 50 : 28;
  const NAV_H         = 60;
  const TOP_OFFSET    = announcementH + STATUS_H + NAV_H;

  const navBg       = scrollY.interpolate({ inputRange: [COLLAPSE - 40, COLLAPSE], outputRange: [0, 1], extrapolate: 'clamp' });
  const heroParallax= scrollY.interpolate({ inputRange: [0, HERO_H], outputRange: [0, -HERO_H * 0.35], extrapolate: 'clamp' });
  const heroScale   = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.08, 1], extrapolate: 'clamp' });
  const heroOpacity = scrollY.interpolate({ inputRange: [0, COLLAPSE * 0.6], outputRange: [1, 0.3], extrapolate: 'clamp' });
  const titleVisible= scrollY.interpolate({ inputRange: [COLLAPSE - 20, COLLAPSE + 20], outputRange: [0, 1], extrapolate: 'clamp' });

  const handleWishlist = (item: any) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        image: item.image,
        storeId: store.id,
        storeName: store.name,
        storeType: store.store_type,
        description: item.description,
      });
    }
  };

  const handleProductPress = (item: any) => {
    navigation.navigate('ProductDetail', { item, store });
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Announcement bar inset */}
      <View style={{ position: 'absolute', top: 30, left: 14, right: 14, zIndex: 60, borderRadius: 8, overflow: 'hidden' }}>
        <AnnouncementBar store={store} accent={accent} />
      </View>

      {/* ── Sticky nav ──────────────────────────────────────────────────────── */}
      <View style={[styles.navWrap, { top: announcementH }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: navBg }]}>
          <LinearGradient colors={[`rgba(${acRgb},0.96)`, `rgba(${acRgb},0.94)`]} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[styles.navSep, { opacity: navBg, borderBottomColor: 'rgba(255,255,255,0.12)' }]} />
        <View style={[styles.navRow, { paddingTop: STATUS_H }]}>
          <Animated.Text style={[styles.navTitle, { opacity: titleVisible }]} numberOfLines={1}>{store.name}</Animated.Text>
        </View>
      </View>

      {/* ── Main scrollable ─────────────────────────────────────────────────── */}
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* ── Hero card ───────────────────────────────────────────────────── */}
        <View style={[styles.heroCard, { marginTop: announcementH + 40, height: HERO_H - 160 }]}>
          {/* Back + Cart + Wishlist */}
          <View style={[styles.heroNav, { paddingTop: 16 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navGlass}>
              <ArrowLeft color="#fff" size={19} strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Wishlist icon */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Wishlist', { store })}
                style={styles.navGlass}
              >
                <Heart color={wishlistCount > 0 ? '#ef4444' : '#fff'} size={19} fill={wishlistCount > 0 ? '#ef4444' : 'none'} strokeWidth={2} />
                {wishlistCount > 0 && (
                  <View style={styles.cartBadge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{wishlistCount}</Text></View>
                )}
              </TouchableOpacity>
              {/* Cart icon */}
              <TouchableOpacity
                onPress={() => cartCount > 0 && navigation.navigate('Cart', { store })}
                style={styles.navGlass}
              >
                <ShoppingCart color="#fff" size={19} strokeWidth={2} />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{cartCount}</Text></View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Banner */}
          <Animated.View style={{ flex: 1, transform: [{ translateY: heroParallax }, { scale: heroScale }] }}>
            {store.banner_image
              ? <Image source={{ uri: store.banner_image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              : <View style={{ flex: 1, backgroundColor: accent }} />}
          </Animated.View>
          <LinearGradient colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.82)']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />

          {/* Hero content */}
          <Animated.View style={[styles.heroContent, { opacity: heroOpacity }]}>
            {store.logo && (
              <View style={styles.logoWrap}>
                <Image source={{ uri: store.logo }} style={{ width: '100%', height: '100%', borderRadius: 14 }} resizeMode="cover" />
              </View>
            )}
            {/* Trust pills */}
            <View style={styles.trustRow}>
              <View style={styles.trustPill}><Star color="#facc15" fill="#facc15" size={10} /><Text style={styles.trustTxt}>4.9 Rating</Text></View>
              <View style={styles.trustPill}><CheckCircle color="#34d399" size={10} /><Text style={styles.trustTxt}>Verified Seller</Text></View>
              {store.city && <View style={styles.trustPill}><MapPin color="rgba(255,255,255,0.75)" size={10} /><Text style={styles.trustTxt}>{store.city}</Text></View>}
              {/* Open/closed badge */}
              {openStatus !== null && (
                <View style={[styles.trustPill, { backgroundColor: openStatus ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)' }]}>
                  <AlertCircle color={openStatus ? '#86efac' : '#fca5a5'} size={10} />
                  <Text style={[styles.trustTxt, { color: openStatus ? '#86efac' : '#fca5a5' }]}>{openStatus ? 'Open Now' : 'Closed'}</Text>
                </View>
              )}
              {/* Working days + hours */}
              {store.working_days && (
                <View style={styles.trustPill}>
                  <Clock color="rgba(255,255,255,0.75)" size={10} />
                  <Text style={styles.trustTxt}>{store.working_days}</Text>
                </View>
              )}
              {store.delivery_hours && (
                <View style={styles.trustPill}>
                  <Zap color="#fbbf24" size={10} />
                  <Text style={styles.trustTxt}>{store.delivery_hours}</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>{store.name}</Text>
            {store.description && <Text style={styles.heroDesc} numberOfLines={2}>{store.description}</Text>}
            <TouchableOpacity
              onPress={() => scrollRef.current?.scrollTo({ y: HERO_H + 20, animated: true })}
              style={[styles.heroCta, { backgroundColor: accent }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.heroCtaTxt, { color: onColor(accent) }]}>{isFood ? 'See Menu' : 'Shop Collection'}</Text>
              <ChevronRight color={onColor(accent)} size={14} strokeWidth={2.5} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ── Category chips / menu tabs ───────────────────────────────────── */}
        {/* For FOOD: these are scroll-to-section tabs. For RETAIL: these are live filters */}
        {allSections.length > 0 && (
          <View style={[styles.tabBar, { backgroundColor: bg, borderBottomColor: `rgba(${rgbStr(secondary)},0.07)` }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
              {/* "All" chip for retail */}
              {!isFood && (
                <TouchableOpacity
                  onPress={() => setActivecat(null)}
                  style={[styles.tab, {
                    backgroundColor: !activecat ? accent : `rgba(${acRgb},0.08)`,
                    borderColor: !activecat ? accent : `rgba(${acRgb},0.15)`,
                  }]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabTxt, { color: !activecat ? onColor(accent) : accent }]}>All</Text>
                </TouchableOpacity>
              )}
              {allSections.map((sec, i) => {
                const active = isFood
                  ? (activecat === sec.title || (!activecat && i === 0))
                  : activecat === sec.title;
                return (
                  <TouchableOpacity
                    key={sec.title}
                    onPress={() => {
                      setActivecat(sec.title);
                      if (isFood) {
                        const off = secOffsets.current[sec.title];
                        if (off !== undefined) scrollRef.current?.scrollTo({ y: off - TOP_OFFSET, animated: true });
                      }
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

        {/* ── Product area ────────────────────────────────────────────────── */}
        <View style={{ paddingTop: 20 }}>
          {isLoading ? (
            // Skeleton
            <View style={{ paddingHorizontal: 16 }}>
              {[0, 1].map(k => (
                <View key={k} style={{ marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                    <Shimmer w={100} h={13} /><Shimmer w={40} h={13} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 14 }}>
                    <Shimmer w={RETAIL_CARD_W} h={RETAIL_CARD_W * 1.5} r={18} />
                    <Shimmer w={RETAIL_CARD_W} h={RETAIL_CARD_W * 1.5} r={18} />
                  </View>
                </View>
              ))}
            </View>
          ) : allSections.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: `rgba(${acRgb},0.08)` }]}>
                <ShoppingBag color={accent} size={40} strokeWidth={1.5} />
              </View>
              <Text style={[styles.emptyTitle, { color: secondary }]}>Nothing here yet</Text>
              <Text style={styles.emptySub}>This store hasn't added any {isFood ? 'menu items' : 'products'} yet.</Text>
            </View>
          ) : isFood ? (
            // ── FOOD: horizontal scroll per menu section ─────────────────────
            visibleSections.map((sec, sIdx) => (
              <View
                key={sec.title}
                onLayout={e => { secOffsets.current[sec.title] = e.nativeEvent.layout.y; }}
                style={{ marginBottom: 32 }}
              >
                <View style={styles.secHeader}>
                  <View style={{ flex: 1, paddingLeft: 16 }}>
                    <Text style={[styles.secTitle, { color: secondary }]}>{sec.title}</Text>
                    <Text style={[styles.secSubtitle, { color: `rgba(${rgbStr(secondary)},0.5)` }]}>{sec.data.length} item{sec.data.length !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
                <View style={[styles.secLine, { backgroundColor: `rgba(${rgbStr(secondary)},0.07)`, marginHorizontal: 16, marginBottom: 14 }]} />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
                >
                  {sec.data.map((item, itemIdx) => (
                    <SharedProductCard
                      key={item.id}
                      item={item}
                      accent={accent}
                      isFood={true}
                      onPress={() => handleProductPress(item)}
                      onWishlist={() => handleWishlist(item)}
                      wishlisted={isInWishlist(item.id)}
                      index={itemIdx}
                    />
                  ))}
                </ScrollView>
              </View>
            ))
          ) : (
            // ── RETAIL: 2-col vertical grid with live category filter ────────
            visibleSections.map((sec, sIdx) => {
              let globalItemIndex = 0;
              visibleSections.slice(0, sIdx).forEach(s => { globalItemIndex += s.data.length; });
              return (
                <View
                  key={sec.title}
                  onLayout={e => { secOffsets.current[sec.title] = e.nativeEvent.layout.y; }}
                  style={{ marginBottom: 32 }}
                >
                  <View style={[styles.secHeader, { paddingHorizontal: 16 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.secTitle, { color: secondary }]}>{sec.title}</Text>
                    </View>
                    <View style={[styles.secCount, { backgroundColor: `rgba(${acRgb},0.1)` }]}>
                      <Text style={[styles.secCountTxt, { color: accent }]}>{sec.data.length} {sec.data.length === 1 ? 'item' : 'items'}</Text>
                    </View>
                  </View>
                  <View style={[styles.secLine, { backgroundColor: `rgba(${rgbStr(secondary)},0.08)`, marginHorizontal: 16, marginBottom: 14 }]} />
                  <View style={[styles.grid, { paddingHorizontal: 16 }]}>
                    {sec.data.map((item, itemIdx) => (
                      <SharedProductCard
                        key={item.id}
                        item={item}
                        accent={accent}
                        isFood={false}
                        onPress={() => handleProductPress(item)}
                        onWishlist={() => handleWishlist(item)}
                        wishlisted={isInWishlist(item.id)}
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

      {/* ── Floating cart bar (only when cart has items) ─────────────────────── */}
      {cartCount > 0 && (
        <View style={styles.cartBarWrap}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart', { store })}
            style={[styles.cartBar, { backgroundColor: accent }]}
            activeOpacity={0.88}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.cartPill}>
                <Text style={{ color: accent, fontSize: 13, fontWeight: '900' }}>{cartCount}</Text>
              </View>
              <Text style={[styles.cartLabel, { color: onColor(accent) }]}>View Cart</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: `rgba(255,255,255,0.7)`, fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>Tap to review</Text>
              <Text style={[styles.cartTotal, { color: onColor(accent) }]}>→ Checkout</Text>
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

  // Hero card
  heroCard:    { marginHorizontal: 14, borderRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  heroNav:     { position: 'absolute', top: 0, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 22, paddingBottom: 26 },
  logoWrap:    { width: 58, height: 58, borderRadius: 16, backgroundColor: '#fff', padding: 2, marginBottom: 14 },
  trustRow:    { flexDirection: 'row', gap: 7, marginBottom: 12, flexWrap: 'wrap' },
  trustPill:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  trustTxt:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  heroTitle:   { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -1.2, lineHeight: 36, marginBottom: 7 },
  heroDesc:    { color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: '500', lineHeight: 18, marginBottom: 18 },
  heroCta:     { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 99 },
  heroCtaTxt:  { fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },

  // Category tabs
  tabBar: { borderBottomWidth: StyleSheet.hairlineWidth },
  tab:    { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 99, borderWidth: 1 },
  tabTxt: { fontSize: 13, fontWeight: '700' },

  // Section headers
  secHeader:   { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  secTitle:    { fontSize: 19, fontWeight: '900', letterSpacing: -0.5 },
  secSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  secCount:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  secCountTxt: { fontSize: 11, fontWeight: '700' },
  secLine:     { height: StyleSheet.hairlineWidth },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' },

  // Product card (shared)
  card:     { borderRadius: 18, overflow: 'hidden', backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.07)', marginBottom: 4 },
  cardImg:  { width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardName: { fontSize: 13, fontWeight: '800', color: '#101827', letterSpacing: -0.2, marginBottom: 3 },
  cardPrice:{ fontSize: 15, fontWeight: '900', letterSpacing: -0.4 },
  cardExtrasHint: { fontSize: 10, fontWeight: '700', marginTop: 2, letterSpacing: 0.3 },
  heartWrap:{ position: 'absolute', top: 8, right: 8 },
  heartBtn: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.30)', alignItems: 'center', justifyContent: 'center' },
  oocOverlay:{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  oocTxt:   { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },

  // Empty state
  emptyState: { paddingVertical: 80, alignItems: 'center' },
  emptyIcon:  { width: 88, height: 88, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  emptySub:   { color: '#9ca3af', textAlign: 'center', fontSize: 14, fontWeight: '500', lineHeight: 20 },

  // Floating cart bar
  cartBarWrap: { position: 'absolute', bottom: 24, left: 16, right: 16 },
  cartBar:     { borderRadius: 22, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  cartPill:    { width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  cartLabel:   { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  cartTotal:   { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
});
