/**
 * Tool IMPLEMENTATIONS for the agentic offer agent (candidate-service).
 *
 *   get_comp_band        → band from the requisition (real)
 *   get_market_rate      → modeled market percentiles (config-driven)
 *   get_candidate_signal → latest interview recommendation (best-effort)
 *   flag_compensation_exception → recruiter-visible note (ACTION)
 */
import type { ToolImpl } from "@cdc-ats/ai-engine";
import type { Logger } from "pino";
import { prisma } from "./prisma.js";

// Modeled market multipliers by seniority keyword (applied to band mid).
// A real deployment would swap this for a salary-data vendor; the structure
// is the same — a source the agent queries rather than a prompt dump.
const LEVEL_MULTIPLIER: Array<{ kw: RegExp; p25: number; p50: number; p75: number }> = [
  { kw: /staff|principal|lead/i, p25: 0.95, p50: 1.12, p75: 1.3 },
  { kw: /senior|sr\.?/i, p25: 0.9, p50: 1.05, p75: 1.2 },
  { kw: /junior|jr\.?|entry|associate/i, p25: 0.75, p50: 0.85, p75: 0.95 },
];

export function buildOfferTools(opts: {
  tenantId: string;
  userId: string | null;
  logger: Logger;
  applicationId: string;
  reqHeaders: { userId: string; role: string };
  jobServiceUrl?: string;
  interviewServiceUrl?: string;
}): Record<string, ToolImpl> {
  const { tenantId, applicationId, logger } = opts;
  const jobUrl = opts.jobServiceUrl ?? process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";
  const interviewUrl = opts.interviewServiceUrl ?? process.env["INTERVIEW_SERVICE_URL"] ?? "http://localhost:4006";

  async function loadReq(): Promise<any | null> {
    const app = await prisma.application.findFirst({ where: { id: applicationId, tenantId } });
    if (!app) return null;
    try {
      const r = await fetch(`${jobUrl}/internal/requisitions/${app.requisitionId}`, {
        headers: { "X-User-Id": opts.reqHeaders.userId, "X-Tenant-Id": tenantId, "X-User-Role": opts.reqHeaders.role },
      });
      if (!r.ok) return { app };
      return { app, req: ((await r.json()) as any)?.data };
    } catch {
      return { app };
    }
  }

  return {
    get_comp_band: async () => {
      const loaded = await loadReq();
      if (!loaded) return { found: false, error: "application not found" };
      const req = loaded.req;
      const min = req?.salaryMin ?? 80000;
      const max = req?.salaryMax ?? 140000;
      return {
        found: true,
        title: req?.title ?? "role",
        level: req?.level ?? "Mid",
        min,
        mid: Math.round((min + max) / 2),
        max,
        currency: req?.salaryCurrency ?? "USD",
      };
    },

    get_market_rate: async () => {
      const loaded = await loadReq();
      const req = loaded?.req;
      const min = req?.salaryMin ?? 80000;
      const max = req?.salaryMax ?? 140000;
      const mid = (min + max) / 2;
      const title = `${req?.title ?? ""} ${req?.level ?? ""}`;
      const m = LEVEL_MULTIPLIER.find((x) => x.kw.test(title)) ?? { p25: 0.92, p50: 1.0, p75: 1.15 };
      return {
        modeled: true,
        p25: Math.round(mid * m.p25),
        p50: Math.round(mid * m.p50),
        p75: Math.round(mid * m.p75),
        currency: req?.salaryCurrency ?? "USD",
      };
    },

    get_candidate_signal: async () => {
      const loaded = await loadReq();
      const candidateId = loaded?.app?.candidateId;
      if (!candidateId) return { signal: null, note: "no application" };
      try {
        const r = await fetch(`${interviewUrl}/internal/candidates/${candidateId}/latest-feedback`, {
          headers: { "X-User-Id": opts.reqHeaders.userId, "X-Tenant-Id": tenantId, "X-User-Role": opts.reqHeaders.role },
        });
        if (r.ok) {
          const d = ((await r.json()) as any)?.data;
          if (d?.recommendation) return { signal: d.recommendation, source: "interview-feedback" };
        }
      } catch {
        /* interview-service optional */
      }
      return { signal: null, note: "no interview signal on file yet" };
    },

    flag_compensation_exception: async (args: { reason: string }) => {
      const loaded = await loadReq();
      const candidateId = loaded?.app?.candidateId;
      if (!candidateId) return { ok: false, error: "no candidate" };
      try {
        const note = await prisma.candidateNote.create({
          data: {
            tenantId,
            candidateId,
            authorUserId: "agent-offer",
            content: `💰 Compensation exception flagged by offer agent: ${args.reason}`,
            isPrivate: true,
          },
        });
        logger.info({ candidateId, noteId: note.id }, "Offer agent flagged a comp exception");
        return { ok: true, flagged: true, noteId: note.id };
      } catch (err) {
        logger.error({ err }, "flag_compensation_exception failed");
        return { ok: false, error: "could not flag" };
      }
    },
  };
}
