import { create } from 'zustand'

interface User {
  id: string
  email: string
  phone_number?: string
  role: 'CUSTOMER' | 'SELLER' | 'DRIVER' | 'ADMIN'
  first_name?: string
  last_name?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAuthModalOpen: boolean // <-- NEW
  login: (user: User, token: string) => void
  setToken: (token: string) => void
  logout: () => void
  openAuthModal: () => void // <-- NEW
  closeAuthModal: () => void // <-- NEW
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null, 
  isAuthenticated: false,
  isAuthModalOpen: false, 
  
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  setToken: (token) => set({ token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}))