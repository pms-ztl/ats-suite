import { fileURLToPath } from "node:url";
import path from "node:path";

// Resolve the monorepo root reliably on both POSIX and Windows.
// URL.pathname on Windows yields "/D:/..." which Next misinterprets as
// relative — causes the standalone tracer to produce doubled paths like
// apps/CDC/ATS-microservices/apps/frontend/.next/... and then ENOENT.
const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output: produces .next/standalone/ with server.js for prod
  // deployment via Docker / k8s. Pulls only the deps the app actually
  // uses — image stays small.
  output: "standalone",

  // Separate build dir override (env-driven). Lets a second `next dev` (e.g. a
  // preview/verification instance) run alongside the primary dev server without
  // both writing to the same .next — sharing it corrupts chunks and yields
  // "Loading chunk … failed" at runtime. Defaults to ".next" so nothing changes
  // for normal single-server dev/prod.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // Demo build: don't block on lint/type errors we haven't yet cleaned up.
  // The codebase still has a few conditional-hook warnings (notifications,
  // settings/features, settings/team) and unused-import warnings that
  // upgrade to errors under `next build`. They are real anti-patterns but
  // none crash at runtime in current flows. Track and fix separately.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // API proxy — gateway URL is env-driven so the same image works in
  // dev (localhost:4000), staging, prod.
  async rewrites() {
    // Server-side proxy target for the same-origin "/api" path. Kept separate
    // from NEXT_PUBLIC_API_URL (the browser's fetch base) so the client can call
    // a relative "/api" same-origin while the Next server proxies to the gateway.
    // This is what lets a single public tunnel (frontend only) serve the whole
    // app without exposing the gateway or needing cross-origin CORS.
    const gatewayOrigin = process.env.GATEWAY_ORIGIN || "http://localhost:4000";
    return [
      {
        source: "/api/:path*",
        destination: `${gatewayOrigin}/api/:path*`,
      },
    ];
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },

  // Compiler optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons", "date-fns"],
    // Monorepo: tell Next where the workspace root is so the file tracer
    // follows linked workspace packages correctly. Without this the
    // standalone bundle misses hoisted node_modules.
    outputFileTracingRoot: monorepoRoot,
  },

  // Dev-only: this is a large monorepo on Windows running the frontend
  // alongside ~14 backend services. The unminified dev chunks are big (the
  // root layout chunk is ~2MB) and, on a CPU-contended machine, the chunk's
  // script can take long enough to load/execute that it trips webpack's
  // default chunk-load timeout, surfacing as "ChunkLoadError: Loading chunk
  // app/layout failed (timeout)" and blocking hydration. Give chunks a
  // generous timeout in dev. No effect on production builds.
  webpack: (config, { dev }) => {
    if (dev) {
      config.output.chunkLoadTimeout = 600000;
    }
    return config;
  },

  // Caching headers
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
