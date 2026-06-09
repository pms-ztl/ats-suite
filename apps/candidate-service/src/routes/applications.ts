/**
 * Application + ApplicationAttachment routes.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1: candidate-facing operations need ADMIN/RECRUITER/HIRING_MANAGER.
// INTERVIEWER cannot create/update applications or upload attachments.
const requireRecruiterOrAdmin = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");
import { ApplicationStageSchema, ApplicationStatusSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";

const router = Router();

const CreateApplicationSchema = z.object({
  candidateId: z.string().uuid(),
  requisitionId: z.string().uuid(),
  // nullish so callers (e.g. public apply with no cover letter) may send null
  notes: z.string().nullish(),
  formResponses: z.record(z.string(), z.unknown()).optional(),
  stage: ApplicationStageSchema.optional(),
});

// POST /internal/applications
router.post("/", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateApplicationSchema.parse(req.body);
    // Verify candidate exists in this tenant
    const candidate = await prisma.candidate.findFirst({
      where: { id: body.candidateId, tenantId }, select: { id: true },
    });
    if (!candidate) throw Errors.notFound("Candidate");

    const app = await prisma.application.create({
      data: {
        tenantId,
        candidateId: body.candidateId,
        requisitionId: body.requisitionId,
        notes: body.notes ?? null,
        formResponses: body.formResponses as any,
        stage: body.stage ?? "APPLIED",
        status: "ACTIVE",
      },
    });
    created(res, app);
  } catch (err) { next(err); }
});

// GET /internal/applications?requisitionId=&stage=
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const requisitionId = req.query["requisitionId"] as string | undefined;
    const stage = req.query["stage"] as string | undefined;
    const where: any = { tenantId };
    if (requisitionId) where.requisitionId = requisitionId;
    if (stage) where.stage = stage;
    const apps = await prisma.application.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      take: 200,
      include: { candidate: { select: { firstName: true, lastName: true, email: true } } },
    });
    ok(res, apps);
  } catch (err) { next(err); }
});

// GET /internal/applications/time-to-hire
// Time-to-hire trend over the trailing ~12 months. A "hire" is an Application
// whose stage = HIRED; we approximate its hire date with stageUpdatedAt (the last
// stage transition) and compute time-to-hire days as (stageUpdatedAt - appliedAt)
// in whole-day units. Returned series is grouped by hire-month with per-month and
// overall avg/median/p90. Percentiles are computed in JS from the per-hire deltas
// (no raw-SQL percentile). Zero hires -> empty `trend` array (honest empty state).
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  if (sortedAsc.length === 1) return sortedAsc[0]!;
  // nearest-rank on a 0..1 fraction; clamp the index into range.
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.ceil(p * sortedAsc.length) - 1));
  return sortedAsc[idx]!;
}
function summarize(deltas: number[]): { avgDays: number; medianDays: number; p90Days: number; hires: number } {
  const hires = deltas.length;
  if (hires === 0) return { avgDays: 0, medianDays: 0, p90Days: 0, hires: 0 };
  const sorted = deltas.slice().sort((a, b) => a - b);
  const sum = sorted.reduce((acc, d) => acc + d, 0);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
  return {
    avgDays: Math.round((sum / hires) * 10) / 10,
    medianDays: Math.round(median * 10) / 10,
    p90Days: Math.round(percentile(sorted, 0.9) * 10) / 10,
    hires,
  };
}
router.get("/time-to-hire", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    // Window: start of the month 11 months ago (gives a trailing 12-month span).
    const now = new Date();
    const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));

    const hires = await prisma.application.findMany({
      where: { tenantId, stage: "HIRED", stageUpdatedAt: { gte: windowStart } },
      select: { appliedAt: true, stageUpdatedAt: true },
      take: 5000,
    });

    // Bucket per-hire deltas by hire-month (keyed YYYY-MM).
    const buckets = new Map<string, number[]>();
    const allDeltas: number[] = [];
    for (const h of hires) {
      const hiredAt = h.stageUpdatedAt ?? h.appliedAt;
      const tth = (hiredAt.getTime() - h.appliedAt.getTime()) / 86_400_000;
      if (!Number.isFinite(tth) || tth < 0) continue; // skip dirty rows (hire before apply)
      const key = `${hiredAt.getUTCFullYear()}-${String(hiredAt.getUTCMonth() + 1).padStart(2, "0")}`;
      const list = buckets.get(key) ?? [];
      list.push(tth);
      buckets.set(key, list);
      allDeltas.push(tth);
    }

    // Emit one row per month across the full window so the trend has continuous
    // x-axis labels; months with no hires report hires:0 and zeroed stats.
    const trend: { month: string; label: string; hires: number; avgDays: number; medianDays: number; p90Days: number }[] = [];
    if (allDeltas.length > 0) {
      for (let i = 0; i < 12; i++) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1));
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
        const s = summarize(buckets.get(key) ?? []);
        trend.push({ month: key, label: MONTH_LABELS[d.getUTCMonth()]!, ...s });
      }
    }

    ok(res, { trend, overall: summarize(allDeltas) });
  } catch (err) { next(err); }
});

// PATCH /internal/applications/:id
const UpdateApplicationSchema = z.object({
  stage: ApplicationStageSchema.optional(),
  status: ApplicationStatusSchema.optional(),
  notes: z.string().optional(),
});
// Phase 27 F-027-micro-a + F-028-micro-P1: gate + scope mutation by tenantId.
router.patch("/:id", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = UpdateApplicationSchema.parse(req.body);
    const existing = await prisma.application.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Application");
    const data: any = { ...body };
    if (body.stage) data.stageUpdatedAt = new Date();
    // defense-in-depth: updateMany with tenantId filter on the mutation itself.
    const { count } = await prisma.application.updateMany({ where: { id, tenantId }, data });
    if (count === 0) throw Errors.notFound("Application");
    const updated = await prisma.application.findUnique({ where: { id } });
    ok(res, updated);
  } catch (err) { next(err); }
});

// POST /internal/attachments — record metadata after file is stored
const CreateAttachmentSchema = z.object({
  applicationId: z.string(),
  fieldId: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  fileSize: z.number().int(),
  mimeType: z.string(),
  storageKey: z.string(),
});
router.post("/attachments", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateAttachmentSchema.parse(req.body);
    const att = await prisma.applicationAttachment.create({
      data: { tenantId, ...body },
    });
    created(res, att);
  } catch (err) { next(err); }
});

export default router;
