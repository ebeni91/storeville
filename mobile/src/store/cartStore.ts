import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SelectedExtra {
  id: string;
  name: string;
  price: number;
}

export interface SelectedOption {
  optionId: string;
  optionName: string;
  choice: string;
}

export interface CartItem {
  id: string;
  name: string;
  base_price: number;          // Original item price (no extras)
  quantity: number;
  image?: string;
  selectedOptions?: SelectedOption[];
  selectedExtras?: SelectedExtra[];
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  storeId: string;
  storeName: string;
  storeType: 'FOOD' | 'RETAIL';
  description?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Compute total price for a single CartItem including all selected extras × qty */
export const getItemTotal = (item: CartItem): number => {
  const extrasTotal = (item.selectedExtras || []).reduce((sum, e) => sum + e.price, 0);
  return (item.base_price + extrasTotal) * item.quantity;
};

/** Effective unit price including extras (for receipt display) */
export const getItemUnitPrice = (item: CartItem): number => {
  const extrasTotal = (item.selectedExtras || []).reduce((sum, e) => sum + e.price, 0);
  return item.base_price + extrasTotal;
};

// ─── State interface ───────────────────────────────────────────────────────────

interface CartState {
  // Cart
  items: CartItem[];
  storeId: string | null;
  storeName: string | null;
  storeType: 'FOOD' | 'RETAIL' | null;

  addItem: (
    item: CartItem,
    storeId: string,
    storeName: string,
    storeType: 'FOOD' | 'RETAIL',
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;

  // Wishlist (persisted via AsyncStorage)
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
  clearWishlist: () => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // ── Cart ────────────────────────────────────────────────────────────────
      items: [],
      storeId: null,
      storeName: null,
      storeType: null,

      addItem: (item, storeId, storeName, storeType) => {
        const state = get();

        // If switching stores, clear cart first (one-store-at-a-time rule)
        if (state.storeId && state.storeId !== storeId) {
          set({ items: [], storeId: null, storeName: null, storeType: null });
        }

        const existing = get().items.find(i => i.id === item.id);
        if (existing) {
          set({
            items: get().items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
            storeId,
            storeName,
            storeType,
          });
        } else {
          set({
            items: [...get().items, { ...item, quantity: item.quantity || 1 }],
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

      /** Sum of (base_price + extras) × qty for all items */
      getTotal: () => get().items.reduce((sum, item) => sum + getItemTotal(item), 0),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      // ── Wishlist ─────────────────────────────────────────────────────────────
      wishlist: [],

      addToWishlist: (item) => {
        const already = get().wishlist.find(w => w.id === item.id);
        if (!already) {
          set({ wishlist: [...get().wishlist, item] });
        }
      },

      removeFromWishlist: (itemId) => {
        set({ wishlist: get().wishlist.filter(w => w.id !== itemId) });
      },

      isInWishlist: (itemId) => get().wishlist.some(w => w.id === itemId),

      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: 'storeville-cart-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist wishlist; cart is intentionally session-only to avoid stale state
      partialize: (state) => ({ wishlist: state.wishlist }),
    },
  ),
);
