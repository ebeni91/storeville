import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  storeId: string | null;
  storeName: string | null;
  storeType: 'FOOD' | 'RETAIL' | null;

  addItem: (item: CartItem, storeId: string, storeName: string, storeType: 'FOOD' | 'RETAIL') => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  storeId: null,
  storeName: null,
  storeType: null,

  addItem: (item, storeId, storeName, storeType) => {
    const state = get();
    
    // If switching stores, clear the cart first (enforce one-store-at-a-time rule)
    if (state.storeId && state.storeId !== storeId) {
      set({ items: [], storeId: null, storeName: null, storeType: null });
    }

    const existing = get().items.find(i => i.id === item.id);
    if (existing) {
      set({
        items: get().items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i),
        storeId,
        storeName,
        storeType,
      });
    } else {
      set({
        items: [...get().items, { ...item, quantity: 1 }],
        storeId,
        storeName,
        storeType,
      });
    }
  },

  removeItem: (itemId) => {
    const newItems = get().items.filter(i => i.id !== itemId);
    if (newItems.length === 0) {
      set({ items: [], storeId: null, storeName: null, storeType: null });
    } else {
      set({ items: newItems });
    }
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set({ items: get().items.map(i => i.id === itemId ? { ...i, quantity } : i) });
  },

  clearCart: () => set({ items: [], storeId: null, storeName: null, storeType: null }),

  getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
