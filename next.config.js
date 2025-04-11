/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // This will be used for tenant identification
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'x-tenant-id',
            value: ':tenantId',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;