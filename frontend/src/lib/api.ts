import axios from 'axios'

// 1. Point to the Next.js proxy rewrite. 
// This ensures cookies are shared between frontend and backend origins!
export const api = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRITICAL: Tells the browser to attach the cookie
})

// Attach the session cookie automatically via withCredentials: true
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If a request fails with 401, it means the session is truly invalid
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

export const fetchNearbyStores = async (lat: number, lon: number, radius = 50000, mode = 'retail'): Promise<Store[]> => {
  const storeType = mode === 'food' ? 'FOOD' : 'RETAIL';
  const response = await api.get(`/stores/discovery/nearby/?lat=${lat}&lon=${lon}&radius=${radius}&type=${storeType}`);
  return response.data;
}