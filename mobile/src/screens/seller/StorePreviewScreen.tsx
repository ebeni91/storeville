/**
 * StorePreviewScreen — Live Preview for Sellers
 * Renders the real StoreGatewayScreen with pending studio changes merged in.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StatusBar, Platform, StyleSheet,
} from 'react-native';
import { ArrowLeft, Eye } from 'lucide-react-native';
import { StoreGatewayScreen } from '../buyer/StoreGatewayScreen';

interface Props {
  route: any;
  navigation: any;
}

export function StorePreviewScreen({ route, navigation }: Props) {
  const { store, pendingChanges } = route.params;

  // Merge unsaved studio changes over the real store data so the preview
  // reflects exactly what the final store will look like when saved.
  const previewStore = { ...store, ...pendingChanges };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      {/* Preview Banner */}
      <View style={styles.banner}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <ArrowLeft color="#fff" size={18} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.bannerCenter}>
          <Eye color="#fff" size={14} strokeWidth={2} />
          <Text style={styles.bannerText}>Live Preview</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Render real gateway screen with preview data */}
      <View style={{ flex: 1 }}>
        <StoreGatewayScreen
          route={{ params: { store: previewStore } }}
          navigation={{
            goBack: () => navigation.goBack(),
            navigate: () => {},   // no-op — preview mode
          }}
          previewMode
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#111827',
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 99,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerCenter: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
  },
  bannerText: {
    color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5,
  },
});
