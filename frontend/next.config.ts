import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  (isProd ? "https://autopilot-stellar-mauve-rqs0.onrender.com" : "http://localhost:3001")
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxy all /api/* calls from the frontend → the Fastify backend
        // Works both in development (localhost:3001) and production (Render URL)
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
