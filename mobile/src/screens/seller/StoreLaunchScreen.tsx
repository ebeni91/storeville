import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Platform,
  KeyboardAvoidingView, Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { ArrowRight, MapPin, Store, Coffee, Navigation, CheckCircle } from 'lucide-react-native';
import { authClient, useSession } from '../../lib/auth-client';
import { api } from '../../lib/api';
import { useThemeStore } from '../../store/themeStore';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useAlert } from '../../lib/useAlert';

const { width } = Dimensions.get('window');

const RETAIL_TYPES = ['Electronics', 'Fashion & Apparel', 'Grocery & Supermarket', 'Home & Decor', 'Beauty & Wellness', 'Sports & Outdoors', 'Books & Stationery', 'Other Retail'];
const FOOD_TYPES = ['Café & Coffee Shop', 'Restaurant', 'Fast Food', 'Bakery & Pastry', 'Bar & Lounge', 'Juice Bar', 'Hotel & Dining', 'Other Food'];

type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number; };

const DEFAULT_REGION: Region = {
  latitude: 9.0192,
  longitude: 38.7525,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

interface Props { navigation: any; }

export function StoreLaunchScreen({ navigation }: Props) {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';
  const { alertState, showAlert, hideAlert } = useAlert();

  const webviewRef = useRef<WebView>(null);

  const [category, setCategory] = useState<'RETAIL' | 'FOOD'>('RETAIL');
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { refetch: refetchSession } = useSession();

  React.useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation(loc);
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch { /* ignore */ }
    })();
  }, []);

  const isRetail = category === 'RETAIL';
  const accentColor = isRetail ? '#6366f1' : '#f97316';
  const accentBg = isRetail ? 'rgba(99,102,241,0.1)' : 'rgba(249,115,22,0.1)';
  const accentBorder = isRetail ? 'rgba(99,102,241,0.3)' : 'rgba(249,115,22,0.3)';
  const businessTypes = isRetail ? RETAIL_TYPES : FOOD_TYPES;

  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : colors.surface;
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : colors.border;

  const handleLaunch = async () => {
    if (!storeName.trim()) {
      showAlert({ title: 'Missing Info', message: 'Please enter your store name.', variant: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }
    if (!businessType) {
      showAlert({ title: 'Missing Info', message: 'Please select your business type.', variant: 'warning', buttons: [{ text: 'OK' }] });
      return;
    }

    setLoading(true);
    try {
      // Build slug from store name
      const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      // Create the store via the Django backend
      await api.post('/stores/manage', {
        name: storeName.trim(),
        category: businessType, // Changed from sending 'RETAIL' to sending the actual type like 'Electronics'
        store_type: category, // This is 'RETAIL' or 'FOOD'
        description: description.trim(),
        latitude: parseFloat(location.latitude.toFixed(6)),
        longitude: parseFloat(location.longitude.toFixed(6)),
      });

      // Show success animation state
      setSuccess(true);
      
      // Wait for user to see the success state, then smoothly transition navigation
      setTimeout(async () => {
        // Force a fresh session fetch to pick up upgraded SELLER role
        await refetchSession();
      }, 1500);

    } catch (e: any) {
      setLoading(false);
      setSuccess(false);
      if (e.response && e.response.data) {
        showAlert({ title: 'Validation Error', message: JSON.stringify(e.response.data), variant: 'error', buttons: [{ text: 'OK' }] });
      } else {
        showAlert({ title: 'Launch Failed', message: e.message || 'Failed to launch store. Try again.', variant: 'error', buttons: [{ text: 'OK' }] });
      }
    }
  };

  const inputStyle = {
    color: colors.text as string,
    fontSize: 16, fontWeight: '600' as const,
    paddingVertical: 16, paddingHorizontal: 20,
  };

  const lat = location.latitude;
  const lng = location.longitude;
  const userLat = userLocation?.coords.latitude || lat;
  const userLng = userLocation?.coords.longitude || lng;

  const mapHtml = `
    <html><head>
    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      body,html,#map{margin:0;padding:0;height:100vh;width:100vw;}
      .leaflet-control-attribution,.leaflet-control-zoom{display:none!important;}
      @keyframes pinPop{0%{transform:scale(0.3) translateY(20px);opacity:0;}80%{transform:scale(1.08) translateY(-2px);}100%{transform:scale(1) translateY(0);opacity:1;}}
      @keyframes ripple{0%{transform:scale(1);opacity:0.6;}100%{transform:scale(2.2);opacity:0;}}
      .store-pin{animation:pinPop 0.35s cubic-bezier(.175,.885,.32,1.275) forwards;}
      .pin-ripple{animation:ripple 1.8s ease-out infinite;}
    </style></head><body><div id="map"></div><script>
      window.map=L.map("map",{zoomControl:false,attributionControl:false}).setView([${lat},${lng}],15);
      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",{maxZoom:20}).addTo(window.map);
      
      // User dot (identical to explore screen)
      var ud='<div style="position:relative;width:22px;height:22px"><div class="pin-ripple" style="position:absolute;width:22px;height:22px;background:rgba(99,102,241,0.35);border-radius:50%;top:0;left:0;"></div><div style="position:absolute;width:14px;height:14px;background:#6366f1;border:2.5px solid #fff;border-radius:50%;top:4px;left:4px;box-shadow:0 2px 8px rgba(99,102,241,0.5);"></div></div>';
      window.userMarker = L.marker([${userLat},${userLng}],{icon:L.divIcon({html:ud,className:"",iconSize:[22,22],iconAnchor:[11,11]})}).addTo(window.map);

      // Store launch pin
      var col="${accentColor}";
      var svg='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
      var h='<div class="store-pin" style="position:relative;width:46px;height:54px;cursor:pointer;">'
        +'<div style="width:46px;height:46px;border-radius:50%;background:#fff;border:2.5px solid '+col+';display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.15);position:relative;z-index:1;">'
        +'<div style="width:32px;height:32px;border-radius:50%;background:'+col+';display:flex;align-items:center;justify-content:center;">'+svg+'</div>'
        +'</div>'
        +'<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:10px;height:10px;background:'+col+';clip-path:polygon(50% 100%,0% 0%,100% 0%);"></div>'
        +'</div>';
      
      var ic=L.divIcon({className:"",html:h,iconSize:[46,54],iconAnchor:[23,54]});
      window.storeMarker = L.marker([${lat},${lng}], {
        icon: ic,
        draggable: true
      }).addTo(window.map);

      function updateRN(latlng) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          latitude: latlng.lat,
          longitude: latlng.lng
        }));
      }

      window.storeMarker.on('dragend', function(e) { updateRN(e.target.getLatLng()); });
      window.map.on('click', function(e) { window.storeMarker.setLatLng(e.latlng); updateRN(e.latlng); });
    </script></body></html>
  `;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      {/* Ambient glow */}
      <View style={{ position: 'absolute', top: -width * 0.4, right: -width * 0.3, width: width * 1.2, height: width * 1.2, borderRadius: width * 0.6, backgroundColor: accentColor, opacity: isDark ? 0.07 : 0.04 }} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ─────────────────────────────────────── */}
        <View style={{ paddingTop: 64, paddingHorizontal: 28, paddingBottom: 12, marginBottom: 8 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 32 }}>
            <Text style={{ color: accentColor, fontSize: 15, fontWeight: '700' }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: -1, marginBottom: 8 }}>
            Launch Your{'\n'}
            <Text style={{ color: accentColor }}>Digital Store.</Text>
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: '500', lineHeight: 22 }}>
            Set up your store in minutes.{'\n'}Your customers are waiting.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>

          {/* ── Category Toggle ────────────────────────────── */}
          <View style={{
            flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surfaceAlt,
            borderRadius: 20, padding: 5, marginBottom: 24,
            borderWidth: 1, borderColor: borderColor,
          }}>
            {(['RETAIL', 'FOOD'] as const).map(cat => {
              const isActive = category === cat;
              const catAccent = cat === 'RETAIL' ? '#6366f1' : '#f97316';
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => { setCategory(cat); setBusinessType(''); }}
                  activeOpacity={0.8}
                  style={{
                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    gap: 8, paddingVertical: 13, borderRadius: 16,
                    backgroundColor: isActive ? (isDark ? 'rgba(255,255,255,0.07)' : colors.surface) : 'transparent',
                  }}
                >
                  {cat === 'RETAIL'
                    ? <Store size={18} color={isActive ? catAccent : colors.textMuted} strokeWidth={2} />
                    : <Coffee size={18} color={isActive ? catAccent : colors.textMuted} strokeWidth={2} />
                  }
                  <Text style={{
                    fontWeight: '800', fontSize: 14,
                    color: isActive ? catAccent : colors.textMuted,
                  }}>
                    {cat === 'RETAIL' ? 'Retail' : 'Food & Hospitality'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Store Name ─────────────────────────────────── */}
          <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 2, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 }}>
            Store Name
          </Text>
          <View style={{
            backgroundColor: cardBg, borderWidth: 1.5, borderColor,
            borderRadius: 20, marginBottom: 20,
          }}>
            <TextInput
              value={storeName}
              onChangeText={setStoreName}
              placeholder="e.g. Habesha Coffee Roasters"
              placeholderTextColor={colors.textMuted}
              style={inputStyle}
            />
          </View>

          {/* ── Business Type ──────────────────────────────── */}
          <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 2, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 }}>
            Business Type
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {businessTypes.map(type => {
              const isActive = businessType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setBusinessType(type)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
                    backgroundColor: isActive ? accentBg : cardBg,
                    borderWidth: 1.5,
                    borderColor: isActive ? accentBorder : borderColor,
                  }}
                >
                  <Text style={{
                    fontWeight: '700', fontSize: 13,
                    color: isActive ? accentColor : colors.textMuted,
                  }}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Description ───────────────────────────────── */}
          <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 2, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 }}>
            Description (Optional)
          </Text>
          <View style={{
            backgroundColor: cardBg, borderWidth: 1.5, borderColor,
            borderRadius: 20, marginBottom: 24,
            paddingHorizontal: 20, paddingVertical: 8,
          }}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tell customers what makes your store unique..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={{
                color: colors.text, fontSize: 15, fontWeight: '500',
                paddingVertical: 12, minHeight: 90, textAlignVertical: 'top',
              }}
            />
          </View>

          {/* ── Map Location Picker ────────────────────────── */}
          <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 2, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 }}>
            Store Location
          </Text>

          <View style={{ position: 'relative' }}>
            <View style={{
              borderRadius: 24, overflow: 'hidden', marginBottom: 10,
              borderWidth: 1.5, borderColor,
              shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.4 : 0.1, shadowRadius: 20, elevation: 6,
            }}>
              <WebView
                ref={webviewRef}
                style={{ width: '100%', height: 230 }}
              source={{ html: mapHtml }}
              scrollEnabled={false}
              bounces={false}
              onMessage={(e) => {
                try {
                  const data = JSON.parse(e.nativeEvent.data);
                  if (data.latitude && data.longitude) {
                    setLocation({ latitude: data.latitude, longitude: data.longitude });
                  }
                } catch (err) {}
              }}
            />
          </View>
          {/* Locate Me Floating Button inside relative container */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={async () => {
              try {
                const currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setUserLocation(currentLoc);
                setLocation({ latitude: currentLoc.coords.latitude, longitude: currentLoc.coords.longitude });
                if (webviewRef.current) {
                  webviewRef.current.injectJavaScript(`
                    if (window.map) window.map.flyTo([${currentLoc.coords.latitude}, ${currentLoc.coords.longitude}], 15, { animate: true, duration: 1.5 });
                    if (window.userMarker) window.userMarker.setLatLng([${currentLoc.coords.latitude}, ${currentLoc.coords.longitude}]);
                    if (window.storeMarker) window.storeMarker.setLatLng([${currentLoc.coords.latitude}, ${currentLoc.coords.longitude}]);
                    true;
                  `);
                }
              } catch (e) { /* ignore */ }
            }}
            style={{
              position: 'absolute', bottom: 20, right: 12,
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
            }}
          >
            <Navigation color={accentColor} size={20} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '500', textAlign: 'center', marginBottom: 32 }}>
            Drag the pin to mark your exact store entrance
          </Text>

          {/* ── Launch Button ──────────────────────────────── */}
          <TouchableOpacity
            onPress={handleLaunch}
            disabled={loading || success || !storeName.trim() || !businessType}
            activeOpacity={0.85}
            style={{
              backgroundColor: success 
                ? '#10b981' // Green for success
                : (loading || !storeName.trim() || !businessType
                  ? (isDark ? 'rgba(255,255,255,0.08)' : colors.surfaceAlt)
                  : accentColor),
              borderRadius: 999, paddingVertical: 20,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
              shadowColor: success ? '#10b981' : accentColor,
              shadowOffset: { width: 0, height: 14 },
              shadowOpacity: (storeName.trim() && businessType && !loading) || success ? 0.5 : 0,
              shadowRadius: 28, elevation: 10,
            }}
          >
            {success ? (
              <>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.3 }}>
                  Store Launched!
                </Text>
                <CheckCircle color="#fff" size={22} strokeWidth={2.5} />
              </>
            ) : loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.3 }}>
                  Launch My Digital Mall
                </Text>
                <ArrowRight color="#fff" size={22} strokeWidth={2.5} />
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
    </KeyboardAvoidingView>
  );
}
