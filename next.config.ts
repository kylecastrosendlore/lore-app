import type { NextConfig } from "next";

/* Security headers applied to every response.
   - HSTS: forces HTTPS on sendlore.com and subdomains
   - X-Frame-Options + CSP frame-ancestors: prevents clickjacking
   - X-Content-Type-Options: blocks MIME sniffing
   - Referrer-Policy: don't leak full URLs (which may carry ?t= tokens) to other origins
   - Permissions-Policy: deny sensitive browser features by default */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
