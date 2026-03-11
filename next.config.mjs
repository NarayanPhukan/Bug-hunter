/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },

  // FIX 13: Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://avatars.githubusercontent.com https://vercel.live https://vercel.com",
              "connect-src 'self' https://api.anthropic.com https://api.github.com https://*.ingest.inngest.com https://vercel.live https://*.vercel.live wss://*.vercel.live https://fonts.googleapis.com https://fonts.gstatic.com",
              "frame-src https://vercel.live",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      // Webhook endpoint: disable CSP (receives raw POST from GitHub)
      {
        source: "/api/webhook",
        headers: [
          { key: "X-Frame-Options",       value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
