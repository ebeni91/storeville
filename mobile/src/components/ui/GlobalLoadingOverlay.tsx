import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';

/**
 * Minimalist loading overlay shown during session restoration / auth transitions.
 */
export function GlobalLoadingOverlay() {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.overlay, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
