import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView,
  Platform, StatusBar, ScrollView, StyleSheet,
} from 'react-native';
import { useCartStore, getItemTotal } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { authClient } from '../../lib/auth-client';
import { api } from '../../lib/api';
import {
  ArrowLeft, MapPin, CreditCard, CheckCircle, ShoppingBag,
  Banknote, Smartphone, Building2,
} from 'lucide-react-native';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';

// ─── Payment methods ───────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'cod',      label: 'Cash on Delivery', icon: Banknote,   color: '#16a34a', bg: '#dcfce7' },
  { id: 'telebirr', label: 'Telebirr',          icon: Smartphone, color: '#111827', bg: '#f3f4f6' },
  { id: 'cbe',      label: 'CBE Birr',           icon: Building2,  color: '#0ea5e9', bg: '#f0f9ff' },
];

// ─── Colour helpers ────────────────────────────────────────────────────────────
const hexRgb = (hex: string) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff');
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 255, g: 255, b: 255 };
};
const luma    = (hex: string) => { const c = hexRgb(hex); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; };
const onColor = (hex: string) => luma(hex) > 160 ? '#0a0a0a' : '#ffffff';

interface Props { route: any; navigation: any; }

export function CheckoutScreen({ route, navigation }: Props) {
  const { store } = route.params;
  const isFood   = store.store_type === 'FOOD';
  const accent   = store.primary_color || (isFood ? '#f97316' : '#4f46e5');
  const bg       = store.background_color || '#ffffff';
  const fg       = onColor(accent);

  const isDark        = luma(bg) < 128;
  const surface       = isDark ? 'rgba(255,255,255,0.08)' : '#ffffff';
  const textPrimary   = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#a5b4d4' : '#9ca3af';
  const border        = isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6';
  const inputBg       = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const inputText     = isDark ? '#f9fafb' : '#111827';

  const { items, clearCart, getTotal } = useCartStore();
  const { isGuest, exitGuestMode } = useAuthStore();
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user && !isGuest;

  const [address,        setAddress]        = useState('');
  const [instructions,   setInstructions]   = useState('');
  const [paymentMethod,  setPaymentMethod]  = useState<string>('cod');
  const [loading,        setLoading]        = useState(false);
  const [orderSuccess,   setOrderSuccess]   = useState(false);
  const [orderId,        setOrderId]        = useState<string | null>(null);
  const { alertState, showAlert, hideAlert } = useAlert();

  const requireAuth = () => showAlert({
    title: 'Login Required',
    message: 'Please login to complete your purchase.',
    variant: 'warning',
    buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Login', onPress: exitGuestMode }],
  });

  const handlePlace = async () => {
    if (!isLoggedIn) return requireAuth();
    if (!address.trim()) {
      showAlert({ title: 'Missing Address', message: isFood ? 'Enter your delivery address.' : 'Enter your shipping address.', variant: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    if (items.length === 0) {
      showAlert({ title: 'Empty Cart', message: 'Add some items before checking out.', variant: 'info', buttons: [{ text: 'OK' }] });
      return;
    }
    setLoading(true);
    try {
      let response;
      if (isFood) {
        response = await api.post('/orders/food/', {
          store: store.id,
          delivery_address: address.trim(),
          delivery_instructions: instructions.trim() || '',
          is_asap: true,
          payment_method: paymentMethod,
          items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
        });
      } else {
        response = await api.post('/orders/retail/', {
          store: store.id,
          shipping_address: address.trim(),
          payment_method: paymentMethod,
          items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
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
      showAlert({ title: 'Order Failed', message: msg, variant: 'error', buttons: [{ text: 'OK' }] });
    } finally { setLoading(false); }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'}  backgroundColor="transparent" translucent={true} />
        <View style={[styles.successCircle, { backgroundColor: isFood ? '#fff7ed' : '#f3f4f6' }]}>
          <CheckCircle color={accent} size={56} />
        </View>
        <Text style={[styles.successTitle, { color: textPrimary }]}>Order Placed! 🎉</Text>
        <Text style={[styles.successSub, { color: textSecondary }]}>
          Your order has been sent to {store.name}.{'\n'}
          {isFood ? "Sit tight, it's being prepared!" : 'Your items will be shipped shortly!'}
        </Text>
        {orderId && (
          <View style={[styles.orderIdBox, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.orderIdLabel, { color: textSecondary }]}>Order ID</Text>
            <Text style={[styles.orderIdVal, { color: textPrimary }]}>{String(orderId).slice(0, 8).toUpperCase()}</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => navigation.popToTop()} style={[styles.backHomeBtn, { backgroundColor: accent }]} activeOpacity={0.85}>
          <Text style={[styles.backHomeTxt, { color: fg }]}>Back to Stores</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { backgroundColor: bg }]}>
        <StatusBar barStyle="light-content"  backgroundColor="transparent" translucent={true} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: accent }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#fff" size={22} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Checkout</Text>
            <Text style={styles.headerSub}>{store.name}</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 160 }}>

          {/* ── Read-only order summary ──────────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>Your {isFood ? 'Order' : 'Cart'} · {items.length} items</Text>
          <View style={[styles.summaryCard, { backgroundColor: surface, borderColor: border }]}>
            {items.map(item => (
              <View key={item.id} style={styles.summaryRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.summaryName, { color: textPrimary }]}>{item.name} ×{item.quantity}</Text>
                  {(item.selectedOptions || []).length > 0 && (
                    <Text style={[styles.summaryMeta, { color: textSecondary }]}>{item.selectedOptions!.map(o => `${o.optionName}: ${o.choice}`).join(' · ')}</Text>
                  )}
                  {(item.selectedExtras || []).length > 0 && (
                    <Text style={styles.summaryExtra}>{item.selectedExtras!.map(e => `+ ${e.name}`).join(', ')}</Text>
                  )}
                </View>
                <Text style={[styles.summaryAmt, { color: accent }]}>Br {getItemTotal(item).toFixed(2)}</Text>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryName, { color: textSecondary }]}>{isFood ? 'Delivery Fee' : 'Shipping Fee'}</Text>
              <Text style={{ color: '#22c55e', fontWeight: '700' }}>Free</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 6 }]}>
              <Text style={{ fontSize: 17, fontWeight: '900', color: textPrimary }}>Total</Text>
              <Text style={{ fontSize: 17, fontWeight: '900', color: accent }}>Br {getTotal().toFixed(2)}</Text>
            </View>
          </View>

          {/* ── Delivery / Shipping address ─────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { marginTop: 16, color: textSecondary }]}>{isFood ? 'Delivery Address' : 'Shipping Address'}</Text>
          <View style={[styles.inputCard, { backgroundColor: surface, borderColor: border }]}>
            <MapPin color={accent} size={20} style={{ marginTop: 2 }} />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 10, color: inputText }]}
              placeholder={isFood ? 'Enter your delivery address...' : 'Enter your shipping address...'}
              placeholderTextColor={textSecondary}
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>

          {/* ── Special instructions (food only) ────────────────────────────── */}
          {isFood && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 12, color: textSecondary }]}>Special Instructions</Text>
              <TextInput
                style={[styles.textareaCard, { backgroundColor: surface, borderColor: border, color: inputText }]}
                placeholder="e.g. No onions, extra spicy, ring bell on arrival..."
                placeholderTextColor={textSecondary}
                value={instructions}
                onChangeText={setInstructions}
                multiline
              />
            </>
          )}

          {/* ── Payment method ───────────────────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { marginTop: 12, color: textSecondary }]}>Payment Method</Text>
          <View style={styles.paymentGrid}>
            {PAYMENT_METHODS.map(m => {
              const active = paymentMethod === m.id;
              const Icon = m.icon;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setPaymentMethod(m.id)}
                  activeOpacity={0.8}
                  style={[styles.paymentPill, {
                    backgroundColor: active ? m.color : surface,
                    borderColor: active ? m.color : border,
                    borderWidth: active ? 2 : 1,
                  }]}
                >
                  <View style={[styles.payIconWrap, { backgroundColor: active ? 'rgba(255,255,255,0.2)' : m.bg }]}>
                    <Icon color={active ? '#fff' : m.color} size={18} strokeWidth={2} />
                  </View>
                  <Text style={[styles.payLabel, { color: active ? '#fff' : textPrimary }]}>{m.label}</Text>
                  {active && (
                    <View style={styles.payCheckWrap}>
                      <CheckCircle color="#fff" size={16} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Guest warning ────────────────────────────────────────────────── */}
          {!isLoggedIn && (
            <View style={styles.guestWarn}>
              <ShoppingBag color="#f97316" size={18} />
              <Text style={styles.guestTxt}>You're browsing as a guest. Login to complete your purchase.</Text>
            </View>
          )}
        </ScrollView>

        {/* ── Sticky place order button ─────────────────────────────────────── */}
        <View style={[styles.bottomBar, { backgroundColor: bg, borderTopColor: border }]}>
          <TouchableOpacity
            onPress={handlePlace}
            disabled={loading || items.length === 0}
            style={[styles.placeBtn, { backgroundColor: loading || items.length === 0 ? '#d1d5db' : accent }]}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <CreditCard color={loading || items.length === 0 ? '#9ca3af' : (onColor(accent))} size={20} />
                <Text style={[styles.placeTxt, { color: loading || items.length === 0 ? '#9ca3af' : onColor(accent) }]}>
                  {isLoggedIn ? 'Place Order' : 'Login to Order'} · Br {getTotal().toFixed(2)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <CustomAlert visible={alertState.visible} title={alertState.title} message={alertState.message} variant={alertState.variant} buttons={alertState.buttons} onDismiss={hideAlert} />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 20, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },

  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },

  summaryCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  summaryName: { fontSize: 14, fontWeight: '700', color: '#374151', flexShrink: 1 },
  summaryMeta: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  summaryExtra: { fontSize: 11, color: '#111827', fontWeight: '600', marginTop: 2 },
  summaryAmt: { fontSize: 14, fontWeight: '800', marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },

  inputCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12 },
  input: { fontSize: 15, color: '#111827', minHeight: 60 },
  textareaCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12, minHeight: 80, textAlignVertical: 'top' },

  paymentGrid: { gap: 10, marginBottom: 16 },
  paymentPill: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18 },
  payIconWrap: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  payLabel: { flex: 1, fontSize: 15, fontWeight: '700' },
  payCheckWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },

  guestWarn: { marginTop: 14, backgroundColor: '#fff7ed', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 4, borderLeftColor: '#f97316' },
  guestTxt: { flex: 1, color: '#92400e', fontWeight: '600', fontSize: 13 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: '#f3f4f6', padding: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 28 },
  placeBtn: { paddingVertical: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  placeTxt: { fontWeight: '900', fontSize: 17, letterSpacing: -0.2 },

  successCircle: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#111827', textAlign: 'center', marginBottom: 10 },
  successSub: { color: '#6b7280', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  orderIdBox: { marginTop: 4, backgroundColor: '#f9fafb', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, marginBottom: 28 },
  orderIdLabel: { color: '#9ca3af', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  orderIdVal: { color: '#374151', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  backHomeBtn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16 },
  backHomeTxt: { fontWeight: '900', fontSize: 16 },
});
