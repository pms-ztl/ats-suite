/**
 * Module F — internal onboarding routes (authenticated, recruiter/admin).
 * Mounted at /internal/onboarding-cases (gateway: /api/onboarding-cases).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { openCase } from "../lib/case-service.js";
import { getPresignedDownloadUrl } from "../lib/storage.js";

const router = Router();
// Onboarding is a hiring/HR function. Gate every route (reads carry candidate PII:
// names/emails, KYC/PAN/bank verifications, presigned document links) to the
// recruiting/hiring side + HR + admins. Interviewers/leadership have no onboarding
// role. HR_MANAGER added here (was recruiter/admin only) since onboarding is HR.
const requireRecruiter = requireRole("ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER");

// GET /internal/onboarding-cases — list the tenant's onboarding cases.
router.get("/", requireRecruiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    getTenantId(req);
    const rows = await prisma.onboardingCase.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { tasks: true, verifications: true },
    });
    // Lightweight progress summary per case for the recruiter board.
    const data = rows.map((c) => {
      const required = c.tasks.filter((t) => t.required);
      const done = required.filter((t) => t.status === "DONE" || t.status === "WAIVED").length;
      return {
        id: c.id, candidateId: c.candidateId, candidateName: c.candidateName,
        candidateEmail: c.candidateEmail, jobTitle: c.jobTitle, status: c.status,
        startDate: c.startDate, createdAt: c.createdAt,
        progress: { done, total: required.length },
        verifications: c.verifications.map((v) => ({ type: v.type, status: v.status })),
      };
    });
    ok(res, data);
  } catch (err) { next(err); }
});

// GET /internal/onboarding-cases/:id — full case detail.
router.get("/:id", requireRecruiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    getTenantId(req);
    const id = req.params["id"] as string;
    const c = await prisma.onboardingCase.findUnique({
      where: { id },
      include: { tasks: { orderBy: { order: "asc" } }, documents: true, verifications: true },
    });
    if (!c) throw Errors.notFound("Onboarding case");
    ok(res, c);
  } catch (err) { next(err); }
});

// GET /internal/onboarding-cases/:id/tasks/:taskId/document — recruiter-side
// presigned download for a document a candidate uploaded. RLS-scoped: the task is
// re-read on the request client so a recruiter can only reach their own tenant's
// documents. Returns 404 (not 200 with a fake URL) when nothing was uploaded or
// storage is unavailable — never a fabricated link.
router.get("/:id/tasks/:taskId/document", requireRecruiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    getTenantId(req);
    const caseId = req.params["id"] as string;
    const taskId = req.params["taskId"] as string;
    const task = await prisma.onboardingTask.findFirst({ where: { id: taskId, caseId } });
    if (!task) throw Errors.notFound("Task");
    if (!task.documentStorageKey) throw Errors.notFound("Uploaded document");
    const url = await getPresignedDownloadUrl(task.documentStorageKey);
    if (!url) throw Errors.notFound("Document storage is not available");
    ok(res, { url, fileName: task.documentFileName, contentType: task.documentContentType });
  } catch (err) { next(err); }
});

const OpenCaseSchema = z.object({
  candidateId: z.string().uuid(),
  applicationId: z.string().uuid().optional(),
  offerId: z.string().uuid().optional(),
  candidateName: z.string().optional(),
  candidateEmail: z.string().email().optional(),
  jobTitle: z.string().optional(),
  startDate: z.string().datetime().optional(),
});

// POST /internal/onboarding-cases — manually open a case (e.g. from a Hire action
// that does not go through the offer.accepted event).
router.post("/", requireRecruiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = OpenCaseSchema.parse(req.body);
    const { case: c, created: wasCreated } = await openCase({
      tenantId,
      candidateId: body.candidateId,
      applicationId: body.applicationId ?? null,
      offerId: body.offerId ?? null,
      candidateName: body.candidateName ?? null,
      candidateEmail: body.candidateEmail ?? null,
      jobTitle: body.jobTitle ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
    });
    if (wasCreated) created(res, c); else ok(res, c);
  } catch (err) { next(err); }
});

export default router;
