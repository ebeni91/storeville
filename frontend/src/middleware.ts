import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Resolve Session from Better Auth
  // We perform an internal fetch to check role-based access at the edge
  let session = null
  try {
    const sessionRes = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get('cookie') || ''
      }
    })
    session = await sessionRes.json()
  } catch (err) {
    console.error("Middleware session check failed:", err)
  }

  const user = session?.user
  const role = user?.role

  // 2. SELLER GUARD: Redirect sellers away from customer storefronts
  // If they are a seller, they should only be in /dashboard/seller or /api routes
  const isSeller = role === 'SELLER'
  const isAccessingPlatform = !pathname.startsWith('/dashboard') && 
                              !pathname.startsWith('/api') && 
                              !pathname.startsWith('/login') &&
                              pathname !== '/logout'

  if (isSeller && isAccessingPlatform) {
     return NextResponse.redirect(new URL('/dashboard/seller', request.url))
  }

  // 3. DASHBOARD PROTECTION: Ensure only sellers access dashboard
  if (pathname.startsWith('/dashboard/seller') && !isSeller) {
     return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}