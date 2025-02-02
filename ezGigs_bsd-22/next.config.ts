import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.rri.co.id",
        pathname: "/berita/**",
      },
      {
        protocol: "https",
        hostname: "static.promediateknologi.id",
      },
    ],
  },
};

export default nextConfig;
