import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, StatusBar, ScrollView,
} from 'react-native';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import {
  ArrowLeft, Minus, Plus, Trash2,
  MapPin, CreditCard, CheckCircle, ShoppingBag,
} from 'lucide-react-native';

interface Props {
  route: any;
  navigation: any;
}

export function CheckoutScreen({ route, navigation }: Props) {
  const { store } = route.params;
  const isFood = store.store_type === 'FOOD';
  const accentColor = isFood ? '#f97316' : '#4f46e5';

  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore();
  const { isAuthenticated, isGuest } = useAuthStore();

  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const isLoggedIn = isAuthenticated && !isGuest;

  // ── Auth gate: redirect to login before checkout ────────────────────────
  const requireAuth = () => {
    Alert.alert(
      'Login Required',
      'Please login or create an account to complete your purchase.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.getParent()?.getParent()?.navigate('Auth', { intendedRole: 'CUSTOMER' }) },
        { text: 'Register', onPress: () => navigation.getParent()?.getParent()?.navigate('Register', { intendedRole: 'CUSTOMER' }) },
      ],
    );
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) return requireAuth();
    if (!address.trim()) {
      Alert.alert('Missing Address', isFood ? 'Please enter your delivery address.' : 'Please enter your shipping address.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Add some items before checking out.');
      return;
    }

    setLoading(true);
    try {
      let response;

      if (isFood) {
        // ── Food order: backend expects menu_item_id, price_at_time is read_only ──
        response = await api.post('/orders/food/', {
          store: store.id,
          delivery_address: address.trim(),
          delivery_instructions: instructions.trim() || '',
          is_asap: true,
          items: items.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
          })),
        });
      } else {
        // ── Retail order: backend expects product_id, price_at_time is read_only ─
        response = await api.post('/orders/retail/', {
          store: store.id,
          shipping_address: address.trim(),
          items: items.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        });
      }

      clearCart();
      setOrderId(response.data?.id || response.data?.order_id || null);
      setOrderSuccess(true);
    } catch (error: any) {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        JSON.stringify(error.response?.data) ||
        error?.message ||
        'Could not place order. Please try again.';
      Alert.alert('Order Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <StatusBar barStyle="dark-content" />
        <View style={{
          width: 100, height: 100, borderRadius: 50,
          backgroundColor: isFood ? '#fff7ed' : '#eef2ff',
          alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <CheckCircle color={accentColor} size={54} />
        </View>
        <Text style={{ fontSize: 28, fontWeight: '900', color: '#111827', textAlign: 'center' }}>Order Placed! 🎉</Text>
        <Text style={{ color: '#6b7280', fontSize: 15, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
          Your order has been sent to {store.name}.{'\n'}
          {isFood ? 'Sit tight, it\'s being prepared!' : 'Your items will be shipped shortly!'}
        </Text>
        {orderId && (
          <View style={{ marginTop: 16, backgroundColor: '#f9fafb', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 18 }}>
            <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>Order ID</Text>
            <Text style={{ color: '#374151', fontSize: 13, fontWeight: '800', textAlign: 'center' }}>{String(orderId).slice(0, 8).toUpperCase()}</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => navigation.popToTop()}
          style={{
            marginTop: 36, backgroundColor: accentColor,
            paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16,
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>Back to Stores</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main Checkout Screen ─────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ backgroundColor: accentColor, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, marginRight: 14 }}
          >
            <ArrowLeft color="#fff" size={22} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>Checkout</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' }}>{store.name}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>

        {/* ── Cart Items ──────────────────────────────────────────────────── */}
        <Text style={{ fontSize: 12, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Your {isFood ? 'Order' : 'Cart'} · {getItemCount()} items
        </Text>

        {items.map(item => (
          <View key={item.id} style={{
            backgroundColor: '#fff', borderRadius: 16, padding: 14,
            marginBottom: 10, flexDirection: 'row', alignItems: 'center',
            borderWidth: 1, borderColor: '#f3f4f6',
            shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827' }}>{item.name}</Text>
              <Text style={{ color: accentColor, fontWeight: '800', marginTop: 3, fontSize: 15 }}>
                {(item.price * item.quantity).toFixed(2)} Birr
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '600' }}>
                {item.price.toFixed(2)} × {item.quantity}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 10 }}>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus color="#374151" size={14} />
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827', minWidth: 20, textAlign: 'center' }}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: accentColor, alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus color="#fff" size={14} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}
              >
                <Trash2 color="#ef4444" size={14} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ── Delivery / Shipping Address ─────────────────────────────────── */}
        <Text style={{ fontSize: 12, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 12 }}>
          {isFood ? 'Delivery Address' : 'Shipping Address'}
        </Text>
        <View style={{
          backgroundColor: '#fff', borderRadius: 16,
          padding: 14, flexDirection: 'row', alignItems: 'flex-start',
          borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12,
        }}>
          <MapPin color={accentColor} size={20} style={{ marginTop: 2 }} />
          <TextInput
            style={{ flex: 1, marginLeft: 10, fontSize: 15, color: '#111827', minHeight: 60 }}
            placeholder={isFood ? 'Enter your delivery address...' : 'Enter your shipping address...'}
            placeholderTextColor="#9ca3af"
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>

        {/* ── Special Instructions (food only) ───────────────────────────── */}
        {isFood && (
          <>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Special Instructions
            </Text>
            <TextInput
              style={{
                backgroundColor: '#fff', borderRadius: 16, padding: 14,
                fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#f3f4f6',
                marginBottom: 12, minHeight: 80, textAlignVertical: 'top',
              }}
              placeholder="e.g. No onions, extra spicy, ring bell on arrival..."
              placeholderTextColor="#9ca3af"
              value={instructions}
              onChangeText={setInstructions}
              multiline
            />
          </>
        )}

        {/* ── Order Summary ───────────────────────────────────────────────── */}
        <Text style={{ fontSize: 12, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 4 }}>
          Order Summary
        </Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#f3f4f6' }}>
          {items.map(item => (
            <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#6b7280', fontWeight: '600', fontSize: 14 }}>
                {item.name} ×{item.quantity}
              </Text>
              <Text style={{ color: '#374151', fontWeight: '700', fontSize: 14 }}>
                {(item.price * item.quantity).toFixed(2)} Birr
              </Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#6b7280', fontWeight: '600' }}>{isFood ? 'Delivery Fee' : 'Shipping Fee'}</Text>
            <Text style={{ color: '#22c55e', fontWeight: '700' }}>Free</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#111827', fontWeight: '900', fontSize: 17 }}>Total</Text>
            <Text style={{ color: accentColor, fontWeight: '900', fontSize: 17 }}>
              {getTotal().toFixed(2)} Birr
            </Text>
          </View>
        </View>

        {/* ── Guest warning ───────────────────────────────────────────────── */}
        {!isLoggedIn && (
          <View style={{
            marginTop: 14, backgroundColor: '#fff7ed', borderRadius: 14,
            padding: 14, flexDirection: 'row', alignItems: 'center',
            borderLeftWidth: 4, borderLeftColor: '#f97316',
          }}>
            <ShoppingBag color="#f97316" size={18} />
            <Text style={{ flex: 1, marginLeft: 10, color: '#92400e', fontWeight: '600', fontSize: 13 }}>
              You're browsing as a guest. Login to complete your purchase.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Sticky Place Order Button ──────────────────────────────────────── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6',
        padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16,
      }}>
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={loading || items.length === 0}
          style={{
            backgroundColor: loading || items.length === 0 ? '#d1d5db' : accentColor,
            paddingVertical: 18, borderRadius: 16,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          }}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CreditCard color="#fff" size={20} />
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 17, marginLeft: 10 }}>
                {isLoggedIn ? 'Place Order' : 'Login to Order'} · {getTotal().toFixed(2)} Birr
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
