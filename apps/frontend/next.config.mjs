/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output: required for the multi-stage Docker build in
  // infra/Dockerfile.frontend (copies .next/standalone + .next/static).
  output: "standalone",
  // Monorepo: tell Next where the workspace root actually lives so the
  // file tracer follows linked workspace packages correctly.
  // (Next 14 nests this under experimental; promoted to top level in Next 15.)
  experimental: {
    outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
  },

  // Demo build: don't block on lint/type errors we haven't yet cleaned up.
  // See next.config.ts for the same flags + reasoning.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
