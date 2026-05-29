/** Agent-orchestration logic + run persistence — pure of HTTP concerns. */
import { runAgent, hasAgenticAgent, type AgentRunSnapshot } from "@cdc-ats/ai-engine";
import { Errors } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

// Single-shot agents (one structured generateObject pass, no service-specific
// investigation tools) — runnable centrally here.
export const SINGLE_SHOT = [
  "jd-author", "interview-kit", "interview-questions", "cover-letter-analyzer",
  "analytics", "bias-auditor", "offer", "sourcing", "interview-intelligence",
  "scheduling", "candidate-experience", "copilot", "resume-parser", "screening",
  "github-corroborator",
] as const;

// Agentic (ReAct + tools that read the owning service's DB) — hosted there for
// now; they migrate to a tool-callback protocol later.
export const AGENTIC_IN_OWNING_SERVICE = [
  "candidate-screener", "sourcing", "scheduling", "copilot", "analytics",
  "candidate-experience", "offer", "bias-auditor", "resume-verifier",
];

export function registry() {
  return { singleShot: SINGLE_SHOT, agenticHostedInOwningService: AGENTIC_IN_OWNING_SERVICE };
}

export async function runById(tenantId: string, userId: string, agentType: string, input: Record<string, any>) {
  if (hasAgenticAgent(agentType as any)) {
    throw Errors.validation(
      `'${agentType}' is an agentic (tool-using) agent and currently runs inside its owning service.`,
    );
  }
  const persistRun = async (run: AgentRunSnapshot) => {
    await prisma.agentRun
      .create({
        data: {
          id: run.agentRunId, tenantId: run.tenantId, agentType: run.agentType, status: run.status,
          inputHash: run.inputHash, tokensIn: run.tokensIn, tokensOut: run.tokensOut, costUsd: run.costUsd,
          latencyMs: run.latencyMs, modelName: run.modelName, iterations: run.iterations,
          errorMessage: run.errorMessage ?? null, triggeredByUserId: run.userId,
        },
      })
      .catch(() => {});
  };
  const result = await runAgent({ agentType: agentType as any, input, context: { tenantId, userId, persistRun } });
  return { agentRunId: result.agentRunId, output: result.output, snapshot: result.snapshot };
}

export async function getRun(tenantId: string, id: string) {
  const row = await prisma.agentRun.findFirst({ where: { id, tenantId } });
  if (!row) throw Errors.notFound("AgentRun");
  return row;
}

export async function listRuns(tenantId: string, agentType?: string) {
  const where: { tenantId: string; agentType?: string } = { tenantId };
  if (agentType) where.agentType = agentType;
  return prisma.agentRun.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
}
