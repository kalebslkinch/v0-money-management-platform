/** @type {import('next').NextConfig} */
const nextConfig = {
  bundlePagesRouterDependencies: true,
  transpilePackages: ['styled-jsx'],
  outputFileTracingIncludes: {
    '/*': ['./node_modules/styled-jsx/**/*'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
