/**
 * PUBLIC application-status lookup — the candidate-portal /status page calls this
 * to see where their OWN application stands, with NO login and NO tenant header.
 *
 * CROSS-LANE CONTRACT (consumed by the frontend /status page):
 *   GET /api/public/applications/status?email=<e>&jobSlug=<s>
 *     -> 200 { stage, updatedAt, jobTitle }   (the applicant's own application)
 *     -> 404 honest-empty                       (no matching application)
 *
 * Privacy posture: this is an UNAUTHENTICATED surface, so it must leak NOTHING
 * beyond the single applicant's own stage for the one job they name. We therefore
 * require BOTH an exact email AND the jobSlug and match on the intersection; we
 * never list applications, never return PII (no name/phone/notes/scores), and
 * never reveal whether an email exists for a DIFFERENT job (an unmatched lookup
 * is the same 404 whether the email is unknown or simply did not apply here).
 *
 * Tenancy: there is no tenant context on a public call, so we resolve the tenant
 * FROM the public job slug (the job-service public-by-slug idiom) and then use
 * prismaAdmin scoped by that tenantId + the applicant's email. A slug is globally
 * unique per (tenant, slug) and job-service only serves PUBLISHED postings, so the
 * slug alone pins exactly one tenant + requisition.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors, createLogger } from "@cdc-ats/common";
import { prismaAdmin } from "../lib/prisma.js";

const router = Router();
const logger = createLogger({ serviceName: "candidate-service:public-status" });

/**
 * Resolve a public job slug to its tenant + requisition + title via job-service.
 * Best-effort HTTP against the SAME public-by-slug route the apply flow uses.
 * Any failure (job-service unreachable, slug unknown/unpublished) yields null so
 * the caller returns an honest 404 rather than surfacing an internal error.
 */
async function resolveJobBySlug(slug: string): Promise<{
  tenantId: string;
  requisitionId: string;
  title: string | null;
} | null> {
  const jobUrl = process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";
  try {
    const res = await fetch(`${jobUrl}/public/jobs/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: Record<string, unknown> };
    const posting = body.data ?? {};
    const tenantId = typeof posting["tenantId"] === "string" ? (posting["tenantId"] as string) : null;
    const requisitionId =
      typeof posting["requisitionId"] === "string" ? (posting["requisitionId"] as string) : null;
    const requisition = (posting["requisition"] ?? {}) as Record<string, unknown>;
    const title =
      typeof requisition["title"] === "string"
        ? (requisition["title"] as string)
        : typeof posting["title"] === "string"
          ? (posting["title"] as string)
          : null;
    if (!tenantId || !requisitionId) return null;
    return { tenantId, requisitionId, title };
  } catch (err) {
    logger.warn({ err, slug }, "public-status: job slug resolve failed");
    return null;
  }
}

// GET /applications/status?email=&jobSlug=
// Mounted (see app.ts) at /public/applications so the full path is
// GET /public/applications/status, reached publicly via the gateway
// /api/public/applications/status proxy.
router.get("/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const emailRaw = (req.query["email"] as string | undefined) ?? "";
    // Accept `jobSlug` (contract name) or `reference`/`slug` aliases the portal
    // form may send, so the lookup works whichever the frontend passes.
    const slugRaw =
      (req.query["jobSlug"] as string | undefined) ??
      (req.query["slug"] as string | undefined) ??
      (req.query["reference"] as string | undefined) ??
      "";
    const email = emailRaw.trim().toLowerCase();
    const jobSlug = slugRaw.trim();

    // Both identifiers are REQUIRED — a public lookup must pin exactly one
    // applicant + one job. Missing either is an honest empty (no enumeration).
    if (!email || !jobSlug) throw Errors.notFound("Application");

    const job = await resolveJobBySlug(jobSlug);
    if (!job) throw Errors.notFound("Application");

    // prismaAdmin: no tenant context on a public call. We scope EXPLICITLY by the
    // slug-resolved tenantId + the applicant's own email, so RLS being inert here
    // does not widen the query.
    const candidate = await prismaAdmin.candidate.findFirst({
      where: { tenantId: job.tenantId, email },
      select: { id: true },
    });
    if (!candidate) throw Errors.notFound("Application");

    const application = await prismaAdmin.application.findFirst({
      where: { tenantId: job.tenantId, candidateId: candidate.id, requisitionId: job.requisitionId },
      orderBy: { appliedAt: "desc" },
      select: { stage: true, stageUpdatedAt: true },
    });
    if (!application) throw Errors.notFound("Application");

    // Contract response — ONLY the applicant's own stage + updatedAt + jobTitle.
    // No id, name, contact, scores, or notes ever cross this public boundary.
    ok(res, {
      stage: application.stage,
      updatedAt: application.stageUpdatedAt.toISOString(),
      jobTitle: job.title,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
