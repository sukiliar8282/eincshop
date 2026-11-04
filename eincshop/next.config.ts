import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // IP lokal hanya diizinkan saat mode pengembangan, otomatis nonaktif saat production
  ...(isDev && {
    allowedDevOrigins: ["192.168.1.64", "localhost:3000"],
  }),

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Cegah MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Cegah kebocoran referrer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Cegah clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Batasi akses sensor hardware browser
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          // HSTS: Memaksa browser hanya berkomunikasi via HTTPS terenkripsi
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Proteksi XSS warisan browser
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Isolasi jendela browsing (aman dan kompatibel dengan Google OAuth)
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          // DNS prefetch control
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
