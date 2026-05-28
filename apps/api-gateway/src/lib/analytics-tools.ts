/**
 * Tool IMPLEMENTATIONS for the agentic analytics agent (api-gateway).
 * The agent pulls only the metric slices a question needs.
 */
import type { ToolImpl } from "@cdc-ats/ai-engine";
import { callService } from "./service-client.js";

interface UserHeaders {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

export function buildAnalyticsTools(userHeaders: UserHeaders): Record<string, ToolImpl> {
  return {
    get_pipeline_overview: async () => {
      const [reqRes, candRes] = await Promise.allSettled([
        callService<any>("job", { path: "/internal/requisitions/overview", userHeaders, timeoutMs: 3000 }),
        callService<any>("candidate", { path: "/internal/candidates/overview", userHeaders, timeoutMs: 3000 }),
      ]);
      const req = reqRes.status === "fulfilled" ? reqRes.value : null;
      const cand = candRes.status === "fulfilled" ? candRes.value : null;
      return {
        openRequisitions: req?.openRequisitions ?? 0,
        totalRequisitions: req?.totalRequisitions ?? 0,
        totalCandidates: cand?.totalCandidates ?? 0,
        activeApplications: cand?.activeApplications ?? 0,
        hiredApplications: cand?.hiredApplications ?? 0,
      };
    },

    get_stage_breakdown: async () => {
      const cand = await callService<any>("candidate", {
        path: "/internal/candidates/overview",
        userHeaders,
        timeoutMs: 3000,
      }).catch(() => null);
      return { applicationsByStage: cand?.applicationsByStage ?? {} };
    },

    get_ai_usage: async () => {
      const bill = await callService<any>("billing", {
        path: "/internal/billing/overview",
        userHeaders,
        timeoutMs: 3000,
      }).catch(() => null);
      return {
        aiDecisionsToday: bill?.aiDecisionsToday ?? 0,
        totalAgentRuns: bill?.totalAgentRuns ?? 0,
        totalCostUsd: bill?.totalCostUsd ?? 0,
      };
    },
  };
}
