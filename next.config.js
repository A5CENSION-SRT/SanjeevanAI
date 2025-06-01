/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['localhost'],
    },
    experimental: {
        serverComponentsExternalPackages: ['bcryptjs', 'jsonwebtoken'],
    },
    skipMiddlewareUrlNormalize: true,
    skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;