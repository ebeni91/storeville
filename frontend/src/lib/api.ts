import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL,
  withCredentials: true, // CRITICAL: Tells the browser to send/receive the HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// 1. Request Interceptor: Attach the short-lived Access Token from Memory
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 2. Response Interceptor: The Silent Refresh Magic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the API says our Access Token is dead (401), and we haven't tried refreshing yet...
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Hit the refresh endpoint. We don't need to send a body because 
        // the browser automatically includes the 'refresh_token' HttpOnly cookie!
        const res = await axios.post(`${baseURL}/accounts/refresh/`, {}, { 
          withCredentials: true 
        })

        const newAccessToken = res.data.access

        // Save the new token back to memory
        useAuthStore.getState().setToken(newAccessToken)

        // Update the failed request with the new token and retry it seamlessly
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // If the refresh fails (e.g., 7 days have passed and the cookie expired)
        // Log the user out and send them to the login page
        useAuthStore.getState().logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export interface Store {
  id: string
  name: string
  slug: string
  category: string
  logo: string | null
  latitude: number
  longitude: number
  distance: number
}

export const fetchNearbyStores = async (lat: number, lon: number, radius = 10, category?: string): Promise<Store[]> => {
  const query = category 
    ? `/stores/discovery/nearby/?lat=${lat}&lon=${lon}&radius=${radius}&category=${category}`
    : `/stores/discovery/nearby/?lat=${lat}&lon=${lon}&radius=${radius}`;
    
  const response = await api.get(query);
  return response.data;
}