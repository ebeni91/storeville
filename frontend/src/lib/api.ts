import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://api.storeville.test:8000/api'

export const api = axios.create({
  baseURL,
  withCredentials: true, // CRITICAL: Send the HttpOnly cookie
  headers: {
    'Content-Type': 'application/json',
  },
})

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

// The Silent Refresh Interceptor with Mutex Lock
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If a refresh is already happening, add to queue
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Use standard axios to prevent interceptor loops
        const res = await axios.post(`${baseURL}/accounts/refresh/`, {}, { 
          withCredentials: true 
        })

        const newAccessToken = res.data.access
        useAuthStore.getState().setToken(newAccessToken)

        processQueue(null, newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        
        if (typeof window !== 'undefined') {
          // Redirect to the main platform login
          const protocol = window.location.protocol;
          const baseDomain = window.location.hostname.includes('test') 
            ? 'storeville.test:3000' 
            : 'storeville.app'; 
            
          window.location.href = `${protocol}//${baseDomain}/login`;
        }
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