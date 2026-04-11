import { NextRequest, NextResponse } from 'next/server'

const DJANGO_BACKEND = process.env.DJANGO_BACKEND_URL ?? 'http://backend:8000'

/**
 * 🌟 CRITICAL FIX: Proper Cookie-Forwarding Proxy
 *
 * Next.js rewrites() strip the Cookie header when proxying to an external destination.
 * This means Django's BetterAuthMiddleware never receives "better-auth.session-token",
 * causing it to fall back to the admin Django session → stores get assigned to Super Admin.
 *
 * This API route EXPLICITLY forwards all cookies and headers, solving the hijacking bug.
 */
async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/')
  const backendUrl = `${DJANGO_BACKEND}/api/${path}`

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

  // Ensure host is set to the backend
  forwardedHeaders.set('host', 'backend:8000')

  let body: string | undefined = undefined
  if (!['GET', 'HEAD'].includes(request.method)) {
    body = await request.text()
  }

  try {
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: forwardedHeaders,
      body,
      // Don't follow redirects automatically — pass them through
      redirect: 'manual',
    })

    const responseBody = await response.arrayBuffer()
    const responseHeaders = new Headers()

    response.headers.forEach((value, key) => {
      // Forward response headers that are safe to pass through
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
