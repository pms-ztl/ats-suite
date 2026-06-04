/**
 * Phase 31c — GDPR tenant-wide data export for job-service.
 * Admin-only. Returns every requisition, job posting, and form schema
 * belonging to the caller's tenant.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, getTenantId, requireTenantAdmin } from "@cdc-ats/common";
// GDPR erase runs with an explicit tenant filter; uses the admin client.
import { prismaAdmin as prisma } from "../lib/prisma.js";

const router = Router();

router.get("/tenant/export", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);

    const [requisitions, jobPostings, formSchemas] = await Promise.all([
      prisma.requisition.findMany({ where: { tenantId } }),
      prisma.jobPosting.findMany({ where: { tenantId } }),
      prisma.applicationFormSchema.findMany({ where: { tenantId } }),
    ]);

    ok(res, {
      service: "job",
      counts: {
        requisitions: requisitions.length,
        jobPostings: jobPostings.length,
        formSchemas: formSchemas.length,
      },
      requisitions,
      jobPostings,
      formSchemas,
    });
  } catch (err) { next(err); }
});

export default router;
