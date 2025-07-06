/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'https://ollanbackend.vercel.app/uploads/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ollanbackend.vercel.app',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
