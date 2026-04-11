import { create } from 'zustand'

// Simplified — better-auth's useSession() owns the user/session state.
// This store only holds app-level UI state.
interface AuthState {
  isAuthModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthModalOpen: false,
  openAuthModal:  () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}))
