import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /explore became the home page's "Hoạt động" tab. Old links keep working;
  // their q, city and page values pass through to the new address.
  async redirects() {
    return [
      {
        source: "/explore",
        destination: "/?tab=activities",
        permanent: false,
      },
    ];
  },
  experimental: {
    agentFeedback: true,
    // A gallery video is at most 50 MB. The proxy buffers the body of /media/upload.
    proxyClientMaxBodySize: "55mb",
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
