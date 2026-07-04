/** Thin HTTP layer: validate -> delegate to the service -> respond. */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, getTenantId, getUserId, createLogger } from "@cdc-ats/common";
import { IngestBody } from "../schemas/analytics.schemas.js";
import * as analyticsService from "../services/analytics.service.js";
import { rollupTenant } from "../lib/rollup.js";

const router = Router();
const rollupLogger = createLogger({ serviceName: "analytics-service:rollup-route" });

router.post("/ingest", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await analyticsService.ingest(getTenantId(req), IngestBody.parse(req.body)));
  } catch (err) { next(err); }
});

// POST /internal/analytics/rollup/run — recompute THIS tenant's MetricRollup
// funnel from candidate-service's real per-stage counts, on demand. Complements the
// periodic sweep so a caller can refresh /reporting immediately (e.g. right after a
// pipeline change) instead of waiting for the next tick. tenant-scoped: it only
// rolls up the caller's own tenant. Returns { refreshed } — false when
// candidate-service was unreachable (rollup left untouched, no fabricated data).
router.post("/rollup/run", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    getUserId(req); // presence-check (readAuthHeaders already enforced auth headers)
    const refreshed = await rollupTenant(tenantId, rollupLogger);
    ok(res, { refreshed });
  } catch (err) { next(err); }
});

router.get("/summary", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await analyticsService.summary(getTenantId(req)));
  } catch (err) { next(err); }
});

router.get("/funnel", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, { funnel: await analyticsService.funnel(getTenantId(req)) });
  } catch (err) { next(err); }
});

router.get("/metrics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metric = req.query["metric"] as string | undefined;
    const period = req.query["period"] as string | undefined;
    ok(res, await analyticsService.metrics(getTenantId(req), metric, period));
  } catch (err) { next(err); }
});

export default router;
