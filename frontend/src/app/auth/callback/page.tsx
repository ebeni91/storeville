'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export default function AuthCallback() {
  const [status, setStatus] = useState('Completing Sign In...')
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (hasRedirected.current) return

    const resolveAndRedirect = async () => {
      let attempts = 0
      const maxAttempts = 20 // 10 seconds max

      const poll = async (): Promise<void> => {
        if (hasRedirected.current) return
        attempts++

        try {
          // Step 1: Verify the Better Auth session exists
          const { data: session } = await authClient.getSession()

          if (session?.user) {
            // Step 2: Get the authoritative role from Django
            const res = await fetch('/api/proxy/accounts/profile', {
              cache: 'no-store',
              credentials: 'include',
            })

            if (res.ok) {
              const profile = await res.json()
              const role = profile?.role

              if (role && !hasRedirected.current) {
                hasRedirected.current = true
                const dest = role === 'SELLER' ? '/dashboard/seller' : '/'
                setStatus(role === 'SELLER' ? 'Launching your Dashboard...' : 'Redirecting...')
                // window.location.assign = hard navigation, bypasses App Router
                // interception and reliably navigates even on Vercel Edge
                window.location.assign(dest)
                return
              }
            }
          }
        } catch (_) {
          // Session not ready yet — retry
        }

        if (attempts < maxAttempts) {
          setStatus(`Syncing session... (${attempts}/${maxAttempts})`)
          await new Promise(r => setTimeout(r, 500))
          return poll()
        }

        // Exhausted retries — send to login
        if (!hasRedirected.current) {
          hasRedirected.current = true
          window.location.assign('/login')
        }
      }

      await poll()
    }

    resolveAndRedirect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin" />
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-900 animate-pulse" size={22} />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">{status}</h1>
      <p className="text-gray-400 font-medium text-sm">Please wait while we route you securely.</p>
    </div>
  )
}
