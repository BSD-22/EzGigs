/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ["ik.imagekit.io"],
    unoptimized: true,
  },
};

module.exports = nextConfig;
