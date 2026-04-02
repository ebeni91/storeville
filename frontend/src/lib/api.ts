import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

// 1. Point directly to your backend natively. 
// No more dynamic domain guessing needed!
export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRITICAL: Tells the browser to attach the cookie
})

// Attach the Access Token from Memory
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


// A passive interceptor for silent token refresh (No Mutex Locks needed)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const isDashboard = typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')
        const zone = isDashboard ? 'seller' : 'buyer'

        // Silently ask Django for a new access token
        const res = await axios.post('http://localhost:8000/api/accounts/refresh/', {}, { 
          withCredentials: true,
          headers: {
            'X-Auth-Zone': zone
          }
        })

        const newAccessToken = res.data.access
        const user = res.data.user 
        
        // Hydrate the user profile state safely
        if (user) {
          useAuthStore.getState().login(user, newAccessToken)
        } else {
          useAuthStore.getState().setToken(newAccessToken)
        }

        // Update the failed request and retry it
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // If refresh fails, they are a true guest. 
        // Just clear RAM and let the UI handle it natively without forcing a redirect.
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
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