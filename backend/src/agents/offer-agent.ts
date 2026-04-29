import { z } from 'zod';
import { AgentRuntime, type AgentDefinition, type AgentContext, type AgentTool } from './runtime';
import { createHITLCheckpoint } from './hitl';
import { prisma } from '../utils/prisma';
import logger from '../lib/logger';
import crypto from 'crypto';

// ── Output Schema ──────────────────────────────────────────────────────

export const OfferDraftSchema = z.object({
  baseSalary: z.number().min(0),
  equity: z.string().optional().describe('Equity package description if applicable'),
  signingBonus: z.number().optional(),
  annualBonus: z.number().optional(),
  totalCompensation: z.number(),
  currency: z.string().default('USD'),
  justification: z.string().min(50).describe('Explanation of how the offer was determined'),
  compBandPosition: z.enum([
    'below_min', 'at_min', 'below_mid', 'at_mid', 'above_mid', 'at_max', 'above_max',
  ]),
  marketComparison: z.string().describe('How this offer compares to market rates'),
  benefits: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  expiresInDays: z.number().default(7),
  approvalChain: z.array(z.object({
    role: z.string(),
    reason: z.string(),
  })).min(1).describe('Who needs to approve this offer and why'),
});

export type OfferDraft = z.infer<typeof OfferDraftSchema>;

// ── System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert compensation analyst and offer specialist for an applicant tracking system.

Your task: Draft a competitive compensation package for a candidate based on comp bands, market data, and candidate context.

Rules:
1. Always stay within the comp band (min-max) unless explicitly overridden by hiring manager notes.
2. Position the offer based on candidate experience, market data, and interview performance:
   - Strong interview performance + high market demand = position toward 75th percentile or above
   - Average performance = position at midpoint
   - Below-average but still hireable = position near minimum
3. Justify every component of the offer package with specific reasoning.
4. Suggest an approval chain based on the offer amount:
   - Below midpoint: Hiring Manager only
   - At or above midpoint: Hiring Manager + Department Head
   - Above 75th percentile: Hiring Manager + Department Head + VP/Director
   - Above band maximum (exception): Hiring Manager + Department Head + VP + CFO/CEO
5. Consider equity, signing bonus, and annual bonus as part of total compensation.
6. Be competitive but fiscally responsible.
7. totalCompensation = baseSalary + (signingBonus / annualizedPeriod if applicable) + annualBonus + annualized equity value (estimate).
8. If candidate expectations are provided, try to meet them within the band. If expectations exceed the band, note it and recommend the closest feasible offer.
9. Set compBandPosition accurately reflecting where the base salary falls relative to the band.

