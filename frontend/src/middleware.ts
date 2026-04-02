import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Create a response object to potentially modify
  const response = NextResponse.next()

  // Provide basic protection
  if (pathname.startsWith('/dashboard')) {
    const sellerCookie = request.cookies.get('seller_refresh_token')
    if (!sellerCookie) {
      // If there's no seller token, they definitely aren't logged in as a seller
      // We could redirect here if there was a dedicated seller login page, 
      // but for now, we just pass through and let AuthProvider handle it.
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}