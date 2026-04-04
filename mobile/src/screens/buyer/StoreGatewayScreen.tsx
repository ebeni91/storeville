import React, { useState, useRef } from 'react';
import {
  View, Text, SectionList, Image, TouchableOpacity,
  ActivityIndicator, ScrollView, StatusBar,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import {
  ArrowLeft, ShoppingCart, Plus, Minus,
  MapPin, Clock, Leaf, Flame, Package,
} from 'lucide-react-native';

interface Props {
  route: any;
  navigation: any;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  category: string;
  category_name: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_spicy: boolean;
  preparation_time_minutes: number;
  is_available: boolean;
}

interface RetailItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  category: string;
  category_name: string;
  stock_quantity: number;
  sku: string;
  is_active: boolean;
}

interface Section {
  title: string;
  data: (FoodItem | RetailItem)[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function groupByCategory(items: any[]): Section[] {
  const map: Record<string, any[]> = {};
  items.forEach(item => {
    const key = item.category_name || 'Other';
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });
  return Object.entries(map).map(([title, data]) => ({ title, data }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FoodBadges({ item }: { item: FoodItem }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
      {item.is_vegetarian && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
          <Leaf color="#16a34a" size={11} />
          <Text style={{ color: '#16a34a', fontSize: 11, fontWeight: '700', marginLeft: 3 }}>Veg</Text>
        </View>
      )}
      {item.is_spicy && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
          <Flame color="#dc2626" size={11} />
          <Text style={{ color: '#dc2626', fontSize: 11, fontWeight: '700', marginLeft: 3 }}>Spicy</Text>
        </View>
      )}
      {item.preparation_time_minutes > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
          <Clock color="#6b7280" size={11} />
          <Text style={{ color: '#6b7280', fontSize: 11, fontWeight: '700', marginLeft: 3 }}>{item.preparation_time_minutes}m</Text>
        </View>
      )}
    </View>
  );
}

function RetailBadges({ item }: { item: RetailItem }) {
  const inStock = item.stock_quantity > 0;
  return (
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inStock ? '#dcfce7' : '#fee2e2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
        <Package color={inStock ? '#16a34a' : '#dc2626'} size={11} />
        <Text style={{ color: inStock ? '#16a34a' : '#dc2626', fontSize: 11, fontWeight: '700', marginLeft: 3 }}>
          {inStock ? `${item.stock_quantity} in stock` : 'Out of stock'}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function StoreGatewayScreen({ route, navigation }: Props) {
  const { store } = route.params;
  const isFood = store.store_type === 'FOOD';
  
  // Use store customization if present, otherwise fallback to defaults
  const accentColor = store.primary_color || (isFood ? '#f97316' : '#4f46e5');
  const bgColor = store.background_color || '#f9fafb';
  const secondaryColor = store.secondary_color || '#111827';
  
  const { items: cartItems, addItem, updateQuantity, getItemCount, getTotal } = useCartStore();
  const cartCount = getItemCount();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionListRef = useRef<any>(null);
  const categoryScrollRef = useRef<ScrollView>(null);

  // ── Fetch items & categories in parallel ──────────────────────────────────
  const { data: itemData, isLoading: itemsLoading } = useQuery({
    queryKey: [isFood ? 'food-items' : 'retail-products', store.id],
    queryFn: async () => {
      const endpoint = isFood
        ? `/food/items/?store_id=${store.id}`
        : `/retail/products/?store_id=${store.id}`;
      const res = await api.get(endpoint);
      return res.data.results ?? res.data;
    },
  });

  const { data: categoryData } = useQuery({
    queryKey: [isFood ? 'food-categories' : 'retail-categories', store.id],
    queryFn: async () => {
      const endpoint = isFood
        ? `/food/categories/?store_id=${store.id}`
        : `/retail/categories/?store_id=${store.id}`;
      const res = await api.get(endpoint);
      return res.data.results ?? res.data;
    },
  });

  const sections: Section[] = groupByCategory(itemData || []);
  const isLoading = itemsLoading;

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const getCartQuantity = (itemId: string) =>
    cartItems.find(i => i.id === itemId)?.quantity ?? 0;

  const handleAdd = (item: any) => {
    addItem(
      { id: item.id, name: item.name, price: parseFloat(item.price), image: item.image, quantity: 1 },
      store.id,
      store.name,
      store.store_type,
    );
  };

  const handleRemove = (itemId: string) => {
    const qty = getCartQuantity(itemId);
    updateQuantity(itemId, qty - 1);
  };

  // ── Scroll to section when a category tab is tapped ───────────────────────
  const handleCategoryPress = (title: string, index: number) => {
    setActiveCategory(title);
    sectionListRef.current?.scrollToLocation({ sectionIndex: index, itemIndex: 0, viewOffset: 0 });
  };

  // ─────────────────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: any }) => {
    const qty = getCartQuantity(item.id);
    const outOfStock = !isFood && item.stock_quantity <= 0;

    return (
      <View style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        opacity: outOfStock ? 0.5 : 1,
      }}>
        {/* Image */}
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={{ width: '100%', height: 160, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{
            width: '100%', height: 100,
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
            backgroundColor: isFood ? '#fff7ed' : '#eef2ff',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 40 }}>{isFood ? '🍽️' : '📦'}</Text>
          </View>
        )}

        {/* Info */}
        <View style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#111827' }}>{item.name}</Text>
              {item.description ? (
                <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 3 }} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              {isFood
                ? <FoodBadges item={item} />
                : <RetailBadges item={item} />
              }
            </View>

            {/* Price + Qty controls */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: accentColor }}>
                {parseFloat(item.price).toFixed(2)}
              </Text>
              <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Birr</Text>

