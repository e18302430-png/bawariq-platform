/** @type {import('next').NextConfig} */
const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:8000";

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND}/api/:path*` }];
  },
  experimental: { proxyTimeout: 300_000 },
};

export default nextConfig;
