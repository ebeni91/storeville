'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show nothing until mounted and session is checked to avoid hydration flickers
  if (!isMounted || isPending) return null 

  return <>{children}</>
}