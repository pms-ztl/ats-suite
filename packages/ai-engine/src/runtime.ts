/**
 * Agent runtime — the single entry point any service uses to invoke an agent.
 *
 *   const result = await runAgent({
 *     agentType: "resume-parser",
 *     input: { resumeText: "..." },
 *     context: { tenantId, userId, persistRun: (run) => prisma.agentRun.create({ data: run }) },
 *   });
 *
 * Two execution paths:
 *  - REAL: when ANTHROPIC_API_KEY is set, calls Claude via Vercel AI SDK's
 *    generateObject() with the agent's Zod schema. Repairs on validation failure.
 *  - STUB: when no key is set, runs a deterministic handler the agent registered
 *    via `registerStub()`. Lets dev/CI work without an API key.
 *
 * The runtime never touches Prisma — services pass a `persistRun` callback so
 * each service writes AgentRun to its own DB (DB-per-service principle).
 */
import { randomUUID, createHash } from "crypto";
import { z, type ZodType } from "zod";
import { generateObject, type LanguageModelV1 } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai, createOpenAI } from "@ai-sdk/openai";

// OpenRouter is OpenAI-API-compatible. When OPENROUTER_API_KEY is set we
// route ALL model calls through it (single API for both Anthropic + OpenAI
// model families). Otherwise we use the native SDKs with their respective
// keys. Lazy: only constructs the OpenRouter client when needed.
const openRouter = process.env["OPENROUTER_API_KEY"]
  ? createOpenAI({
      apiKey: process.env["OPENROUTER_API_KEY"],
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        // Required by OpenRouter for attribution + ranking
        "HTTP-Referer": process.env["OPENROUTER_REFERER"] ?? "https://cdc-ats.local",
        "X-Title": process.env["OPENROUTER_APP_TITLE"] ?? "CDC ATS",
      },
    })
  : null;

/** Maps short logical names to OpenRouter slugs. */
const OPENROUTER_MODEL_MAP: Record<string, string> = {
  "claude-sonnet-4-20250514":   "anthropic/claude-sonnet-4",
  "claude-3-5-sonnet-20241022": "anthropic/claude-3.5-sonnet",
  "claude-3-5-haiku-20241022":  "anthropic/claude-3.5-haiku",
  "gpt-4o-2024-11-20":          "openai/gpt-4o",
  "gpt-4o-mini":                "openai/gpt-4o-mini",
};

// ── Types ────────────────────────────────────────────────────────────────────

export type AgentType =
  | "resume-parser"
  | "candidate-screener"
  | "jd-author"
  | "interview-kit"
  | "interview-intelligence"
  | "scheduling"
  | "candidate-experience"
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
  status: "COMPLETED" | "FAILED" | "BUDGET_EXCEEDED" | "REPAIR_FAILED";
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

/**
 * Real LLM-backed agent definition. The runtime uses these when an API key
 * is configured. If the key is missing, it falls back to the registered stub.
 */
export interface AgentDefinition<TIn, TOut> {
  name: AgentType;
  systemPrompt: string;
  /** Build a user-facing prompt from typed input. */
  buildUserPrompt: (input: TIn) => string;
  /** Zod schema for the structured output. */
  outputSchema: ZodType<TOut>;
  /** Default `claude-sonnet-4-20250514`. */
  modelId?: string;
  /** Max repair attempts on schema validation failure. Default 3. */
  maxRepairAttempts?: number;
  /** Max total cost in USD per run before aborting. Default 0.50. */
  maxCostUsd?: number;
}

/** Each agent registers a stub handler that runs when no API key is set. */
export type StubHandler<TIn, TOut> = (input: TIn, context: AgentContext) => Promise<TOut>;

const definitions = new Map<AgentType, AgentDefinition<any, any>>();
const stubs = new Map<AgentType, StubHandler<any, any>>();

export function registerAgent<TIn, TOut>(def: AgentDefinition<TIn, TOut>) {
  definitions.set(def.name, def);
}

export function registerStub<TIn, TOut>(type: AgentType, handler: StubHandler<TIn, TOut>) {
  stubs.set(type, handler as StubHandler<any, any>);
}

// ── Model costs (USD per 1M tokens) ─────────────────────────────────────────

const MODEL_COSTS: Record<string, { inputPer1m: number; outputPer1m: number }> = {
  "claude-sonnet-4-20250514": { inputPer1m: 3.0, outputPer1m: 15.0 },
  "claude-3-5-sonnet-20241022": { inputPer1m: 3.0, outputPer1m: 15.0 },
  "claude-3-5-haiku-20241022": { inputPer1m: 1.0, outputPer1m: 5.0 },
  "gpt-4o-2024-11-20": { inputPer1m: 2.5, outputPer1m: 10.0 },
  "gpt-4o-mini": { inputPer1m: 0.15, outputPer1m: 0.60 },
};

function estimateCost(modelId: string, tokensIn: number, tokensOut: number): number {
  const rates = MODEL_COSTS[modelId] ?? { inputPer1m: 3.0, outputPer1m: 15.0 };
  return (tokensIn / 1_000_000) * rates.inputPer1m + (tokensOut / 1_000_000) * rates.outputPer1m;
}

