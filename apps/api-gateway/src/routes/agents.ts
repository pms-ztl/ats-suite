/**
 * Gateway-hosted agent routes — for agents that aggregate across services.
 *
 *  POST /api/analytics      — analytics agent over the platform overview
 *  POST /api/bias-auditor   — bias-auditor over caller-provided stats
 *  POST /api/copilot        — copilot agent over a cross-service search
 *
 * Each route exports its own Router with POST "/" so the gateway can mount
 * them at distinct paths without shadowing.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import type { Logger } from "pino";
import { ok, Errors } from "@cdc-ats/common";
import {
  runAgent,
  publishAgentCompleted,
  type AnalyticsInput,
  type AnalyticsOutput,
  type BiasAuditorInput,
  type BiasAuditorOutput,
  type CopilotInput,
  type CopilotOutput,
} from "@cdc-ats/ai-engine";
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
interface BillOverview {
  aiDecisionsToday: number;
  totalAgentRuns: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number;
}

// ── Analytics ────────────────────────────────────────────────────────────────

const AnalyticsRequestSchema = z.object({
  query: z.string().min(3).max(500),
  timeRangeDays: z.number().int().min(1).max(365).optional(),
  department: z.string().max(100).optional(),
});

export function analyticsAgentRouter(logger: Logger): Router {
  const router = Router();
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const body = AnalyticsRequestSchema.parse(req.body);
      const userHeaders = {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        role: req.user.role,
        email: req.user.email,
      };

      const [reqRes, candRes, billRes] = await Promise.allSettled([
        callService<ReqOverview>("job", { path: "/internal/requisitions/overview", userHeaders, timeoutMs: 3000 }),
        callService<CandOverview>("candidate", { path: "/internal/candidates/overview", userHeaders, timeoutMs: 3000 }),
        callService<BillOverview>("billing", { path: "/internal/billing/overview", userHeaders, timeoutMs: 3000 }),
      ]);

      const req2 = reqRes.status === "fulfilled" ? reqRes.value : null;
      const cand = candRes.status === "fulfilled" ? candRes.value : null;
      const bill = billRes.status === "fulfilled" ? billRes.value : null;

      const result = await runAgent<AnalyticsInput, AnalyticsOutput>({
        agentType: "analytics",
        input: {
          query: body.query,
          ...(body.timeRangeDays != null ? { timeRangeDays: body.timeRangeDays } : {}),
          ...(body.department ? { department: body.department } : {}),
          metrics: {
            openRequisitions: req2?.openRequisitions ?? 0,
            totalCandidates: cand?.totalCandidates ?? 0,
            activeApplications: cand?.activeApplications ?? 0,
            hiredApplications: cand?.hiredApplications ?? 0,
            applicationsByStage: cand?.applicationsByStage ?? {},
            aiDecisionsToday: bill?.aiDecisionsToday ?? 0,
            totalAgentRuns: bill?.totalAgentRuns ?? 0,
            totalCostUsd: bill?.totalCostUsd ?? 0,
          },
        },
        context: { tenantId: req.user.tenantId, userId: req.user.id, persistRun: publishAgentCompleted(logger) },
      });

      ok(res, {
        ...result.output,
        agentRunId: result.agentRunId,
        tokensUsed: result.snapshot.tokensIn + result.snapshot.tokensOut,
        costUsd: result.snapshot.costUsd,
        modelName: result.snapshot.modelName,
      });
    } catch (err) {
      next(err);
    }
  });
  return router;
}

// ── Bias Auditor ────────────────────────────────────────────────────────────

const BiasRequestSchema = z.object({
  data: z
    .array(
      z.object({
        attribute: z.string(),
        stage: z.string(),
        groups: z.array(
          z.object({
            name: z.string(),
            applicants: z.number().int().min(0),
            selected: z.number().int().min(0),
            selectionRate: z.number().min(0).max(1),
          }),
        ),
        adverseImpactRatio: z.number().min(0),
        fourFifthsPass: z.boolean(),
        highestRateGroup: z.string(),
        lowestRateGroup: z.string(),
      }),
    )
    .min(1),
  timeRangeDays: z.number().int().min(1).max(365).optional(),
});

export function biasAuditorRouter(logger: Logger): Router {
  const router = Router();
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const body = BiasRequestSchema.parse(req.body);

      const result = await runAgent<BiasAuditorInput, BiasAuditorOutput>({
        agentType: "bias-auditor",
        input: body as BiasAuditorInput,
        context: { tenantId: req.user.tenantId, userId: req.user.id, persistRun: publishAgentCompleted(logger) },
      });

      ok(res, {
        ...result.output,
        agentRunId: result.agentRunId,
        tokensUsed: result.snapshot.tokensIn + result.snapshot.tokensOut,
        costUsd: result.snapshot.costUsd,
        modelName: result.snapshot.modelName,
      });
    } catch (err) {
      next(err);
    }
  });
  return router;
}

// ── Copilot ──────────────────────────────────────────────────────────────────

const CopilotRequestSchema = z.object({
  query: z.string().min(3).max(500),
  context: z
    .object({
      currentPage: z.string().optional(),
      selectedEntities: z.array(z.object({ type: z.string(), id: z.string() })).optional(),
    })
    .optional(),
});

export function copilotRouter(logger: Logger): Router {
  const router = Router();
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const body = CopilotRequestSchema.parse(req.body);
      const userHeaders = {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        role: req.user.role,
        email: req.user.email,
      };

      const [candRes, reqRes, billRes] = await Promise.allSettled([
        callService<any[]>("candidate", { path: "/internal/candidates", userHeaders, timeoutMs: 3000 }),
        callService<any[]>("job", { path: "/internal/requisitions", userHeaders, timeoutMs: 3000 }),
        callService<BillOverview>("billing", { path: "/internal/billing/overview", userHeaders, timeoutMs: 3000 }),
      ]);

      const candidates = (candRes.status === "fulfilled" ? candRes.value : []).slice(0, 10).map((c: any) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        snippet: c.summary ?? (c.tags ?? []).slice(0, 3).join(", "),
      }));
      const requisitions = (reqRes.status === "fulfilled" ? reqRes.value : []).slice(0, 10).map((r: any) => ({
        id: r.id,
        title: r.title,
        snippet: `${r.department} · ${r.status} · ${r.location ?? ""}`,
      }));
      const bill = billRes.status === "fulfilled" ? billRes.value : null;
      const metrics = bill
        ? [
            { name: "aiDecisionsToday", value: bill.aiDecisionsToday, unit: "runs" },
            { name: "totalCostUsd", value: bill.totalCostUsd, unit: "USD" },
            { name: "totalAgentRuns", value: bill.totalAgentRuns, unit: "runs" },
          ]
        : [];

      const result = await runAgent<CopilotInput, CopilotOutput>({
        agentType: "copilot",
        input: {
          query: body.query,
          searchResults: { candidates, requisitions, metrics },
          ...(body.context ? { context: body.context } : {}),
        },
        context: { tenantId: req.user.tenantId, userId: req.user.id, persistRun: publishAgentCompleted(logger) },
      });

      ok(res, {
        ...result.output,
        agentRunId: result.agentRunId,
        tokensUsed: result.snapshot.tokensIn + result.snapshot.tokensOut,
        costUsd: result.snapshot.costUsd,
        modelName: result.snapshot.modelName,
      });
    } catch (err) {
      next(err);
    }
  });
  return router;
}
