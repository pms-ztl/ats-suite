/**
 * Standard health endpoint factory. Every service mounts this at "/".
 *   GET /healthz  — process is alive
 *   GET /livez    — process is responsive (used by k8s liveness probe)
 *   GET /readyz   — all dependencies (DB, Redis, NATS) are reachable
 */
import { Router, type Request, type Response } from "express";

export type DependencyCheck = () => Promise<boolean>;

export interface HealthRouterOptions {
  /** Map of dependency name → async check function returning true if healthy. */
  dependencies?: Record<string, DependencyCheck>;
  /** Service version (defaults to env SERVICE_VERSION). */
  version?: string;
}

export function createHealthRouter(opts: HealthRouterOptions = {}): Router {
  const router = Router();
  const startedAt = Date.now();
  const version = opts.version ?? process.env["SERVICE_VERSION"] ?? "0.0.1";

  router.get("/healthz", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      version,
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    });
  });

  router.get("/livez", (_req: Request, res: Response) => {
    res.json({ status: "alive" });
  });

  router.get("/readyz", async (_req: Request, res: Response) => {
    const checks = opts.dependencies ?? {};
    const results: Record<string, "ok" | "fail"> = {};
    let allOk = true;
    for (const [name, check] of Object.entries(checks)) {
      try {
        const isOk = await Promise.race([
          check(),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000)),
        ]);
        results[name] = isOk ? "ok" : "fail";
        if (!isOk) allOk = false;
      } catch {
        results[name] = "fail";
        allOk = false;
      }
    }
    res.status(allOk ? 200 : 503).json({
      status: allOk ? "ready" : "degraded",
      dependencies: results,
    });
  });

  return router;
}
