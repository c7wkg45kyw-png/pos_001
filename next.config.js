/** @type {import('next').NextConfig} */
const configuredApiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "").replace(/\/+$/, "");
const proxyBaseUrl = configuredApiBaseUrl
  ? configuredApiBaseUrl.endsWith("/api/v1")
    ? configuredApiBaseUrl
    : `${configuredApiBaseUrl}/api/v1`
  : "http://localhost:8080/api/v1";

const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${proxyBaseUrl}/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
