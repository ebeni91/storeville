import { create } from 'zustand'
import { api } from '@/lib/api'

export interface FavoriteItem {
  id: string          // The ID of the Favorite record for deletion
  productId: string   // The ID of the actual product/menu item
  type: 'RETAIL' | 'FOOD'
  name: string
  price: string
  image: string | null
  storeName?: string
  storeId?: string
  storeSlug?: string
}

interface FavoriteStore {
  favorites: FavoriteItem[]
  isLoading: boolean
  fetchFavorites: () => Promise<void>
  toggleFavorite: (product: any, type: 'RETAIL' | 'FOOD') => Promise<void>
  clearFavorites: () => void
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  isLoading: false,

  clearFavorites: () => set({ favorites: [] }),

  fetchFavorites: async () => {
    // Only fetch if we have a token (handled by API interceptor, but we can avoid blind calls)
    try {
      set({ isLoading: true })
      const [retailRes, foodRes] = await Promise.all([
        api.get('/retail/favorites/').catch(() => ({ data: { results: [] } })),
        api.get('/food/favorites/').catch(() => ({ data: { results: [] } }))
      ])
      
      const retailData = retailRes.data.results || retailRes.data || []
      const foodData = foodRes.data.results || foodRes.data || []

      const formattedRetail = retailData.map((fav: any): FavoriteItem => ({
        id: fav.id,
        productId: fav.product,
        type: 'RETAIL',
        name: fav.product_details?.name,
        price: fav.product_details?.price,
        image: fav.product_details?.image,
        storeName: fav.product_details?.store_name,
        storeId: fav.product_details?.store_id,
        storeSlug: fav.product_details?.store_slug
      }))

      const formattedFood = foodData.map((fav: any): FavoriteItem => ({
        id: fav.id,
        productId: fav.menu_item,
        type: 'FOOD',
        name: fav.menu_item_details?.name,
        price: fav.menu_item_details?.price,
        image: fav.menu_item_details?.image,
        storeName: fav.menu_item_details?.store_name,
        storeId: fav.menu_item_details?.store_id,
        storeSlug: fav.menu_item_details?.store_slug
      }))
      
      set({ favorites: [...formattedRetail, ...formattedFood], isLoading: false })
    } catch (err) {
      console.error('Failed to fetch favorites', err)
      set({ isLoading: false })
    }
  },

  toggleFavorite: async (product: any, type: 'RETAIL' | 'FOOD') => {
    const { favorites, fetchFavorites } = get()
    const targetId = product.id
    
    // Check if it already exists
    const existing = favorites.find(f => f.productId === targetId && f.type === type)
    
    if (existing) {
      // Optimistic Remove
      set({ favorites: favorites.filter(f => f.id !== existing.id) })
      try {
        const endpoint = type === 'RETAIL' ? `/retail/favorites/${existing.id}/` : `/food/favorites/${existing.id}/`
        await api.delete(endpoint)
      } catch (err) {
        // Revert on failure
        await fetchFavorites()
      }
    } else {
      // We don't have the Favorite DB ID yet, so we can't do a perfect optimistic add that supports immediate deletion.
      // We'll just show loading or just wait for the network to add it to the state.
      try {
        const endpoint = type === 'RETAIL' ? '/retail/favorites/' : '/food/favorites/'
        const payloadKey = type === 'RETAIL' ? 'product' : 'menu_item'
        
        await api.post(endpoint, { [payloadKey]: targetId })
        // Re-fetch to get the new favorite ID
        await fetchFavorites()
      } catch (err) {
        console.error('Failed to add favorite', err)
      }
    }
  }
}))
