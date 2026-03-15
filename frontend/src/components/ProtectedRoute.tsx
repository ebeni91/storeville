'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<'CUSTOMER' | 'SELLER' | 'DRIVER' | 'SUPER_ADMIN'>
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // We wrap this in a short timeout to let Zustand rehydrate from memory
    const checkAuth = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/login')
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // If they are logged in but don't have the right role, route them appropriately
        if (user.role === 'SELLER') router.replace('/dashboard/seller')
        else if (user.role === 'DRIVER') router.replace('/dashboard/driver')
        else router.replace('/') // Customers go to the homepage
      } else {
        setIsChecking(false)
      }
    }, 100)

    return () => clearTimeout(checkAuth)
  }, [isAuthenticated, user, router, allowedRoles])

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-gray-500 font-bold animate-pulse">Verifying secure session...</p>
      </div>
    )
  }

  return <>{children}</>
}