/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const internalBackendUrl = (process.env.INTERNAL_BACKEND_URL || '').replace(/\/$/, '');

    if (!internalBackendUrl) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${internalBackendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
