import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Search, SlidersHorizontal, MapPin, Coffee, ShoppingBag, Utensils } from 'lucide-react-native';

export function ExploreScreen({ navigation }: { navigation: any }) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const selectedGateway = useAuthStore(state => state.selectedGateway);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError('Permission to access location was denied');
        return;
      }
      
      try {
        const locationPromise = (async () => {
          let loc = await Location.getLastKnownPositionAsync({});
          if (!loc) {
            loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          }
          return loc;
        })();
        
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 2000)
        );

        const loc = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;
        setLocation(loc);
      } catch (err: any) {
        setLocation({
          coords: {
            latitude: 9.03,
            longitude: 38.74,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now()
        } as Location.LocationObject);
      }
    })();
  }, []);

  // Filter stores by the selected gateway type
  const storeTypeFilter = selectedGateway || 'RETAIL';

  const { data: stores } = useQuery({
    queryKey: ['stores', storeTypeFilter],
    queryFn: async () => {
      const response = await api.get('/stores/discovery/', { params: { type: storeTypeFilter } });
      return response.data.results || response.data;
    }
  });

  if (permissionError) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-50 p-6">
        <Text className="text-xl font-bold text-red-500 text-center">{permissionError}</Text>
        <Text className="text-gray-600 text-center mt-2">Please enable GPS in your device settings.</Text>
      </View>
    );
  }

  // Build the HTML string using concatenation to avoid nested template literal issues
  const lat = location?.coords.latitude || 9.03;
  const lng = location?.coords.longitude || 38.74;
  const storesJson = JSON.stringify(stores || []);

  const leafletHTML = [
    '<!DOCTYPE html><html><head>',
    '<title>StoreVille Map</title>',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />',
    '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />',
    '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>',
    '<style>',
    'body { padding: 0; margin: 0; }',
    'html, body, #map { height: 100vh; width: 100vw; }',
    '.leaflet-popup-content-wrapper { border-radius: 12px; font-family: sans-serif; }',
    '.leaflet-popup-content b { color: #4f46e5; font-size: 15px; }',
    '@keyframes pulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }',
    '</style></head><body><div id="map"></div><script>',
    'var map = L.map("map", { zoomControl: false, attributionControl: false }).setView([' + lat + ', ' + lng + '], 15);',
    'L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", { maxZoom: 20 }).addTo(map);',
    // User location dot
    'var userDot = \'<div style="position:relative;"><div style="position:absolute;left:-8px;top:-8px;width:36px;height:36px;background:rgba(59,130,246,0.3);border-radius:50%;animation:pulse 2s infinite;"></div><div style="position:absolute;width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 4px 6px rgba(0,0,0,0.3);"></div></div>\';',
    'L.marker([' + lat + ', ' + lng + '], { icon: L.divIcon({ html: userDot, className: "", iconSize: [20,20], iconAnchor: [10,10] }) }).addTo(map);',
    // Store markers
    'var stores = ' + storesJson + ';',
    'stores.forEach(function(store) {',
    '  if (store.latitude && store.longitude) {',
    '    var pinHtml = \'<div style="background:#4f46e5;width:32px;height:32px;border-radius:16px;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-weight:bold;font-size:14px;">S</span></div>\';',
    '    var icon = L.divIcon({ className: "x", html: pinHtml, iconSize: [32,32], iconAnchor: [16,16] });',
    '    L.marker([parseFloat(store.latitude), parseFloat(store.longitude)], { icon: icon })',
    '      .addTo(map)',
    '      .bindPopup("<div style=\'padding:4px;text-align:center;\'><b>" + store.name + "</b><br><span style=\'color:#6b7280;font-size:12px;\'>" + store.category + "</span><br><button onclick=\'window.ReactNativeWebView.postMessage(JSON.stringify({type:\\"STORE_CLICK\\", storeId:\\"" + store.id + "\\"}))\' style=\'margin-top:8px;background:#4f46e5;color:white;border:none;padding:6px 12px;border-radius:6px;font-weight:bold;cursor:pointer;width:100%;\'>Visit Store</button></div>");',
    '  }',
    '});',
    '</script></body></html>'
  ].join('\n');

  const isFood = selectedGateway === 'FOOD';

  return (
    <View className="flex-1 bg-white">
      {location ? (
        <View className="flex-1 relative">
          <WebView
            source={{ html: leafletHTML }}
            style={{ flex: 1, width: '100%' }}
            scrollEnabled={false}
            bounces={false}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'STORE_CLICK' && stores) {
                  const selectedStore = stores.find((s: any) => s.id === data.storeId);
                  if (selectedStore) {
                    navigation.navigate('StoreGateway', { store: selectedStore });
                  }
                }
              } catch (err) {
                console.error("WebView message error:", err);
              }
            }}
          />
          
          {/* Top Premium Search Overlay */}
          <View className="absolute top-12 w-full px-6 z-10">
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-4 shadow-lg shadow-black/10 border border-gray-100">
              <Search color="#9ca3af" size={20} />
              <TextInput 
                placeholder={isFood ? "Search Cafes, Restaurants..." : "Search Stores, Products..."}
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-3 text-base text-gray-900 font-medium"
              />
              <TouchableOpacity className="bg-primary-50 p-2 rounded-xl">
                <SlidersHorizontal color="#4f46e5" size={18} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Floating Filter Chips */}
          <View className="absolute bottom-6 w-full z-10">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
              <TouchableOpacity className="flex-row items-center bg-primary-600 px-5 py-3.5 rounded-full mr-3 shadow-lg shadow-primary-600/30">
                <MapPin color="#ffffff" size={16} />
                <Text className="text-white font-bold ml-2">Nearby</Text>
              </TouchableOpacity>
              
              {isFood ? (
                <>
                  <TouchableOpacity className="flex-row items-center bg-white px-5 py-3.5 rounded-full mr-3 shadow-md shadow-black/5 border border-gray-100">
                    <Coffee color="#374151" size={16} />
                    <Text className="text-gray-700 font-bold ml-2">Cafes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center bg-white px-5 py-3.5 rounded-full mr-3 shadow-md shadow-black/5 border border-gray-100">
                    <Utensils color="#374151" size={16} />
                    <Text className="text-gray-700 font-bold ml-2">Restaurants</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity className="flex-row items-center bg-white px-5 py-3.5 rounded-full mr-3 shadow-md shadow-black/5 border border-gray-100">
                    <ShoppingBag color="#374151" size={16} />
                    <Text className="text-gray-700 font-bold ml-2">Fashion</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center bg-white px-5 py-3.5 rounded-full mr-3 shadow-md shadow-black/5 border border-gray-100">
                    <ShoppingBag color="#374151" size={16} />
                    <Text className="text-gray-700 font-bold ml-2">Electronics</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>

        </View>
      ) : (
        <View className="flex-1 items-center justify-center bg-primary-50">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="mt-4 text-primary-900 font-medium">Getting your location...</Text>
        </View>
      )}
    </View>
  );
}
