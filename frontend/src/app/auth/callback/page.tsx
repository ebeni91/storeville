'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const [status, setStatus] = useState('Completing Sign In...')

  useEffect(() => {
    const resolveAndRedirect = async () => {
      let attempts = 0
      const maxAttempts = 12

      const poll = async (): Promise<void> => {
        attempts++
        try {
          // Use Django profile endpoint \u2014 same source as the middleware.
          // The Django BetterAuthMiddleware reads the session cookie and
          // returns the correct role directly from the BA user table.
          const res = await fetch('/api/proxy/accounts/profile/', {
            cache: 'no-store',
            credentials: 'include',
          })
          if (res.ok) {
            const profile = await res.json()
            const role = profile?.role

            if (role === 'SELLER') {
              setStatus('Launching your Dashboard...')
              window.location.href = '/dashboard/seller'
            } else if (role) {
              // Known role (CUSTOMER etc.) \u2014 go home
              window.location.href = '/'
            } else if (attempts < maxAttempts) {
              // No role yet \u2014 session establishing, retry
              await new Promise(r => setTimeout(r, 500))
              return poll()
            } else {
              window.location.href = '/'
            }
            return
          } else if (res.status === 401 || res.status === 403) {
            // Not authenticated yet \u2014 retry
          }
        } catch (_) {}

        if (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 500))
          return poll()
        }

        // No session established after retries — send to login
        window.location.href = '/login'
      }

      await poll()
    }

    resolveAndRedirect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 size={48} className="animate-spin text-gray-900 mb-4" />
      <h1 className="text-xl font-bold text-gray-900">{status}</h1>
      <p className="text-gray-500 font-medium">Please wait while we route you securely.</p>
    </div>
  )
}
