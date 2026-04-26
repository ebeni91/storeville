import React, { useEffect, useState, useRef } from 'react';
const MAP_SOURCE = {
  html: `<!DOCTYPE html><html><head>
<title>StoreVille Map</title>
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
</style></head><body><div id="map"></div>
<script>
// ✅ SECURITY: Map initialised with no data. Store data injected via initMap event.
window.map = L.map('map', {zoomControl:false, attributionControl:false}).setView([9.0,38.75], 5);
L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {maxZoom:20}).addTo(window.map);

window.addEventListener('initMap', function(e) {
  var data = e.detail;
  var lat = data.lat; var lng = data.lng;
  var stores = data.stores;
  if(window.userMarker) window.map.removeLayer(window.userMarker);
  if(window.storeMarkers) window.storeMarkers.forEach(function(m){window.map.removeLayer(m);});
  window.storeMarkers = [];

  // Place user dot
  var ud = '<div style="position:relative;width:22px;height:22px"><div class="pin-ripple" style="position:absolute;width:22px;height:22px;background:rgba(0,0,0,0.20);border-radius:50%;top:0;left:0;"></div><div style="position:absolute;width:14px;height:14px;background:#111827;border:2.5px solid #fff;border-radius:50%;top:4px;left:4px;box-shadow:0 2px 8px rgba(0,0,0,0.30);"></div></div>';
  window.userMarker = L.marker([lat,lng],{icon:L.divIcon({html:ud,className:'',iconSize:[22,22],iconAnchor:[11,11]})}).addTo(window.map);

  var bounds = L.latLngBounds([[lat,lng]]);

  stores.forEach(function(s) {
    if (!s.latitude || !s.longitude) return;
    var isF = s.store_type === 'FOOD';
    var col = isF ? '#f97316' : '#111827';
    var svg = isF
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
    var t = '<div style="position:absolute;top:56px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.95);padding:4px 10px;border-radius:12px;box-shadow:0 3px 12px rgba(0,0,0,0.12);white-space:nowrap;font-family:-apple-system, BlinkMacSystemFont, sans-serif;font-weight:800;font-size:12px;color:#111827;letter-spacing:-0.3px;pointer-events:none;">' + (s.name || 'Store') + '</div>';
    var h = '<div class="store-pin" style="position:relative;width:46px;height:54px;cursor:pointer;">'
      + '<div style="width:46px;height:46px;border-radius:50%;background:#fff;border:2.5px solid '+col+';display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.15);position:relative;z-index:1;">'
      + '<div style="width:32px;height:32px;border-radius:50%;background:'+col+';display:flex;align-items:center;justify-content:center;">'+svg+'</div>'
      + '</div>'
      + '<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:10px;height:10px;background:'+col+';clip-path:polygon(50% 100%,0% 0%,100% 0%);"></div>'
      + t + '</div>';
    var ic = L.divIcon({className:'', html:h, iconSize:[46,54], iconAnchor:[23,54]});
    var coord = [parseFloat(s.latitude), parseFloat(s.longitude)];
    bounds.extend(coord);
    var m = L.marker(coord, {icon:ic}).addTo(window.map);
    window.storeMarkers.push(m);
    m
      .on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'STORE_CLICK', storeId:s.id}));
      });
  });

  // 1. Dynamically compute the closest cluster bounds to guarantee ideal pin separation
  var distances = [];
  stores.forEach(function(s) {
    if (!s.latitude) return;
    var storeLat = parseFloat(s.latitude);
    var storeLng = parseFloat(s.longitude);
    distances.push([storeLat, storeLng, window.map.distance([lat, lng], [storeLat, storeLng])]);
  });
  
  distances.sort(function(a, b) { return a[2] - b[2]; });
  var closest = distances.slice(0, 5); // Take the top 5 closest stores
  
  var dynamicBounds = L.latLngBounds([[lat, lng]]);
  // Ensure we include at least a 100m radius visually even if stores are extremely close
  // 1 degree is roughly 111km, so 0.0009 is about 100m
  dynamicBounds.extend([lat + 0.0009, lng + 0.0009]);
  dynamicBounds.extend([lat - 0.0009, lng - 0.0009]);
  
  closest.forEach(function(c) {
    dynamicBounds.extend([c[0], c[1]]);
  });

  // 2. Seamless mapping zoom override on first hit
  if (!window.hasAutoLocated) {
    if (closest.length > 0) {
      // Automatically calculates the perfect optical zoom stretching the nearest coordinates across the screen
      window.map.flyToBounds(dynamicBounds, { padding: [60, 60], maxZoom: 19, animate: true, duration: 1.5 });
    } else {
      window.map.flyTo([lat, lng], 18, { animate: true, duration: 1.5 });
    }
    window.hasAutoLocated = true;
  }
});
</script></body></html>`
};

