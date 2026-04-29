import { generateObject, generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { z, type ZodType } from 'zod';
import { prisma } from '../utils/prisma';
import logger from '../lib/logger';
import crypto from 'crypto';
import { checkTenantBudget, isAgentEnabled } from '../lib/billing';
import { toAISDKTools } from './tool-adapter';
import { classifyInjection } from './injection-classifier';
import { createAgentTrace, logGeneration, flushLangfuse } from './observability';
import { captureException } from '../lib/sentry';
import {
  agentRunTotal,
  agentRunDuration,
  agentTokensUsed,
  agentCostUsd,
  agentRepairLoops,
} from '../lib/slo';

// ── Types ──────────────────────────────────────────────────────────────

export interface AgentTool {
  name: string;
  description: string;
  parameters: ZodType;
  returns: ZodType;
  sideEffect: 'read' | 'write' | 'external';
  rateLimit: { maxPerMinute: number; maxPerRun: number };
  costTag: 'free' | 'low' | 'medium' | 'high';
  requiredScope: string[];
  execute: (params: unknown, ctx: AgentContext) => Promise<unknown>;
}

export interface AgentBudget {
  maxTokensPerRun: number;
  maxIterationsPerRun: number;
  maxCostUsdPerRun: number;
  maxRepairAttempts: number;
}

export interface AgentDefinition {
  name: string; // e.g., 'resume-parser', 'candidate-screener'
  systemPrompt: string;
  tools: AgentTool[];
  outputSchema: ZodType;
  budget: AgentBudget;
  modelId?: string; // default: 'claude-sonnet-4-20250514'
  fallbackModelId?: string; // default: 'gpt-4.1'
  mode: 'single-call' | 'react'; // determines execution strategy
  selfCritiqueEnabled?: boolean; // optional self-critique pass (future)
  untrustedInput?: boolean; // flag for injection classifier (Batch H1)
}

export interface AgentContext {
  tenantId: string;
  userId: string;
  runId: string;
  agentType: string;
}

interface TraceEntry {
  stepIndex: number;
  stepType: string;
  modelName?: string;
  promptHash?: string;
  toolName?: string;
  toolInput?: unknown;
  toolOutput?: unknown;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  errorMessage?: string;
}

// ── Cost estimation (approximate) ──────────────────────────────────────

const MODEL_COSTS: Record<string, { inputPer1k: number; outputPer1k: number }> = {
  'claude-sonnet-4-20250514': { inputPer1k: 0.003, outputPer1k: 0.015 },
  'claude-3-5-haiku-20241022': { inputPer1k: 0.001, outputPer1k: 0.005 },
  'gpt-4.1': { inputPer1k: 0.002, outputPer1k: 0.008 },
};

function estimateCost(modelId: string, tokensIn: number, tokensOut: number): number {
  const rates = MODEL_COSTS[modelId] || { inputPer1k: 0.003, outputPer1k: 0.015 };
  return (tokensIn / 1000) * rates.inputPer1k + (tokensOut / 1000) * rates.outputPer1k;
}

// ── LLM availability check ────────────────────────────────────────────

/**
 * Check if the required LLM provider API key is configured.
 * Returns { available: true } or { available: false, reason: string }.
 */
export function checkLLMAvailability(modelId: string): { available: boolean; reason?: string; provider: string } {
  if (modelId.startsWith('claude') || modelId.startsWith('anthropic')) {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { available: false, reason: 'ANTHROPIC_API_KEY not configured. Set it in .env to enable AI agents.', provider: 'anthropic' };
    }
    return { available: true, provider: 'anthropic' };
  }
  // OpenAI models
  if (!process.env.OPENAI_API_KEY) {
    return { available: false, reason: 'OPENAI_API_KEY not configured. Set it in .env to enable AI agents.', provider: 'openai' };
  }
  return { available: true, provider: 'openai' };
}

// ── Model provider selection ───────────────────────────────────────────

function getModel(modelId: string) {
  if (modelId.startsWith('claude') || modelId.startsWith('anthropic')) {
    return anthropic(modelId);
  }
  return openai(modelId);
}

