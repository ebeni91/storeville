import { NextRequest, NextResponse } from 'next/server'

/**
 * 🌟 CRITICAL FIX: Proper Cookie-Forwarding Proxy
 * 🌟 CRITICAL FIX: Proper Cookie-Forwarding Proxy
 *
 * Next.js rewrites() strip the Cookie header when proxying to an external destination.
 * This means Django's BetterAuthMiddleware never receives "better-auth.session-token",
 * causing it to fall back to the admin Django session → stores get assigned to Super Admin.
 *
 * This API route EXPLICITLY forwards all cookies and headers, solving the hijacking bug.
 */
async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  const DJANGO_BACKEND = process.env.DJANGO_INTERNAL_URL ?? process.env.DJANGO_BACKEND_URL ?? 'http://backend:8000'
  const BASE_URL = new URL(DJANGO_BACKEND)

  // Extract path accurately from nextUrl.pathname
  let path = request.nextUrl.pathname.replace('/api/proxy/', '')
  
  // Django's APPEND_SLASH requires all API endpoints to end with a trailing slash.
  // Next.js automatically strips them, causing infinite redirect loops if we don't fix it right here.
  if (!path.endsWith('/') && !path.includes('.')) {
    path += '/'
  }

  const backendUrl = `${DJANGO_BACKEND}/api/${path}`
  // Only log in development — avoids cluttering Render/Docker production logs
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[PROXY] ${request.method} ${request.nextUrl.pathname} → ${backendUrl}`)
  }

  // Preserve query string
  const url = new URL(backendUrl)
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })

  // Build forwarded headers — CRITICALLY including all cookies
  const forwardedHeaders = new Headers()
  request.headers.forEach((value, key) => {
    // Forward all headers except those Next.js adds internally
    if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
      forwardedHeaders.set(key, value)
    }
  })

  // Ensure host is set to the actual backend hostname (e.g. render.com domain or backend:8000 locally)
  forwardedHeaders.set('host', BASE_URL.host)

  // 🔒 CSRF GUARD: Inject a custom header that Django's BetterAuthAuthentication
  // validates. Browsers cannot set custom headers in cross-origin requests without
  // a CORS preflight — which Django will reject. This acts as a CSRF token.
  forwardedHeaders.set('X-Requested-From', 'storeville-proxy')

  let body: string | undefined = undefined
  if (!['GET', 'HEAD'].includes(request.method)) {
    body = await request.text()
  }

  try {
    let response = await fetch(url.toString(), {
      method: request.method,
      headers: forwardedHeaders,
      body,
      redirect: 'manual',
      cache: 'no-store', // 🌟 FIX: Never cache proxy responses (bypasses poisoned 301 redirect caches)
    })

    // Django's APPEND_SLASH sends a 301/308 redirect when the trailing slash is missing.
    // Follow it internally so the browser never sees a redirect loop.
    if ((response.status === 301 || response.status === 308) && response.headers.get('location')) {
      const redirectLocation = response.headers.get('location')!
      const redirectUrl = redirectLocation.startsWith('http')
        ? new URL(redirectLocation)
        : new URL(redirectLocation, DJANGO_BACKEND)
      // Reattach query params
      request.nextUrl.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value)
      })
      response = await fetch(redirectUrl.toString(), {
        method: request.method,
        headers: forwardedHeaders,
        body,
        redirect: 'manual',
        cache: 'no-store',
      })
    }

    const buffer = await response.arrayBuffer()
    const responseBody = buffer.byteLength === 0 || response.status === 204 ? null : buffer

    const responseHeaders = new Headers()

    response.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    })

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (err) {
    console.error('[Proxy] Backend unreachable:', err)
    return NextResponse.json({ error: 'Backend service unavailable' }, { status: 503 })
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
