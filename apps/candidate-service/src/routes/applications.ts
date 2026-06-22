/**
 * Application + ApplicationAttachment routes.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole, createLogger } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1: candidate-facing operations need ADMIN/RECRUITER/HIRING_MANAGER.
// INTERVIEWER cannot create/update applications or upload attachments.
const requireRecruiterOrAdmin = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");
import { ApplicationStageSchema, ApplicationStatusSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";
import { approveOfferInternal } from "../lib/offer-approve.js";
import {
  resolveRequisitionContext,
  stakeholderIds,
  publishApplicationHired,
  publishApplicationRejected,
  rejectionReasonLabel,
} from "../lib/decision-events.js";

const router = Router();
const logger = createLogger({ serviceName: "candidate-service:decisions" });

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

// ── Module E — hire / reject decision flow ──────────────────────────────────
// These drive the terminal decision on an application and publish the lifecycle
// events notification-service + onboarding-service subscribe to.

// POST /internal/applications/:id/hire
// Marks the application HIRED (idempotent) and publishes application.hired with
// the candidate + job context and the stakeholder user ids to notify.
router.post("/:id/hire", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const userId = (req.headers["x-user-id"] as string) || null;
    const role = (req.headers["x-user-role"] as string) || "ADMIN";

    const application = await prisma.application.findFirst({
      where: { id, tenantId },
      include: { candidate: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!application) throw Errors.notFound("Application");

    // Idempotent: if already HIRED, do not re-stamp or re-publish.
    const alreadyHired = application.stage === "HIRED";
    let updated = application;
    if (!alreadyHired) {
      const now = new Date();
      // defense-in-depth: scope the mutation by tenantId too.
      const { count } = await prisma.application.updateMany({
        where: { id, tenantId },
        data: { stage: "HIRED", status: "HIRED", stageUpdatedAt: now },
      });
      if (count === 0) throw Errors.notFound("Application");
      updated = { ...application, stage: "HIRED", status: "HIRED", stageUpdatedAt: now };

      const ctx = await resolveRequisitionContext({ requisitionId: application.requisitionId, tenantId, userId, role });
      const candidateName = `${application.candidate.firstName} ${application.candidate.lastName}`.trim();
      // Leg 1 + 2: application.hired drives the onboarding case (onboarding-service)
      // and the stakeholder notice (notification-service).
      await publishApplicationHired(
        {
          tenantId,
          applicationId: application.id,
          candidateId: application.candidateId,
          requisitionId: application.requisitionId,
          candidateName: candidateName || null,
          candidateEmail: application.candidate.email ?? null,
          jobTitle: ctx.title,
          decidedByUserId: userId,
          stakeholderUserIds: stakeholderIds(ctx),
        },
        logger,
      );

      // Leg 3 (one-click): ensure an Offer exists for this application and run
      // the SAME approve body as the Offers "Approve" button: render the
      // offer-letter PDF and publish offer.approved, which is what makes
      // notification-service email the CANDIDATE the offer + letter reference.
      // Best-effort: a failure here never undoes the HIRED mark or the onboarding
      // case, those already fired above.
      try {
        let offer = await prisma.offer.findFirst({ where: { tenantId, applicationId: id } });
        if (!offer) {
          // Minimal DRAFT so the letter renders. No requisition comp data is
          // resolved here (we never fabricate a salary figure); a 0/USD
          // placeholder is used and can be edited on the Offer record later.
          offer = await prisma.offer.create({
            data: {
              tenantId,
              candidateId: application.candidateId,
              requisitionId: application.requisitionId,
              applicationId: id,
              baseSalary: 0,
              currency: "USD",
              status: "DRAFT",
            },
          });
        }
        await approveOfferInternal(offer.id, tenantId, userId, role, logger);
      } catch (err) {
        logger.warn({ err, applicationId: id }, "hire: auto offer-approve failed (HIRED + onboarding unaffected)");
      }
    }

    ok(res, { id: updated.id, stage: updated.stage, status: updated.status, stageUpdatedAt: updated.stageUpdatedAt, alreadyHired });
  } catch (err) { next(err); }
});

// POST /internal/applications/:id/reject  { reasonCode?: string }
// Marks the application REJECTED (idempotent) and publishes application.rejected.
// The candidate-facing reason is a reason-code LABEL — never raw notes.
const RejectSchema = z.object({
  // A stable reason CODE (mapped to a courteous label); free-text notes are
  // NOT surfaced to the candidate.
  reasonCode: z.string().max(64).optional(),
  reason: z.string().max(64).optional(), // accepted alias for reasonCode
});
router.post("/:id/reject", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const userId = (req.headers["x-user-id"] as string) || null;
    const role = (req.headers["x-user-role"] as string) || "ADMIN";
    const body = RejectSchema.parse(req.body ?? {});
    const reasonLabel = rejectionReasonLabel(body.reasonCode ?? body.reason ?? null);

    const application = await prisma.application.findFirst({
      where: { id, tenantId },
      include: { candidate: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!application) throw Errors.notFound("Application");

    const alreadyRejected = application.stage === "REJECTED";
    let updated = application;
    if (!alreadyRejected) {
      const now = new Date();
      const { count } = await prisma.application.updateMany({
        where: { id, tenantId },
        data: { stage: "REJECTED", status: "REJECTED", stageUpdatedAt: now },
      });
      if (count === 0) throw Errors.notFound("Application");
      updated = { ...application, stage: "REJECTED", status: "REJECTED", stageUpdatedAt: now };

      const ctx = await resolveRequisitionContext({ requisitionId: application.requisitionId, tenantId, userId, role });
      const candidateName = `${application.candidate.firstName} ${application.candidate.lastName}`.trim();
      await publishApplicationRejected(
        {
          tenantId,
          applicationId: application.id,
          candidateId: application.candidateId,
          candidateName: candidateName || null,
          candidateEmail: application.candidate.email ?? null,
          jobTitle: ctx.title,
          reason: reasonLabel,
          decidedByUserId: userId,
        },
        logger,
      );
    }

    ok(res, { id: updated.id, stage: updated.stage, status: updated.status, stageUpdatedAt: updated.stageUpdatedAt, alreadyRejected });
  } catch (err) { next(err); }
});

export default router;
