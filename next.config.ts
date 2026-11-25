import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

// The browser never talks to Supabase directly (all queries run on the server),
// so everything can be locked to 'self'. Next.js needs inline scripts for hydration;
// dev mode also needs eval for hot reload.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

// Student contact data: never let browsers or CDNs cache these pages.
const noStore = [{ key: 'Cache-Control', value: 'no-store, max-age=0' }];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/', headers: noStore },
      { source: '/dashboard/:path*', headers: noStore },
      { source: '/login', headers: noStore },
    ];
  },
};

export default nextConfig;
