import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { ArrowLeft, CheckCircle, Store, Zap, Crown } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { api } from '../../lib/api';
import { useSession } from '../../lib/auth-client';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';

// Re-using local image requires for placeholders
const paymentMethods = [
  { id: 'telebirr', name: 'Telebirr', image: 'https://telebirr.et/static/media/telebirr-logo.518fc5cf.png' },
  { id: 'cbe', name: 'CBE Birr', image: 'https://play-lh.googleusercontent.com/lM_K8_pAYK9xV1w1J8dI44pAILoMFTl2Vv-_f0w8r9jXON-gZzLpL9tI-F29P5YF3g=w240-h480-rw' },
  { id: 'boa', name: 'Bank of Abyssinia', image: 'https://bankofabyssinia.com/wp-content/uploads/2022/10/BoALogo.png' },
];

export function SubscriptionCheckoutScreen({ route, navigation }: any) {
  const { storeData, plan } = route.params;
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';
  const { alertState, showAlert, hideAlert } = useAlert();
  const { refetch: refetchSession } = useSession();

  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].id);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isPro = plan.id === 'pro';
  const Icon = isPro ? Zap : Crown;
  const accent = isPro ? '#111827' : '#f59e0b';
  const price = isPro ? '299.00' : '799.00';

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Simulate payment delay
      await new Promise(r => setTimeout(r, 1200));

      // Append the selected plan to store payload (converting to uppercase for DB choice)
      const payload = {
        ...storeData,
        subscription_plan: plan.id.toUpperCase(),
      };

      await api.post('/stores/manage', payload);
      
      setSuccess(true);
      
      setTimeout(async () => {
        await refetchSession();
      }, 1500);

    } catch (e: any) {
      setLoading(false);
      const msg = e.response?.data ? JSON.stringify(e.response.data) : (e.message || 'Payment failed.');
      showAlert({ title: 'Transaction Failed', message: msg, variant: 'error', buttons: [{ text: 'OK' }] });
    }
  };

  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="light-content"  backgroundColor="transparent" translucent={true} />
        <CheckCircle color="#fff" size={80} strokeWidth={2.5} style={{ marginBottom: 20 }} />
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 8 }}>Payment Successful</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Launching your store...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'}  backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: isDark ? 'rgba(28,30,43,0.95)' : colors.surface, borderBottomWidth: 1, borderColor: isDark ? '#3b3f5c' : colors.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 12 }}>Secure Checkout</Text>
        <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '500', marginTop: 4 }}>Complete your store subscription</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Order Summary */}
        <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>Summary</Text>
        <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border, marginBottom: 28 }}>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6', paddingBottom: 16, marginBottom: 16 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${accent}22`, alignItems: 'center', justifyContent: 'center' }}>
              <Icon color={accent} size={20} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>StoreVille {plan.name}</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textMuted }}>1 Month Subscription</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 15, color: colors.textMuted, fontWeight: '500' }}>Subtotal</Text>
            <Text style={{ fontSize: 15, color: colors.text, fontWeight: '700' }}>Br {price}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 15, color: colors.textMuted, fontWeight: '500' }}>Tax (0%)</Text>
            <Text style={{ fontSize: 15, color: colors.text, fontWeight: '700' }}>Br 0.00</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6' }}>
            <Text style={{ fontSize: 16, color: colors.text, fontWeight: '900' }}>Total</Text>
            <Text style={{ fontSize: 22, color: accent, fontWeight: '900' }}>Br {price}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>Pay With</Text>
        <View style={{ gap: 12 }}>
          {paymentMethods.map(method => {
            const isSelected = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod(method.id)}
                style={{
                  flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
                  backgroundColor: isSelected ? `${accent}11` : (isDark ? 'rgba(255,255,255,0.04)' : '#fff'),
                  borderWidth: 1.5, borderColor: isSelected ? accent : (isDark ? 'rgba(255,255,255,0.1)' : colors.border)
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Image source={{ uri: method.image }} style={{ width: 28, height: 28 }} resizeMode="contain" />
                </View>
                <Text style={{ flex: 1, fontSize: 16, fontWeight: '700', color: isSelected ? accent : colors.text }}>{method.name}</Text>
                
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: isSelected ? accent : '#d1d5db', alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? accent : 'transparent' }}>
                  {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* Footer / CTA */}
      <View style={{ padding: 20, paddingBottom: 36, backgroundColor: isDark ? 'rgba(28,30,43,0.95)' : colors.surface, borderTopWidth: 1, borderColor: isDark ? '#3b3f5c' : colors.border }}>
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={loading}
          activeOpacity={0.9}
          style={{
            backgroundColor: accent,
            borderRadius: 999, paddingVertical: 18,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            shadowColor: accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Pay Br {price}</Text>
          )}
        </TouchableOpacity>
        <Text style={{ textAlign: 'center', color: colors.textMuted, fontSize: 12, fontWeight: '500', marginTop: 12 }}>
          Payments are securely encrypted.
        </Text>
      </View>

      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
    </View>
  );
}
