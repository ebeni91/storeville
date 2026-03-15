import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  phone_number?: string
  role: 'CUSTOMER' | 'SELLER' | 'DRIVER' | 'ADMIN'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null, // Token starts empty in RAM
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      setToken: (token) => set({ token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'storeville-auth',
      // ENTERPRISE SECURITY MAGIC: 
      // We only save the user profile and auth flag to the browser. 
      // The JWT token is excluded, keeping it strictly in RAM!
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)