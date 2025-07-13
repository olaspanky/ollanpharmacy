/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static site generation
  async rewrites() {
    return [
      {
        source: '/Uploads/:path*',
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
        unoptimized: true

  },
};

module.exports = nextConfig;