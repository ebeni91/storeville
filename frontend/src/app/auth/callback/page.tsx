'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const [status, setStatus] = useState('Completing Sign In...')
  const router = useRouter()
  // Guard to ensure we only redirect once even if the effect fires multiple times
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (hasRedirected.current) return

    const resolveAndRedirect = async () => {
      let attempts = 0
      const maxAttempts = 15 // ~7.5 seconds total

      const poll = async (): Promise<void> => {
        if (hasRedirected.current) return
        attempts++

        try {
          // No trailing slash — avoids Django 301 redirect that drops cookies
          const res = await fetch('/api/proxy/accounts/profile', {
            cache: 'no-store',
            credentials: 'include',
          })

          if (res.ok) {
            const profile = await res.json()
            const role = profile?.role

            if (role === 'SELLER') {
              if (hasRedirected.current) return
              hasRedirected.current = true
              setStatus('Launching your Dashboard...')
              // Use replace to avoid back-button loop
              router.replace('/dashboard/seller')
              return
            } else if (role) {
              if (hasRedirected.current) return
              hasRedirected.current = true
              setStatus('Redirecting...')
              router.replace('/')
              return
            }
            // role is null/undefined — session not fully synced yet, retry
          }
          // 401/403 or no role — retry
        } catch (_) {}

        if (attempts < maxAttempts) {
          setStatus(`Syncing session... (${attempts}/${maxAttempts})`)
          await new Promise(r => setTimeout(r, 500))
          return poll()
        }

        // Exhausted retries — send to login
        if (!hasRedirected.current) {
          hasRedirected.current = true
          router.replace('/login')
        }
      }

      await poll()
    }

    resolveAndRedirect()
  }, [router])

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
