/**
 * Agentic runtime — a genuine ReAct (reason → act → observe → repeat) loop,
 * as opposed to the single-shot generateObject() path in runtime.ts.
 *
 * What makes this "agentic" and not just "AI-powered":
 *   1. TOOL USE      — the model calls tools, sees their results, and decides
 *                      what to do next. It can investigate before judging.
 *   2. MULTI-STEP    — generateText({ maxSteps }) loops automatically: each
 *      REASONING       tool result is fed back into the model, which reasons
 *                      again. Not one prompt → one answer.
 *   3. MEMORY/TRACE  — every thought, tool call, and observation is recorded
 *                      into an AgentStep[] trace (working memory + an audit
 *                      trail). Tools can also read PAST runs (cross-run memory).
 *   4. AUTONOMY      — tools can take real actions in the world (e.g. open a
 *                      human-review task), not just return text.
 *
 * Separation of concerns (preserves DB-per-service):
 *   - The ai-engine declares tool *interfaces* (name + description + Zod params).
 *     It never touches a database or another service.
 *   - The calling service supplies the tool *implementations* via
 *     `AgenticContext.toolImpls`. Those are free to hit Prisma / other services.
 *
 * Structured final output uses the "answer tool" pattern: a terminal tool whose
 * parameters ARE the output schema and which has no executor — calling it ends
 * the loop and yields the typed verdict. If the model exhausts its step budget
 * without answering, we force one final generateObject() over the gathered
 * evidence so a run always produces a verdict.
 */
import { randomUUID } from "crypto";
import { z, type ZodType } from "zod";
import { generateText, generateObject, tool, type CoreMessage } from "ai";
import { getModel, estimateCost, realLLMAvailable } from "./runtime.js";
import type { AgentType, AgentContext, AgentRunSnapshot } from "./runtime.js";

// ── Types ────────────────────────────────────────────────────────────────────

/**
 * A tool the agent can call. Declared in the engine (interface only); the
 * implementation is injected by the calling service at runtime.
 */
export interface AgenticToolDef<TArgs = any> {
  name: string;
  description: string;
  /** Zod schema for the tool's arguments — also drives the model's tool schema. */
  parameters: ZodType<TArgs>;
}

/** Service-provided implementation for a declared tool. */
export type ToolImpl<TArgs = any, TResult = any> = (
  args: TArgs,
  ctx: AgenticContext,
) => Promise<TResult> | TResult;

/** One entry in the agent's reasoning trace (working memory + audit log). */
export interface AgentStep {
  index: number;
  kind: "reasoning" | "tool_call" | "observation" | "answer" | "error";
  /** Free-text the model emitted at this step (its "thought"). */
  text?: string;
  toolName?: string;
  args?: unknown;
  /** Stringified observation returned by the tool. Truncated for storage. */
  observation?: string;
  ok?: boolean;
}

export interface AgenticContext extends AgentContext {
  /** name → implementation. Every tool the agent declares must have one. */
  toolImpls: Record<string, ToolImpl>;
  /** Optional override of step budget. */
  maxSteps?: number;
}

export interface AgenticAgentDefinition<TIn, TOut> {
  name: AgentType;
  systemPrompt: string;
  buildUserPrompt: (input: TIn) => string;
  /** The investigation tools the agent may call (interfaces only). */
  tools: AgenticToolDef[];
  /** Schema of the final verdict, surfaced as the terminal `submit_*` tool. */
  answerSchema: ZodType<TOut>;
  /** Name of the terminal answer tool. Default `submit_assessment`. */
  answerToolName?: string;
  modelId?: string;
  /** ReAct step budget (model turns). Default 8. */
  maxSteps?: number;
  /** Hard cost ceiling per run in USD. Default 0.40. */
  maxCostUsd?: number;
}

export interface AgenticResult<T> {
  agentRunId: string;
  output: T;
  steps: AgentStep[];
  toolsUsed: string[];
  snapshot: AgentRunSnapshot;
}

// ── Registry ─────────────────────────────────────────────────────────────────

const agenticDefs = new Map<AgentType, AgenticAgentDefinition<any, any>>();
/** Deterministic fallback when no LLM key is configured (CI / offline dev). */
export type AgenticStub<TIn, TOut> = (
  input: TIn,
  ctx: AgenticContext,
) => Promise<{ output: TOut; steps: AgentStep[]; toolsUsed: string[] }>;
const agenticStubs = new Map<AgentType, AgenticStub<any, any>>();

