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
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // While the BA client is still fetching the session, hold on the loader.
    if (isPending) return

    if (session && user) {
      const userRole = (user as any).role
      // Correct role — render the children
      if (!allowedRoles || allowedRoles.includes(userRole)) {
        setIsReady(true)
        return
      }
      // Wrong role for this page — redirect to correct destination
      if (userRole === 'SELLER') router.replace('/dashboard/seller')
      else if (userRole === 'DRIVER') router.replace('/dashboard/driver')
      else router.replace('/')
      return
    }

    // session is null after loading finished.
    // IMPORTANT: Do NOT immediately redirect to /login here.
    // The middleware (which runs server-side) already guarantees that only
    // authenticated users reach protected routes. If useSession() returns null
    // it is almost always a transient race condition (Render cold start, BA
    // hydration delay, etc). We simply stay on the loading screen.
    // The only way to get to /login is a true session expiry, which the
    // middleware will handle on the next navigation automatically.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending, user])

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-900 animate-pulse" size={24} />
        </div>
        <p className="mt-6 text-gray-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}