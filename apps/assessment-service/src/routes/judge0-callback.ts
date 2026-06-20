/**
 * Judge0 inbound callback router (assessment-service) — SLICE G7.
 *
 * Judge0 PUTs (some deployments POST) one callback per submission once execution
 * finishes. There is NO JWT and NO tenant header on these calls — the Judge0
 * sidecar runs in its own network and only knows the opaque submission token,
 * which IS the correlation credential. So this router:
 *   - uses prismaAdmin (via the judge0 lib) and resolves the owning result/tenant
 *     FROM the submission token (never from request context);
 *   - is mounted BEFORE tenantContext + readAuthHeaders in app.ts (the same
 *     public posture as the candidate take routes);
 *   - is reached through the gateway's PUBLIC raw proxy
 *     /api/internal/judge0/callback -> /internal/judge0/callback (no auth, no
 *     X-Internal-Service stamp — matching the inbound-email / twilio webhook
 *     posture). The token is unguessable, so a forged callback for an unknown
 *     token is a harmless no-op (handleJudge0Callback returns null).
 *
 * On each callback we write the REAL Judge0 verdict onto the matching test case,
 * recompute the question's weighted points, and — once every coding verdict for
 * the attempt has landed — finalize the attempt (publishing assessment.completed).
 * Hidden test-case I/O is never echoed back to anyone.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok } from "@cdc-ats/common";
import type { Logger } from "pino";
import { handleJudge0Callback, type Judge0Callback } from "../lib/judge0.js";
import { finalizeIfCodingResolved } from "../workers/grading.worker.js";

export function createJudge0CallbackRouter(logger: Logger): Router {
  const router = Router();

  // Judge0 uses PUT by default for callbacks; accept POST too for hosted variants.
  const handler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cb = (req.body ?? {}) as Judge0Callback;
      const outcome = await handleJudge0Callback(cb);

      // Always 200 the callback so Judge0 does not retry a verdict we have already
      // applied (idempotent) or one for an unknown/late token (harmless no-op).
      if (!outcome) {
        return ok(res, { applied: false });
      }

      // When every coding verdict for the attempt has landed, finalize it (compute
      // the score, set needsReview, publish assessment.completed). Best-effort:
      // the timeout reaper finalizes anyway if this path is missed.
      if (outcome.allResolved) {
        const result = await import("../lib/prisma.js").then(async ({ prismaAdmin }) => {
          return prismaAdmin.attempt.findUnique({
            where: { id: outcome.attemptId },
            select: { tenantId: true, assessmentId: true, candidateId: true },
          });
        });
        if (result) {
          await finalizeIfCodingResolved(
            {
              tenantId: result.tenantId,
              assessmentId: result.assessmentId,
              attemptId: outcome.attemptId,
              candidateId: result.candidateId,
            },
            logger,
          ).catch((err) => logger.warn({ err, attemptId: outcome.attemptId }, "judge0 callback finalize failed"));
        }
      }

      ok(res, { applied: true, allResolved: outcome.allResolved });
    } catch (err) {
      next(err);
    }
  };

  router.put("/callback", handler);
  router.post("/callback", handler);
  return router;
}