Use the available tools to gather compensation benchmarks, market data, and candidate history before drafting.`;

// ── Tools ──────────────────────────────────────────────────────────────

const getCompBandTool: AgentTool = {
  name: 'get_comp_band',
  description: 'Query CompensationBenchmark table for the role level and department. Returns min, mid, max, and currency for the comp band. If no benchmark data exists, returns defaults based on the role level.',
  parameters: z.object({
    jobFamily: z.string().describe('Job family or department, e.g., "Engineering", "Product"'),
    level: z.string().describe('Role level, e.g., "L3", "Senior", "Staff"'),
    location: z.string().optional().describe('Location for geo-adjusted bands'),
  }),
  returns: z.object({
    min: z.number(),
    mid: z.number(),
    max: z.number(),
    currency: z.string(),
    source: z.string(),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 30, maxPerRun: 3 },
  costTag: 'free',
  requiredScope: ['compensation:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const benchmark = await prisma.compensationBenchmark.findFirst({
      where: {
        tenantId: ctx.tenantId,
        jobFamily: params.jobFamily,
        level: params.level,
        ...(params.location ? { location: params.location } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (benchmark) {
      return {
        min: benchmark.percentile25,
        mid: benchmark.percentile50,
        max: benchmark.percentile90,
        currency: benchmark.currency,
        source: benchmark.source || 'internal_benchmark',
      };
    }

    // Defaults based on level when no benchmark data exists
    const levelDefaults: Record<string, { min: number; mid: number; max: number }> = {
      intern: { min: 40000, mid: 50000, max: 60000 },
      junior: { min: 60000, mid: 75000, max: 90000 },
      mid: { min: 80000, mid: 100000, max: 120000 },
      senior: { min: 120000, mid: 150000, max: 180000 },
      staff: { min: 160000, mid: 200000, max: 240000 },
      principal: { min: 200000, mid: 250000, max: 300000 },
      director: { min: 180000, mid: 220000, max: 280000 },
      vp: { min: 220000, mid: 280000, max: 350000 },
    };

    const normalizedLevel = params.level.toLowerCase().replace(/[^a-z]/g, '');
    const defaults = levelDefaults[normalizedLevel] || levelDefaults['mid'];

    return {
      min: defaults.min,
      mid: defaults.mid,
      max: defaults.max,
      currency: 'USD',
      source: 'default_level_based',
    };
  },
};

const getMarketDataTool: AgentTool = {
  name: 'get_market_data',
  description: 'Query market compensation data for the role. Returns percentile breakdowns (p25, p50, p75, p90) and data source information.',
  parameters: z.object({
    jobFamily: z.string().describe('Job family, e.g., "Engineering"'),
    level: z.string().describe('Role level, e.g., "Senior"'),
    location: z.string().optional().describe('Location for geo-adjusted market data'),
  }),
  returns: z.object({
    p25: z.number(),
    p50: z.number(),
    p75: z.number(),
    p90: z.number(),
    source: z.string(),
    asOf: z.string(),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 30, maxPerRun: 3 },
  costTag: 'free',
  requiredScope: ['compensation:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const benchmark = await prisma.compensationBenchmark.findFirst({
      where: {
        tenantId: ctx.tenantId,
        jobFamily: params.jobFamily,
        level: params.level,
        ...(params.location ? { location: params.location } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (benchmark) {
      return {
        p25: benchmark.percentile25,
        p50: benchmark.percentile50,
        p75: benchmark.percentile75,
        p90: benchmark.percentile90,
        source: benchmark.source || 'internal_benchmark',
        asOf: benchmark.validUntil.toISOString().split('T')[0],
      };
    }

    // Return market defaults when no data exists
    return {
      p25: 90000,
      p50: 110000,
      p75: 135000,
      p90: 165000,
      source: 'estimated_market_default',
      asOf: new Date().toISOString().split('T')[0],
    };
  },
};

const getCandidateHistoryTool: AgentTool = {
  name: 'get_candidate_history',
  description: 'Fetch candidate applications, current stage, and interview feedback scores. Returns a summary useful for negotiation context and offer positioning.',
  parameters: z.object({
    candidateId: z.string(),
    requisitionId: z.string(),
  }),
  returns: z.object({
    candidateName: z.string(),
    currentStage: z.string(),
    applicationCount: z.number(),
    interviewCount: z.number(),
    averageFeedbackScore: z.number().nullable(),
    feedbackSummary: z.array(z.object({
      interviewType: z.string(),
      rating: z.number(),
      recommendation: z.string(),
    })),
    candidateLocation: z.string().nullable(),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 30, maxPerRun: 3 },
  costTag: 'free',
  requiredScope: ['candidates:read', 'interviews:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const candidate = await prisma.candidate.findFirst({
      where: { id: params.candidateId, tenantId: ctx.tenantId },
    });
    if (!candidate) throw new Error('Candidate not found');

    const applications = await prisma.application.findMany({
      where: { candidateId: params.candidateId, tenantId: ctx.tenantId },
    });

    const currentApp = applications.find(a => a.requisitionId === params.requisitionId);

    const interviews = await prisma.interview.findMany({
      where: {
        candidateId: params.candidateId,
        requisitionId: params.requisitionId,
        tenantId: ctx.tenantId,
      },
      include: { feedback: true },
    });

    const feedbackSummary = interviews
      .filter(i => i.feedback && i.feedback.length > 0)
      .map(i => ({
        interviewType: i.interviewType,
        rating: i.feedback.reduce((sum, f) => sum + f.overallRating, 0) / i.feedback.length,
        recommendation: i.feedback[0]?.recommendation || 'none',
      }));

    const allRatings = interviews.flatMap(i => i.feedback.map(f => f.overallRating));
    const averageFeedbackScore = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : null;

    return {
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      currentStage: currentApp?.stage || 'UNKNOWN',
      applicationCount: applications.length,
      interviewCount: interviews.length,
      averageFeedbackScore,
      feedbackSummary,
      candidateLocation: candidate.location || null,
    };
  },
};

// ── Agent Definition ───────────────────────────────────────────────────

const offerAgentDefinition: AgentDefinition = {
  name: 'offer-agent',
  systemPrompt: SYSTEM_PROMPT,
  tools: [getCompBandTool, getMarketDataTool, getCandidateHistoryTool],
  outputSchema: OfferDraftSchema,
  budget: {
    maxTokensPerRun: 15000,
    maxIterationsPerRun: 6,
    maxCostUsdPerRun: 0.20,
    maxRepairAttempts: 3,
  },
  modelId: 'claude-sonnet-4-20250514',
  mode: 'react',
  untrustedInput: false,
};

// ── Public API ─────────────────────────────────────────────────────────

export interface GenerateOfferInput {
  candidateId: string;
  requisitionId: string;
  applicationId: string;
  candidateExpectation?: number;
  hiringManagerNotes?: string;
  tenantId: string;
  userId: string;
}

export interface GenerateOfferResult {
  offer: OfferDraft;
  runId: string;
  hitlCheckpointId: string;
  tokensUsed: number;
  costUsd: number;
}

/**
 * Generate a compensation offer using the AI agent.
 * 1. Gathers comp band data, market data, and candidate history via tools
 * 2. Drafts an offer package
 * 3. Creates MANDATORY HITL checkpoint (no offer auto-sends)
 * 4. Optionally creates an Offer record in DRAFT status
 * 5. Returns the offer draft, run ID, and HITL checkpoint ID
 */
export async function generateOffer(input: GenerateOfferInput): Promise<GenerateOfferResult> {
  const runId = crypto.randomUUID();

  // Load requisition for context
  const requisition = await prisma.requisition.findFirst({
    where: { id: input.requisitionId, tenantId: input.tenantId },
  });
  if (!requisition) throw new Error('Requisition not found');

  // Build the user message
  const parts: string[] = [
    `Draft a compensation offer for the following role:`,
    ``,
    `Role: ${requisition.title}`,
    `Department: ${requisition.department}`,
    `Location: ${requisition.location}`,
    `Job Family: ${requisition.jobFamily || requisition.department}`,
  ];

  if (requisition.salaryMin || requisition.salaryMax) {
    parts.push(`Requisition Salary Range: ${requisition.salaryCurrency} ${requisition.salaryMin ?? '?'} - ${requisition.salaryMax ?? '?'}`);
  }

  parts.push(``, `Candidate ID: ${input.candidateId}`);
  parts.push(`Requisition ID: ${input.requisitionId}`);

  if (input.candidateExpectation) {
    parts.push(``, `Candidate Salary Expectation: $${input.candidateExpectation.toLocaleString()}`);
  }

  if (input.hiringManagerNotes) {
    parts.push(``, `Hiring Manager Notes: ${input.hiringManagerNotes}`);
  }

  parts.push(
    ``,
    `Instructions:`,
    `1. Use get_comp_band to fetch the compensation band for this role level and department.`,
    `2. Use get_market_data to understand market positioning.`,
    `3. Use get_candidate_history to understand candidate context, interview performance, and current stage.`,
    `4. Draft a competitive but fiscally responsible offer with full justification.`,
  );

  const userMessage = parts.join('\n');

  logger.info({
    candidateId: input.candidateId,
    requisitionId: input.requisitionId,
    runId,
  }, 'Starting offer generation');

  // Run the ReAct agent
  const runtime = new AgentRuntime(offerAgentDefinition);
  const ctx: AgentContext = {
    tenantId: input.tenantId,
    userId: input.userId,
    runId,
    agentType: 'offer-agent',
  };

  const result = await runtime.run<OfferDraft>(ctx, userMessage);
  const offer = result.output;

  // MANDATORY HITL checkpoint — no offer auto-sends
  const hitlCheckpointId = await createHITLCheckpoint({
    tenantId: input.tenantId,
    agentRunId: runId,
    type: 'approval',
    action: `AI-drafted offer for "${requisition.title}" — ${offer.currency} ${offer.baseSalary.toLocaleString()} base (${offer.compBandPosition})`,
    payload: {
      candidateId: input.candidateId,
      requisitionId: input.requisitionId,
      applicationId: input.applicationId,
      requisitionTitle: requisition.title,
      department: requisition.department,
      baseSalary: offer.baseSalary,
      equity: offer.equity,
      signingBonus: offer.signingBonus,
      annualBonus: offer.annualBonus,
      totalCompensation: offer.totalCompensation,
      currency: offer.currency,
      justification: offer.justification,
      compBandPosition: offer.compBandPosition,
      marketComparison: offer.marketComparison,
      benefits: offer.benefits,
      startDate: offer.startDate,
      expiresInDays: offer.expiresInDays,
      approvalChain: offer.approvalChain,
      candidateExpectation: input.candidateExpectation,
      hiringManagerNotes: input.hiringManagerNotes,
    },
    slaMinutes: 480, // 8 hours for offer approvals
  });

  logger.info({
    candidateId: input.candidateId,
    hitlCheckpointId,
    baseSalary: offer.baseSalary,
    compBandPosition: offer.compBandPosition,
  }, 'HITL checkpoint created for offer approval');

  // Create Offer record in DRAFT status
  await prisma.offer.create({
    data: {
      tenantId: input.tenantId,
      requisitionId: input.requisitionId,
      candidateId: input.candidateId,
      applicationId: input.applicationId,
      salaryAmount: offer.baseSalary,
      salaryCurrency: offer.currency,
      equity: offer.equity ? { description: offer.equity } as any : undefined,
      benefits: offer.benefits ? (offer.benefits as any) : undefined,
      startDate: offer.startDate ? new Date(offer.startDate) : undefined,
      expiresAt: new Date(Date.now() + offer.expiresInDays * 24 * 60 * 60 * 1000),
      status: 'DRAFT',
      complianceCheck: {
        agentRunId: runId,
        compBandPosition: offer.compBandPosition,
        totalCompensation: offer.totalCompensation,
      } as any,
      approvalChain: offer.approvalChain as any,
    },
  }).catch(err => logger.error({ err }, 'Failed to create Offer record'));

  // Audit trail
  await prisma.auditTrailEntry.create({
    data: {
      tenantId: input.tenantId,
      action: 'AI_OFFER_DRAFTED',
      resourceType: 'Offer',
      resourceId: `${input.candidateId}-${input.requisitionId}`,
      actorId: input.userId,
      actorType: 'AGENT',
      after: {
        agentRunId: runId,
        baseSalary: offer.baseSalary,
        totalCompensation: offer.totalCompensation,
        compBandPosition: offer.compBandPosition,
        hitlCheckpointId,
      },
      metadata: {
        agentType: 'offer-agent',
        modelId: 'claude-sonnet-4-20250514',
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
      },
    },
  }).catch(err => logger.error({ err }, 'Failed to create offer audit trail'));

  logger.info({
    candidateId: input.candidateId,
    runId,
    baseSalary: offer.baseSalary,
    totalCompensation: offer.totalCompensation,
    compBandPosition: offer.compBandPosition,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  }, 'Offer generation completed');

  return {
    offer,
    runId,
    hitlCheckpointId,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  };
}

// ── Exports for testing ────────────────────────────────────────────────

export { offerAgentDefinition as _offerAgentDefinition };
export { getCompBandTool as _getCompBandTool };
export { getMarketDataTool as _getMarketDataTool };
export { getCandidateHistoryTool as _getCandidateHistoryTool };
