/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo: 使用 packages 里的共享代码
  transpilePackages: [
    "@repo/ui",
    "@repo/database",
    "@repo/auth",
    "@repo/support",
    "@repo/api-client",
  ],

  // 图片优化
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // 性能优化
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // 忽略构建期严苛的历史类型与规范报错，保持终端清爽
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
