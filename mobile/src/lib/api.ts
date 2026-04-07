import axios from 'axios';
import { Platform } from 'react-native';

const DEV_ANDROID_URL = 'http://10.17.127.123:8000/api';
const DEV_IOS_URL = 'http://10.17.127.123:8000/api';
const PROD_URL = 'https://api.storeville.app/api';

const getBaseUrl = () => {
  if (__DEV__) {
    return Platform.OS === 'android' ? DEV_ANDROID_URL : DEV_IOS_URL;
  }
  return PROD_URL;
};

export const API_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ── Auth interceptor ──────────────────────────────────────────────────────────
// Lazily import authStore to avoid circular dependency issues at module init.
// Injects the Bearer token into every outgoing request if the user is logged in.
api.interceptors.request.use(config => {
  try {
    // useAuthStore.getState() works outside of React components
    const { useAuthStore } = require('../store/authStore');
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // Silently skip if store isn't initialised yet (e.g., during app boot)
  }
  return config;
});