export function registerAgenticAgent<TIn, TOut>(def: AgenticAgentDefinition<TIn, TOut>) {
  agenticDefs.set(def.name, def);
}
export function registerAgenticStub<TIn, TOut>(name: AgentType, stub: AgenticStub<TIn, TOut>) {
  agenticStubs.set(name, stub as AgenticStub<any, any>);
}
export function hasAgenticAgent(name: AgentType): boolean {
  return agenticDefs.has(name);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const truncate = (s: string, n = 1200) => (s.length > n ? s.slice(0, n) + "…[truncated]" : s);

function summariseObservation(result: unknown): string {
  if (result === null || result === undefined) return "(no result)";
  if (typeof result === "string") return truncate(result);
  try {
    return truncate(JSON.stringify(result));
  } catch {
    return String(result);
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function runAgenticAgent<TIn, TOut>(opts: {
  agentType: AgentType;
  input: TIn;
  context: AgenticContext;
}): Promise<AgenticResult<TOut>> {
  const def = agenticDefs.get(opts.agentType);
  const stub = agenticStubs.get(opts.agentType);
  if (!def && !stub) throw new Error(`No agentic agent registered for type: ${opts.agentType}`);

  const agentRunId = randomUUID();
  const startedAt = new Date();
  const modelId = def?.modelId ?? "claude-sonnet-4-20250514";
  const useReal = !!def && realLLMAvailable(modelId);

  let output = {} as TOut;
  let steps: AgentStep[] = [];
  let toolsUsed: string[] = [];
  let status: AgentRunSnapshot["status"] = "COMPLETED";
  let errorMessage: string | undefined;
  let tokensIn = 0;
  let tokensOut = 0;
  let costUsd = 0;
  let iterations = 0;
  let modelName = useReal ? modelId : "stub-deterministic";

  try {
    if (useReal && def) {
      const real = await runReActLoop<TIn, TOut>(def, opts.input, opts.context, modelId);
      output = real.output;
      steps = real.steps;
      toolsUsed = real.toolsUsed;
      tokensIn = real.tokensIn;
      tokensOut = real.tokensOut;
      costUsd = real.costUsd;
      iterations = real.iterations;
    } else if (stub) {
      const s = await stub(opts.input, opts.context);
      output = s.output;
      steps = s.steps;
      toolsUsed = s.toolsUsed;
      iterations = s.steps.length;
      const inputSize = JSON.stringify(opts.input).length;
      tokensIn = Math.ceil(inputSize / 4);
      tokensOut = Math.ceil(inputSize / 8);
      costUsd = 0;
    } else {
      throw new Error(`Agentic agent ${opts.agentType} has no stub and no API key is configured.`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.startsWith("BUDGET_EXCEEDED")) status = "BUDGET_EXCEEDED";
    else status = "FAILED";
    errorMessage = msg;
    steps.push({ index: steps.length, kind: "error", text: msg });
  }

  const completedAt = new Date();
  const snapshot: AgentRunSnapshot = {
    agentRunId,
    agentType: opts.agentType,
    tenantId: opts.context.tenantId,
    userId: opts.context.userId,
    status,
    inputHash: randomUUID().slice(0, 16),
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
      /* persistence best-effort */
    }
  }

  if (status !== "COMPLETED") throw new Error(errorMessage ?? "Agentic run failed");
  return { agentRunId, output, steps, toolsUsed, snapshot };
}

// ── The ReAct loop ───────────────────────────────────────────────────────────

async function runReActLoop<TIn, TOut>(
  def: AgenticAgentDefinition<TIn, TOut>,
  input: TIn,
  ctx: AgenticContext,
  modelId: string,
): Promise<{
  output: TOut;
  steps: AgentStep[];
  toolsUsed: string[];
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  iterations: number;
}> {
  const maxSteps = ctx.maxSteps ?? def.maxSteps ?? 8;
  const maxCost = def.maxCostUsd ?? 0.4;
  const answerToolName = def.answerToolName ?? "submit_assessment";

  const steps: AgentStep[] = [];
  const toolsUsed = new Set<string>();
  let answer: TOut | undefined;
  let totalIn = 0;
  let totalOut = 0;
  let totalCost = 0;

  // Build the AI-SDK tool map. Investigation tools wrap the service-provided
  // implementation and record a trace entry. The terminal answer tool has NO
  // executor, so the SDK stops the loop when the model calls it.
  // Loose typing: investigation tools (with execute) and the terminal answer
  // tool (no execute) have incompatible static shapes under the SDK's union.
  const toolMap: Record<string, any> = {};
  for (const t of def.tools) {
    const impl = ctx.toolImpls[t.name];
    toolMap[t.name] = tool({
      description: t.description,
      parameters: t.parameters as any,
      execute: async (args: any) => {
        toolsUsed.add(t.name);
        steps.push({ index: steps.length, kind: "tool_call", toolName: t.name, args });
        if (!impl) {
          const msg = `Tool "${t.name}" has no implementation in this context.`;
          steps.push({ index: steps.length, kind: "observation", toolName: t.name, observation: msg, ok: false });
          return { error: msg };
        }
        try {
          const result = await impl(args, ctx);
          steps.push({
            index: steps.length,
            kind: "observation",
            toolName: t.name,
            observation: summariseObservation(result),
            ok: true,
          });
          return result ?? { ok: true };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          steps.push({ index: steps.length, kind: "observation", toolName: t.name, observation: msg, ok: false });
          return { error: msg };
        }
      },
    });
  }
  // Terminal answer tool — no execute → loop halts when the model calls it.
  toolMap[answerToolName] = tool({
    description:
      "Call this ONCE, only after you have gathered enough evidence, to submit your final structured verdict. This ends the assessment.",
    parameters: def.answerSchema as any,
  });

  const messages: CoreMessage[] = [{ role: "user", content: def.buildUserPrompt(input) }];

  const result = await generateText({
    model: getModel(modelId),
    system: def.systemPrompt,
    messages,
    tools: toolMap,
    maxSteps,
    onStepFinish: (step) => {
      if (step.text && step.text.trim()) {
        steps.push({ index: steps.length, kind: "reasoning", text: truncate(step.text, 800) });
      }
      const inTok = step.usage?.promptTokens ?? 0;
      const outTok = step.usage?.completionTokens ?? 0;
      totalIn += inTok;
      totalOut += outTok;
      totalCost += estimateCost(modelId, inTok, outTok);
      if (totalCost >= maxCost) {
        throw new Error(`BUDGET_EXCEEDED: agentic ${def.name} hit cost cap $${maxCost.toFixed(2)}`);
      }
    },
  });

  // Did the model call the terminal answer tool?
  for (const tc of result.toolCalls ?? []) {
    if (tc.toolName === answerToolName) {
      const parsed = def.answerSchema.safeParse(tc.args);
      if (parsed.success) {
        answer = parsed.data;
        steps.push({ index: steps.length, kind: "answer", toolName: answerToolName, args: tc.args });
      }
    }
  }

  // Fallback: step budget exhausted without a valid answer → force one
  // structured pass over everything observed so a run always yields a verdict.
  if (answer === undefined) {
    const transcript = steps
      .map((s) =>
        s.kind === "tool_call"
          ? `ACTION ${s.toolName}(${JSON.stringify(s.args)})`
          : s.kind === "observation"
            ? `OBSERVATION: ${s.observation}`
            : s.kind === "reasoning"
              ? `THOUGHT: ${s.text}`
              : "",
      )
      .filter(Boolean)
      .join("\n");
    const forced = await generateObject({
      model: getModel(modelId),
      schema: def.answerSchema as any,
      system: def.systemPrompt,
      prompt:
        `${def.buildUserPrompt(input)}\n\n` +
        `You investigated but did not submit a verdict in time. Based on this trace, ` +
        `produce the final structured verdict now:\n\n${transcript}`,
    });
    answer = forced.object as TOut;
    totalIn += forced.usage?.promptTokens ?? 0;
    totalOut += forced.usage?.completionTokens ?? 0;
    totalCost += estimateCost(modelId, forced.usage?.promptTokens ?? 0, forced.usage?.completionTokens ?? 0);
    steps.push({ index: steps.length, kind: "answer", text: "(forced final verdict after step budget)" });
  }

  return {
    output: answer,
    steps,
    toolsUsed: [...toolsUsed],
    tokensIn: totalIn,
    tokensOut: totalOut,
    costUsd: totalCost,
    iterations: result.steps?.length ?? steps.length,
  };
}
