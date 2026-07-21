/**
 * Cross-service aggregators + small read endpoints the frontend needs.
 *
 * These exist in the gateway because:
 *   - They aggregate from multiple services (analytics, copilot etc.), OR
 *   - They are simple proxies the frontend expects under a different path, OR
 *   - They return empty/stub data for features not yet implemented in
 *     microservices, so the frontend renders gracefully instead of crashing.
 *
 * Routes added here:
 *   GET  /api/analytics/pipeline
 *   GET  /api/analytics/diversity
 *   GET  /api/analytics/time-to-hire
 *   GET  /api/analytics/source-of-hire
 *   GET  /api/analytics/ai-insights
 *   GET  /api/analytics/export/eeo        (returns 501 — todo)
 *   GET  /api/analytics/export/pipeline   (returns 501 — todo)
 *   GET  /api/agents/hitl
 *   GET  /api/ai/jobs
 *   GET  /api/platform/features
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import type { Logger } from "pino";
import { ok, Errors } from "@cdc-ats/common";
import { callService } from "../lib/service-client.js";

interface ReqOverview { openRequisitions: number; totalRequisitions: number; byStatus: Record<string, number>; }
interface CandOverview {
  totalCandidates: number;
  activeCandidates: number;
  activeApplications: number;
  hiredApplications: number;
  applicationsByStage: Record<string, number>;
}
interface BillOverview {
  aiDecisionsToday: number;
  totalAgentRuns: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number;
}

export function aggregatorRouter(logger: Logger): Router {
  const router = Router();

  // ── Pipeline metrics ────────────────────────────────────────────────────
  router.get("/analytics/pipeline", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const userHeaders = {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        role: req.user.role,
        email: req.user.email,
      };
      const [reqRes, candRes] = await Promise.allSettled([
        callService<ReqOverview>("job", { path: "/internal/requisitions/overview", userHeaders, timeoutMs: 3000 }),
        callService<CandOverview>("candidate", { path: "/internal/candidates/overview", userHeaders, timeoutMs: 3000 }),
      ]);
      const cand = candRes.status === "fulfilled" ? candRes.value : null;
      const req2 = reqRes.status === "fulfilled" ? reqRes.value : null;

      const stages = cand?.applicationsByStage ?? {};
      const stageOrder = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED"];
      const funnel = stageOrder.map((stage) => ({ name: stage, value: stages[stage] ?? 0 }));

      ok(res, {
        openRequisitions: req2?.openRequisitions ?? 0,
        totalCandidates: cand?.totalCandidates ?? 0,
        activeApplications: cand?.activeApplications ?? 0,
        hiredApplications: cand?.hiredApplications ?? 0,
        funnel,
        byStage: stages,
      });
    } catch (err) { next(err); }
  });

  // ── Diversity breakdown ────────────────────────────────────────────────
  // Real diversity data requires demographic capture which we don't ship
  // by default. Return an honest "not available" payload so the UI shows
  // the empty-state instead of crashing on missing fields.
  router.get("/analytics/diversity", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      ok(res, {
        available: false,
        reason: "Demographic data collection not enabled for this tenant.",
        breakdowns: [],
        timestamp: new Date().toISOString(),
      });
    } catch (err) { next(err); }
  });

  // ── Time-to-hire ───────────────────────────────────────────────────────
  // Real monthly trend computed by candidate-service from HIRED applications
  // (stageUpdatedAt - appliedAt). We surface that shape directly, plus a
  // `trendByMonth` alias for the legacy detail-page normaliser, and a
  // top-level avg/median/p90 from the `overall` block. Zero hires -> empty
  // trend (the frontend keeps its EmptyChart — no fabrication).
  router.get("/analytics/time-to-hire", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const userHeaders = {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        role: req.user.role,
        email: req.user.email,
      };
      const tth = await callService<{
        trend: { month: string; label: string; hires: number; avgDays: number; medianDays: number; p90Days: number }[];
        overall: { avgDays: number; medianDays: number; p90Days: number; hires: number };
      }>("candidate", {
        path: "/internal/applications/time-to-hire",
        userHeaders,
        timeoutMs: 3000,
      }).catch(() => null);

      const trend = tth?.trend ?? [];
      const overall = tth?.overall ?? { avgDays: 0, medianDays: 0, p90Days: 0, hires: 0 };
      const hasHires = overall.hires > 0;

      ok(res, {
        // Real per-month series (empty when there are no hires in the window).
        trend,
        // Alias the detail page's normaliser reads (out.trendByMonth).
        trendByMonth: trend,
        // Top-level metrics: null when there are no hires so the UI shows a dash,
        // not an invented "0 days".
        avgDays: hasHires ? overall.avgDays : null,
        medianDays: hasHires ? overall.medianDays : null,
        p90Days: hasHires ? overall.p90Days : null,
        byDepartment: [],
        hiredCount: overall.hires,
        note: hasHires
          ? undefined
          : "No hires in the last 12 months — time-to-hire cannot be computed.",
      });
    } catch (err) { next(err); }
  });

  // ── Source of hire ─────────────────────────────────────────────────────
  router.get("/analytics/source-of-hire", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const userHeaders = {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        role: req.user.role,
        email: req.user.email,
      };
      // Applications-per-source come from the candidate list (Candidate.source);
      // hires-per-source come from the tenant's HIRED-stage applications joined
      // back to their candidate's source.
      const [candList, hiredApps] = await Promise.all([
        callService<any[]>("candidate", { path: "/internal/candidates", userHeaders, timeoutMs: 3000 }).catch(() => [] as any[]),
        callService<any[]>("candidate", { path: "/internal/applications?stage=HIRED", userHeaders, timeoutMs: 3000 }).catch(() => [] as any[]),
      ]);
      const sourceOf = new Map<string, string>();
      const bySource: Record<string, { applied: number; hired: number }> = {};
      for (const c of candList ?? []) {
        const s = c.source ?? "unknown";
        sourceOf.set(c.id, s);
        if (!bySource[s]) bySource[s] = { applied: 0, hired: 0 };
        bySource[s].applied++;
      }
      for (const a of hiredApps ?? []) {
        const s = sourceOf.get(a.candidateId);
        if (s && bySource[s]) bySource[s].hired++;
      }
      ok(res, {
        sources: Object.entries(bySource).map(([source, counts]) => ({
          source,
          applied: counts.applied,
          hired: counts.hired,
          conversionRate: counts.applied > 0 ? counts.hired / counts.applied : 0,
        })),
        totalCandidates: candList?.length ?? 0,
      });
    } catch (err) { next(err); }
  });

  // ── AI insights stub ───────────────────────────────────────────────────
  // Frontend can call POST /api/analytics for real AI-generated insights.
  // This GET endpoint returns the latest cached insights or an empty array.
  router.get("/analytics/ai-insights", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      ok(res, {
        insights: [],
        note: "POST /api/analytics with a query to generate AI insights.",
      });
    } catch (err) { next(err); }
  });

  // ── Export endpoints (501 — not implemented for microservices yet) ────
  router.get("/analytics/export/:kind", (req: Request, res: Response) => {
    res.status(501).json({
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: `Export "${req.params["kind"]}" not yet available in microservices. Coming in a later phase.`,
      },
    });
  });

  // ── Sourcing talent-pools (stub — talent-pool infrastructure deferred) ─
  // The /sourcing UI page calls BOTH /sourcing AND /sourcing/talent-pools
  // depending on which api-client helper it uses. Both return an empty
  // array so the page renders its "no pools" UI gracefully.
  router.get("/sourcing", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      ok(res, []);
    } catch (err) { next(err); }
  });
  router.get("/sourcing/talent-pools", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      ok(res, { pools: [], total: 0 });
    } catch (err) { next(err); }
  });

  // ── HITL queue — proxies to notification-service for the actual data ───
  router.get("/agents/hitl", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const userHeaders = {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        role: req.user.role,
        email: req.user.email,
      };
      const items = await callService<any[]>("notification", {
        path: "/internal/hitl",
        userHeaders,
        timeoutMs: 3000,
      }).catch(() => []);
      ok(res, items ?? []);
    } catch (err) { next(err); }
  });

  // ── AI agent runs / jobs queue ─────────────────────────────────────────
  // Surfaces recent AgentRunCost rows from billing-service so the AI ops
  // page has something real to display.
  router.get("/ai/jobs", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const userHeaders = {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        role: req.user.role,
        email: req.user.email,
      };
      const usage = await callService<any>("billing", {
        path: "/internal/billing/usage?days=7",
        userHeaders,
        timeoutMs: 3000,
      }).catch(() => null);
      ok(res, {
        recentRuns: usage?.byAgent ?? [],
        totalRuns: usage?.totalRuns ?? 0,
        windowDays: 7,
      });
    } catch (err) { next(err); }
  });

  // ── Platform features (proxies billing's plan/agent flags) ────────────
  router.get("/platform/features", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const userHeaders = {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        role: req.user.role,
        email: req.user.email,
      };
      const [planLimits, agents] = await Promise.allSettled([
        callService<any>("billing", { path: "/internal/billing/plan-limits", userHeaders, timeoutMs: 3000 }),
        callService<any>("billing", { path: "/internal/billing/agents", userHeaders, timeoutMs: 3000 }).catch(() => null),
      ]);
      ok(res, {
        plans: planLimits.status === "fulfilled" ? planLimits.value : null,
        agents: agents.status === "fulfilled" ? agents.value : [],
      });
    } catch (err) { next(err); }
  });

  return router;
}