// ── AgentRuntime ───────────────────────────────────────────────────────

export class AgentRuntime {
  private definition: AgentDefinition;
  private totalTokensIn = 0;
  private totalTokensOut = 0;
  private totalCostUsd = 0;
  private iterations = 0;
  private traces: TraceEntry[] = [];

  constructor(definition: AgentDefinition) {
    this.definition = definition;
  }

  // Expose internal counters for testing
  get _totalTokensIn() { return this.totalTokensIn; }
  get _totalTokensOut() { return this.totalTokensOut; }
  get _totalCostUsd() { return this.totalCostUsd; }
  get _iterations() { return this.iterations; }

  /**
   * Execute the agent with structured output validation + repair loop.
   * Returns the validated output or throws if budget exceeded / repair failed.
   */
  async run<T>(
    ctx: AgentContext,
    userMessage: string,
    inputData?: Record<string, unknown>,
  ): Promise<{ output: T; runId: string; tokensUsed: number; costUsd: number; iterations: number }> {
    const modelId = this.definition.modelId || 'claude-sonnet-4-20250514';
    const runId = ctx.runId;

    // Pre-flight: Check if the required LLM provider is configured
    const llmCheck = checkLLMAvailability(modelId);
    if (!llmCheck.available) {
      throw new Error(`AI_NOT_CONFIGURED: ${llmCheck.reason}`);
    }

    // Tenant-level kill switch check
    const agentEnabled = await isAgentEnabled(ctx.tenantId, this.definition.name);
    if (!agentEnabled) {
      throw new Error(`AGENT_DISABLED: ${this.definition.name} is disabled for this tenant`);
    }

    // Tenant-level daily budget check
    const budgetCheck = await checkTenantBudget(ctx.tenantId);
    if (!budgetCheck.allowed) {
      throw new Error(`TENANT_BUDGET_EXCEEDED: ${budgetCheck.reason}`);
    }

    // Pre-flight injection check for untrusted inputs
    if (this.definition.untrustedInput && userMessage) {
      const classification = await classifyInjection(userMessage);

      // Log classification to trace
      this.traces.push({
        stepIndex: this.traces.length,
        stepType: 'injection_check',
        toolName: 'injection-classifier',
        toolInput: { textLength: userMessage.length },
        toolOutput: classification,
        tokensIn: 0,
        tokensOut: 0,
        costUsd: 0.001, // Approximate Haiku cost
        latencyMs: 0,
      });

      if (classification.isInjection && classification.score >= 0.7) {
        logger.warn({
          agentType: this.definition.name,
          score: classification.score,
          attackType: classification.attackType,
          reason: classification.reason,
        }, 'INJECTION DETECTED — blocking agent run');

        throw new Error(
          `INJECTION_DETECTED: Potential prompt injection detected (score: ${classification.score}, type: ${classification.attackType}). ` +
          `Agent run blocked for safety. The input has been logged for review.`
        );
      }
    }

    // Create AgentRun record
    const promptHash = crypto
      .createHash('sha256')
      .update(this.definition.systemPrompt)
      .digest('hex')
      .slice(0, 16);
    const inputHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ userMessage, inputData }))
      .digest('hex')
      .slice(0, 16);

    await prisma.agentRun
      .create({
        data: {
          id: runId,
          tenantId: ctx.tenantId,
          agentType: this.definition.name,
          status: 'RUNNING',
          triggeredBy: ctx.userId,
          inputHash,
          inputJson: { userMessage, ...inputData } as any,
          modelName: modelId,
          promptHash,
        },
      })
      .catch((err: unknown) => logger.error({ err }, 'Failed to create AgentRun'));

    // Langfuse trace creation
    const langfuseTrace = createAgentTrace({
      runId,
      agentType: this.definition.name,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      input: { userMessage, inputData },
    });

    const runStartTime = Date.now();

    try {
      // Budget check before first call
      this.checkBudget();

      // Dispatch by mode: ReAct loop for tool-using agents, single-call for stateless agents
      const result = this.definition.mode === 'react'
        ? await this.runReActLoop<T>(ctx, modelId, userMessage)
        : await this.generateWithRepair<T>(ctx, modelId, userMessage, inputData);

      // Update AgentRun as completed
      await prisma.agentRun
        .update({
          where: { id: runId },
          data: {
            status: 'COMPLETED',
            outputJson: result as any,
            tokensIn: this.totalTokensIn,
            tokensOut: this.totalTokensOut,
            costUsd: this.totalCostUsd,
            iterations: this.iterations,
            latencyMs: this.traces.reduce((sum, t) => sum + t.latencyMs, 0),
            completedAt: new Date(),
          },
        })
        .catch((err: unknown) => logger.error({ err }, 'Failed to update AgentRun'));

      // Emit Prometheus metrics
      const totalLatency = Date.now() - runStartTime;
      agentRunTotal.inc({ agent_type: this.definition.name, status: 'COMPLETED', tenant_id: ctx.tenantId });
      agentRunDuration.observe({ agent_type: this.definition.name, status: 'COMPLETED', tenant_id: ctx.tenantId }, totalLatency / 1000);
      agentTokensUsed.inc({ agent_type: this.definition.name, model: modelId, tenant_id: ctx.tenantId, direction: 'input' }, this.totalTokensIn);
      agentTokensUsed.inc({ agent_type: this.definition.name, model: modelId, tenant_id: ctx.tenantId, direction: 'output' }, this.totalTokensOut);
      agentCostUsd.inc({ agent_type: this.definition.name, model: modelId, tenant_id: ctx.tenantId }, this.totalCostUsd);

      // Persist traces
      await this.persistTraces(runId);

      // Flush Langfuse
      await flushLangfuse();

      return {
        output: result,
        runId,
        tokensUsed: this.totalTokensIn + this.totalTokensOut,
        costUsd: this.totalCostUsd,
        iterations: this.iterations,
      };
    } catch (err: any) {
      // Update AgentRun as failed
      const status = err.message?.includes('INJECTION_DETECTED')
        ? 'INJECTION_BLOCKED'
        : err.message?.includes('BUDGET_EXCEEDED')
          ? 'BUDGET_EXCEEDED'
          : err.message?.includes('REPAIR_FAILED')
            ? 'REPAIR_FAILED'
            : 'FAILED';

      await prisma.agentRun
        .update({
          where: { id: runId },
          data: {
            status: status as any,
            errorMessage: err.message,
            tokensIn: this.totalTokensIn,
            tokensOut: this.totalTokensOut,
            costUsd: this.totalCostUsd,
            iterations: this.iterations,
            latencyMs: this.traces.reduce((sum, t) => sum + t.latencyMs, 0),
            completedAt: new Date(),
          },
        })
        .catch(() => {});

      // Emit Prometheus metrics for failed runs
      agentRunTotal.inc({ agent_type: this.definition.name, status, tenant_id: ctx.tenantId });

      // Report to Sentry for unexpected failures
      if (status === 'FAILED') {
        captureException(err instanceof Error ? err : new Error(String(err)), {
          agentType: this.definition.name,
          runId,
          tenantId: ctx.tenantId,
        });
      }

      await this.persistTraces(runId);

      // Flush Langfuse even on error
      await flushLangfuse();

      throw err;
    }
  }

  private async generateWithRepair<T>(
    ctx: AgentContext,
    modelId: string,
    userMessage: string,
    _inputData?: Record<string, unknown>,
  ): Promise<T> {
    const maxRepairs = this.definition.budget.maxRepairAttempts;
    let lastError: string | null = null;

    for (let attempt = 0; attempt <= maxRepairs; attempt++) {
      this.iterations++;
      this.checkBudget();

      const start = Date.now();
      const prompt = lastError
        ? `${userMessage}\n\nYour previous output failed validation: ${lastError}\nPlease fix and return valid output.`
        : userMessage;

      try {
        const { object, usage } = await generateObject({
          model: getModel(modelId),
          schema: this.definition.outputSchema as any,
          system: this.definition.systemPrompt,
          prompt,
        });

        const tokensIn = usage?.inputTokens || 0;
        const tokensOut = usage?.outputTokens || 0;
        const cost = estimateCost(modelId, tokensIn, tokensOut);
        const latency = Date.now() - start;

        this.totalTokensIn += tokensIn;
        this.totalTokensOut += tokensOut;
        this.totalCostUsd += cost;

        this.traces.push({
          stepIndex: this.traces.length,
          stepType: attempt === 0 ? 'llm_call' : 'repair_call',
          modelName: modelId,
          promptHash: crypto.createHash('sha256').update(prompt).digest('hex').slice(0, 16),
          tokensIn,
          tokensOut,
          costUsd: cost,
          latencyMs: latency,
        });

        // Log to Langfuse
        logGeneration({
          traceId: ctx.runId,
          name: `${this.definition.name}-${attempt === 0 ? 'llm_call' : 'repair_call'}`,
          model: modelId,
          input: prompt,
          output: object,
          tokensIn,
          tokensOut,
          costUsd: cost,
          latencyMs: latency,
        });

        if (attempt > 0) {
          agentRepairLoops.inc({ agent_type: this.definition.name, tenant_id: ctx.tenantId });
        }

        logger.info(
          {
            agent: this.definition.name,
            attempt,
            tokensIn,
            tokensOut,
            cost: cost.toFixed(4),
            latency,
          },
          'Agent LLM call completed',
        );

        return object as T;
      } catch (err: any) {
        const latency = Date.now() - start;
        lastError = err.message || 'Unknown validation error';

        this.traces.push({
          stepIndex: this.traces.length,
          stepType: attempt === 0 ? 'llm_call' : 'repair_call',
          modelName: modelId,
          tokensIn: 0,
          tokensOut: 0,
          costUsd: 0,
          latencyMs: latency,
          errorMessage: lastError ?? undefined,
        });

        logger.warn(
          {
            agent: this.definition.name,
            attempt,
            error: lastError,
          },
          'Agent output validation failed, attempting repair',
        );

        if (attempt === maxRepairs) {
          throw new Error(
            `REPAIR_FAILED: Agent ${this.definition.name} failed after ${maxRepairs + 1} attempts. Last error: ${lastError}`,
          );
        }
      }
    }

    throw new Error('REPAIR_FAILED: Unreachable');
  }

  /**
   * ReAct execution loop: perceive -> plan -> act (tool call) -> observe -> decide (continue/stop).
   * The model decides when to call tools and when to produce a final answer.
   */
  private async runReActLoop<T>(
    ctx: AgentContext,
    modelId: string,
    userMessage: string,
  ): Promise<T> {
    const maxIterations = this.definition.budget.maxIterationsPerRun;
    const aiTools = toAISDKTools(this.definition.tools, ctx);

    // Build conversation messages
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: userMessage },
    ];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      this.iterations++;
      this.checkBudget();

      const start = Date.now();

      try {
        const result = await generateText({
          model: getModel(modelId),
          system: this.definition.systemPrompt,
          messages,
          tools: aiTools,
          // Default stopWhen is stepCountIs(1) — one step per iteration, we control the loop
        });

        const tokensIn = result.usage?.inputTokens || 0;
        const tokensOut = result.usage?.outputTokens || 0;
        const cost = estimateCost(modelId, tokensIn, tokensOut);
        const latency = Date.now() - start;

        this.totalTokensIn += tokensIn;
        this.totalTokensOut += tokensOut;
        this.totalCostUsd += cost;

        // Check if model made tool calls
        if (result.toolCalls && result.toolCalls.length > 0) {
          for (const toolCall of result.toolCalls) {
            this.traces.push({
              stepIndex: this.traces.length,
              stepType: 'tool_call',
              toolName: toolCall.toolName,
              toolInput: (toolCall as any).input,
              toolOutput: result.toolResults?.find(
                (r: any) => r.toolCallId === toolCall.toolCallId,
              )?.output,
              tokensIn,
              tokensOut,
              costUsd: cost,
              latencyMs: latency,
            });

            // Log tool call to Langfuse
            logGeneration({
              traceId: ctx.runId,
              name: `${this.definition.name}-tool-${toolCall.toolName}`,
              model: modelId,
              input: (toolCall as any).input,
              output: result.toolResults?.find(
                (r: any) => r.toolCallId === toolCall.toolCallId,
              )?.output,
              tokensIn,
              tokensOut,
              costUsd: cost,
              latencyMs: latency,
            });

            logger.info(
              {
                agent: this.definition.name,
                iteration,
                tool: toolCall.toolName,
                latency,
              },
              'Agent tool call executed',
            );
          }

          // Add assistant response to messages for next iteration
          messages.push({ role: 'assistant', content: result.text || '' });

          // Feed tool results back into messages so the model sees them
          for (const toolCall of result.toolCalls) {
            const toolResult = result.toolResults?.find(
              (r: any) => r.toolCallId === toolCall.toolCallId,
            );
            if (toolResult) {
              messages.push({
                role: 'assistant' as const,
                content: `[Tool Result: ${toolCall.toolName}] ${
                  typeof toolResult.output === 'string'
                    ? toolResult.output
                    : JSON.stringify(toolResult.output)
                }`,
              });
            }
          }

          continue; // Next iteration
        }

        // Model produced final text without tool calls — extract structured output
        if (result.text) {
          this.traces.push({
            stepIndex: this.traces.length,
            stepType: 'llm_call',
            modelName: modelId,
            promptHash: crypto
              .createHash('sha256')
              .update(result.text)
              .digest('hex')
              .slice(0, 16),
            tokensIn,
            tokensOut,
            costUsd: cost,
            latencyMs: latency,
          });

          // Validate against output schema using generateObject
          const validated = await this.validateFinalOutput<T>(modelId, result.text);
          return validated;
        }

        // If finishReason is 'stop' with no text and no tools, we're done
        if (result.finishReason === 'stop') {
          throw new Error('Agent produced no output and no tool calls');
        }
      } catch (err: any) {
        // Don't re-wrap BUDGET_EXCEEDED or REPAIR_FAILED errors
        if (
          err.message?.includes('BUDGET_EXCEEDED') ||
          err.message?.includes('REPAIR_FAILED')
        ) {
          throw err;
        }

        const latency = Date.now() - start;
        this.traces.push({
          stepIndex: this.traces.length,
          stepType: 'llm_call',
          modelName: modelId,
          tokensIn: 0,
          tokensOut: 0,
          costUsd: 0,
          latencyMs: latency,
          errorMessage: err.message,
        });

        if (iteration === maxIterations - 1) {
          throw new Error(
            `BUDGET_EXCEEDED: Agent ${this.definition.name} reached max iterations (${maxIterations}). Last error: ${err.message}`,
          );
        }

        // Add error context for next iteration
        messages.push({
          role: 'assistant',
          content: `Error occurred: ${err.message}. Let me try a different approach.`,
        });
      }
    }

    throw new Error(
      `BUDGET_EXCEEDED: Agent ${this.definition.name} reached max iterations (${maxIterations})`,
    );
  }

  /**
   * Validate the model's final text output against the Zod schema.
   * Uses generateObject with the text as context to produce structured output.
   */
  private async validateFinalOutput<T>(modelId: string, text: string): Promise<T> {
    const maxRepairs = this.definition.budget.maxRepairAttempts;
    let lastError: string | null = null;

    for (let attempt = 0; attempt <= maxRepairs; attempt++) {
      const prompt = lastError
        ? `Based on your analysis below, produce the required structured output.\n\nYour analysis:\n${text}\n\nPrevious validation error: ${lastError}\nPlease fix and return valid output.`
        : `Based on your analysis below, produce the required structured output.\n\nYour analysis:\n${text}`;

      try {
        const { object, usage } = await generateObject({
          model: getModel(modelId),
          schema: this.definition.outputSchema as any,
          system: this.definition.systemPrompt,
          prompt,
        });

        const tokensIn = usage?.inputTokens || 0;
        const tokensOut = usage?.outputTokens || 0;
        const cost = estimateCost(modelId, tokensIn, tokensOut);
        this.totalTokensIn += tokensIn;
        this.totalTokensOut += tokensOut;
        this.totalCostUsd += cost;

        this.traces.push({
          stepIndex: this.traces.length,
          stepType: attempt === 0 ? 'structured_output' : 'repair_call',
          modelName: modelId,
          tokensIn,
          tokensOut,
          costUsd: cost,
          latencyMs: 0,
        });

        return object as T;
      } catch (err: any) {
        lastError = err.message;
        if (attempt === maxRepairs) {
          throw new Error(
            `REPAIR_FAILED: Final output validation failed after ${maxRepairs + 1} attempts. Last error: ${lastError}`,
          );
        }
      }
    }

    throw new Error('REPAIR_FAILED: Unreachable');
  }

  /**
   * Execute a tool call with input/output validation.
   */
  async executeTool(ctx: AgentContext, toolName: string, params: unknown): Promise<unknown> {
    const tool = this.definition.tools.find((t) => t.name === toolName);
    if (!tool) throw new Error(`Tool not found: ${toolName}`);

    const start = Date.now();
    try {
      // Validate input
      const validatedParams = tool.parameters.parse(params);

      // Execute
      const result = await tool.execute(validatedParams, ctx);

      // Validate output
      const validatedResult = tool.returns.parse(result);

      const latency = Date.now() - start;
      this.traces.push({
        stepIndex: this.traces.length,
        stepType: 'tool_call',
        toolName,
        toolInput: validatedParams,
        toolOutput: validatedResult,
        tokensIn: 0,
        tokensOut: 0,
        costUsd: 0,
        latencyMs: latency,
      });

      return validatedResult;
    } catch (err: any) {
      const latency = Date.now() - start;
      this.traces.push({
        stepIndex: this.traces.length,
        stepType: 'tool_call',
        toolName,
        toolInput: params,
        tokensIn: 0,
        tokensOut: 0,
        costUsd: 0,
        latencyMs: latency,
        errorMessage: err.message,
      });
      throw err;
    }
  }

  /** @internal Exposed for testing */
  checkBudget(): void {
    if (this.iterations > this.definition.budget.maxIterationsPerRun) {
      throw new Error(
        `BUDGET_EXCEEDED: Max iterations (${this.definition.budget.maxIterationsPerRun}) exceeded`,
      );
    }
    if (this.totalTokensIn + this.totalTokensOut > this.definition.budget.maxTokensPerRun) {
      throw new Error(
        `BUDGET_EXCEEDED: Max tokens (${this.definition.budget.maxTokensPerRun}) exceeded`,
      );
    }
    if (this.totalCostUsd > this.definition.budget.maxCostUsdPerRun) {
      throw new Error(
        `BUDGET_EXCEEDED: Max cost ($${this.definition.budget.maxCostUsdPerRun}) exceeded`,
      );
    }
  }

  private async persistTraces(runId: string): Promise<void> {
    try {
      await prisma.agentTrace.createMany({
        data: this.traces.map((t) => ({
          agentRunId: runId,
          stepIndex: t.stepIndex,
          stepType: t.stepType,
          modelName: t.modelName || null,
          promptHash: t.promptHash || null,
          toolName: t.toolName || null,
          toolInput: t.toolInput ? (t.toolInput as any) : null,
          toolOutput: t.toolOutput ? (t.toolOutput as any) : null,
          tokensIn: t.tokensIn,
          tokensOut: t.tokensOut,
          costUsd: t.costUsd,
          latencyMs: t.latencyMs,
          errorMessage: t.errorMessage || null,
        })),
      });
    } catch (err) {
      logger.error({ err, runId }, 'Failed to persist agent traces');
    }
  }
}
