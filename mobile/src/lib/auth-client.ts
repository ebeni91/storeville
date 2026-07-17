import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import { phoneNumberClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';

// Configure environment-specific auth URL.
// Development relies on EXPO_PUBLIC_AUTH_URL (e.g. ngrok tunnel) for OAuth redirects.
export const AUTH_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_AUTH_URL ?? 'http://localhost:3000')
  : 'https://storeville.app';

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
