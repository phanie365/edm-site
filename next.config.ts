import type { NextConfig } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const supabase = new URL(supabaseUrl);
const supabaseLocal = ['127.0.0.1', 'localhost'].includes(supabase.hostname);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // 90 pour les grandes photos (accueil), 75 pour le reste
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: supabase.protocol.replace(':', '') as 'http' | 'https',
        hostname: supabase.hostname,
        port: supabase.port,
        pathname: '/storage/v1/object/public/**',
      },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
    ],
    // Uniquement pour Supabase lancé en local (développement) : jamais en production.
    dangerouslyAllowLocalIP: supabaseLocal,
  },
  // L'ancienne page « Notre église » est devenue une fenêtre sur l'accueil
  async redirects() {
    return [
      { source: '/notre-eglise', destination: '/#qui-sommes-nous', permanent: true },
      // « Contact » est désormais une section de « Nous rejoindre »
      { source: '/contact', destination: '/nous-rejoindre#contact', permanent: true },
    ];
  },
  async headers() {
    const securite = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    return [
      { source: '/:path*', headers: securite },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
