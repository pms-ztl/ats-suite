/**
 * Tool IMPLEMENTATIONS for the agentic candidate-experience chat assistant.
 *
 *   get_application_status → this candidate's app + upcoming interview (act)
 *   get_faq_answer         → built-in process knowledge base
 *   escalate_to_recruiter  → recruiter-visible note (ACTION)
 *
 * Closes over candidateId so the chat is always scoped to the current person.
 */
import type { ToolImpl } from "@cdc-ats/ai-engine";
import type { Logger } from "pino";
import { prisma } from "./prisma.js";

// Small, real knowledge base — keyword-matched.
const FAQ: Array<{ keys: string[]; answer: string }> = [
  { keys: ["prepare", "prep", "expect"], answer: "to prepare, review the role's requirements, be ready to discuss specific projects with measurable outcomes, and prepare a few questions for the interviewer. Interviews are typically 45–60 minutes." },
  { keys: ["timeline", "how long", "hear back", "next step"], answer: "our process is usually: application review (3–5 days), screening, 1–2 interview rounds, then a decision. You'll get an update at each stage." },
  { keys: ["withdraw"], answer: "you can withdraw any time — just let us know and we'll close your application. A recruiter can also do this for you." },
  { keys: ["reschedule"], answer: "rescheduling an interview is no problem; a recruiter will help you find a new slot. I can connect you." },
  { keys: ["accommodat", "disability", "access"], answer: "we provide interview accommodations on request. A recruiter will arrange whatever you need confidentially." },
  { keys: ["referral", "refer"], answer: "referrals are welcome — referred candidates go through the same fair process. Ask your referrer to submit through our careers page." },
];

export function buildExperienceTools(opts: {
  tenantId: string;
  userId: string | null;
  logger: Logger;
  candidateId: string;
  jobServiceUrl?: string;
  reqHeaders: { userId: string; role: string };
}): Record<string, ToolImpl> {
  const { tenantId, candidateId, logger } = opts;
  const jobUrl = opts.jobServiceUrl ?? process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";

  return {
    get_application_status: async () => {
      const candidate = await prisma.candidate.findFirst({
        where: { id: candidateId, tenantId },
        include: { applications: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1 } },
      });
      const app = candidate?.applications?.[0];
      if (!app) return { found: false };
      let jobTitle = "your role";
      try {
        const r = await fetch(`${jobUrl}/internal/requisitions/${app.requisitionId}`, {
          headers: {
            "X-User-Id": opts.reqHeaders.userId,
            "X-Tenant-Id": tenantId,
            "X-User-Role": opts.reqHeaders.role,
          },
        });
        if (r.ok) jobTitle = ((await r.json()) as any)?.data?.title ?? jobTitle;
      } catch {
        /* job-service optional */
      }
      return {
        found: true,
        jobTitle,
        stage: app.stage,
        status: app.status,
        appliedAt: app.createdAt.toISOString().slice(0, 10),
      };
    },

    get_faq_answer: async (args: { topic: string }) => {
      const q = (args.topic ?? "").toLowerCase();
      const hit = FAQ.find((f) => f.keys.some((k) => q.includes(k)));
      return hit ? { found: true, answer: hit.answer } : { found: false };
    },

    escalate_to_recruiter: async (args: { reason: string; urgency: "low" | "normal" | "high" }) => {
      try {
        const note = await prisma.candidateNote.create({
          data: {
            tenantId,
            candidateId,
            authorUserId: "agent-experience",
            content: `🚩 Escalation from candidate chat (${args.urgency}): ${args.reason}`,
            isPrivate: true,
          },
        });
        logger.info({ candidateId, urgency: args.urgency, noteId: note.id }, "Experience agent escalated to recruiter");
        return { ok: true, escalated: true, noteId: note.id };
      } catch (err) {
        logger.error({ err }, "escalate_to_recruiter failed");
        return { ok: false, error: "could not escalate" };
      }
    },
  };
}
