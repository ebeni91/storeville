import React, { useEffect, useRef } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Pressable,
} from 'react-native';
import { AlertTriangle, CheckCircle2, Info, XCircle, LogOut } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';

const { width } = Dimensions.get('window');

export type AlertVariant = 'success' | 'error' | 'warning' | 'info' | 'danger' | 'default';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  variant?: AlertVariant;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

const VARIANT_CONFIG: Record<AlertVariant, {
  icon: any;
  iconColor: string;
  iconBg: string;
  accentColor: string;
}> = {
  success: {
    icon: CheckCircle2,
    iconColor: '#10b981',
    iconBg: 'rgba(16,185,129,0.12)',
    accentColor: '#10b981',
  },
  error: {
    icon: XCircle,
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,0.12)',
    accentColor: '#ef4444',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.12)',
    accentColor: '#f59e0b',
  },
  info: {
    icon: Info,
    iconColor: '#6366f1',
    iconBg: 'rgba(99,102,241,0.12)',
    accentColor: '#6366f1',
  },
  danger: {
    icon: LogOut,
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,0.1)',
    accentColor: '#ef4444',
  },
  default: {
    icon: Info,
    iconColor: '#6366f1',
    iconBg: 'rgba(99,102,241,0.12)',
    accentColor: '#6366f1',
  },
};

export function CustomAlert({
  visible,
  title,
  message,
  variant = 'default',
  buttons = [{ text: 'OK' }],
  onDismiss,
}: CustomAlertProps) {
  const { colors, mode } = useThemeStore();
  const isDark = mode === 'dark';
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const cfg = VARIANT_CONFIG[variant];
  const IconComponent = cfg.icon;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 18,
          stiffness: 260,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.88,
          damping: 18,
          stiffness: 260,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleButton = (btn: AlertButton) => {
    btn.onPress?.();
    onDismiss?.();
  };

  const primaryButton = buttons.find(b => b.style !== 'cancel') ?? buttons[0];
  const cancelButton = buttons.find(b => b.style === 'cancel');

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Pressable
        style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
        onPress={() => {
          if (buttons.length === 1) handleButton(buttons[0]);
        }}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#0f0f18' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              shadowColor: cfg.accentColor,
            },
          ]}
        >
          {/* Icon badge */}
          <View style={[styles.iconBadge, { backgroundColor: cfg.iconBg }]}>
            <IconComponent color={cfg.iconColor} size={26} strokeWidth={2} />
          </View>

          {/* Text */}
          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#0f0f18' }]}>
            {title}
          </Text>
          {message ? (
            <Text style={[styles.message, { color: isDark ? 'rgba(255,255,255,0.5)' : '#6b7280' }]}>
              {message}
            </Text>
          ) : null}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6' }]} />

          {/* Buttons */}
          <View style={[
            styles.buttonRow,
            { flexDirection: cancelButton ? 'row' : 'column' }
          ]}>
            {cancelButton && (
              <TouchableOpacity
                style={[
                  styles.btnCancel,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                  }
                ]}
                activeOpacity={0.75}
                onPress={() => handleButton(cancelButton)}
              >
                <Text style={[styles.btnCancelText, { color: isDark ? 'rgba(255,255,255,0.55)' : '#6b7280' }]}>
                  {cancelButton.text}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.btnPrimary,
                {
                  backgroundColor: primaryButton.style === 'destructive'
                    ? cfg.accentColor
                    : cfg.accentColor,
                  flex: cancelButton ? 1 : undefined,
                  width: cancelButton ? undefined : '100%',
                }
              ]}
              activeOpacity={0.82}
              onPress={() => handleButton(primaryButton)}
            >
              <Text style={styles.btnPrimaryText}>{primaryButton.text}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: width - 56,
    borderRadius: 28,
    borderWidth: 1,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    width: '100%',
    marginTop: 20,
    marginBottom: 16,
  },
  buttonRow: {
    width: '100%',
    gap: 10,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  btnPrimary: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});
