/**
 * Phase 37g — Interview-questions endpoint.
 *
 *   POST /internal/candidates/:id/interview-questions
 *   Body: { requisitionId?: string, jobDescriptionText?: string,
 *           desiredCount?: number, focusAreas?: string[] }
 *
 * Returns the agent's generated questions with citations. Recruiter UI
 * pulls this to populate the "Interview Questions" tab on the candidate
 * detail page.
 *
 * Auth: tenant admin / recruiter / hiring manager — anyone who'd run an interview.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, Errors, getTenantId, getUserId, requireRole } from "@cdc-ats/common";
import { runAgent, type InterviewQuestionsInput, type InterviewQuestionsOutput } from "@cdc-ats/ai-engine";
import { prisma } from "../lib/prisma.js";

const router = Router();
const requireInterviewer = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER");

const BodySchema = z.object({
  requisitionId: z.string().uuid().optional(),
  jobDescriptionText: z.string().optional(),
  desiredCount: z.number().int().min(5).max(10).optional(),
  focusAreas: z.array(z.string()).max(5).optional(),
});

router.post(
  "/:id/interview-questions",
  requireInterviewer,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      const candidateId = req.params["id"] as string;
      const body = BodySchema.parse(req.body ?? {});

      const candidate = await prisma.candidate.findFirst({
        where: { id: candidateId, tenantId },
      });
      if (!candidate) throw Errors.notFound("Candidate");
      if (!candidate.parsedSummary) {
        throw Errors.validation("Candidate resume hasn't been parsed yet — wait for parsing to complete");
      }

      // JD text: either supplied directly, or look up from requisition.
      let jdText = body.jobDescriptionText ?? "";
      if (!jdText && body.requisitionId) {
        // Cross-service fetch — job-service has the requisition.
        const jobUrl = process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";
        const r = await fetch(`${jobUrl}/internal/requisitions/${body.requisitionId}`, {
          headers: {
            "X-User-Id": userId,
            "X-Tenant-Id": tenantId,
            "X-User-Role": req.user?.role ?? "ADMIN",
          },
        });
        if (r.ok) {
          const j: any = await r.json();
          const data = j.data ?? j;
          jdText = [data.title, data.description ?? "", (data.requirements ?? []).join("\n")]
            .filter(Boolean).join("\n\n");
        }
      }
      if (!jdText) {
        throw Errors.validation("Provide jobDescriptionText OR requisitionId");
      }

      const result = await runAgent<InterviewQuestionsInput, InterviewQuestionsOutput>({
        agentType: "interview-questions" as any,
        input: {
          candidateProfileJson: JSON.stringify(candidate.parsedSummary),
          jobDescriptionText: jdText,
          desiredCount: body.desiredCount ?? 7,
          ...(body.focusAreas ? { focusAreas: body.focusAreas } : {}),
        },
        context: { tenantId, userId, persistRun: async () => undefined },
      });

      ok(res, {
        candidateId,
        questions: result.output.questions,
        coverageNotes: result.output.coverageNotes,
        costUsd: result.snapshot.costUsd,
      });
    } catch (err) { next(err); }
  },
);

export default router;
