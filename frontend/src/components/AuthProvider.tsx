'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import axios from 'axios'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrating, setIsHydrating] = useState(true)
  const { token, login, logout } = useAuthStore()

  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        setIsHydrating(false)
        return
      }

      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://api.storeville.test:8000/api'
        // Base axios bypasses the interceptor trap
        const res = await axios.post(`${baseURL}/accounts/refresh/`, {}, { 
            withCredentials: true 
        })
        
        const { access, user } = res.data
        login(user, access)
      } catch (error) {
        logout() // No valid cookie found
      } finally {
        setIsHydrating(false)
      }
    }

    restoreSession()
  }, [token, login, logout])

  if (isHydrating) return null // Prevents UI flashing

  return <>{children}</>
}