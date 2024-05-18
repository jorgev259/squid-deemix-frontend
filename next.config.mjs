/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'git-scm.com'
      }
    ]
  }
}

export default nextConfig
