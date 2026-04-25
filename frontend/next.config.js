/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy to Django backend is handled via src/app/api/proxy/[...path]/route.ts
  // which correctly forwards Cookie headers (unlike rewrites() which strip them).

  // ✅ FIX (Issue #14): Add HTTP security headers to all Next.js responses.
  // These provide browser-side defense against XSS, clickjacking, and MIME sniffing.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // Prevents embedding this site in any <iframe> on a different origin (clickjacking).
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Prevents browsers from sniffing a response's content type (MIME confusion attacks).
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Don't send Referer header for cross-origin requests to avoid leaking URLs.
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Permissions policy — disable APIs we don't use.
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), payment=()',
          },
          {
            // Content Security Policy — baseline defence against XSS.
            // 'unsafe-inline' is required for styled-components / next/font and our
            // dangerouslySetInnerHTML CSS blocks. When the review system is built
            // and dangerouslySetInnerHTML is removed, nonces can be added to tighten this.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",   // unsafe-eval required by Next.js dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",               // https: allows any CDN image src
              "connect-src 'self' https: wss:",                  // API calls + WebSocket
              "media-src 'self'",
              "frame-ancestors 'none'",                           // belt-and-suspenders with X-Frame-Options
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
