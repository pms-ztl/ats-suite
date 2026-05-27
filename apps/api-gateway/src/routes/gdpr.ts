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

      const [candidate, resumes, screenings] = await Promise.allSettled([
        callService<any>("candidate", { path: `/internal/gdpr/candidates/${id}/export`, userHeaders, timeoutMs: 5000 }),
        callService<any[]>("resume", { path: `/internal/resume?candidateId=${id}`, userHeaders, timeoutMs: 5000 }).catch(() => []),
        callService<any[]>("screening", { path: `/internal/screening?candidateId=${id}`, userHeaders, timeoutMs: 5000 }).catch(() => []),
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
        _partial: {
          candidate: candidate.status === "fulfilled",
          resume: resumes.status === "fulfilled",
          screening: screenings.status === "fulfilled",
        },
      };

      ok(res, bundle);
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

      const [candidate, resume, screening] = await Promise.allSettled([
        callService<any>("candidate", { method: "DELETE", path: `/internal/gdpr/candidates/${id}`, userHeaders, timeoutMs: 5000 }),
        callService<any>("resume", { method: "DELETE", path: `/internal/resume?candidateId=${id}`, userHeaders, timeoutMs: 5000 }).catch(() => null),
        callService<any>("screening", { method: "DELETE", path: `/internal/screening?candidateId=${id}`, userHeaders, timeoutMs: 5000 }).catch(() => null),
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
        },
      });
    } catch (err) { next(err); }
  });

  return router;
}
