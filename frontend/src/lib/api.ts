import axios from 'axios'

// We mapped this in docker-compose.yml to http://localhost:8000/api
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types for our Store discovery
export interface Store {
  id: string
  name: string
  slug: string
  category: string
  logo: string | null
  latitude: number
  longitude: number
  distance: number // Populated by Django's Haversine formula!
}

export const fetchNearbyStores = async (lat: number, lon: number, radius = 10): Promise<Store[]> => {
  const response = await api.get(`/stores/discovery/nearby/?lat=${lat}&lon=${lon}&radius=${radius}`)
  return response.data
}