import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import { phoneNumberClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// 🌟 DEV: use ngrok tunnel so Google OAuth redirect URIs work properly.
// Google blocks raw IP addresses as OAuth redirect URIs — ngrok provides a real domain.
// Update this when you restart ngrok and get a new URL.
const DEV_URL = 'https://anthological-defectively-suzette.ngrok-free.dev';
const PROD_URL = 'https://storeville.app';

export const AUTH_URL = __DEV__ ? DEV_URL : PROD_URL;

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  plugins: [
    expoClient({
      scheme: 'storeville',
      storagePrefix: 'storeville',
      storage: SecureStore,
    }),
    phoneNumberClient(),
  ],
});

// Convenience re-exports
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
