/** @type {import('next').NextConfig} */
const nextConfig = {
  // パフォーマンス最適化
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    // モダンなNext.jsの機能を有効化
    serverActions: true,
    typedRoutes: true,
  },

  // 画像最適化
  images: {
    // 本番環境では必要に応じてfalseに設定することを推奨
    unoptimized: true,
    // 必要な外部ドメインがある場合は追加
    domains: [],
    remotePatterns: [],
  },

  // TypeScriptとESLintの設定
  // 開発時はエラーチェックを有効にすることを推奨
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // パフォーマンス最適化
  poweredByHeader: false,
  reactStrictMode: true,
  
  // 必要に応じてカスタムヘッダーを追加
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

export default nextConfig
