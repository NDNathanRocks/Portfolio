import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    // The Clarity demo is a static Expo web export. Serve its index at a clean URL, and fall back to it for
    // client-side routes (e.g. /demos/clarity/Home) so a refresh in a full-screen tab still works.
    return {
      beforeFiles: [{ source: "/demos/clarity", destination: "/demos/clarity/index.html" }],
      afterFiles: [],
      fallback: [{ source: "/demos/clarity/:path*", destination: "/demos/clarity/index.html" }],
    };
  },
  async redirects() {
    // DualSight was called "Aegis AI Race"; keep old links and search results working.
    return [{ source: "/projects/aegis-ai-race", destination: "/projects/dualsight", permanent: true }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          // Report-only until it has been watched in the console: the WASM demos and the inline theme script are the risk.
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://aegis-ai-race-api.onrender.com https://aegis-ai-race.vercel.app",
              "worker-src 'self' blob:",
              "frame-src 'self' https://aegis-ai-race.vercel.app",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      // Nothing may frame the site, except our own pages framing the self-hosted Clarity demo.
      {
        source: "/((?!demos/clarity).*)",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
      {
        source: "/demos/clarity/:path*",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
      {
        source: "/demos/clarity",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
      // Big, rarely-changing demo assets (OpenCV.js, ONNX runtime and model, sample images).
      {
        source: "/demos/:dir(opencv|ort|models|stitch|binit)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/Nathan_DSouza_Resume.pdf",
        // Same URL for every version (see `npm run resume`), so browsers must re-check it rather than keep an old copy.
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
