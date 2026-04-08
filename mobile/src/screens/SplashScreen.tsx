import React, { useEffect, useRef } from 'react';
import {
  View, Text, Animated, Dimensions, StyleSheet, StatusBar, Easing
} from 'react-native';
import { useThemeStore } from '../store/themeStore';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: Props) {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';

  // Animation values
  const storeOpacity    = useRef(new Animated.Value(0)).current;
  const villeOpacity    = useRef(new Animated.Value(0)).current;
  const rulerScaleX     = useRef(new Animated.Value(0)).current;
  const taglineOpacity  = useRef(new Animated.Value(0)).current;
  const dotOpacity1     = useRef(new Animated.Value(0)).current;
  const dotOpacity2     = useRef(new Animated.Value(0)).current;
  const dotOpacity3     = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const wordmarkY       = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const seq = Animated.sequence([

      // 1. "Store" word slides + fades in
      Animated.parallel([
        Animated.timing(storeOpacity, {
          toValue: 1, duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkY, {
          toValue: 0, duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 2. Brief pause then "Ville" appears
      Animated.delay(80),
      Animated.timing(villeOpacity, {
        toValue: 1, duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      // 3. Ruler expands left→right
      // Animated.delay(60),
      // Animated.spring(rulerScaleX, {
      //   toValue: 1, tension: 100, friction: 12,
      //   useNativeDriver: true,
      // }),

      // 4. Tagline fades in
      Animated.delay(70),
      Animated.timing(taglineOpacity, {
        toValue: 1, duration: 420,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),

      // 5. Loading dots appear one by one
      // Animated.delay(300),
      // Animated.stagger(160, [
      //   Animated.timing(dotOpacity1, { toValue: 1, duration: 220, useNativeDriver: true }),
      //   Animated.timing(dotOpacity2, { toValue: 1, duration: 220, useNativeDriver: true }),
      //   Animated.timing(dotOpacity3, { toValue: 1, duration: 220, useNativeDriver: true }),
      // ]),

      // 6. Hold at peak
      Animated.delay(600),

      // 7. Fade out everything
      Animated.timing(containerOpacity, {
        toValue: 0, duration: 380,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    seq.start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.root, { backgroundColor: colors.bg, opacity: containerOpacity }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      {/* Ambient glow orbs */}
      <View style={styles.glowWrapper} pointerEvents="none">
        <View style={[styles.glowOrb, {
          width: width * 1.1, height: width * 1.1,
          borderRadius: width * 0.55,
          top: -width * 0.3, left: -width * 0.3,
          backgroundColor: '#6366f1',
          opacity: isDark ? 0.08 : 0.055,
        }]} />
        <View style={[styles.glowOrb, {
          width: width * 0.75, height: width * 0.75,
          borderRadius: width * 0.375,
          bottom: height * 0.12, right: -width * 0.2,
          backgroundColor: '#f59e0b',
          opacity: isDark ? 0.065 : 0.045,
        }]} />
      </View>

      {/* ── Wordmark ──────────────────────────────────────── */}
      <View style={styles.center}>

        {/* Thin rule above — expands horizontally */}
        <View style={styles.rulerContainer}>
          <Animated.View style={[
            styles.ruler,
            { backgroundColor: '#6366f1', transform: [{ scaleX: rulerScaleX }] }
          ]} />
        </View>

        {/* "StoreVille" using the same mixed-weight typography */}
        <Animated.Text style={[
          styles.wordmark,
          { transform: [{ translateY: wordmarkY }] },
        ]}>
          <Animated.Text style={[
            styles.wordmarkLight,
            { opacity: storeOpacity, color: isDark ? 'rgba(255,255,255,0.52)' : colors.textSub }
          ]}>
            Store
          </Animated.Text>
          <Animated.Text style={[
            styles.wordmarkBold,
            { opacity: villeOpacity, color: colors.text }
          ]}>
            Ville
          </Animated.Text>
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[
          styles.tagline,
          { opacity: taglineOpacity, color: colors.textMuted }
        ]}>
          The Digital Mall of Ethiopia
        </Animated.Text>

        {/* Loading dots */}
        <View style={styles.dotsRow}>
          {[dotOpacity1, dotOpacity2, dotOpacity3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { backgroundColor: colors.accent, opacity: dot }]}
            />
          ))}
        </View>
      </View>

      {/* Footer */}
      <Animated.Text style={[styles.footer, { opacity: taglineOpacity, color: colors.textMuted }]}>
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
  glowWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
  },
  center: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  rulerContainer: {
    width: 40,
    height: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  ruler: {
    width: '100%',
    height: '100%',
    borderRadius: 99,
    transformOrigin: 'left',
  },
  wordmark: {
    fontSize: 60,
    lineHeight: 62,
    letterSpacing: -2.5,
    marginBottom: 14,
    includeFontPadding: false,
  },
  wordmarkLight: {
    fontWeight: '300',
  },
  wordmarkBold: {
    fontWeight: '900',
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 4.5,
    textTransform: 'uppercase',
    marginBottom: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 99,
  },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    paddingBottom: 40,
  },
});
