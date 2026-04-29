import { z } from 'zod';
import { AgentRuntime, type AgentDefinition, type AgentContext, type AgentTool } from './runtime';
import { searchSemanticMemory } from './memory';
import { prisma } from '../utils/prisma';
import logger from '../lib/logger';
import crypto from 'crypto';

// ── Output Schema ──────────────────────────────────────────────────────

export const SourcingResultSchema = z.object({
  candidates: z.array(z.object({
    id: z.string(),
    name: z.string(),
    matchScore: z.number().min(0).max(1),
    rationale: z.string().min(10),
    source: z.enum(['database', 'talent_pool', 'semantic_search']),
    skills: z.array(z.string()),
  })).min(0).max(50),
  searchStrategiesUsed: z.array(z.string()),
  totalScanned: z.number(),
  summary: z.string().min(20),
});

export type SourcingResult = z.infer<typeof SourcingResultSchema>;

// ── System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a talent sourcing agent. Your goal is to find the best matching candidates for a job requisition.

Strategy:
1. First, understand the requisition requirements (call get_requisition_details)
2. Search the candidate database by skills and location
3. Search the semantic talent pool for similar profiles
4. Rank results by relevance and provide rationale for each match
5. Return your findings with match scores and explanations

Scoring Rules:
- matchScore is between 0 and 1 (0 = no match, 1 = perfect match)
- Score based on skills overlap, experience relevance, and location fit
- Provide specific rationale for each candidate explaining why they match
- Mark the source correctly: 'database' for DB queries, 'talent_pool' for pool searches, 'semantic_search' for embedding-based results
- De-duplicate candidates that appear in multiple sources (keep the highest score)
- Do NOT use age, gender, race, disability status, or any protected characteristic in ranking