              {qty === 0 ? (
                <TouchableOpacity
                  onPress={() => handleAdd(item)}
                  disabled={outOfStock}
                  style={{
                    marginTop: 10, backgroundColor: accentColor,
                    paddingHorizontal: 18, paddingVertical: 10,
                    borderRadius: 12, flexDirection: 'row', alignItems: 'center',
                  }}
                  activeOpacity={0.8}
                >
                  <Plus color="#fff" size={15} />
                  <Text style={{ color: '#fff', fontWeight: '800', marginLeft: 4 }}>Add</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => handleRemove(item.id)}
                    style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Minus color="#374151" size={15} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 17, fontWeight: '900', color: '#111827', minWidth: 20, textAlign: 'center' }}>{qty}</Text>
                  <TouchableOpacity
                    onPress={() => handleAdd(item)}
                    style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: accentColor, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus color="#fff" size={15} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={{ backgroundColor: bgColor, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 4 }}>
      <Text style={{ fontSize: 13, fontWeight: '800', color: secondaryColor, textTransform: 'uppercase', letterSpacing: 1 }}>
        {section.title}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar barStyle={bgColor === '#000000' || bgColor === '#0A0A0A' ? 'light-content' : 'dark-content'} />

      {/* ── Announcement Bar ────────────────────────────────────────────── */}
      {store.announcement_is_active && store.announcement_text ? (
        <View style={{ backgroundColor: store.announcement_color || accentColor, paddingTop: 45, paddingBottom: 10, paddingHorizontal: 16, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
            {store.announcement_text}
          </Text>
        </View>
      ) : null}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={{ backgroundColor: accentColor, paddingTop: (store.announcement_is_active && store.announcement_text) ? 20 : 52, paddingBottom: 30, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: accentColor, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5, zIndex: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 }}
          >
            <ArrowLeft color="#fff" size={22} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => cartCount > 0 && navigation.navigate('Checkout', { store })}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, position: 'relative' }}
          >
            <ShoppingCart color="#fff" size={22} />
            {cartCount > 0 && (
              <View style={{
                position: 'absolute', top: -5, right: -5,
                backgroundColor: '#ef4444', width: 20, height: 20,
                borderRadius: 10, alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

          {store.logo ? (
             <View style={{width: 60, height: 60, borderRadius: 16, backgroundColor: '#fff', padding: 2, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10}}>
                <Image source={{uri: store.logo}} style={{width: '100%', height: '100%', borderRadius: 14}} resizeMode="cover" />
             </View>
          ) : null}

        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 }}>{store.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
          <MapPin color="rgba(255,255,255,0.8)" size={14} />
          <Text style={{ color: 'rgba(255,255,255,0.8)', marginLeft: 5, fontWeight: '600', fontSize: 13 }}>
            {store.category}{store.city ? ` · ${store.city}` : ''}
          </Text>
        </View>
        {store.description ? (
          <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 10, fontSize: 14, fontWeight: '500', lineHeight: 20 }}>
            {store.description}
          </Text>
        ) : null}
      </View>

      {/* ── Category Tabs ─────────────────────────────────────────────────── */}
      {sections.length > 1 && (
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ backgroundColor: bgColor, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', marginTop: 10 }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
        >
          {sections.map((sec, idx) => {
            const isActive = activeCategory === sec.title || (!activeCategory && idx === 0);
            return (
              <TouchableOpacity
                key={sec.title}
                onPress={() => handleCategoryPress(sec.title, idx)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: isActive ? accentColor : 'rgba(0,0,0,0.05)',
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontWeight: '700', fontSize: 13, color: isActive ? '#fff' : secondaryColor }}>
                  {sec.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={{ color: '#9ca3af', marginTop: 12, fontWeight: '600' }}>
            Loading {isFood ? 'menu' : 'products'}...
          </Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>{isFood ? '🍽️' : '📦'}</Text>
          <Text style={{ color: '#374151', fontSize: 18, fontWeight: '800' }}>Nothing here yet</Text>
          <Text style={{ color: '#9ca3af', marginTop: 6, textAlign: 'center', paddingHorizontal: 32 }}>
            This store hasn't added any {isFood ? 'menu items' : 'products'} yet.
          </Text>
        </View>
      ) : (
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: cartCount > 0 ? 110 : 24 }}
          stickySectionHeadersEnabled={true}
          onScrollToIndexFailed={() => {}}
        />
      )}

      {/* ── Floating Cart Bar ─────────────────────────────────────────────── */}
      {cartCount > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Checkout', { store })}
          style={{
            position: 'absolute', bottom: 24, left: 16, right: 16,
            backgroundColor: accentColor,
            paddingVertical: 16, paddingHorizontal: 20,
            borderRadius: 18, flexDirection: 'row',
            justifyContent: 'space-between', alignItems: 'center',
            shadowColor: accentColor, shadowOpacity: 0.4, shadowRadius: 12,
            elevation: 8,
          }}
          activeOpacity={0.9}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 12, paddingVertical: 4,
              borderRadius: 10, marginRight: 12,
            }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>{cartCount}</Text>
            </View>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17 }}>View Cart</Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 17 }}>
            {getTotal().toFixed(2)} Birr
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
