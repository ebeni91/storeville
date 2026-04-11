import axios from 'axios';
import { Platform } from 'react-native';
import { authClient } from './auth-client';

const DEV_ANDROID_URL = 'http://10.17.127.123:8000/api';
const DEV_IOS_URL     = 'http://10.17.127.123:8000/api';
const PROD_URL        = 'https://api.storeville.app/api';

const getBaseUrl = () => {
  if (__DEV__) {
    return Platform.OS === 'android' ? DEV_ANDROID_URL : DEV_IOS_URL;
  }
  return PROD_URL;
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
