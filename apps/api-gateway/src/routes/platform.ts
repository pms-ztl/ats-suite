/**
 * Platform aggregator routes — combine data from multiple services into a
 * single dashboard payload. The frontend's main dashboard hits these.
 *
 * GET /api/platform/unified-overview
 *   - Fan-out: job-service /internal/requisitions/overview
 *              candidate-service /internal/candidates/overview
 *              billing-service /internal/billing/overview
 *   - Combines results into the shape the dashboard's main page expects.
 *   - Each fan-out is best-effort: if one service errors, return null fields
 *     for that slice so the dashboard renders partial data instead of crashing.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import type { Logger } from "pino";
import { ok, Errors } from "@cdc-ats/common";
import { callService } from "../lib/service-client.js";

interface ReqOverview {
  openRequisitions: number;
  totalRequisitions: number;
  byStatus: Record<string, number>;
}
interface CandOverview {
  totalCandidates: number;
  activeCandidates: number;
  activeApplications: number;
  hiredApplications: number;
  applicationsByStage: Record<string, number>;
  // Additive real KPIs (candidate-service /internal/candidates/overview).
  // null/[]/absent = honest "no data", never a fabricated 0.
  avgTimeToHire?: number | null;
  weeklyInflow?: Array<{ label: string; n: number }>;
  offerAcceptRate?: number | null;
  offersAccepted?: number;
  offersExtended?: number;
}
interface BillingOverview {
  aiDecisionsToday: number;
  totalAgentRuns: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number;
  // Additive real KPI (billing-service /internal/billing/overview).
  spendSparkline?: Array<{ label: string; cost: number }>;
}

// Percent change between two real prior-vs-current values. Returns null (so the
// caller OMITS the field) when there is no usable prior period — never a fake 0%.
function pctChange(current: number, prior: number): number | null {
  if (!isFinite(current) || !isFinite(prior) || prior <= 0) return null;
  return Number((((current - prior) / prior) * 100).toFixed(1));
}

export function platformRouter(logger: Logger): Router {
  const router = Router();

  router.get("/unified-overview", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const userHeaders = {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        role: req.user.role,
        email: req.user.email,
        requestId: req.headers["x-request-id"] as string | undefined,
      };

      const [reqRes, candRes, billRes] = await Promise.allSettled([
        callService<ReqOverview>("job", {
          path: "/internal/requisitions/overview",
          userHeaders,
          timeoutMs: 3000,
        }),
        callService<CandOverview>("candidate", {
          path: "/internal/candidates/overview",
          userHeaders,
          timeoutMs: 3000,
        }),
        callService<BillingOverview>("billing", {
          path: "/internal/billing/overview",
          userHeaders,
          timeoutMs: 3000,
        }),
      ]);

      const reqData = reqRes.status === "fulfilled" ? reqRes.value : null;
      const candData = candRes.status === "fulfilled" ? candRes.value : null;
      const billData = billRes.status === "fulfilled" ? billRes.value : null;

      // Log any partial failures so they're visible (but don't fail the whole request)
      if (reqRes.status === "rejected") {
        logger.warn({ err: reqRes.reason }, "platform-overview: job-service slice failed");
      }
      if (candRes.status === "rejected") {
        logger.warn({ err: candRes.reason }, "platform-overview: candidate-service slice failed");
      }
      if (billRes.status === "rejected") {
        logger.warn({ err: billRes.reason }, "platform-overview: billing-service slice failed");
      }

      // --- Real, derivable KPIs (additive; honest-null/empty otherwise) -------
      // weeklyInflow: applications per ISO week (last 8) from candidate-service.
      // Used as the active-candidates momentum sparkline; the week-over-week
      // delta is a real prior-vs-current comparison (omitted when no prior week).
      const weeklyInflow = candData?.weeklyInflow ?? [];
      const inflowSpark = weeklyInflow.map((w) => w.n);
      let activeCandidatesChange: number | null = null;
      if (weeklyInflow.length >= 2) {
        const last = weeklyInflow[weeklyInflow.length - 1]!.n;
        const prev = weeklyInflow[weeklyInflow.length - 2]!.n;
        activeCandidatesChange = pctChange(last, prev);
      }

      // spendSparkline: AI cost per day (last 14) from billing-service. Real
      // spend delta = last 7 days vs the prior 7 days (omitted when prior is 0).
      const spendSpark = billData?.spendSparkline ?? [];
      const spendSparkValues = spendSpark.map((d) => d.cost);
      let spendChange: number | null = null;
      if (spendSpark.length >= 14) {
        const prior7 = spendSpark.slice(0, 7).reduce((s, d) => s + d.cost, 0);
        const last7 = spendSpark.slice(7).reduce((s, d) => s + d.cost, 0);
        spendChange = pctChange(last7, prior7);
      }

      const avgTimeToHire = candData?.avgTimeToHire ?? null;
      const offerAcceptRate = candData?.offerAcceptRate ?? null;

      // Build the response shape the dashboard expects. Use null for
      // not-yet-implemented metrics so the UI renders "—" honestly.
      ok(res, {
        // Counts from job + candidate + billing services
        openRequisitions: reqData?.openRequisitions ?? 0,
        totalRequisitions: reqData?.totalRequisitions ?? 0,
        activeCandidates: candData?.activeCandidates ?? 0,
        totalCandidates: candData?.totalCandidates ?? 0,
        hiredApplications: candData?.hiredApplications ?? 0,
        aiDecisionsToday: billData?.aiDecisionsToday ?? 0,
        totalAgentRuns: billData?.totalAgentRuns ?? 0,

        // Real derived metrics (null when there is genuinely no data yet)
        avgTimeToHire,              // mean days hired apps spent in pipeline | null
        offerAcceptRate,            // accepted / extended offers, percent | null
        offersAccepted: candData?.offersAccepted ?? null,
        offersExtended: candData?.offersExtended ?? null,

        // Still honest-null — no demographic / audit-pass-rate store exists
        complianceScore: null,      // needs audit-trail pass-rate
        diversityScore: null,       // needs demographic data + parity calc
        costPerHire: candData?.hiredApplications && billData?.totalCostUsd
          ? Number((billData.totalCostUsd / candData.hiredApplications).toFixed(2))
          : null,

        // Real sparklines (empty array = no data; frontend keeps honest empty state)
        activeCandidatesSparkline: inflowSpark,   // weekly application inflow (8 pts)
        weeklyInflow,                             // labelled series (for richer viz)
        spendSparkline: spendSpark,               // labelled per-day AI spend (14 pts)
        aiSpendSparkline: spendSparkValues,       // bare values for a simple sparkline

        // Real period deltas — present ONLY when a real prior period exists.
        // (Omitted entirely otherwise; the frontend then suppresses the pill.)
        ...(activeCandidatesChange !== null ? { activeCandidatesChange } : {}),
        ...(spendChange !== null ? { aiSpendChange: spendChange } : {}),

        // Per-stage funnel for the chart
        pipelineData: candData?.applicationsByStage
          ? Object.entries(candData.applicationsByStage).map(([stage, count]) => ({
              name: stage,
              value: count,
            }))
          : null,

        // Reserved for future analytics service
        timeSeriesData: null,
        diversityData: null,

        // Source visibility — which slices were live this request
        _partialErrors: {
          job: reqRes.status === "rejected",
          candidate: candRes.status === "rejected",
          billing: billRes.status === "rejected",
        },
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
