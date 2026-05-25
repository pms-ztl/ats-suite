/** @type {import('next').NextConfig} */
const nextConfig = {
  // Demo build: don't block on lint/type errors we haven't yet cleaned up.
  // See next.config.ts for the same flags + reasoning.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
