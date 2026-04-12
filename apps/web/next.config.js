/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 禁用 Turbopack，使用传统的 webpack 构建
    turbo: false,
  },
  // 如果需要，可以配置其他选项
}

module.exports = nextConfig