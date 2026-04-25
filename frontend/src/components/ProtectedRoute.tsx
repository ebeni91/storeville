'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<'CUSTOMER' | 'SELLER' | 'DRIVER' | 'SUPER_ADMIN'>
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const user = session?.user
  
  // Use a local verified state to prevent "flicker" redirects during client hydration
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    if (isPending) return;

    // If no session exists after loading finish, strictly check if we should redirect.
    // We add a tiny delay or check to ensure we don't bounce a user who is currently
    // in the middle of a valid middleware-authorized load.
    if (!session) {
      // ONLY redirect to login if we are absolutely sure there is no session.
      // If the middleware let us in, there IS a session cookie. 
      // If BA library doesn't see it, it might be a hydration delay.
      const redirectTimer = setTimeout(() => {
        if (!session) router.replace('/login')
      }, 1500)
      return () => clearTimeout(redirectTimer)
    } 
    
    // Check roles
    if (allowedRoles && user) {
      const userRole = (user as any).role
      if (!allowedRoles.includes(userRole)) {
        if (userRole === 'SELLER') router.replace('/dashboard/seller')
        else if (userRole === 'DRIVER') router.replace('/dashboard/driver')
        else router.replace('/')
      } else {
        setIsVerified(true)
      }
    } else if (session) {
      setIsVerified(true)
    }
  }, [session, isPending, user, router, allowedRoles])

  // While pending or before verification is confirmed, show the loader.
  // This prevents the page from rendering half-broken states that might trigger more redirects.
  if (isPending || (!isVerified && session)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-900 animate-pulse" size={24} />
        </div>
        <p className="mt-6 text-gray-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Syncing Secure Session...</p>
      </div>
    )
  }

  // Final check: if we finished loading and definitely have no session (and the timer above hasn't kicked in yet),
  // return null to prevent rendering protected children.
  if (!session) return null;

  return <>{children}</>
}