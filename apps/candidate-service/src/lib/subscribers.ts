/**
 * Phase 35c — NATS subscribers for candidate-service.
 *
 * Subscribers consume events and mutate the local DB. Today there's just
 * one (resume.parsed); more will be added as cross-service workflows grow.
 *
 *   tenant.{tenantId}.resume.parsed       → backfill Candidate.parsedSummary
 *                                           + overwrite placeholder name/email
 *                                           for bulk-uploaded candidates
 *   tenant.{tenantId}.assessment.completed -> advance the candidate's application
 *                                            to ApplicationStage.ASSESSMENT
 *                                            (WF10/J1 - never auto-rejects)
 */
import { subscribeToEvents } from "@cdc-ats/nats-client";
import type { Logger } from "pino";
import { z } from "zod";
import { toFairnessView } from "@cdc-ats/ai-engine";
// NATS subscriber runs outside any HTTP request; it scopes every query by the
// event's tenantId explicitly, so it uses the admin (non-RLS) client.
import { prismaAdmin as prisma } from "./prisma.js";
import { embedCandidate } from "./matching.js";

// Loose schema — accept ANY parsed shape. The Phase 37 resume-parser wraps
// identity fields as { value, confidence } and nests skills/experience as
// objects, so a strict per-field schema (email: z.string(), …) actually
// REJECTED the real payload and crashed the subscriber before the unwrap/
// backfill ran. The handler below unwraps + type-guards every field it reads,
// so it's safe to accept anything here and validate at point-of-use.
const ResumeParsedPayload = z.object({
  tenantId: z.string(),
  candidateId: z.string(),
  resumeId: z.string(),
  parsed: z.any().optional(),
}).passthrough();

// WF10/J1 - the assessment.completed payload published by the grading worker.
// passed is null while a human review is pending (no auto-reject); applicationId
// may be null for a standalone assessment.
const AssessmentCompletedPayload = z.object({
  tenantId: z.string(),
  assessmentId: z.string(),
  attemptId: z.string(),
  candidateId: z.string(),
  applicationId: z.string().nullable().optional(),
  passed: z.boolean().nullable().optional(),
  score: z.number().nullable().optional(),
  needsReview: z.boolean().optional(),
}).passthrough();

// Placeholder emails from bulk-upload look like:
//   bulk-{8chars}-{idx}@pending.placeholder
// We overwrite those with the parsed email. Real emails we leave alone
// — even if the parser found a different one, the recruiter's input wins.
const PLACEHOLDER_EMAIL_RE = /@pending\.placeholder$/i;

