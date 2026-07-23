import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone output keeps the production Docker image small.
  output: 'standalone',
  // The monorepo root, so Next traces workspace files correctly.
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
  typedRoutes: true,
}

export default nextConfig
