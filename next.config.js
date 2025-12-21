/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig
