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

  async rewrites() {
    return [
      {
        source: '/vendor/:slug/:path*',
        destination: 'https://spotcove.com/vendor/:slug/:path*',
      },
    ]
  },
};

export default nextConfig;
