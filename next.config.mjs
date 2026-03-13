// frontend/next.config.mjs
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
