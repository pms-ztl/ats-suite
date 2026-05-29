/** Thin HTTP layer: validate -> delegate to the service -> respond. */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, getTenantId } from "@cdc-ats/common";
import { IngestBody } from "../schemas/analytics.schemas.js";
import * as analyticsService from "../services/analytics.service.js";

const router = Router();

router.post("/ingest", async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await analyticsService.ingest(getTenantId(req), IngestBody.parse(req.body)));
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
