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
}
interface BillingOverview {
  aiDecisionsToday: number;
  totalAgentRuns: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number;
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

        // Derivable metrics — null until backed by real history
        avgTimeToHire: null,        // needs hired_at-applied_at history
        offerAcceptRate: null,      // needs OFFERED + (HIRED|REJECTED) counts
        complianceScore: null,      // needs audit-trail pass-rate
        diversityScore: null,       // needs demographic data + parity calc
        costPerHire: candData?.hiredApplications && billData?.totalCostUsd
          ? Number((billData.totalCostUsd / candData.hiredApplications).toFixed(2))
          : null,

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
