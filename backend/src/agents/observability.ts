import { Langfuse } from 'langfuse';
import logger from '../lib/logger';

let langfuseClient: Langfuse | null = null;

/**
 * Get or create the Langfuse client.
 * Returns null if Langfuse is not configured (graceful degradation).
 */
export function getLangfuse(): Langfuse | null {
  if (langfuseClient) return langfuseClient;

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl = process.env.LANGFUSE_BASE_URL || 'http://localhost:3001'; // self-hosted default

  if (!publicKey || !secretKey) {
    logger.info('Langfuse not configured — LLM observability disabled');
    return null;
  }

  langfuseClient = new Langfuse({ publicKey, secretKey, baseUrl });
  logger.info({ baseUrl }, 'Langfuse client initialized');
  return langfuseClient;
}

/**
 * Create a trace for an agent run.
 */
export function createAgentTrace(params: {
  runId: string;
  agentType: string;
  tenantId: string;
  userId: string;
  input: unknown;
}) {
  const lf = getLangfuse();
  if (!lf) return null;

  return lf.trace({
    id: params.runId,
    name: params.agentType,
    userId: params.userId,
    metadata: { tenantId: params.tenantId },
    input: params.input,
  });
}

/**
 * Log a generation (LLM call) span.
 */
export function logGeneration(params: {
  traceId: string;
  name: string;
  model: string;
  input: unknown;
  output: unknown;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  statusMessage?: string;
}) {
  const lf = getLangfuse();
  if (!lf) return;

  lf.generation({
    traceId: params.traceId,
    name: params.name,
    model: params.model,
    input: params.input,
    output: params.output,
    usage: {
      promptTokens: params.tokensIn,
      completionTokens: params.tokensOut,
      totalTokens: params.tokensIn + params.tokensOut,
    },
    metadata: { costUsd: params.costUsd, latencyMs: params.latencyMs },
    statusMessage: params.statusMessage,
  });
}

/**
 * Flush pending events to Langfuse (call before process exit or after each request).
 */
export async function flushLangfuse(): Promise<void> {
  const lf = getLangfuse();
  if (lf) await lf.flushAsync();
}
