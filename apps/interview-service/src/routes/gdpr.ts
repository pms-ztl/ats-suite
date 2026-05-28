/**
 * Phase 31c — GDPR tenant-wide data export for interview-service.
 * Admin-only. Returns rounds + interviews + per-round panelist assignments.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, getTenantId, requireTenantAdmin } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/tenant/export", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);

    const [rounds, interviews] = await Promise.all([
      prisma.interviewRound.findMany({ where: { tenantId } }),
      prisma.interview.findMany({ where: { tenantId } }),
    ]);

    ok(res, {
      service: "interview",
      counts: {
        rounds: rounds.length,
        interviews: interviews.length,
      },
      rounds,
      interviews,
    });
  } catch (err) { next(err); }
});

export default router;
