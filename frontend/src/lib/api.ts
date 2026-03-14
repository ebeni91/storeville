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

export const fetchNearbyStores = async (lat: number, lon: number, radius = 10, category?: string): Promise<Store[]> => {
  // If a category is provided, append it to the Django API query
  const query = category 
    ? `/stores/discovery/nearby/?lat=${lat}&lon=${lon}&radius=${radius}&category=${category}`
    : `/stores/discovery/nearby/?lat=${lat}&lon=${lon}&radius=${radius}`;
    
  const response = await api.get(query);
  return response.data;
}