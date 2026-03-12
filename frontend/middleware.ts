import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  
  // Get the hostname (e.g., 'localhost:3000', 'tomoca.localhost:3000', or 'tomoca.storeville.app')
  const hostname = req.headers.get('host') || ''

  // Define our base domains that should just show the Map Explorer
  const mainDomains = ['localhost:3000', '127.0.0.1:3000', 'storeville.app', 'www.storeville.app']

  // Exclude internal Next.js requests and static files from being intercepted
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.') // skips files like favicon.ico, images, etc.
  ) {
    return NextResponse.next()
  }

  // If the user is on the main domain, let them see the main Map page
  if (mainDomains.includes(hostname)) {
    return NextResponse.next()
  }

  // If we reach here, it's a SUBDOMAIN! 
  // Extract 'tomoca' from 'tomoca.localhost:3000'
  const subdomain = hostname.split('.')[0]

  // Secretly rewrite the URL to our dynamic storefront folder
  // The user's browser still says "tomoca.localhost:3000", but Next.js renders "/store/tomoca"
  url.pathname = `/store/${subdomain}${url.pathname}`
  return NextResponse.rewrite(url)
}