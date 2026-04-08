import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, AppColors } from '../theme/colors';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  colors: AppColors;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  colors: lightColors,

  toggleTheme: async () => {
    const next: ThemeMode = get().mode === 'light' ? 'dark' : 'light';
    await AsyncStorage.setItem('app_theme', next);
    set({ mode: next, colors: next === 'light' ? lightColors : darkColors });
  },

  loadTheme: async () => {
    const saved = await AsyncStorage.getItem('app_theme');
    if (saved === 'light' || saved === 'dark') {
      set({ mode: saved, colors: saved === 'light' ? lightColors : darkColors });
    }
  },
}));
