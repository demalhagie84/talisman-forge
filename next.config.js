/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
        swcMinify: true,
        compiler: {
    removeConsole: process.env.NODE_ENV === "production",
      },
        images: {
    remotePatterns: [
{
        protocol: "https",
                  hostname: "**",
          },
          ],
      },
        experimental: {
    esmExternals: true,
      },
        };

module.exports = nextConfig;
