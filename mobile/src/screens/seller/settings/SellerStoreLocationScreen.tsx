import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator
} from 'react-native';
import { ChevronLeft, MapPin, Navigation } from 'lucide-react-native';
import { useThemeStore } from '../../../store/themeStore';
import { api } from '../../../lib/api';
import * as Location from 'expo-location';
import { CustomAlert } from '../../../components/ui/CustomAlert';
import { useAlert } from '../../../lib/useAlert';

interface Props { navigation: any; }

export function SellerStoreLocationScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const { alertState, showAlert, hideAlert } = useAlert();

  useEffect(() => {
    api.get('/stores/manage').then(r => {
      const s = r.data?.results?.[0] || r.data?.[0];
      if (s) {
        setStore(s);
        // API may return coords as strings — always coerce to number
        setLat(s.latitude  != null ? parseFloat(s.latitude)  : null);
        setLng(s.longitude != null ? parseFloat(s.longitude) : null);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const grabLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { showAlert({ title: 'Permission Denied', message: 'GPS access is required to set your store location.', variant: 'warning', buttons: [{ text: 'OK' }] }); return; }
    try {
      const loc = await Location.getLastKnownPositionAsync({});
      const coords = loc?.coords || (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })).coords;
      setLat(coords.latitude); setLng(coords.longitude);
    } catch { showAlert({ title: 'Location Error', message: 'Could not get GPS location.', variant: 'error', buttons: [{ text: 'OK' }] }); }
  };

  const save = async () => {
    if (!store?.id || !lat || !lng) return;
    setSaving(true);
    try {
      await api.patch(`/stores/manage/${store.id}`, { 
        latitude: parseFloat(lat.toFixed(6)), 
        longitude: parseFloat(lng.toFixed(6)) 
      });
      showAlert({ title: 'Location Saved!', message: 'Your store location has been updated.', variant: 'success', buttons: [{ text: 'Great' }] });
    } catch { showAlert({ title: 'Save Failed', message: 'Could not update location.', variant: 'error', buttons: [{ text: 'OK' }] }); }
    finally { setSaving(false); }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.topBar, { 
        backgroundColor: isDark ? 'rgba(28, 30, 43, 0.98)' : colors.surface, 
        borderBottomColor: isDark ? '#3b3f5c' : colors.border 
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Store Location</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
          <>
            {/* Store info strip */}
            <View style={[styles.storeStrip, { 
              backgroundColor: isDark ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
              borderColor: isDark ? '#3b3f5c' : colors.border 
            }]}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5' }]}>
                <MapPin color="#10b981" size={20} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stripLabel, { color: colors.textMuted }]}>Active store</Text>
                <Text style={[styles.stripValue, { color: colors.text }]}>{store?.name || '—'}</Text>
              </View>
            </View>

            {/* Current coords */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Current Coordinates</Text>
            <View style={[styles.coordCard, { 
              backgroundColor: isDark ? 'rgba(28, 30, 43, 0.95)' : colors.surface, 
              borderColor: lat ? '#10b981' : (isDark ? '#3b3f5c' : colors.border) 
            }]}>
              <View style={[styles.coordDot, { backgroundColor: lat ? '#10b981' : colors.textMuted }]} />
              <Text style={[styles.coordText, { color: lat ? '#10b981' : colors.textMuted }]}>
                {lat != null && Number.isFinite(lat) && lng != null && Number.isFinite(lng)
                  ? `${lat.toFixed(5)},  ${lng.toFixed(5)}`
                  : 'No location set yet'}
              </Text>
            </View>

            {/* Re-pin button */}
            <TouchableOpacity onPress={grabLocation} activeOpacity={0.85}
              style={[styles.pinBtn, { backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5', borderColor: '#10b981' }]}>
              <Navigation color="#10b981" size={18} strokeWidth={2} />
              <Text style={[styles.pinBtnText, { color: '#10b981' }]}>Pin My Current Location</Text>
            </TouchableOpacity>

            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Buyers use your GPS coordinates to see your store on the map. Tap the button to retake your current position.
            </Text>

            {/* Save */}
            <TouchableOpacity onPress={save} disabled={saving || !lat}
              activeOpacity={0.85}
              style={[styles.saveBtn, { backgroundColor: (!lat || saving) ? colors.surfaceAlt : '#10b981' }]}>
              {saving ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>Update Location</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  storeStrip: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 16, borderWidth: 1, marginBottom: 24 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stripLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  stripValue: { fontSize: 16, fontWeight: '800' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  coordCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 14 },
  coordDot: { width: 8, height: 8, borderRadius: 99 },
  coordText: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] } as any,
  pinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 15, borderWidth: 1.5, marginBottom: 14 },
  pinBtnText: { fontSize: 15, fontWeight: '800' },
  hint: { fontSize: 13, fontWeight: '500', lineHeight: 19, marginBottom: 28 },
  saveBtn: { borderRadius: 16, paddingVertical: 17, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
