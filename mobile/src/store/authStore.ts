import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  phone_number?: string;
  role: 'CUSTOMER' | 'SELLER' | 'DRIVER' | 'ADMIN';
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  selectedGateway: 'FOOD' | 'RETAIL' | null;
  
  // Actions
  login: (user: User, accessToken: string, refreshToken: string, zone: 'seller' | 'buyer') => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
  restoreSession: () => Promise<void>;
  enterGuestMode: () => void;
  setGateway: (gateway: 'FOOD' | 'RETAIL') => Promise<void>;
  loadGateway: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  isGuest: false,
  selectedGateway: null,

  login: async (user, accessToken, refreshToken, zone) => {
    const key = zone === 'seller' ? 'seller_refresh_token' : 'buyer_refresh_token';
    await SecureStore.setItemAsync(key, refreshToken);
    await SecureStore.setItemAsync('active_zone', zone); 
    
    set({ user, accessToken, isAuthenticated: true, isGuest: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('seller_refresh_token');
    await SecureStore.deleteItemAsync('buyer_refresh_token');
    await SecureStore.deleteItemAsync('active_zone');
    
    set({ user: null, accessToken: null, isAuthenticated: false, isGuest: false });
  },

  setAccessToken: (token: string) => set({ accessToken: token, isAuthenticated: true }),

  enterGuestMode: () => {
    set({ isGuest: true, isAuthenticated: false, user: null });
  },

  setGateway: async (gateway: 'FOOD' | 'RETAIL') => {
    // Persist the buyer's gateway choice so the app remembers it
    await AsyncStorage.setItem('selected_gateway', gateway);
    set({ selectedGateway: gateway });
  },

  loadGateway: async () => {
    const saved = await AsyncStorage.getItem('selected_gateway');
    if (saved === 'FOOD' || saved === 'RETAIL') {
      set({ selectedGateway: saved });
    }
  },

  restoreSession: async () => {
    try {
      // Also restore the remembered gateway
      const savedGateway = await AsyncStorage.getItem('selected_gateway');
      if (savedGateway === 'FOOD' || savedGateway === 'RETAIL') {
        set({ selectedGateway: savedGateway });
      }

      const zone = await SecureStore.getItemAsync('active_zone');
      if (!zone) return set({ isLoading: false });
      
      const key = zone === 'seller' ? 'seller_refresh_token' : 'buyer_refresh_token';
      const refreshToken = await SecureStore.getItemAsync(key);
      
      if (!refreshToken) return set({ isLoading: false });

      const { api } = require('../lib/api');
      
      const response = await api.post('/accounts/refresh/', {}, {
        headers: { 
          'X-Auth-Zone': zone,
          'Cookie': `${key}=${refreshToken}`
        }
      });
      
      const newAccessToken = response.data.access;
      const user = response.data.user;
      
      if (user) {
        set({ user, accessToken: newAccessToken, isAuthenticated: true, isLoading: false });
      } else {
        set({ accessToken: newAccessToken, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('seller_refresh_token');
      await SecureStore.deleteItemAsync('buyer_refresh_token');
      await SecureStore.deleteItemAsync('active_zone');
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
