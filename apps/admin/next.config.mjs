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
    serverComponentsExternalPackages: ["jsdom"],
  },

  // 放行开发与打包期间的类型及格式检查（因为历史包袱过重），避免终端刷屏报错
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
