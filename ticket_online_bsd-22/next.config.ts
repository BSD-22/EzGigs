import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.rri.co.id",
        pathname: "/berita/**",
      },
    ],
  },
};

export default nextConfig;
