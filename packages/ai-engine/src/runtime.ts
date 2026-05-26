/**
 * Agent runtime — the single entry point any service uses to invoke an agent.
 *
 *   const result = await runAgent({
 *     agentType: "resume-parser",
 *     input: { resumeText: "..." },
 *     context: { tenantId, userId, persistRun: (run) => prisma.agentRun.create({ data: run }) },
 *   });
 *
 * Phase 3: stub implementations return deterministic mock data fast.
 * Phase 3.5: swap stubs for real Claude/OpenAI calls using runtime.ts pattern
 * from D:\CDC\ATS\backend\src\lib\runtime.ts.
 */
import { randomUUID } from "crypto";

export type AgentType =
  | "resume-parser"
  | "candidate-screener"
  | "jd-author"
  | "interview-kit"
  | "interview-intelligence"
  | "interview-scheduler"
  | "candidate-assistant"
  | "sourcing"
  | "offer"
  | "analytics"
  | "bias-auditor"
  | "copilot";

export interface AgentContext {
  tenantId: string;
  userId: string | null;
  /**
   * Per-service persistence hook — called after the run completes (or fails)
   * with the full AgentRun record. The service is responsible for writing
   * to its own DB. The runtime never touches Prisma directly.
   */
  persistRun?: (run: AgentRunSnapshot) => Promise<void> | void;
}

export interface AgentRunSnapshot {
  agentRunId: string;
  agentType: AgentType;
  tenantId: string;
  userId: string | null;
  status: "COMPLETED" | "FAILED" | "BUDGET_EXCEEDED";
  inputHash: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  modelName: string;
  iterations: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt: Date;
}

export interface AgentResult<T> {
  agentRunId: string;
  output: T;
  snapshot: AgentRunSnapshot;
}

/** Each agent registers a handler here. */
export type AgentHandler<TIn, TOut> = (input: TIn, context: AgentContext) => Promise<TOut>;

const handlers = new Map<AgentType, AgentHandler<any, any>>();

export function registerAgent<TIn, TOut>(type: AgentType, handler: AgentHandler<TIn, TOut>) {
  handlers.set(type, handler as AgentHandler<any, any>);
}

export async function runAgent<TIn, TOut>(opts: {
  agentType: AgentType;
  input: TIn;
  context: AgentContext;
}): Promise<AgentResult<TOut>> {
  const handler = handlers.get(opts.agentType);
  if (!handler) throw new Error(`No handler registered for agent type: ${opts.agentType}`);

  const agentRunId = randomUUID();
  const startedAt = new Date();
  const inputHash = hashInput(opts.input);

  let output: TOut;
  let status: AgentRunSnapshot["status"] = "COMPLETED";
  let errorMessage: string | undefined;
  let costUsd = 0;
  let tokensIn = 0;
  let tokensOut = 0;

  try {
    output = (await handler(opts.input, opts.context)) as TOut;
    // Stub costs: scaled by input size
    const inputSize = JSON.stringify(opts.input).length;
    tokensIn = Math.ceil(inputSize / 4);
    tokensOut = Math.ceil(inputSize / 8);
    costUsd = (tokensIn * 0.000003) + (tokensOut * 0.000015);
  } catch (err) {
    status = "FAILED";
    errorMessage = err instanceof Error ? err.message : String(err);
    output = {} as TOut;
  }

  const completedAt = new Date();
  const snapshot: AgentRunSnapshot = {
    agentRunId,
    agentType: opts.agentType,
    tenantId: opts.context.tenantId,
    userId: opts.context.userId,
    status,
    inputHash,
    tokensIn,
    tokensOut,
    costUsd: Number(costUsd.toFixed(6)),
    latencyMs: completedAt.getTime() - startedAt.getTime(),
    modelName: "stub-claude-sonnet-4.5",
    iterations: 1,
    errorMessage,
    startedAt,
    completedAt,
  };

  if (opts.context.persistRun) {
    try {
      await opts.context.persistRun(snapshot);
    } catch {
      // Persistence failure is logged elsewhere; agent run already happened
    }
  }

  if (status === "FAILED") throw new Error(errorMessage);
  return { agentRunId, output, snapshot };
}

function hashInput(input: unknown): string {
  const json = JSON.stringify(input);
  let h = 0;
  for (let i = 0; i < json.length; i++) {
    h = ((h << 5) - h) + json.charCodeAt(i);
    h |= 0;
  }
  return `h_${Math.abs(h).toString(36)}`;
}
