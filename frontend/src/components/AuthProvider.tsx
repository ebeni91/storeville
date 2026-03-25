'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrating, setIsHydrating] = useState(true)
  const { token, logout } = useAuthStore()
  
  // Prevents React 18 Strict Mode from double-firing the hydration check
  const hasAttempted = useRef(false) 

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const restoreSession = async () => {
      if (token) {
        setIsHydrating(false)
        return
      }

      try {
        // We trigger a protected route. 
        // If there is no token in RAM, this gets a 401, triggers the Mutex Lock 
        // in api.ts, safely rotates the HttpOnly cookie, and retries successfully.
        await api.get('/accounts/profile/')
      } catch (error) {
        // If it still fails, the cookie is truly dead/missing.
        logout() 
      } finally {
        setIsHydrating(false)
      }
    }

    restoreSession()
  }, [token, logout])

  if (isHydrating) return null 

  return <>{children}</>
}