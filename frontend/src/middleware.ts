import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const hostname = req.headers.get('host') || ''
  
  // Define domains that belong to the core platform, NOT merchants
  const mainDomains = [
    'localhost:3000', 
    '127.0.0.1:3000', 
    'storeville.test:3000', // Local main domain
    'api.storeville.test:8000', // Backend API
    'storeville.app',       // Prod main domain
    'www.storeville.app',
    'api.storeville.app'
  ]

  // If the user is on the main site, let them pass normally
  if (mainDomains.includes(hostname)) {
    return NextResponse.next()
  }

  // Otherwise, extract the subdomain (e.g., 'sami-caffee' from 'sami-caffee.storeville.test:3000')
  const subdomain = hostname.split('.')[0]
  
  // Rewrite the internal path to point to your dynamic store folder
  const path = url.pathname === '/' ? '' : url.pathname
  url.pathname = `/store/${subdomain}${path}`
  
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Skip all API routes, static files, and images
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}