/**
 * Tool IMPLEMENTATIONS for the agentic candidate-screener.
 *
 * The ai-engine declares the tool interfaces (names + Zod params); this file
 * supplies the bodies, which are free to hit Prisma and sibling services.
 * `buildScreenerTools()` returns a name→impl map the worker injects into the
 * agentic runtime via AgenticContext.toolImpls.
 *
 * Tool capabilities map to the four pillars of "agentic":
 *   get_job_requirements / get_candidate_profile  → perceive
 *   find_evidence_in_resume                        → investigate (act+observe)
 *   lookup_past_screenings                         → MEMORY (recall past runs)
 *   flag_for_human_review                          → AUTONOMY (take an action)
 */
import { publishEvent } from "@cdc-ats/nats-client";
import { tenantSubject } from "@cdc-ats/contracts";
import type { ToolImpl } from "@cdc-ats/ai-engine";
import type { Logger } from "pino";
import { prisma } from "./prisma.js";
import { fetchResume, fetchRequisition } from "./service-client.js";

const STOPWORDS = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "has", "have", "this", "that",
  "from", "will", "able", "must", "should", "experience", "years", "year", "plus", "strong",
]);

/** Significant lowercased terms from a free-text query. */
function terms(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
    ),
  );
}

/** Pull a readable ~window around the first index. */
function snippetAround(text: string, idx: number, window = 160): string {
  const start = Math.max(0, idx - window / 2);
  const end = Math.min(text.length, idx + window / 2);
  return (start > 0 ? "…" : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "…" : "");
}

export function buildScreenerTools(opts: {
  tenantId: string;
  userId: string | null;
  logger: Logger;
}): Record<string, ToolImpl> {
  const { tenantId, userId, logger } = opts;

  return {
    // ── perceive ─────────────────────────────────────────────────────────────
    get_job_requirements: async (args: { requisitionId: string }) => {
      const req = await fetchRequisition(args.requisitionId, tenantId);
      if (!req) return { found: false, error: "requisition not found" };
      const requirements = Array.isArray(req.requirements) ? (req.requirements as string[]) : [];
      return {
        found: true,
        title: req.title,
        department: req.department,
        description: (req as any).description ?? null,
        requirements,
        requirementCount: requirements.length,
      };
    },

    get_candidate_profile: async (args: { candidateId: string }) => {
      const resume = await fetchResume(args.candidateId, tenantId);
      if (!resume) return { found: false, error: "no resume on file" };
      // parsedData is stored NESTED as { raw|enriched: { skills:[{raw,confidence}], ... } }.
      // Unwrap to the structured core, then flatten each skill object to its string so the
      // screener actually sees the candidate's skills. The previous code read `.skills` off
      // the top-level wrapper → always [] (every candidate looked skill-less to the screener).
      const pd: any = resume.parsedData ?? {};
      const core: any = pd.enriched ?? pd.raw ?? pd;
      const skills = (Array.isArray(core.skills) ? core.skills : [])
        .map((s: any) => (typeof s === "string" ? s : s?.raw ?? s?.name ?? s?.canonical ?? null))
        .filter((s: any): s is string => typeof s === "string" && s.length > 0);
      const summaryRaw = core.summary;
      const summary = typeof summaryRaw === "string" ? summaryRaw : (summaryRaw?.value ?? null);
      const text = resume.extractedText ?? "";
      return {
        found: true,
        skills,
        skillCount: skills.length,
        summary,
        hasResumeText: text.length > 0,
        resumeTextLength: text.length,
        parseStatus: resume.parseStatus,
      };
    },

    // ── investigate (act → observe) ───────────────────────────────────────────
    find_evidence_in_resume: async (args: { candidateId: string; query: string }) => {
      const resume = await fetchResume(args.candidateId, tenantId);
      const text = resume?.extractedText ?? "";
      if (!text) return { found: false, error: "no resume text to search" };
      const lower = text.toLowerCase();
      const want = terms(args.query);
      const matched: string[] = [];
      const missing: string[] = [];
      let firstIdx = -1;
      for (const t of want) {
        const idx = lower.indexOf(t);
        if (idx >= 0) {
          matched.push(t);
          if (firstIdx < 0 || idx < firstIdx) firstIdx = idx;
        } else {
          missing.push(t);
        }
      }
      const coverage = want.length ? matched.length / want.length : 0;
      return {
        found: coverage >= 0.5, // at least half the significant terms present
        coverage: Number(coverage.toFixed(2)),
        matchedTerms: matched,
        missingTerms: missing,
        snippet: firstIdx >= 0 ? snippetAround(text, firstIdx) : null,
      };
    },

    // ── memory (recall prior runs) ────────────────────────────────────────────
    lookup_past_screenings: async (args: { requisitionId: string }) => {
      const rows = await prisma.screening.findMany({
        where: { tenantId, requisitionId: args.requisitionId, status: "COMPLETED", score: { not: null } },
        select: { score: true, result: true },
        take: 200,
      });
      if (rows.length === 0) {
        return { count: 0, note: "No prior screenings for this requisition — you are setting the bar.", passBar: 70 };
      }
      const scores = rows.map((r) => r.score as number);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const passes = rows.filter((r) => r.result === "PASS").length;
      return {
        count: rows.length,
        averageScore: Number(avg.toFixed(1)),
        passRate: Number((passes / rows.length).toFixed(2)),
        passBar: 70,
      };
    },

    // ── autonomy (take a real action) ─────────────────────────────────────────
    flag_for_human_review: async (args: {
      candidateId: string;
      requisitionId: string;
      reason: string;
      severity: "low" | "medium" | "high";
    }) => {
      try {
        await publishEvent({
          subject: tenantSubject(tenantId, "screening", "review_requested"),
          type: "screening.review_requested",
          tenantId,
          payload: {
            tenantId,
            candidateId: args.candidateId,
            requisitionId: args.requisitionId,
            reason: args.reason,
            severity: args.severity,
            requestedByAgent: true,
            requestedByUserId: userId,
          },
        });
        logger.info(
          { candidateId: args.candidateId, severity: args.severity },
          "Agent opened a human-review task",
        );
        return { ok: true, taskOpened: true, severity: args.severity };
      } catch (err) {
        logger.error({ err }, "flag_for_human_review failed to publish");
        return { ok: false, error: "could not open review task" };
      }
    },
  };
}
