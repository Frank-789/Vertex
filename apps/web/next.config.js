/** @type {import('next').NextConfig} */
const nextConfig = {
  // 使用 SWC 而不是 Turbopack
  swcMinify: true,
  experimental: {
    // 明确禁用 Turbopack
    turbo: {
      enabled: false,
    },
  },
}

module.exports = nextConfig