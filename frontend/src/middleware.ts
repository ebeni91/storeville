import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const hostname = req.headers.get('host') || ''
  const mainDomains = ['localhost:3000', '127.0.0.1:3000', 'storeville.app', 'www.storeville.app']

  if (mainDomains.includes(hostname)) {
    return NextResponse.next()
  }

  const subdomain = hostname.split('.')[0]
  // url.pathname = `/store/${subdomain}${url.pathname}`
  const path = url.pathname === '/' ? '' : url.pathname
  url.pathname = `/store/${subdomain}${path}`
  return NextResponse.rewrite(url)
}

// NEW: This explicitly tells Next.js to run this middleware on all routes
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}