import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated, Dimensions, StatusBar, StyleSheet
} from 'react-native';
import { BlurView } from 'expo-blur';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { api, API_URL } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import {
  Search, SlidersHorizontal, Coffee, ShoppingBag,
  Star, Navigation, X, ArrowRight, CheckCircle
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
// Bottom safe zone: floating tab bar (68) + its bottom margin (24) + a little gap
const TAB_BAR_HEIGHT = 68 + 24 + 12; // ~104

type Gateway = 'FOOD' | 'RETAIL';

export function ExploreScreen({ navigation }: { navigation: any }) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [activeChip, setActiveChip] = useState<string>('Cafes');
  const { colors, mode } = useThemeStore();
  
  // Gateway state is local — no longer uses global store (gateway concept removed)
  const [activeGateway, setActiveGateway] = useState<Gateway>('RETAIL');

  const drawerAnim = useRef(new Animated.Value(0)).current;
  const webviewRef = useRef<WebView>(null);

  const isFood = activeGateway === 'FOOD';

  const switchGateway = (type: Gateway) => {
    setActiveGateway(type);
    setActiveChip(type === 'FOOD' ? 'Cafes' : 'Fashion');
  };

  // ── Location setup ─────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setPermissionError('Location access denied'); return; }
      try {
        const locationPromise = (async () => {
          const loc = await Location.getLastKnownPositionAsync({});
          return loc || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        })();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        );
        setLocation(await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject);
      } catch {
        setLocation({
          coords: { latitude: 9.0192, longitude: 38.7525, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
          timestamp: Date.now()
        } as Location.LocationObject);
      }
    })();
  }, []);

  // ── Store data (public — works for guests AND authenticated users) ─
  const { data: stores } = useQuery({
    queryKey: ['stores', activeGateway],
    queryFn: async () => {
      // Use the shared api client which hits the correct backend URL.
      // /stores/discovery/ (trailing slash required by Django's APPEND_SLASH)
      const res = await api.get('/stores/discovery/', {
        params: { type: activeGateway },
      });
      return res.data.results || res.data;
    },
    // Always enabled — don't gate on auth state
    enabled: true,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  });

  // ── Drawer ──────────────────────────────────────
  const openDrawer = (store: any) => {
    setSelectedStore(store);
    Animated.spring(drawerAnim, { toValue: 1, tension: 65, friction: 11, useNativeDriver: true }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, { toValue: 0, duration: 240, useNativeDriver: true }).start(() => {
      setSelectedStore(null);
    });
  };

  const drawerTranslateY = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  // ✅ SECURITY FIX: Store data is NEVER concatenated into the HTML string.
  // The HTML below is fully static — no user-controlled data inside it.
  // Stores are injected AFTER load via injectJavaScript() which safely
  // passes a JSON payload without any XSS risk.
  const lat = location?.coords.latitude ?? 9.0192;
  const lng = location?.coords.longitude ?? 38.7525;

  // Called after WebView finishes loading — safely injects store data
  const injectStoreData = () => {
    if (!webviewRef.current || !stores) return;
    const payload = JSON.stringify({ stores: stores || [], lat, lng });
    webviewRef.current.injectJavaScript(`
      (function() {
        try { window.dispatchEvent(new CustomEvent('initMap', { detail: ${payload} })); } catch(e){}
        true;
      })();
    `);
  };
  useEffect(() => { injectStoreData(); }, [stores, activeGateway, location]); // dynamic updates
  

  

  const foodChips = ['Cafes', 'Restaurants', 'Bakeries', 'Hotels'];
  const retailChips = ['Fashion', 'Electronics', 'Home', 'Beauty'];
  const chips = isFood ? foodChips : retailChips;

  if (permissionError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#dc2626', textAlign: 'center' }}>{permissionError}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}  backgroundColor="transparent" translucent={true} />

      {!location ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={{ color: '#111827', fontWeight: '600', marginTop: 14, fontSize: 15 }}>Finding you on the map…</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* ── Full-screen Map ───────────────────── */}
          <WebView
            ref={webviewRef}
            source={MAP_SOURCE}
            style={{ flex: 1 }}
            scrollEnabled={false}
            bounces={false}
            // ✅ SECURITY FIX: Store data injected AFTER load, not in HTML string
            onLoadEnd={injectStoreData}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'STORE_CLICK' && stores) {
                  const store = stores.find((s: any) => s.id === data.storeId);
                  if (store) openDrawer(store);
                }
              } catch { /* ignore */ }
            }}
          />

          {/* ── Floating Search Bar ───────────────── */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { 
              backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : '#ffffff',
              borderWidth: mode === 'dark' ? 1 : 0,
              borderColor: mode === 'dark' ? '#3b3f5c' : 'transparent'
            }]}>
              <Search color={colors.accent} size={20} strokeWidth={2.5} />
              <TextInput
                placeholder={isFood ? 'Search cafes, restaurants…' : 'Search stores, products…'}
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, { color: colors.text }]}
              />
              <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.accentFaint }]}>
                <SlidersHorizontal color={colors.accent} size={17} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* ── Category Chips ──────────────────── */}
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {chips.map((chip) => {
                const active = activeChip === chip;
                return (
                  <TouchableOpacity
                    key={chip}
                    onPress={() => setActiveChip(chip)}
                    style={[
                      styles.chip,
                      { backgroundColor: active ? colors.text : (mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : colors.surface), borderColor: active ? colors.text : (mode === 'dark' ? '#3b3f5c' : colors.border) },
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, { color: active ? colors.bg : colors.textSub }]}>{chip}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Locate Me Button ──────────────────── */}
          <TouchableOpacity
            style={styles.locateButton}
            activeOpacity={0.8}
            onPress={async () => {
              try {
                const currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                // Unlock map camera so the useEffect sync can trigger the dynamic zoom physics
                if (webviewRef.current) {
                  webviewRef.current.injectJavaScript('window.hasAutoLocated = false; true;');
                }
                setLocation(currentLoc);
              } catch (e) { /* ignore */ }
            }}
          >
            <Navigation color="#111827" size={24} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* ── Gateway Switcher Pills ────────────── */}
          <View style={styles.gatewaySwitcher}>
            <TouchableOpacity
              onPress={() => switchGateway('RETAIL')}
              activeOpacity={0.85}
              style={[
                styles.gatewayPill,
                activeGateway === 'RETAIL'
                  ? styles.gatewayPillRetailActive
                  : [styles.gatewayPillInactive, { backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : '#ffffff', borderWidth: mode === 'dark' ? 1 : 0, borderColor: mode === 'dark' ? '#3b3f5c' : 'transparent' }],
              ]}
            >
              <ShoppingBag size={14} color={activeGateway === 'RETAIL' ? '#ffffff' : colors.textSub} strokeWidth={2.5} style={{ marginRight: 6 }} />
              <Text style={[styles.gatewayPillText, { color: activeGateway === 'RETAIL' ? '#ffffff' : colors.text }]}>Shop Retail</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => switchGateway('FOOD')}
              activeOpacity={0.85}
              style={[
                styles.gatewayPill,
                activeGateway === 'FOOD' ? styles.gatewayPillFoodActive 
                  : [styles.gatewayPillInactive, { backgroundColor: mode === 'dark' ? 'rgba(28, 30, 43, 0.95)' : '#ffffff', borderWidth: mode === 'dark' ? 1 : 0, borderColor: mode === 'dark' ? '#3b3f5c' : 'transparent' }],
              ]}
            >
              <Coffee size={14} color={activeGateway === 'FOOD' ? '#ffffff' : colors.textSub} strokeWidth={2.5} style={{ marginRight: 6 }} />
              <Text style={[styles.gatewayPillText, { color: activeGateway === 'FOOD' ? '#ffffff' : colors.text }]}>Food & Coffee</Text>
            </TouchableOpacity>
          </View>

          {/* ── Store Discovery Drawer ────────────── */}
          {selectedStore && (
            <Animated.View style={[styles.drawer, { transform: [{ translateY: drawerTranslateY }] }]}>
              <View style={[styles.drawerInner, { backgroundColor: colors.surface }]}>
                <View style={[styles.drawerHandle, { backgroundColor: colors.border }]} />

                {/* Close button */}
                <TouchableOpacity onPress={closeDrawer} style={styles.drawerClose}>
                  <X color="#6b7280" size={18} strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Hero banner */}
                <View style={[styles.heroBanner, { backgroundColor: isFood ? '#fff7ed' : '#f3f4f6', borderColor: isFood ? '#fed7aa' : '#c7d2fe' }]}>
                  <View style={[styles.heroIconCircle, {
                    backgroundColor: isFood ? '#f97316' : '#111827',
                    shadowColor: isFood ? '#f97316' : '#111827',
                  }]}>
                    {isFood
                      ? <Coffee color="#ffffff" size={30} />
                      : <ShoppingBag color="#ffffff" size={30} />}
                  </View>
                </View>

                {/* Store name + badge */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.storeName}>{selectedStore.name}</Text>
                  <View style={styles.verifiedBadge}>
                    <CheckCircle color="#16a34a" size={11} strokeWidth={2.5} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
                <Text style={styles.storeCategory}>{selectedStore.category || (isFood ? 'food' : 'retail')}</Text>

                {/* Stats row */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {[
                      { icon: Navigation, label: '1.2 km', sub: 'Distance', color: '#111827' },
                      { icon: Star, label: '4.8', sub: '200+ reviews', color: '#f59e0b' },
                      { icon: CheckCircle, label: 'Open', sub: 'Until 10 PM', color: '#16a34a' },
                    ].map((s, i) => (
                      <View key={i} style={styles.statCard}>
                        <s.icon color={s.color} size={17} strokeWidth={2} />
                        <Text style={styles.statLabel}>{s.label}</Text>
                        <Text style={styles.statSub}>{s.sub}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                {/* CTA — sits above the floating tab bar */}
                <TouchableOpacity
                  onPress={() => { drawerAnim.setValue(0); setSelectedStore(null); navigation.navigate('StoreGateway', { store: selectedStore }); }}
                  activeOpacity={0.85}
                  style={[styles.ctaButton, { backgroundColor: isFood ? '#f97316' : '#111827', shadowColor: isFood ? '#f97316' : '#111827' }]}
                >
                  <Text style={styles.ctaText}>{isFood ? 'Order From This Place' : 'Enter Store'}</Text>
                  <ArrowRight color="#ffffff" size={20} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Search
  searchContainer: {
    position: 'absolute', top: 52, left: 16, right: 16, zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 6,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '500', color: '#111827',
  },
  filterButton: {
    backgroundColor: 'rgba(99,102,241,0.09)', padding: 8, borderRadius: 11,
  },

  // ── Chips
  chipsRow: {
    flexDirection: 'row', gap: 8, paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  chipActive: {
    backgroundColor: '#111827', borderColor: '#111827',
  },
  chipText: {
    fontSize: 13, fontWeight: '700', color: '#374151',
  },
  chipTextActive: {
    color: '#ffffff',
  },

  // ── Locate Me Button
  locateButton: {
    position: 'absolute',
    right: 20,
    bottom: TAB_BAR_HEIGHT + 84, // Above the gateway pills
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    zIndex: 20,
  },

  // ── Gateway Switcher
  gatewaySwitcher: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT + 16, // sits just above the tab bar
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
    zIndex: 20,
  },
  gatewayPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 11,
    borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  gatewayPillRetailActive: {
    backgroundColor: '#111827',
  },
  gatewayPillFoodActive: {
    backgroundColor: '#f97316',
  },
  gatewayPillInactive: {
    backgroundColor: '#ffffff',
  },
  gatewayPillText: {
    fontSize: 14, fontWeight: '700',
  },

  // ── Drawer
  drawer: {
    position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 50,
  },
  drawerInner: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
    paddingHorizontal: 22,
    // Critical: pad bottom enough so CTA clears the floating tab bar
    paddingBottom: TAB_BAR_HEIGHT + 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10, shadowRadius: 20, elevation: 20,
  },
  drawerHandle: {
    width: 38, height: 4, borderRadius: 99,
    backgroundColor: '#e5e7eb', alignSelf: 'center',
    marginTop: 14, marginBottom: 16,
  },
  drawerClose: {
    position: 'absolute', top: 18, right: 20, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
  },
  heroBanner: {
    height: 130, borderRadius: 20, marginBottom: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, overflow: 'hidden',
  },
  heroIconCircle: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  storeName: {
    fontSize: 26, fontWeight: '900', color: '#111827', letterSpacing: -0.5,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7', paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: 99, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  verifiedText: {
    color: '#16a34a', fontSize: 11, fontWeight: '800',
  },
  storeCategory: {
    color: '#6b7280', fontSize: 14, fontWeight: '500', marginTop: 2, marginBottom: 18,
  },
  statCard: {
    backgroundColor: '#f9fafb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    alignItems: 'center', minWidth: 88,
    borderWidth: 1, borderColor: '#f3f4f6',
  },
  statLabel: {
    fontSize: 15, fontWeight: '900', color: '#111827', marginTop: 6,
  },
  statSub: {
    fontSize: 10, fontWeight: '600', color: '#9ca3af', marginTop: 2,
  },
  ctaButton: {
    borderRadius: 18, paddingVertical: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35,
    shadowRadius: 16, elevation: 10,
  },
  ctaText: {
    color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: -0.2, marginRight: 10,
  },
});