function getModel(modelId: string): LanguageModelV1 {
  // 1. OpenRouter takes priority — single API for all model families
  if (openRouter) {
    const routedId = OPENROUTER_MODEL_MAP[modelId] ?? modelId;
    return openRouter(routedId);
  }
  // 2. Native SDKs as fallback
  if (modelId.startsWith("claude") || modelId.startsWith("anthropic")) {
    return anthropic(modelId);
  }
  return openai(modelId);
}

/** Returns true when the agent should run against a real LLM. */
function realLLMAvailable(modelId: string): boolean {
  // OpenRouter covers all model families
  if (process.env["OPENROUTER_API_KEY"]) return true;
  if (modelId.startsWith("claude") || modelId.startsWith("anthropic")) {
    return !!process.env["ANTHROPIC_API_KEY"];
  }
  return !!process.env["OPENAI_API_KEY"];
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function runAgent<TIn, TOut>(opts: {
  agentType: AgentType;
  input: TIn;
  context: AgentContext;
}): Promise<AgentResult<TOut>> {
  const def = definitions.get(opts.agentType);
  const stub = stubs.get(opts.agentType);
  if (!def && !stub) {
    throw new Error(`No agent registered for type: ${opts.agentType}`);
  }

  const agentRunId = randomUUID();
  const startedAt = new Date();
  const inputHash = hashInput(opts.input);
  const modelId = def?.modelId ?? "claude-sonnet-4-20250514";
  const useReal = !!def && realLLMAvailable(modelId);

  let output: TOut = {} as TOut;
  let status: AgentRunSnapshot["status"] = "COMPLETED";
  let errorMessage: string | undefined;
  let tokensIn = 0;
  let tokensOut = 0;
  let iterations = 0;
  let costUsd = 0;
  let modelName = useReal ? modelId : "stub-deterministic";

  try {
    if (useReal && def) {
      const real = await callRealLLM<TIn, TOut>(def, opts.input, opts.context);
      output = real.output;
      tokensIn = real.tokensIn;
      tokensOut = real.tokensOut;
      iterations = real.iterations;
      costUsd = real.costUsd;
    } else if (stub) {
      output = await stub(opts.input, opts.context);
      // Stub cost model: scaled by input size
      const inputSize = JSON.stringify(opts.input).length;
      tokensIn = Math.ceil(inputSize / 4);
      tokensOut = Math.ceil(inputSize / 8);
      costUsd = (tokensIn * 0.000003) + (tokensOut * 0.000015);
      iterations = 1;
    } else {
      throw new Error(
        `Agent ${opts.agentType} has a real definition but no stub fallback, and no API key is configured.`
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.startsWith("REPAIR_FAILED")) status = "REPAIR_FAILED";
    else if (msg.startsWith("BUDGET_EXCEEDED")) status = "BUDGET_EXCEEDED";
    else status = "FAILED";
    errorMessage = msg;
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
    modelName,
    iterations,
    errorMessage,
    startedAt,
    completedAt,
  };

  if (opts.context.persistRun) {
    try {
      await opts.context.persistRun(snapshot);
    } catch {
      // Persistence failure is logged elsewhere; the run already happened
    }
  }

  if (status !== "COMPLETED") {
    throw new Error(errorMessage ?? "Agent run failed");
  }
  return { agentRunId, output, snapshot };
}

// ── Real LLM execution (generateObject with repair loop) ────────────────────

async function callRealLLM<TIn, TOut>(
  def: AgentDefinition<TIn, TOut>,
  input: TIn,
  _ctx: AgentContext,
): Promise<{ output: TOut; tokensIn: number; tokensOut: number; iterations: number; costUsd: number }> {
  const modelId = def.modelId ?? "claude-sonnet-4-20250514";
  const maxRepairs = def.maxRepairAttempts ?? 3;
  const maxCost = def.maxCostUsd ?? 0.50;
  const userPrompt = def.buildUserPrompt(input);

  let totalIn = 0;
  let totalOut = 0;
  let totalCost = 0;
  let iterations = 0;
  let lastError: string | null = null;

  for (let attempt = 0; attempt <= maxRepairs; attempt++) {
    iterations++;
    if (totalCost >= maxCost) {
      throw new Error(`BUDGET_EXCEEDED: agent ${def.name} hit cost cap $${maxCost.toFixed(2)}`);
    }

    const prompt = lastError
      ? `${userPrompt}\n\nYour previous response failed schema validation: ${lastError}\nReturn a corrected response that conforms to the schema.`
      : userPrompt;

    try {
      const result = await generateObject({
        model: getModel(modelId),
        schema: def.outputSchema as any,
        system: def.systemPrompt,
        prompt,
      });

      const inTok = result.usage?.promptTokens ?? 0;
      const outTok = result.usage?.completionTokens ?? 0;
      totalIn += inTok;
      totalOut += outTok;
      totalCost += estimateCost(modelId, inTok, outTok);

      return {
        output: result.object as TOut,
        tokensIn: totalIn,
        tokensOut: totalOut,
        iterations,
        costUsd: totalCost,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt === maxRepairs) {
        throw new Error(
          `REPAIR_FAILED: agent ${def.name} failed after ${maxRepairs + 1} attempts. Last error: ${lastError}`
        );
      }
    }
  }
  throw new Error("REPAIR_FAILED: unreachable");
}

// ── Utilities ───────────────────────────────────────────────────────────────

function hashInput(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 16);
}

// Re-export zod for agent definition files
export { z };
