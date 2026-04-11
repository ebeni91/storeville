'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace('/login')
    } else if (allowedRoles && user && !allowedRoles.includes((user as any).role)) {
      if ((user as any).role === 'SELLER') router.replace('/dashboard/seller')
      else if ((user as any).role === 'DRIVER') router.replace('/dashboard/driver')
      else router.replace('/') 
    }
  }, [session, isPending, user, router, allowedRoles])

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-gray-500 font-bold animate-pulse">Verifying secure session...</p>
      </div>
    )
  }

  if (!session) return null;
  if (allowedRoles && user && !allowedRoles.includes((user as any).role)) return null;

  return <>{children}</>
}