export async function startCandidateSubscribers(logger: Logger): Promise<void> {
  await subscribeToEvents({
    stream: "RESUME_EVENTS",
    subject: "tenant.*.resume.parsed",
    durable: "candidate-service:resume-parsed",
    logger,
    handler: async (envelope) => {
      const parsed = ResumeParsedPayload.parse(envelope.payload);
      const p = parsed.parsed ?? {};

      const candidate = await prisma.candidate.findFirst({
        where: { id: parsed.candidateId, tenantId: parsed.tenantId },
      });
      if (!candidate) {
        logger.warn({ candidateId: parsed.candidateId }, "Candidate not found for resume.parsed event");
        return;
      }

      // 1. ALWAYS update parsedSummary — authoritative parsed view.
      // Phase 37: prefer the enriched view if the publisher sent one
      // (taxonomy canonicalization, YOE, dates normalized). Fall back to
      // raw flat shape for pre-37 events.
      const enrichedPayload = (envelope.payload as any).enriched;
      const githubCorroboration = (envelope.payload as any).githubCorroboration ?? null;
      // Phase 38 — agentic resume-verifier output (trust score + findings).
      const verification = (envelope.payload as any).verification ?? null;
      const summary = enrichedPayload ?? {
        skills:           p.skills ?? [],
        experience:       p.experience ?? [],
        education:        p.education ?? [],
        summary:          p.summary ?? null,
        yearsOfExperience: p.yearsOfExperience ?? null,
        languages:        p.languages ?? [],
        certifications:   p.certifications ?? [],
        links:            p.links ?? null,
        parsedAt:         new Date().toISOString(),
        sourceResumeId:   parsed.resumeId,
      };
      // Phase 37j — fairness view (PII-stripped). Only computable from the
      // enriched shape; skip for old-style flat backfill.
      const fairSummary = enrichedPayload ? toFairnessView(enrichedPayload) : null;

      // 2. Decide whether to overwrite name/email/phone/location. Rule:
      //    - email: overwrite ONLY if current is a placeholder
      //    - firstName/lastName: overwrite if current is generic ("Pending",
      //      "Bulk N", "Unknown") OR if parsed has a "fullName" that splits
      //      to materially different values
      //    - phone/location: fill-in only (never overwrite a real value)
      const updateData: Record<string, unknown> = {
        parsedSummary: { ...summary, githubCorroboration, verification },
        ...(fairSummary ? { parsedSummaryFair: fairSummary } : {}),
      };

      // Phase 37 parser fields are confidence-wrapped ({value,confidence}); the
      // enriched view carries them too. Unwrap before backfilling identity —
      // otherwise p.email is an object, p.email.toLowerCase() throws, and the
      // candidate keeps its placeholder name/email.
      const unwrap = (f: any): any => (f && typeof f === "object" && "value" in f ? f.value : f);
      const pName = unwrap((p as any).name) ?? unwrap(enrichedPayload?.name);
      const pEmail = unwrap((p as any).email) ?? unwrap(enrichedPayload?.email);
      const pPhone = unwrap((p as any).phone) ?? unwrap(enrichedPayload?.phone);
      const pLocation = unwrap((p as any).location) ?? unwrap(enrichedPayload?.location);
      const pSummary = unwrap((p as any).summary) ?? unwrap(enrichedPayload?.summary);

      if (typeof pEmail === "string" && pEmail && PLACEHOLDER_EMAIL_RE.test(candidate.email)) {
        updateData.email = pEmail.toLowerCase();
      }
      const isGenericName =
        /^(pending|unknown|bulk|cloud|resume|cv|document|file|untitled)\b/i.test(candidate.firstName) ||
        /^\d/.test(candidate.firstName) ||
        /^(pending|unknown|bulk|cloud|user|—|resume|cv)\b/i.test(candidate.lastName) ||
        /^\d/.test(candidate.lastName);
      if (isGenericName) {
        const fullName =
          (p as any).fullName ??
          (pName && typeof pName === "object"
            ? `${pName.first ?? ""} ${pName.last ?? ""}`.trim()
            : typeof pName === "string" ? pName : "");
        if (fullName) {
          const [first, ...rest] = fullName.split(/\s+/);
          if (first) updateData.firstName = first;
          if (rest.length > 0) updateData.lastName = rest.join(" ");
        }
      }
      if (!candidate.phone && typeof pPhone === "string" && pPhone)          updateData.phone    = pPhone;
      if (!candidate.location && typeof pLocation === "string" && pLocation) updateData.location = pLocation;
      if (!candidate.summary && typeof pSummary === "string" && pSummary)    updateData.summary  = pSummary;
      if (!candidate.linkedinUrl && p.links?.linkedin)   updateData.linkedinUrl  = p.links.linkedin;
      if (!candidate.portfolioUrl && p.links?.portfolio) updateData.portfolioUrl = p.links.portfolio;

      try {
        // F-027-micro: scope mutation by tenantId on the update too.
        await prisma.candidate.updateMany({
          where: { id: parsed.candidateId, tenantId: parsed.tenantId },
          data: updateData as any,
        });
      } catch (err) {
        // Most likely cause: email collision (parsed email matches another
        // candidate in the same tenant). Leave the placeholder email; ops
        // can merge candidates manually.
        logger.warn(
          { err, candidateId: parsed.candidateId, parsedEmail: p.email },
          "Backfill from resume.parsed failed — likely email collision; leaving candidate as-is",
        );
        await prisma.candidate.updateMany({
          where: { id: parsed.candidateId, tenantId: parsed.tenantId },
          data: { parsedSummary: summary as any },
        }).catch(() => undefined);
      }

      // Phase 39 — embed the freshly-parsed candidate for vector matching.
      // Best-effort + no-op without an embeddings key.
      embedCandidate(parsed.candidateId, parsed.tenantId, logger).catch(() => undefined);
    },
  });

  // ── tenant.{tenantId}.assessment.completed ────────────────────────────────
  // WF10/J1 - when an Online Assessment is graded, advance the candidate's
  // application to the ASSESSMENT stage so the pipeline reflects that the OA leg
  // is done. This is a STAGE ADVANCE only; it NEVER rejects (GDPR Art.22 - no
  // solely-automated adverse decision). A failed/low score does NOT move the
  // application backward or to a rejected status here; an adverse outcome is the
  // HITL queue's decision (notification-service raises the checkpoint). The
  // event carries passed=null whenever a human review is still pending.
  await subscribeToEvents({
    stream: "ASSESSMENT_EVENTS",
    subject: "tenant.*.assessment.completed",
    durable: "candidate-service:assessment-completed",
    logger,
    handler: async (envelope) => {
      const p = AssessmentCompletedPayload.parse(envelope.payload);
      if (!p.applicationId) {
        // No application resolved (standalone assessment / candidate has no app).
        // Honest no-op - nothing to advance.
        logger.info({ attemptId: p.attemptId, candidateId: p.candidateId }, "assessment.completed: no applicationId, no stage to advance");
        return;
      }

      // Only ADVANCE forward; never move a candidate who is already past the
      // assessment stage back to it (forward-only, idempotent). We scope by
      // tenantId + applicationId on the find AND the update.
      const app = await prisma.application.findFirst({
        where: { id: p.applicationId, tenantId: p.tenantId, candidateId: p.candidateId },
        select: { id: true, stage: true },
      });
      if (!app) {
        logger.warn({ applicationId: p.applicationId, tenantId: p.tenantId }, "assessment.completed: application not found");
        return;
      }
      // Stages that are at/after ASSESSMENT, or terminal - do not regress.
      const AT_OR_PAST = new Set([
        "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN",
      ]);
      if (AT_OR_PAST.has(app.stage)) {
        logger.info({ applicationId: app.id, stage: app.stage }, "assessment.completed: already at/past ASSESSMENT, no advance");
        return;
      }

      await prisma.application.updateMany({
        where: { id: app.id, tenantId: p.tenantId },
        data: { stage: "ASSESSMENT", stageUpdatedAt: new Date() },
      });
      logger.info(
        { applicationId: app.id, from: app.stage, to: "ASSESSMENT", passed: p.passed, needsReview: p.needsReview },
        "assessment.completed: advanced application to ASSESSMENT (no auto-reject)",
      );
    },
  });

  logger.info("candidate-service NATS subscribers started (resume.parsed + assessment.completed)");
}
