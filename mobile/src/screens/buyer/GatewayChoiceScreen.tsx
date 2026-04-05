import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Animated, Dimensions } from 'react-native';
import { Coffee, ShoppingBag } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export function GatewayChoiceScreen({ navigation }: Props) {
  const setGateway = useAuthStore(state => state.setGateway);
  const user = useAuthStore(state => state.user);
  const isGuest = useAuthStore(state => state.isGuest);

  const foodScale = useRef(new Animated.Value(1)).current;
  const retailScale = useRef(new Animated.Value(1)).current;

  const handleGateway = async (type: 'FOOD' | 'RETAIL', anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(async () => {
      await setGateway(type);
    });
  };

  const firstName = user?.first_name || null;

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Dual glow blobs */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <View style={{
          position: 'absolute', width: width * 1.3, height: width * 1.3,
          borderRadius: width * 0.65, top: -width * 0.4, left: -width * 0.4,
          backgroundColor: '#f97316', opacity: 0.09,
        }} />
        <View style={{
          position: 'absolute', width: width * 1.2, height: width * 1.2,
          borderRadius: width * 0.6, bottom: -width * 0.3, right: -width * 0.3,
          backgroundColor: '#6366f1', opacity: 0.1,
        }} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>

        {/* Greeting */}
        <View style={{ marginBottom: 52 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>
            Choose Your Experience
          </Text>
          <Text style={{ fontSize: 40, fontWeight: '900', color: '#ffffff', letterSpacing: -1.2, lineHeight: 46 }}>
            {isGuest ? "What are\nyou craving?" : `Hey ${firstName ?? 'there'} 👋\nWhat today?`}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: '500', marginTop: 10, lineHeight: 20 }}>
            Discover stores and experiences{'\n'}designed for you.
          </Text>
        </View>

        {/* Food Panel */}
        <Animated.View style={{ transform: [{ scale: foodScale }], marginBottom: 16 }}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => Animated.timing(foodScale, { toValue: 0.97, duration: 100, useNativeDriver: true }).start()}
            onPressOut={() => Animated.timing(foodScale, { toValue: 1, duration: 100, useNativeDriver: true }).start()}
            onPress={() => handleGateway('FOOD', foodScale)}
            style={{
              backgroundColor: 'rgba(249,115,22,0.1)',
              borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)',
              borderRadius: 28, overflow: 'hidden',
            }}
          >
            <View style={{ padding: 28 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{
                  width: 52, height: 52, borderRadius: 16,
                  backgroundColor: '#f97316',
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: '#f97316', shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
                }}>
                  <Coffee color="#ffffff" size={24} />
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={{ color: '#f97316', fontSize: 11, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Food Gateway</Text>
                </View>
              </View>
              <Text style={{ fontSize: 30, fontWeight: '900', color: '#ffffff', letterSpacing: -0.6, marginBottom: 8 }}>Order Food & Coffee</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '500', lineHeight: 20 }}>
                Cafes, restaurants, bakeries & hotels
              </Text>
              <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#f97316', fontSize: 13, fontWeight: '800' }}>Explore Now</Text>
                <Text style={{ color: '#f97316', marginLeft: 6, fontSize: 16 }}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Retail Panel */}
        <Animated.View style={{ transform: [{ scale: retailScale }] }}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => Animated.timing(retailScale, { toValue: 0.97, duration: 100, useNativeDriver: true }).start()}
            onPressOut={() => Animated.timing(retailScale, { toValue: 1, duration: 100, useNativeDriver: true }).start()}
            onPress={() => handleGateway('RETAIL', retailScale)}
            style={{
              backgroundColor: 'rgba(99,102,241,0.1)',
              borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)',
              borderRadius: 28, overflow: 'hidden',
            }}
          >
            <View style={{ padding: 28 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{
                  width: 52, height: 52, borderRadius: 16,
                  backgroundColor: '#6366f1',
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: '#6366f1', shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
                }}>
                  <ShoppingBag color="#ffffff" size={24} />
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={{ color: '#818cf8', fontSize: 11, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>Retail Gateway</Text>
                </View>
              </View>
              <Text style={{ fontSize: 30, fontWeight: '900', color: '#ffffff', letterSpacing: -0.6, marginBottom: 8 }}>Shop Retail</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '500', lineHeight: 20 }}>
                Electronics, fashion, home & art
              </Text>
              <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '800' }}>Explore Now</Text>
                <Text style={{ color: '#818cf8', marginLeft: 6, fontSize: 16 }}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </View>
  );
}
