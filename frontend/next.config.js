/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable server-side rendering for SEO
  output: 'standalone',
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  // Image optimization (if needed for future enhancements)
  images: {
    domains: [],
  },
}

module.exports = nextConfig
