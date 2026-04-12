import React, { useEffect, useRef } from 'react';
import {
  View, Text, Animated, Dimensions, StyleSheet, StatusBar, Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';

const { width, height } = Dimensions.get('window');

const ACCENT = '#34d399'; // emerald-mint — matches AuthScreen

interface Props { onFinish: () => void; }

export function SplashScreen({ onFinish }: Props) {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';

  // ── Animation values ─────────────────────────────────────────
  const contentOpacity  = useRef(new Animated.Value(0)).current;
  const contentY        = useRef(new Animated.Value(22)).current;
  const shimmerX        = useRef(new Animated.Value(-width * 1.2)).current;
  const exitOpacity     = useRef(new Animated.Value(1)).current;
  const exitScale       = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([

      // 1. Content rises + fades in — clean, elegant entrance
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 680,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentY, {
          toValue: 0,
          duration: 680,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 2. Hold — let the user read the brand
      Animated.delay(600),

      // 3. Shimmer sweep — a bright light glides through the wordmark
      Animated.timing(shimmerX, {
        toValue: width * 1.4,
        duration: 820,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),

      // 4. Brief pause after shimmer settles
      Animated.delay(160),

      // 5. Graceful exit — fade + very gentle scale-up (feels like zooming into auth)
      Animated.parallel([
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 520,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(exitScale, {
          toValue: 1.06,
          duration: 520,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

    ]).start(() => onFinish());
  }, []);

  const bg = isDark ? '#0d0e14' : '#f7f7fb';

  return (
    <Animated.View
      style={[
        styles.root,
        {
          backgroundColor: bg,
          opacity: exitOpacity,
          transform: [{ scale: exitScale }],
        },
      ]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* ── Subtle vignette / depth gradient ─────────────────── */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(99,102,241,0.06)', 'transparent', 'rgba(52,211,153,0.04)']
            : ['rgba(99,102,241,0.04)', 'transparent', 'rgba(52,211,153,0.03)']
        }
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* ── Centre brand block ───────────────────────────────── */}
      <Animated.View
        style={[
          styles.center,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentY }],
          },
        ]}
      >
        {/* Hairline accent above wordmark */}
        {/* <View style={styles.hairlineWrap}>
          <View style={[styles.hairline, { backgroundColor: ACCENT }]} />
        </View> */}

        {/* Wordmark — shimmer overlay clips to this area */}
        <View style={styles.wordmarkWrap}>
          {/* The text itself */}
          <View style={styles.wordmarkRow}>
            <Text
              style={[
                styles.wordStore,
                { color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(15,15,35,0.35)' },
              ]}
            >
              Store
            </Text>
            <Text
              style={[
                styles.wordVille,
                { color: isDark ? '#ffffff' : '#0f0f23' },
              ]}
            >
              Ville
            </Text>
            <Text style={[styles.trademark, { color: ACCENT }]}>™</Text>
          </View>

          {/* ── Shimmer sweep overlay — clipped to wordmark bounds ── */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { transform: [{ translateX: shimmerX }], overflow: 'hidden' },
            ]}
          >
            <LinearGradient
              colors={[
                'transparent',
                isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.7)',
                isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.9)',
                isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.7)',
                'transparent',
              ]}
              locations={[0, 0.3, 0.5, 0.7, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.shimmerGradient]}
            />
          </Animated.View>
        </View>

        {/* Tagline */}
        <Text
          style={[
            styles.tagline,
            { color: isDark ? 'rgba(255,255,255,0.26)' : 'rgba(15,15,35,0.3)' },
          ]}
        >
          The Digital Mall of Ethiopia
        </Text>

        {/* Mint accent dot */}
        {/* <View style={[styles.mintDot, { backgroundColor: ACCENT }]} /> */}
      </Animated.View>

      {/* ── Bottom trademark ─────────────────────────────────── */}
      <Animated.Text
        style={[
          styles.footer,
          {
            opacity: contentOpacity,
            color: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(15,15,35,0.18)',
          },
        ]}
      >
        © 2026 StoreVille Technology
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 999,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  hairlineWrap: {
    marginBottom: 26,
    alignItems: 'center',
  },
  hairline: {
    width: 36,
    height: 2.5,
    borderRadius: 99,
  },
  wordmarkWrap: {
    // Clip shimmer to this box
    overflow: 'hidden',
    marginBottom: 18,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  wordStore: {
    fontSize: 64,
    fontWeight: '200',
    letterSpacing: -2.5,
    lineHeight: 68,
    includeFontPadding: false,
  },
  wordVille: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2.5,
    lineHeight: 68,
    includeFontPadding: false,
  },
  trademark: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    marginLeft: 3,
  },
  shimmerGradient: {
    width: width * 0.55,
    height: '100%',
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 4.5,
    textTransform: 'uppercase',
    marginBottom: 28,
    textAlign: 'center',
  },
  mintDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
  },
  footer: {
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    paddingBottom: 46,
  },
});
