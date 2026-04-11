/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy to Django backend is handled via src/app/api/proxy/[...path]/route.ts
  // which correctly forwards Cookie headers (unlike rewrites() which strip them).
}

module.exports = nextConfig
