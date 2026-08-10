import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Screenshots are the single heaviest asset class in S-OS. Modern formats only.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },

  // The Demo Viewer embeds project demos, so we cannot use DENY. SAMEORIGIN plus a
  // frame-ancestors policy stops S-OS itself being framed by anyone else.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
