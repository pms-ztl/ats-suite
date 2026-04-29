import { z } from 'zod';
import { AgentRuntime, type AgentDefinition, type AgentContext, type AgentTool } from './runtime';
import { loadConversationHistory, searchSemanticMemory } from './memory';
import { prisma } from '../utils/prisma';
import logger from '../lib/logger';
import crypto from 'crypto';

// ── Output Schema ──────────────────────────────────────────────────────

export const CopilotResponseSchema = z.object({
  answer: z
    .string()
    .min(1)
    .max(3000)
    .describe('Natural language answer to the recruiter question'),
  sources: z
    .array(
      z.object({
        type: z.enum(['candidate', 'requisition', 'interview', 'metric', 'policy']),
        id: z.string(),
        snippet: z.string().max(200),
      }),
    )
    .max(10)
    .describe('Sources cited in the answer'),
  suggestedActions: z
    .array(
      z.object({
        label: z.string(),
        type: z.enum(['navigate', 'filter', 'export', 'schedule', 'create']),
        payload: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .max(3)
    .optional()
    .describe('Suggested next actions for the recruiter'),
  confidence: z.number().min(0).max(1),
  followUpQuestions: z.array(z.string()).max(3).optional(),
});

export type CopilotResponse = z.infer<typeof CopilotResponseSchema>;

// ── System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a hiring operations copilot for recruiters. You have access to the full hiring pipeline data.

Rules:
- Answer questions about candidates, requisitions, interviews, pipeline metrics
- Always cite your sources (which candidates, which requisitions, which metrics)
- Suggest actionable next steps when appropriate
- Be concise but thorough
- If you don't have enough data to answer, say so honestly
- Never reveal AI screening scores or internal rankings to candidates (this is a recruiter-only tool)
- Protect candidate PII — don't include emails/phones in answers unless specifically asked

When answering:
1. Use the available tools to gather data before forming your response
2. Cite sources with their IDs so the recruiter can navigate to them
3. Provide follow-up questions to help the recruiter explore further
4. Suggest concrete actions (filter candidates, schedule interviews, export reports) when relevant`;

// ── Tools ──────────────────────────────────────────────────────────────

const searchCandidatesDbTool: AgentTool = {
  name: 'search_candidates_db',
  description:
    'Search candidates in the database with optional filters for skills, location, and application stage. Returns matching candidates with their details.',
  parameters: z.object({
    skills: z
      .array(z.string())
      .optional()
      .describe('Filter by skill names (case-insensitive partial match)'),
    location: z.string().optional().describe('Filter by candidate location (partial match)'),
    stage: z
      .string()
      .optional()
      .describe(
        'Filter by application stage: APPLIED, SCREENED, PHONE_SCREEN, ASSESSMENT, INTERVIEW, FINAL_REVIEW, OFFER, HIRED, REJECTED, WITHDRAWN',
      ),
    requisitionId: z.string().optional().describe('Filter to candidates for a specific requisition'),
    limit: z.number().min(1).max(50).default(20).describe('Max results to return'),
  }),
  returns: z.object({
    candidates: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        stage: z.string(),
        skills: z.array(z.string()),
        location: z.string().nullable(),
      }),
    ),
    totalFound: z.number(),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 30, maxPerRun: 5 },
  costTag: 'free',
  requiredScope: ['candidates:read'],
  execute: async (params: any, ctx: AgentContext) => {
    // Build where clause dynamically
    const where: any = { tenantId: ctx.tenantId };

    // If filtering by stage or requisition, join through applications
    const applicationWhere: any = {};
    if (params.stage) {
      applicationWhere.stage = params.stage;
    }
    if (params.requisitionId) {
      applicationWhere.requisitionId = params.requisitionId;
    }

    if (params.location) {
      where.location = { contains: params.location, mode: 'insensitive' };
    }

    // Query candidates with their skills and latest application
    const candidates = await prisma.candidate.findMany({
      where: {
        ...where,
        ...(Object.keys(applicationWhere).length > 0
          ? { newApplications: { some: { ...applicationWhere, tenantId: ctx.tenantId } } }
          : {}),
        ...(params.skills && params.skills.length > 0
          ? {
              skills: {
                some: {
                  skill: { name: { in: params.skills, mode: 'insensitive' } },
                },
              },
            }
          : {}),
      },
      include: {
        skills: { include: { skill: { select: { name: true } } }, take: 10 },
        newApplications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { stage: true },
        },
      },
      take: params.limit || 20,
      orderBy: { createdAt: 'desc' },
    });

    const totalFound = await prisma.candidate.count({
      where: {
        ...where,
        ...(Object.keys(applicationWhere).length > 0
          ? { newApplications: { some: { ...applicationWhere, tenantId: ctx.tenantId } } }
          : {}),
        ...(params.skills && params.skills.length > 0
          ? {
              skills: {
                some: {
                  skill: { name: { in: params.skills, mode: 'insensitive' } },
                },
              },
            }
          : {}),
      },
    });

    return {
      candidates: candidates.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        stage: c.newApplications[0]?.stage ?? 'NO_APPLICATION',
        skills: c.skills.map((s) => s.skill.name),
        location: c.location,
      })),
      totalFound,
    };
  },
};

const getRequisitionDetailsTool: AgentTool = {
  name: 'get_requisition_details',
  description:
    'Fetch detailed information about a specific requisition including title, department, status, headcount, and candidate count.',
  parameters: z.object({
    requisitionId: z.string().describe('The requisition ID to look up'),
  }),
  returns: z.object({
    id: z.string(),
    title: z.string(),
    department: z.string(),
    location: z.string(),
    status: z.string(),
    priority: z.number(),
    headcount: z.number(),
    candidateCount: z.number(),
    createdAt: z.string(),
    hiringManagerId: z.string().nullable(),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 30, maxPerRun: 5 },
  costTag: 'free',
  requiredScope: ['requisitions:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const req = await prisma.requisition.findFirst({
      where: { id: params.requisitionId, tenantId: ctx.tenantId },
      include: {
        _count: { select: { applications: true } },
      },
    });

    if (!req) {
      throw new Error(`Requisition ${params.requisitionId} not found`);
    }

    return {
      id: req.id,
      title: req.title,
      department: req.department,
      location: req.location,
      status: req.status,
      priority: req.priority,
      headcount: req.headcount,
      candidateCount: req._count.applications,
      createdAt: req.createdAt.toISOString(),
      hiringManagerId: req.hiringManagerId,
    };
  },
};

const queryPipelineMetricsTool: AgentTool = {
  name: 'query_pipeline_metrics',
  description:
    'Query pipeline analytics: open requisitions, active candidates, average time-to-hire, hires this month, and stage distribution. Uses real database aggregations.',
  parameters: z.object({
    timeRangeStart: z
      .string()
      .optional()
      .describe('ISO date string for start of time range (default: 30 days ago)'),
    timeRangeEnd: z
      .string()
      .optional()
      .describe('ISO date string for end of time range (default: now)'),
    requisitionIds: z
      .array(z.string())
      .optional()
      .describe('Filter to specific requisition IDs'),
  }),
  returns: z.object({
    openRequisitions: z.number(),
    activeApplications: z.number(),
    avgTimeToHireDays: z.number().nullable(),
    hiresThisMonth: z.number(),
    stageDistribution: z.record(z.string(), z.number()),
    totalCandidates: z.number(),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 20, maxPerRun: 3 },
  costTag: 'low',
  requiredScope: ['analytics:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const now = new Date();
    const rangeStart = params.timeRangeStart
      ? new Date(params.timeRangeStart)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const rangeEnd = params.timeRangeEnd ? new Date(params.timeRangeEnd) : now;

    const reqWhere: any = { tenantId: ctx.tenantId };
    if (params.requisitionIds?.length) {
      reqWhere.id = { in: params.requisitionIds };
    }

    // Open requisitions count
    const openRequisitions = await prisma.requisition.count({
      where: { ...reqWhere, status: 'OPEN' },
    });

    // Active applications (not rejected/withdrawn/hired)
    const activeApplications = await prisma.application.count({
      where: {
        tenantId: ctx.tenantId,
        status: 'ACTIVE',
        ...(params.requisitionIds?.length
          ? { requisitionId: { in: params.requisitionIds } }
          : {}),
      },
    });

    // Hires this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const hiresThisMonth = await prisma.application.count({
      where: {
        tenantId: ctx.tenantId,
        stage: 'HIRED',
        stageUpdatedAt: { gte: monthStart },
        ...(params.requisitionIds?.length
          ? { requisitionId: { in: params.requisitionIds } }
          : {}),
      },
    });

    // Average time-to-hire for completed hires in range
    const hiredApps = await prisma.application.findMany({
      where: {
        tenantId: ctx.tenantId,
        stage: 'HIRED',
        stageUpdatedAt: { gte: rangeStart, lte: rangeEnd },
        ...(params.requisitionIds?.length
          ? { requisitionId: { in: params.requisitionIds } }
          : {}),
      },
      select: { appliedAt: true, stageUpdatedAt: true },
    });

    let avgTimeToHireDays: number | null = null;
    if (hiredApps.length > 0) {
      const totalDays = hiredApps.reduce((sum, app) => {
        const days =
          (app.stageUpdatedAt.getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      avgTimeToHireDays = Math.round((totalDays / hiredApps.length) * 10) / 10;
    }

    // Stage distribution
    const stageGroups = await prisma.application.groupBy({
      by: ['stage'],
      where: {
        tenantId: ctx.tenantId,
        status: 'ACTIVE',
        ...(params.requisitionIds?.length
          ? { requisitionId: { in: params.requisitionIds } }
          : {}),
      },
      _count: { id: true },
    });

    const stageDistribution: Record<string, number> = {};
    for (const group of stageGroups) {
      stageDistribution[group.stage] = group._count.id;
    }

    // Total candidates
    const totalCandidates = await prisma.candidate.count({
      where: { tenantId: ctx.tenantId },
    });

    return {
      openRequisitions,
      activeApplications,
      avgTimeToHireDays,
      hiresThisMonth,
      stageDistribution,
      totalCandidates,
    };
  },
};

const searchSemanticMemoryTool: AgentTool = {
  name: 'search_semantic_memory',
  description:
    'Search for similar content in the tenant knowledge base using semantic/vector search. Finds relevant resumes, job descriptions, and past decisions.',
  parameters: z.object({
    query: z.string().min(1).describe('Natural language search query'),
    entityType: z
      .string()
      .optional()
      .describe('Filter by type: candidate_resume, requisition_jd'),
    topK: z.number().min(1).max(50).default(10),
  }),
  returns: z.object({
    results: z.array(
      z.object({
        entityId: z.string(),
        entityType: z.string(),
        snippet: z.string(),
        similarity: z.number(),
      }),
    ),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 20, maxPerRun: 5 },
  costTag: 'low',
  requiredScope: ['embeddings:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const results = await searchSemanticMemory(
      ctx.tenantId,
      params.query,
      params.entityType,
      params.topK,
    );
    return { results };
  },
};

// ── Agent Definition ───────────────────────────────────────────────────

export const copilotAgentDefinition: AgentDefinition = {
  name: 'hiring-copilot',
  systemPrompt: SYSTEM_PROMPT,
  tools: [
    searchCandidatesDbTool,
    getRequisitionDetailsTool,
    queryPipelineMetricsTool,
    searchSemanticMemoryTool,
  ],
  outputSchema: CopilotResponseSchema,
  budget: {
    maxTokensPerRun: 25000,
    maxIterationsPerRun: 10,
    maxCostUsdPerRun: 0.50,
    maxRepairAttempts: 3,
  },
  modelId: 'claude-sonnet-4-20250514',
  mode: 'react',
  untrustedInput: false,
};

// ── Public API ─────────────────────────────────────────────────────────

export interface ChatWithCopilotInput {
  query: string;
  tenantId: string;
  userId: string;
  context?: {
    activeRequisitionIds?: string[];
    timeRange?: { start: string; end: string };
  };
}

export interface ChatWithCopilotResult {
  response: CopilotResponse;
  runId: string;
  tokensUsed: number;
  costUsd: number;
}

/**
 * Chat with the Hiring Ops Copilot agent.
 * Uses Claude Sonnet in ReAct mode for multi-step tool calling.
 * Loads conversation history for context continuity.
 */
export async function chatWithCopilot(
  input: ChatWithCopilotInput,
): Promise<ChatWithCopilotResult> {
  const runId = crypto.randomUUID();

  // Load episodic conversation history for this recruiter
  const persistedHistory = await loadConversationHistory(
    input.tenantId,
    'hiring-copilot',
    input.userId,
    20,
  );

  // Build the user message with conversation context
  const historyContext =
    persistedHistory.length > 0
      ? `Previous conversation:\n${persistedHistory
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join('\n')}\n\n`
      : '';

  // Build context block if active filters are provided
  let contextBlock = '';
  if (input.context?.activeRequisitionIds?.length) {
    contextBlock += `\nActive requisition IDs: ${input.context.activeRequisitionIds.join(', ')}`;
  }
  if (input.context?.timeRange) {
    contextBlock += `\nTime range: ${input.context.timeRange.start} to ${input.context.timeRange.end}`;
  }
  if (contextBlock) {
    contextBlock = `\nContext:${contextBlock}\n\n`;
  }

  const userMessage = `${historyContext}${contextBlock}Recruiter asks: ${input.query}`;

  logger.info(
    {
      userId: input.userId,
      runId,
      queryLength: input.query.length,
      historyLength: persistedHistory.length,
      hasContext: !!input.context,
    },
    'Starting copilot chat',
  );

  // Run the agent
  const runtime = new AgentRuntime(copilotAgentDefinition);
  const ctx: AgentContext = {
    tenantId: input.tenantId,
    userId: input.userId,
    runId,
    agentType: 'hiring-copilot',
  };

  const result = await runtime.run<CopilotResponse>(ctx, userMessage);

  logger.info(
    {
      userId: input.userId,
      runId,
      confidence: result.output.confidence,
      sourcesCount: result.output.sources.length,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
    },
    'Copilot chat completed',
  );

  return {
    response: result.output,
    runId,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  };
}
