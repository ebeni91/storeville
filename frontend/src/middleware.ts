import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 0. QUICK EXIT: If no session cookie exists, skip the network fetch completely
  const hasSessionCookie = request.cookies.has('better-auth.session_token') || request.cookies.has('__Secure-better-auth.session_token')
  
  if (!hasSessionCookie) {
    if (pathname.startsWith('/dashboard/seller')) {
      const res = NextResponse.redirect(new URL('/', request.url))
      res.cookies.delete('x-user-role')
      return res
    }
    const res = NextResponse.next()
    res.cookies.delete('x-user-role')
    return res
  }

  // 1. Resolve the user's role from the Django backend.
  // CRITICAL: We call the Django /api/accounts/profile/ endpoint instead of
  // Better Auth's /api/auth/get-session because:
  // - Django backend BetterAuthMiddleware reads the BA session cookie and
  //   queries the BA user table directly — PROVEN to return the correct role
  //   (the same mechanism that logs "role=SELLER" in the backend logs)
  // - Better Auth's own get-session may not include additionalFields reliably.
  let role: string | null = request.cookies.get('x-user-role')?.value || null
  let fetchedRole = false

  if (!role) {
    try {
      const djangoURL = process.env.DJANGO_INTERNAL_URL || 'http://backend:8000'
      const profileRes = await fetch(`${djangoURL}/api/accounts/profile/`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
          'Accept': 'application/json',
        },
      })
      if (profileRes.ok) {
        const profile = await profileRes.json()
        role = profile?.role ?? 'CUSTOMER'
        fetchedRole = true
      }
    } catch (err) {
      console.error('[Middleware] Django profile check failed:', err)
    }
  }

  const isSeller = role === 'SELLER'

  // 2. SELLER GUARD: Redirect sellers away from non-dashboard routes
  // Exceptions: /auth, /login, /store (live preview from Studio), /logout
  const isAccessingPlatform = !pathname.startsWith('/dashboard') && 
                              !pathname.startsWith('/api') && 
                              !pathname.startsWith('/login') &&
                              !pathname.startsWith('/auth') &&
                              !pathname.startsWith('/store') &&
                              pathname !== '/logout'

  let response = NextResponse.next()

  if (isSeller && isAccessingPlatform) {
    response = NextResponse.redirect(new URL('/dashboard/seller', request.url))
  } else if (pathname.startsWith('/dashboard/seller') && !isSeller) {
    response = NextResponse.redirect(new URL('/', request.url))
  }

  // 4. SET CACHE COOKIE: If we just fetched the role, cache it for 5 minutes.
  // This drastically reduces network calls to the backend on every page load.
  if (fetchedRole && role) {
    response.cookies.set('x-user-role', role, { maxAge: 300, path: '/' })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}