Always call get_requisition_details first before searching. Then use both search_candidates_db and search_talent_pool to cast a wide net.`;

// ── Tools ──────────────────────────────────────────────────────────────

const getRequisitionDetailsTool: AgentTool = {
  name: 'get_requisition_details',
  description: 'Fetch the full details of a job requisition including title, department, skills, and description',
  parameters: z.object({ requisitionId: z.string() }),
  returns: z.object({
    title: z.string(),
    department: z.string(),
    location: z.string(),
    description: z.string().nullable(),
    requirements: z.array(z.string()),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 30, maxPerRun: 2 },
  costTag: 'free',
  requiredScope: ['requisitions:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const req = await prisma.requisition.findFirst({
      where: { id: params.requisitionId, tenantId: ctx.tenantId },
    });
    if (!req) throw new Error('Requisition not found');

    let requirements: string[] = [];
    if (Array.isArray(req.requirements)) {
      requirements = (req.requirements as unknown[]).map(r => String(r));
    } else if (typeof req.requirements === 'string') {
      try {
        const parsed = JSON.parse(req.requirements);
        requirements = Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        requirements = [];
      }
    }

    return {
      title: req.title,
      department: req.department,
      location: req.location,
      description: req.description,
      requirements,
    };
  },
};

const searchCandidatesDbTool: AgentTool = {
  name: 'search_candidates_db',
  description: 'Search the candidate database with skill, location, and source filters. Returns matching candidates with their skills.',
  parameters: z.object({
    skills: z.array(z.string()).optional().describe('Filter by skill names (case-insensitive match)'),
    location: z.string().optional().describe('Filter by location (partial match)'),
    source: z.string().optional().describe('Filter by candidate source'),
    limit: z.number().min(1).max(50).default(20).describe('Max results to return'),
  }),
  returns: z.object({
    candidates: z.array(z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      location: z.string().nullable(),
      source: z.string().nullable(),
      skills: z.array(z.string()),
      summary: z.string().nullable(),
    })),
    totalFound: z.number(),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 20, maxPerRun: 5 },
  costTag: 'free',
  requiredScope: ['candidates:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const where: any = {
      tenantId: ctx.tenantId,
      isAnonymized: false,
    };

    if (params.location) {
      where.location = { contains: params.location, mode: 'insensitive' };
    }
    if (params.source) {
      where.source = params.source;
    }

    // If skills are specified, find candidates who have matching CandidateSkill records
    if (params.skills && params.skills.length > 0) {
      where.skills = {
        some: {
          skill: {
            name: { in: params.skills, mode: 'insensitive' },
          },
        },
      };
    }

    const candidates = await prisma.candidate.findMany({
      where,
      take: params.limit || 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        location: true,
        source: true,
        summary: true,
        skills: {
          select: {
            skill: { select: { name: true } },
          },
        },
      },
    });

    const totalFound = await prisma.candidate.count({ where });

    return {
      candidates: candidates.map((c: any) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        location: c.location,
        source: c.source,
        skills: c.skills.map((cs: any) => cs.skill.name),
        summary: c.summary,
      })),
      totalFound,
    };
  },
};

const searchTalentPoolTool: AgentTool = {
  name: 'search_talent_pool',
  description: 'Search the semantic talent pool using natural language. Finds similar candidates via embedding similarity. Great for finding candidates with related but not exact skill matches.',
  parameters: z.object({
    query: z.string().min(1).describe('Natural language search query describing ideal candidate'),
    topK: z.number().min(1).max(50).default(10).describe('Number of results to return'),
  }),
  returns: z.object({
    results: z.array(z.object({
      entityId: z.string(),
      entityType: z.string(),
      snippet: z.string(),
      similarity: z.number(),
    })),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 15, maxPerRun: 5 },
  costTag: 'low',
  requiredScope: ['embeddings:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const results = await searchSemanticMemory(
      ctx.tenantId,
      params.query,
      'candidate_resume',
      params.topK || 10,
    );
    return { results };
  },
};

// ── Agent Definition ───────────────────────────────────────────────────

const sourcingAgentDefinition: AgentDefinition = {
  name: 'talent-sourcer',
  systemPrompt: SYSTEM_PROMPT,
  tools: [getRequisitionDetailsTool, searchCandidatesDbTool, searchTalentPoolTool],
  outputSchema: SourcingResultSchema,
  budget: {
    maxTokensPerRun: 20000,
    maxIterationsPerRun: 8,
    maxCostUsdPerRun: 0.50,
    maxRepairAttempts: 3,
  },
  modelId: 'claude-sonnet-4-20250514',
  mode: 'react',
  untrustedInput: false,
};

// ── Public API ─────────────────────────────────────────────────────────

export interface SourceCandidatesInput {
  requisitionId: string;
  tenantId: string;
  userId: string;
  maxResults?: number;
}

export interface SourceCandidatesResult {
  results: SourcingResult;
  runId: string;
  tokensUsed: number;
  costUsd: number;
}

/**
 * Source candidates for a requisition using the AI agent.
 * Read-only operation: searches DB and talent pool, ranks results.
 * No HITL checkpoint needed (recruiter reviews results directly).
 */
export async function sourceCandidates(input: SourceCandidatesInput): Promise<SourceCandidatesResult> {
  const runId = crypto.randomUUID();
  const maxResults = input.maxResults ?? 20;

  logger.info({
    requisitionId: input.requisitionId,
    tenantId: input.tenantId,
    runId,
    maxResults,
  }, 'Starting candidate sourcing');

  // Build the sourcing prompt
  const userMessage = `Find the best matching candidates for requisition ID: ${input.requisitionId}

Return up to ${maxResults} candidates ranked by match score. Use all available search strategies.`;

  // Run the agent
  const runtime = new AgentRuntime(sourcingAgentDefinition);
  const ctx: AgentContext = {
    tenantId: input.tenantId,
    userId: input.userId,
    runId,
    agentType: 'talent-sourcer',
  };

  const result = await runtime.run<SourcingResult>(ctx, userMessage);
  const sourcingResult = result.output;

  // Create audit trail
  await prisma.auditTrailEntry.create({
    data: {
      tenantId: input.tenantId,
      action: 'AI_SOURCING',
      resourceType: 'Requisition',
      resourceId: input.requisitionId,
      actorId: input.userId,
      actorType: 'AGENT',
      after: {
        agentRunId: runId,
        candidatesFound: sourcingResult.candidates.length,
        searchStrategiesUsed: sourcingResult.searchStrategiesUsed,
        totalScanned: sourcingResult.totalScanned,
      },
      metadata: {
        agentType: 'talent-sourcer',
        modelId: 'claude-sonnet-4-20250514',
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
      },
    },
  }).catch(err => logger.error({ err }, 'Failed to create sourcing audit trail'));

  logger.info({
    requisitionId: input.requisitionId,
    runId,
    candidatesFound: sourcingResult.candidates.length,
    totalScanned: sourcingResult.totalScanned,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  }, 'Candidate sourcing completed');

  return {
    results: sourcingResult,
    runId,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  };
}

// Export for testing
export { sourcingAgentDefinition, getRequisitionDetailsTool, searchCandidatesDbTool, searchTalentPoolTool };
