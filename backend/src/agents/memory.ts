import { prisma } from '../utils/prisma';
import { searchSimilarEmbeddings, generateEmbedding } from '../lib/embeddings';
import logger from '../lib/logger';

// ── Episodic Memory (per-session, per-run) ────────────────────────────

export interface EpisodicMemoryEntry {
  stepIndex: number;
  stepType: string;
  toolName?: string;
  toolOutput?: unknown;
  content?: string;
  timestamp: string;
}

/**
 * Load episodic memory for a specific agent run.
 * Returns previous steps and their results for context continuity.
 */
export async function loadEpisodicMemory(
  runId: string,
  tenantId: string,
): Promise<EpisodicMemoryEntry[]> {
  // Verify the run belongs to this tenant (defense in depth)
  const run = await prisma.agentRun.findFirst({
    where: { id: runId, tenantId },
    select: { id: true },
  });

  if (!run) {
    logger.warn({ runId, tenantId }, 'Episodic memory access denied — run not found for tenant');
    return [];
  }

  const traces = await prisma.agentTrace.findMany({
    where: { agentRunId: runId },
    orderBy: { stepIndex: 'asc' },
    select: {
      stepIndex: true,
      stepType: true,
      toolName: true,
      toolOutput: true,
      createdAt: true,
    },
  });

  return traces.map((t: any) => ({
    stepIndex: t.stepIndex,
    stepType: t.stepType,
    toolName: t.toolName || undefined,
    toolOutput: t.toolOutput || undefined,
    timestamp: t.createdAt.toISOString(),
  }));
}

/**
 * Load conversation history for the candidate experience agent.
 * Fetches recent agent runs of the same type for the same candidate.
 */
export async function loadConversationHistory(
  tenantId: string,
  agentType: string,
  candidateId: string,
  maxTurns: number = 20,
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const recentRuns = await prisma.agentRun.findMany({
    where: {
      tenantId,
      agentType,
      status: 'COMPLETED',
      inputJson: { path: ['candidateId'], equals: candidateId },
    },
    orderBy: { createdAt: 'desc' },
    take: maxTurns,
    select: {
      inputJson: true,
      outputJson: true,
      createdAt: true,
    },
  });

  // Build conversation pairs from most recent runs (reverse to chronological order)
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const run of recentRuns.reverse()) {
    const input = run.inputJson as any;
    const output = run.outputJson as any;

    if (input?.userMessage) {
      history.push({ role: 'user', content: input.userMessage });
    }
    if (output?.response) {
      history.push({ role: 'assistant', content: output.response });
    }
  }

  return history.slice(-maxTurns * 2); // Cap at maxTurns pairs
}

// ── Semantic Memory (vector search via pgvector) ──────────────────────

export interface SemanticSearchResult {
  entityId: string;
  entityType: string;
  snippet: string;
  similarity: number;
}

/**
 * Search semantic memory for similar content.
 * Uses pgvector with explicit tenantId filtering (not just RLS).
 */
export async function searchSemanticMemory(
  tenantId: string,
  query: string,
  entityType?: string,
  topK: number = 10,
): Promise<SemanticSearchResult[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) {
    logger.warn('Semantic search skipped — embedding generation failed (no API key?)');
    return [];
  }

  const results = await searchSimilarEmbeddings({
    tenantId, // Explicit tenant filter (defense in depth)
    entityType: entityType || 'candidate_resume',
    queryEmbedding,
    topK,
  });

  return results.map((r) => ({
    entityId: r.entityId,
    entityType: entityType || 'candidate_resume',
    snippet: r.chunkText,
    similarity: r.similarity,
  }));
}

// ── Memory Store (persist intermediate results) ───────────────────────

/**
 * Store a memory entry as an AgentTrace step.
 * Used for persisting intermediate reasoning or tool results.
 */
export async function storeMemory(
  runId: string,
  key: string,
  value: unknown,
): Promise<void> {
  const stepCount = await prisma.agentTrace.count({
    where: { agentRunId: runId },
  });

  await prisma.agentTrace.create({
    data: {
      agentRunId: runId,
      stepIndex: stepCount,
      stepType: 'memory_store',
      toolName: key,
      toolOutput: value as any,
      tokensIn: 0,
      tokensOut: 0,
      costUsd: 0,
      latencyMs: 0,
    },
  });
}
