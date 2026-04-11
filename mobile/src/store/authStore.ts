import { create } from 'zustand';
import { authClient } from '../lib/auth-client';

export interface User {
  id: string;
  email?: string;
  phone_number?: string;
  role: 'CUSTOMER' | 'SELLER' | 'DRIVER' | 'ADMIN';
  name?: string;
  image?: string;
}

interface AuthState {
  // Guest mode (unauthenticated browsing)
  isGuest: boolean;

  // Actions
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isGuest: false,

  enterGuestMode: () => set({ isGuest: true }),
  exitGuestMode: () => set({ isGuest: false }),

  logout: async () => {
    await authClient.signOut();
    set({ isGuest: false });
  },
}));
