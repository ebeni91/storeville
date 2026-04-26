import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { authClient } from './auth-client';

const PROD_URL = 'https://api.storeville.app/api';

const getBaseUrl = () => {
  if (!__DEV__) return PROD_URL;
  
  // If we are using Ngrok for Auth, route API traffic through the Ngrok proxy endpoint
  // to bypass Docker's 127.0.0.1 isolation and preserve cookie domains.
  if (process.env.EXPO_PUBLIC_AUTH_URL) {
    return `${process.env.EXPO_PUBLIC_AUTH_URL}/api/proxy`;
  }

  // Fallback for LAN without Ngrok (requires docker-compose to bind 0.0.0.0:8000)
  const expoHost = Constants.expoConfig?.hostUri;
  const devHost = expoHost ? expoHost.split(':')[0] : (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
  return `http://${devHost}:8000/api`;
};

export const API_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  // Do NOT use withCredentials — we attach cookies manually from SecureStore
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ── Auth interceptor ─────────────────────────────────────────────────────────
// better-auth stores session cookies in expo-secure-store.
// authClient.getCookie() retrieves them and we attach them to every Django request.
// Django's BetterAuthMiddleware reads the cookie and resolves the session.
api.interceptors.request.use(async (config) => {
  try {
    const cookies = authClient.getCookie();
    if (cookies) {
      config.headers = config.headers ?? {};
      config.headers['Cookie'] = cookies;
    }
  } catch {
    // Silently skip if auth client isn't ready yet
  }
  return config;
});

// ── Trailing slash interceptor ───────────────────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // Django's APPEND_SLASH requires all API endpoints to end with a trailing slash.
  // This interceptor ensures every request has one, so we don't need to add
  // trailing slashes at every individual call site.
  if (config.url) {
    // Extract just the path portion (before any ?) and add slash if missing
    const [path, query] = config.url.split('?');
    if (!path.endsWith('/') && !path.includes('.')) {
      config.url = query ? `${path}/?${query}` : `${path}/`;
    }
  }
  return config;
});
