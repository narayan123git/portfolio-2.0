/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.INTERNAL_BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
