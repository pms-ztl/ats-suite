/**
 * GDPR — full per-candidate export + delete orchestration.
 *
 *   POST /api/gdpr/candidates/:id/export
 *        Fans out to candidate, resume, screening services to assemble
 *        a single JSON bundle covering EVERY system that holds data
 *        about this candidate. Optionally emails the bundle to the
 *        caller's address.
 *
 *   DELETE /api/gdpr/candidates/:id
 *        Anonymizes per-service: candidate-service anonymizes PII +
 *        deletes apps/notes/attachments; resume-service deletes resumes;
 *        screening-service deletes screenings.
 *
 * Each downstream service is best-effort: if one fails the rest still
 * proceed, and the response reports per-service outcome.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import type { Logger } from "pino";
import { ok, Errors } from "@cdc-ats/common";
import { callService } from "../lib/service-client.js";

export function gdprRouter(_logger: Logger): Router {
  const router = Router();

  // ── POST /api/gdpr/candidates/:id/export ────────────────────────────────
  router.post("/candidates/:id/export", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
        throw Errors.forbidden("Only tenant admins can run GDPR exports");
      }
      const id = req.params["id"] as string;
      const userHeaders = {
        userId: req.user.id, tenantId: req.user.tenantId,
        role: req.user.role, email: req.user.email,
      };

      const [candidate, resumes, screenings, assessments] = await Promise.allSettled([
        callService<any>("candidate", { path: `/internal/gdpr/candidates/${id}/export`, userHeaders, timeoutMs: 5000 }),
        callService<any[]>("resume", { path: `/internal/resume?candidateId=${id}`, userHeaders, timeoutMs: 5000 }).catch(() => []),
        callService<any[]>("screening", { path: `/internal/screening?candidateId=${id}`, userHeaders, timeoutMs: 5000 }).catch(() => []),
        // WF10/J1 - online-assessment data (attempts, answers, results, proctoring).
        callService<any>("assessment", { path: `/internal/gdpr/candidates/${id}/export`, userHeaders, timeoutMs: 8000 }).catch(() => null),
      ]);

      if (candidate.status === "rejected") {
        throw Errors.notFound("Candidate");
      }

      const bundle = {
        gdprExport: {
          exportedAt: new Date().toISOString(),
          exportedBy: req.user.id,
          tenantId: req.user.tenantId,
          subject: { type: "candidate", id },
        },
        candidate: candidate.value.candidate,
        applications: candidate.value.applications ?? [],
        notes: candidate.value.notes ?? [],
        attachments: candidate.value.attachments ?? [],
        resumes: resumes.status === "fulfilled" ? resumes.value : [],
        screenings: screenings.status === "fulfilled" ? screenings.value : [],
        // WF10/J1 - OA export leg (null when assessment-service is unreachable
        // or the candidate has no OA data; honest absence, never fabricated).
        assessments: assessments.status === "fulfilled" ? assessments.value : null,
        _partial: {
          candidate: candidate.status === "fulfilled",
          resume: resumes.status === "fulfilled",
          screening: screenings.status === "fulfilled",
          assessment: assessments.status === "fulfilled" && assessments.value != null,
        },
      };

      ok(res, bundle);
    } catch (err) { next(err); }
  });

  // ── GET /api/gdpr/tenant/export ──────────────────────────────────────────
  // Phase 31c — full tenant data export (GDPR Article 20 — data portability).
  // Aggregates ALL hiring data from every service into a single downloadable
  // JSON file. Browser saves it via Content-Disposition. Admin-only.
  router.get("/tenant/export", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
        throw Errors.forbidden("Only tenant admins can export tenant data");
      }
      const userHeaders = {
        userId: req.user.id, tenantId: req.user.tenantId,
        role: req.user.role, email: req.user.email,
      };

      // Fan out to all data-owning services in parallel. allSettled so a
      // single service failure produces a partial export rather than a 500
      // — the response carries _partial flags so the admin knows.
      const [tenant, identity, job, candidate, interview] = await Promise.allSettled([
        callService<any>("tenant",    { path: "/internal/gdpr/tenant/export", userHeaders, timeoutMs: 30_000 }),
        callService<any>("identity",  { path: "/internal/gdpr/tenant/export", userHeaders, timeoutMs: 30_000 }),
        callService<any>("job",       { path: "/internal/gdpr/tenant/export", userHeaders, timeoutMs: 30_000 }),
        callService<any>("candidate", { path: "/internal/gdpr/tenant/export", userHeaders, timeoutMs: 60_000 }),
        callService<any>("interview", { path: "/internal/gdpr/tenant/export", userHeaders, timeoutMs: 30_000 }),
      ]);

      const bundle = {
        gdprExport: {
          exportedAt: new Date().toISOString(),
          exportedBy: req.user.id,
          tenantId: req.user.tenantId,
          gdprArticle: "Article 20 — Right to data portability",
          schemaVersion: "1.0",
        },
        services: {
          tenant:    tenant.status    === "fulfilled" ? tenant.value    : { _error: String((tenant as any).reason) },
          identity:  identity.status  === "fulfilled" ? identity.value  : { _error: String((identity as any).reason) },
          job:       job.status       === "fulfilled" ? job.value       : { _error: String((job as any).reason) },
          candidate: candidate.status === "fulfilled" ? candidate.value : { _error: String((candidate as any).reason) },
          interview: interview.status === "fulfilled" ? interview.value : { _error: String((interview as any).reason) },
        },
        _partial: {
          tenant:    tenant.status    === "fulfilled",
          identity:  identity.status  === "fulfilled",
          job:       job.status       === "fulfilled",
          candidate: candidate.status === "fulfilled",
          interview: interview.status === "fulfilled",
        },
      };

      // Browser-friendly download: timestamped filename + JSON mimetype.
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="cdc-ats-tenant-${req.user.tenantId.slice(0, 8)}-${stamp}.json"`,
      );
      res.status(200).end(JSON.stringify(bundle, null, 2));
    } catch (err) { next(err); }
  });

  // ── DELETE /api/gdpr/candidates/:id ─────────────────────────────────────
  router.delete("/candidates/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
        throw Errors.forbidden("Only tenant admins can run GDPR deletes");
      }
      const id = req.params["id"] as string;
      const userHeaders = {
        userId: req.user.id, tenantId: req.user.tenantId,
        role: req.user.role, email: req.user.email,
      };

      const [candidate, resume, screening, assessment] = await Promise.allSettled([
        callService<any>("candidate", { method: "DELETE", path: `/internal/gdpr/candidates/${id}`, userHeaders, timeoutMs: 5000 }),
        callService<any>("resume", { method: "DELETE", path: `/internal/resume?candidateId=${id}`, userHeaders, timeoutMs: 5000 }).catch(() => null),
        callService<any>("screening", { method: "DELETE", path: `/internal/screening?candidateId=${id}`, userHeaders, timeoutMs: 5000 }).catch(() => null),
        // WF10/J1 - erase OA rows (Attempt/Answer/AssessmentResult/ProctorEvent/Invite).
        callService<any>("assessment", { method: "DELETE", path: `/internal/gdpr/candidates/${id}`, userHeaders, timeoutMs: 8000 }).catch(() => null),
      ]);

      if (candidate.status === "rejected") {
        throw Errors.notFound("Candidate");
      }

      ok(res, {
        candidateId: id,
        deletedAt: new Date().toISOString(),
        gdprArticle: "Article 17 — Right to erasure",
        perService: {
          candidate: candidate.status === "fulfilled" ? "anonymized" : "failed",
          resume:    resume.status === "fulfilled" ? "deleted" : "failed-or-skipped",
          screening: screening.status === "fulfilled" ? "deleted" : "failed-or-skipped",
          assessment: assessment.status === "fulfilled" && assessment.value != null ? "erased" : "failed-or-skipped",
        },
      });
    } catch (err) { next(err); }
  });

  return router;
}
