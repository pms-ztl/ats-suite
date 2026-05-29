import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, getTenantId } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

// POST /internal/analytics/ingest  { metric, dimension?, period?, delta? }
const IngestBody = z.object({
  metric: z.string().min(1).max(80),
  dimension: z.string().max(120).default("all"),
  period: z.string().max(20).default("all"),
  delta: z.number().int().default(1),
});
router.post("/ingest", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const b = IngestBody.parse(req.body);
    const row = await prisma.metricRollup.upsert({
      where: { tenantId_metric_dimension_period: { tenantId, metric: b.metric, dimension: b.dimension, period: b.period } },
      create: { tenantId, metric: b.metric, dimension: b.dimension, period: b.period, value: b.delta },
      update: { value: { increment: b.delta } },
    });
    ok(res, { metric: row.metric, dimension: row.dimension, period: row.period, value: row.value });
  } catch (err) { next(err); }
});

// GET /internal/analytics/summary
router.get("/summary", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const rollups = await prisma.metricRollup.findMany({ where: { tenantId }, orderBy: { metric: "asc" } });
    ok(res, { count: rollups.length, rollups });
  } catch (err) { next(err); }
});

// GET /internal/analytics/funnel — the canonical hiring funnel.
const STAGES = ["applied", "screened", "interviewed", "offered", "hired"];
router.get("/funnel", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const rows = await prisma.metricRollup.findMany({
      where: { tenantId, metric: { in: STAGES }, dimension: "all", period: "all" },
    });
    const byMetric: Record<string, number> = {};
    for (const r of rows) byMetric[r.metric] = (byMetric[r.metric] ?? 0) + r.value;
    const funnel = STAGES.map((s, i) => {
      const count = byMetric[s] ?? 0;
      const prev = i > 0 ? byMetric[STAGES[i - 1]!] ?? 0 : count;
      return { stage: s, count, conversionFromPrev: prev ? Number((count / prev).toFixed(3)) : null };
    });
    ok(res, { funnel });
  } catch (err) { next(err); }
});

// GET /internal/analytics/metrics?metric=&period=
router.get("/metrics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const metric = req.query["metric"] as string | undefined;
    const period = req.query["period"] as string | undefined;
    const where: { tenantId: string; metric?: string; period?: string } = { tenantId };
    if (metric) where.metric = metric;
    if (period) where.period = period;
    const rows = await prisma.metricRollup.findMany({ where, orderBy: { updatedAt: "desc" }, take: 200 });
    ok(res, rows);
  } catch (err) { next(err); }
});

export default router;
