import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

export interface CartItem {
  id: string
  name: string
  price: string
  quantity: number
  image?: string | null
}

interface CartState {
  // A dictionary isolating carts by store ID: { "store_id_1": [items], "store_id_2": [items] }
  carts: Record<string, CartItem[]> 
  
  addItem: (store_id: string, item: CartItem) => void
  removeItem: (store_id: string, product_id: string) => void
  clearCart: (store_id: string) => void
  
  // THE HANDSHAKE
  // mergeCartWithBackend: (store_id: string) => Promise<void>
  mergeCartWithBackend: (store_id: string, storeType: 'RETAIL' | 'FOOD') => Promise<void>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},
      
      addItem: (store_id, newItem) => set((state) => {
        const storeCart = state.carts[store_id] || []
        const existingItem = storeCart.find(i => i.id === newItem.id)
        
        let newStoreCart;
        if (existingItem) {
          // Add to existing quantity
          newStoreCart = storeCart.map(i => 
            i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
          )
        } else {
          // Add new item
          newStoreCart = [...storeCart, newItem]
        }
        
        return { carts: { ...state.carts, [store_id]: newStoreCart } }
      }),

      removeItem: (store_id, product_id) => set((state) => {
        const storeCart = state.carts[store_id] || []
        return { 
          carts: { ...state.carts, [store_id]: storeCart.filter(i => i.id !== product_id) } 
        }
      }),

      clearCart: (store_id) => set((state) => ({ 
        carts: { ...state.carts, [store_id]: [] } 
      })),

      // Updated Handshake Function
      mergeCartWithBackend: async (store_id, storeType) => {
        const { carts, clearCart } = get()
        const storeCart = carts[store_id] || []
        
        if (storeCart.length === 0) return 
        
        try {
          const payload = {
            store_id: store_id,
            items: storeCart.map(item => ({
              product_id: item.id,
              quantity: item.quantity
            }))
          }
          
          // Dynamically route to the correct Django app
          const endpoint = storeType === 'RETAIL' 
            ? '/retail_orders/cart/merge/' 
            : '/food_orders/cart/merge/';
            
          await api.post(endpoint, payload)
          clearCart(store_id)
        } catch (error) {
          console.error(`Failed to merge ${storeType} cart:`, error)
        }
      }
    }),
    {
      name: 'storeville-guest-carts', // The localStorage key
    }
  )
)