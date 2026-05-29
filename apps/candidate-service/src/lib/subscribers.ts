/**
 * Phase 35c — NATS subscribers for candidate-service.
 *
 * Subscribers consume events and mutate the local DB. Today there's just
 * one (resume.parsed); more will be added as cross-service workflows grow.
 *
 *   tenant.{tenantId}.resume.parsed   → backfill Candidate.parsedSummary
 *                                       + overwrite placeholder name/email
 *                                       for bulk-uploaded candidates
 */
import { subscribeToEvents } from "@cdc-ats/nats-client";
import type { Logger } from "pino";
import { z } from "zod";
import { toFairnessView } from "@cdc-ats/ai-engine";
import { prisma } from "./prisma.js";

// Loose schema — the parser may grow new fields; we accept anything and
// only enforce shapes for the fields we actually use here.
const ResumeParsedPayload = z.object({
  tenantId: z.string(),
  candidateId: z.string(),
  resumeId: z.string(),
  parsed: z.object({
    email: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    fullName: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
    skills: z.array(z.string()).optional(),
    experience: z.array(z.unknown()).optional(),
    education: z.array(z.unknown()).optional(),
    yearsOfExperience: z.number().optional(),
    languages: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    links: z.object({
      linkedin: z.string().optional().nullable(),
      github: z.string().optional().nullable(),
      portfolio: z.string().optional().nullable(),
    }).optional(),
  }).optional(),
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

      if (p.email && PLACEHOLDER_EMAIL_RE.test(candidate.email)) {
        updateData.email = p.email.toLowerCase();
      }
      const isGenericName =
        /^(pending|unknown|bulk\s|cloud\s)/i.test(candidate.firstName) ||
        /^(pending|unknown|bulk\s|cloud\s|user|—)/i.test(candidate.lastName);
      if (isGenericName) {
        const fullName = p.fullName ?? `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
        if (fullName) {
          const [first, ...rest] = fullName.split(/\s+/);
          if (first) updateData.firstName = first;
          if (rest.length > 0) updateData.lastName = rest.join(" ");
        }
      }
      if (!candidate.phone && p.phone)         updateData.phone    = p.phone;
      if (!candidate.location && p.location)   updateData.location = p.location;
      if (!candidate.summary && p.summary)     updateData.summary  = p.summary;
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
    },
  });

  logger.info("candidate-service NATS subscribers started");
}
