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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
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
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
