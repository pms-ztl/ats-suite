/**
 * Tool IMPLEMENTATIONS for the agentic copilot (api-gateway).
 *
 * Uses the gateway's cross-service client so the agent can retrieve ONLY what
 * a given question needs, instead of the route blindly pre-fetching everything.
 *
 *   search_candidates / search_requisitions / get_pipeline_metrics
 */
import type { ToolImpl } from "@cdc-ats/ai-engine";
import { callService } from "./service-client.js";

interface UserHeaders {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

export function buildCopilotTools(userHeaders: UserHeaders): Record<string, ToolImpl> {
  return {
    search_candidates: async (args: { query?: string; limit?: number }) => {
      const list = await callService<any[]>("candidate", {
        path: "/internal/candidates",
        userHeaders,
        timeoutMs: 3000,
      }).catch(() => []);
      const q = (args.query ?? "").toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const scored = (list ?? [])
        .map((c: any) => {
          const hay = `${c.firstName ?? ""} ${c.lastName ?? ""} ${c.summary ?? ""} ${(c.tags ?? []).join(" ")}`.toLowerCase();
          const hits = q.filter((w) => hay.includes(w)).length;
          return { c, hits };
        })
        .sort((a, b) => b.hits - a.hits)
        .filter((x) => (q.length ? x.hits > 0 : true))
        .slice(0, args.limit ?? 10);
      return {
        count: scored.length,
        candidates: scored.map(({ c }) => ({
          id: c.id,
          name: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
          snippet: c.summary ?? (c.tags ?? []).slice(0, 4).join(", "),
        })),
      };
    },

    search_requisitions: async (args: { query?: string }) => {
      const list = await callService<any[]>("job", {
        path: "/internal/requisitions",
        userHeaders,
        timeoutMs: 3000,
      }).catch(() => []);
      const q = (args.query ?? "").toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const filtered = (list ?? [])
        .filter((r: any) => {
          if (!q.length) return true;
          const hay = `${r.title ?? ""} ${r.department ?? ""} ${r.status ?? ""}`.toLowerCase();
          return q.some((w) => hay.includes(w));
        })
        .slice(0, 10);
      return {
        count: filtered.length,
        requisitions: filtered.map((r: any) => ({
          id: r.id,
          title: r.title,
          snippet: `${r.department ?? ""} · ${r.status ?? ""}${r.location ? " · " + r.location : ""}`,
        })),
      };
    },

    get_pipeline_metrics: async () => {
      const bill = await callService<any>("billing", {
        path: "/internal/billing/overview",
        userHeaders,
        timeoutMs: 3000,
      }).catch(() => null);
      if (!bill) return { metrics: [] };
      return {
        metrics: [
          { name: "aiDecisionsToday", value: bill.aiDecisionsToday, unit: "runs" },
          { name: "totalAgentRuns", value: bill.totalAgentRuns, unit: "runs" },
          { name: "totalCostUsd", value: bill.totalCostUsd, unit: "USD" },
        ],
      };
    },
  };
}
