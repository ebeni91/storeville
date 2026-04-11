import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Store } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

/**
 * Premium loading overlay shown during session restoration / auth transitions.
 */
export function GlobalLoadingOverlay() {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle continuous rotation for an outer ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.overlay, { backgroundColor: colors.bg }]}>
      <View style={styles.contentContainer}>
        {/* Animated Brand Identity */}
        <View style={styles.iconContainer}>
          <Animated.View style={[styles.ring, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', transform: [{ rotate: spin }] }]} />
          <Animated.View style={[styles.ring2, { borderColor: colors.accent, transform: [{ rotate: spin }] }]} />
          <Animated.View style={{ transform: [{ scale: pulseAnim }], backgroundColor: colors.accent, borderRadius: 32, padding: 20 }}>
            <Store size={40} color="#ffffff" strokeWidth={2.5} />
          </Animated.View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          StoreVille
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Authenticating...
        </Text>
      </View>
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
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  ring2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderStyle: 'dotted',
    opacity: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
