import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

// 1. We dynamically ensure the API points to the same base domain we are browsing on
// so the browser doesn't block the cookie for being "Cross-Site"
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const isTestDomain = window.location.hostname.includes('test');
    // Align with the backend ALLOWED_HOSTS & CORS configuration
    return isTestDomain ? 'http://api.storeville.test:8000/api' : 'http://localhost:8000/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://api.storeville.test:8000/api';
}

export const api = axios.create({
  // Dynamically assigned base URL to prevent hardcoded domain mismatch
  baseURL: getBaseURL(), 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRITICAL: Tells the browser to attach the cookie
})
// ... keep your interceptors below exactly as they are ...

// Attach the Access Token from Memory
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- CONCURRENCY LOCK VARIABLES ---
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Use raw axios here to avoid interceptor loops
        const baseURL = getBaseURL()
        const res = await axios.post(`${baseURL}/accounts/refresh/`, {}, { 
          withCredentials: true 
        })

        const newAccessToken = res.data.access
        const user = res.data.user // This comes from our CustomTokenRefreshSerializer
        
        // CRITICAL: Hydrate the user profile state across subdomains
        if (user) {
          useAuthStore.getState().login(user, newAccessToken)
        } else {
          useAuthStore.getState().setToken(newAccessToken)
        }

        processQueue(null, newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // 1. Clear the queue
        processQueue(refreshError, null)
        
        // 2. Wipe the frontend state (tell Zustand they are a guest)
        useAuthStore.getState().logout()

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
// inside frontend/src/lib/api.ts

export interface Store {
  id: string
  name: string
  slug: string         // 🌟 We use SLUG, not subdomain
  store_type?: string  
  category: string
  city?: string        
  logo: string | null
  latitude: number
  longitude: number
  distance: number
}

export const fetchNearbyStores = async (lat: number, lon: number, radius = 10, mode = 'retail'): Promise<Store[]> => {
  const storeType = mode === 'food' ? 'FOOD' : 'RETAIL';
  const response = await api.get(`/stores/discovery/nearby/?lat=${lat}&lon=${lon}&radius=${radius}&type=${storeType}`);
  return response.data;
}