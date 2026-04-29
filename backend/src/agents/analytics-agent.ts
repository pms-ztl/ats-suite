import { z } from 'zod';
import { AgentRuntime, type AgentDefinition, type AgentContext } from './runtime';
import { prisma } from '../utils/prisma';
import logger from '../lib/logger';
import crypto from 'crypto';

// ── Output Schema ──────────────────────────────────────────────────────

export const AnalyticsInsightSchema = z.object({
  insights: z.array(z.object({
    finding: z.string().min(10),
    evidence: z.string(),
    severity: z.enum(['info', 'warning', 'critical']),
    recommendation: z.string(),
  })).min(1).max(5),
  metrics: z.array(z.object({
    name: z.string(),
    value: z.number(),
    unit: z.string(),
    trend: z.enum(['up', 'down', 'stable']).optional(),
  })).optional(),
  answer: z.string().min(20).describe('Natural language answer to the query'),
});

export type AnalyticsInsight = z.infer<typeof AnalyticsInsightSchema>;

// ── System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an analytics expert for a hiring pipeline (Applicant Tracking System).

Your task: Analyze the provided hiring pipeline metrics and produce actionable insights.

Rules:
1. Focus on bottlenecks, conversion rates, time-to-hire trends, and source effectiveness.
2. Be data-driven — always cite specific numbers from the data provided.
3. Severity levels:
   - "info": Interesting observation, no action needed immediately.
   - "warning": Potential issue that should be monitored or addressed soon.
   - "critical": Significant problem requiring immediate attention (e.g., conversion drop >50%, TTH doubling).
4. Each insight must have a concrete, actionable recommendation.
5. Return between 1 and 5 insights, prioritized by severity.
6. The "answer" field must directly address the user's query in plain language.
7. If the data is insufficient to answer the query, say so explicitly and recommend what data to collect.
8. Never fabricate numbers — only use what is provided in the context.`;

// ── Agent Definition ──────────────────────────────────────────────────

const analyticsAgentDefinition: AgentDefinition = {
  name: 'analytics-agent',
  systemPrompt: SYSTEM_PROMPT,
  tools: [], // No tools — context loaded pre-call
  outputSchema: AnalyticsInsightSchema,
  budget: {
    maxTokensPerRun: 15000,
    maxIterationsPerRun: 4,
    maxCostUsdPerRun: 0.30,
    maxRepairAttempts: 3,
  },
  modelId: 'claude-sonnet-4-20250514',
  mode: 'single-call',
  untrustedInput: false,
};

// ── Pre-load metrics from DB ──────────────────────────────────────────

interface PipelineMetrics {
  openRequisitions: number;
  totalCandidates: number;
  totalApplications: number;
  hiredCount: number;
  rejectedCount: number;
  withdrawnCount: number;
  pipelineByStage: Array<{ stage: string; count: number }>;
  timeToHire: {
    averageDays: number;
    medianDays: number;
    sampleSize: number;
    byDepartment: Array<{ department: string; averageDays: number; count: number }>;
  };
  sourceEffectiveness: Array<{
    source: string | null;
    totalCandidates: number;
    hiredCount: number;
    hireRate: number;
  }>;
  conversionRates: Array<{
    fromStage: string;
    toStage: string;
    rate: number;
  }>;
}

const FUNNEL_STAGES = [
  'APPLIED', 'SCREENED', 'PHONE_SCREEN', 'ASSESSMENT',
  'INTERVIEW', 'FINAL_REVIEW', 'OFFER', 'HIRED',
] as const;

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function loadPipelineMetrics(
  tenantId: string,
  timeRange?: { start: Date; end: Date },
  department?: string,
): Promise<PipelineMetrics> {
  const dateFilter = timeRange
    ? { createdAt: { gte: timeRange.start, lte: timeRange.end } }
    : {};

  const reqFilter = department ? { department } : {};

  const [
    openRequisitions,
    totalCandidates,
    totalApplications,
    hiredCount,
    rejectedCount,
    withdrawnCount,
    pipelineGrouped,
    hiredApps,
    sourceGroups,
    hiredAppsForSource,
  ] = await Promise.all([
    prisma.requisition.count({
      where: { tenantId, status: 'OPEN', ...reqFilter },
    }),
    prisma.candidate.count({
      where: { tenantId, isAnonymized: false },
    }),
    prisma.application.count({
      where: { tenantId, ...dateFilter },
    }),
    prisma.application.count({
      where: { tenantId, stage: 'HIRED', ...dateFilter },
    }),
    prisma.application.count({
      where: { tenantId, stage: 'REJECTED', ...dateFilter },
    }),
    prisma.application.count({
      where: { tenantId, stage: 'WITHDRAWN', ...dateFilter },
    }),
    prisma.application.groupBy({
      by: ['stage'],
      where: { tenantId, ...dateFilter },
      _count: { id: true },
    }),
    prisma.application.findMany({
      where: { tenantId, stage: 'HIRED', ...dateFilter },
      select: {
        appliedAt: true,
        stageUpdatedAt: true,
        requisition: { select: { department: true } },
      },
    }),
    prisma.candidate.groupBy({
      by: ['source'],
      where: { tenantId, isAnonymized: false },
      _count: { id: true },
    }),
    prisma.application.findMany({
      where: { tenantId, stage: 'HIRED', ...dateFilter },
      include: { candidate: { select: { source: true } } },
    }),
  ]);

  // Pipeline by stage
  const countByStage: Record<string, number> = {};
  for (const g of pipelineGrouped as Array<{ stage: string; _count: { id: number } }>) {
    countByStage[g.stage] = g._count.id;
  }

  const pipelineByStage = FUNNEL_STAGES.map(stage => ({
    stage,
    count: countByStage[stage] ?? 0,
  }));

  // Conversion rates
  const conversionRates = FUNNEL_STAGES.slice(0, -1).map((stage, i) => {
    const fromCount = countByStage[stage] ?? 0;
    const toCount = countByStage[FUNNEL_STAGES[i + 1]] ?? 0;
    return {
      fromStage: stage,
      toStage: FUNNEL_STAGES[i + 1],
      rate: fromCount > 0 ? Math.round((toCount / fromCount) * 1000) / 10 : 0,
    };
  });

  // Time to hire
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const allDays: number[] = [];
  const deptMap: Record<string, number[]> = {};
  for (const app of hiredApps) {
    const days = (app.stageUpdatedAt.getTime() - app.appliedAt.getTime()) / MS_PER_DAY;
    allDays.push(days);
    const dept = app.requisition?.department ?? 'Unknown';
    if (!deptMap[dept]) deptMap[dept] = [];
    deptMap[dept].push(days);
  }

  const timeToHire = {
    averageDays: Math.round(mean(allDays) * 10) / 10,
    medianDays: Math.round(median(allDays) * 10) / 10,
    sampleSize: hiredApps.length,
    byDepartment: Object.entries(deptMap).map(([dept, days]) => ({
      department: dept,
      averageDays: Math.round(mean(days) * 10) / 10,
      count: days.length,
    })),
  };

  // Source effectiveness
  const hiredBySource: Record<string, number> = {};
  for (const app of hiredAppsForSource) {
    const src = app.candidate?.source ?? '__null__';
    hiredBySource[src] = (hiredBySource[src] ?? 0) + 1;
  }

  const sourceEffectiveness = (sourceGroups as Array<{ source: string | null; _count: { id: number } }>)
    .map(g => {
      const src = g.source ?? '__null__';
      const total = g._count.id;
      const hired = hiredBySource[src] ?? 0;
      return {
        source: g.source,
        totalCandidates: total,
        hiredCount: hired,
        hireRate: total > 0 ? Math.round((hired / total) * 1000) / 10 : 0,
      };
    });

  return {
    openRequisitions,
    totalCandidates,
    totalApplications,
    hiredCount,
    rejectedCount,
    withdrawnCount,
    pipelineByStage,
    timeToHire,
    sourceEffectiveness,
    conversionRates,
  };
}

// ── Public API ─────────────────────────────────────────────────────────

export interface GenerateInsightsInput {
  tenantId: string;
  userId: string;
  query: string;
  timeRange?: { start: Date; end: Date };
  department?: string;
}

export interface GenerateInsightsResult {
  insights: AnalyticsInsight;
  runId: string;
  tokensUsed: number;
  costUsd: number;
}

/**
 * Generate AI-powered analytics insights for the hiring pipeline.
 * 1. Pre-loads pipeline metrics from DB (no tools — single-call mode)
 * 2. Passes metrics + user query to the LLM
 * 3. Returns structured insights with evidence and recommendations
 */
export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsResult> {
  const runId = crypto.randomUUID();

  // Pre-load all pipeline metrics
  const metrics = await loadPipelineMetrics(
    input.tenantId,
    input.timeRange,
    input.department,
  );

  // Build the user message with metrics context
  const parts: string[] = [
    `User Query: ${input.query}`,
    ``,
    `--- PIPELINE METRICS ---`,
    ``,
    `Open Requisitions: ${metrics.openRequisitions}`,
    `Total Candidates: ${metrics.totalCandidates}`,
    `Total Applications: ${metrics.totalApplications}`,
    `Hired: ${metrics.hiredCount}`,
    `Rejected: ${metrics.rejectedCount}`,
    `Withdrawn: ${metrics.withdrawnCount}`,
    ``,
    `--- PIPELINE BY STAGE ---`,
    ...metrics.pipelineByStage.map(s => `${s.stage}: ${s.count}`),
    ``,
    `--- CONVERSION RATES ---`,
    ...metrics.conversionRates.map(c => `${c.fromStage} -> ${c.toStage}: ${c.rate}%`),
    ``,
    `--- TIME TO HIRE ---`,
    `Average: ${metrics.timeToHire.averageDays} days`,
    `Median: ${metrics.timeToHire.medianDays} days`,
    `Sample Size: ${metrics.timeToHire.sampleSize} hires`,
  ];

  if (metrics.timeToHire.byDepartment.length > 0) {
    parts.push(``, `By Department:`);
    for (const d of metrics.timeToHire.byDepartment) {
      parts.push(`  ${d.department}: ${d.averageDays} days (${d.count} hires)`);
    }
  }

  if (metrics.sourceEffectiveness.length > 0) {
    parts.push(``, `--- SOURCE EFFECTIVENESS ---`);
    for (const s of metrics.sourceEffectiveness) {
      parts.push(`${s.source ?? 'Unknown'}: ${s.totalCandidates} candidates, ${s.hiredCount} hired (${s.hireRate}% hire rate)`);
    }
  }

  if (input.department) {
    parts.push(``, `Note: Filtered by department: ${input.department}`);
  }
  if (input.timeRange) {
    parts.push(`Time Range: ${input.timeRange.start.toISOString().split('T')[0]} to ${input.timeRange.end.toISOString().split('T')[0]}`);
  }

  const userMessage = parts.join('\n');

  logger.info({
    tenantId: input.tenantId,
    query: input.query,
    runId,
    metricsLoaded: {
      applications: metrics.totalApplications,
      hires: metrics.hiredCount,
      stages: metrics.pipelineByStage.length,
    },
  }, 'Starting analytics insight generation');

  // Run the single-call agent
  const runtime = new AgentRuntime(analyticsAgentDefinition);
  const ctx: AgentContext = {
    tenantId: input.tenantId,
    userId: input.userId,
    runId,
    agentType: 'analytics-agent',
  };

  const result = await runtime.run<AnalyticsInsight>(ctx, userMessage);

  // Audit trail
  await prisma.auditTrailEntry.create({
    data: {
      tenantId: input.tenantId,
      action: 'AI_ANALYTICS_INSIGHTS_GENERATED',
      resourceType: 'AnalyticsInsight',
      resourceId: runId,
      actorId: input.userId,
      actorType: 'AGENT',
      metadata: {
        agentType: 'analytics-agent',
        query: input.query,
        insightCount: result.output.insights.length,
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
      },
    },
  }).catch(err => logger.error({ err }, 'Failed to create analytics audit trail'));

  logger.info({
    runId,
    insightCount: result.output.insights.length,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  }, 'Analytics insight generation completed');

  return {
    insights: result.output,
    runId,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  };
}

// ── Exports for testing ────────────────────────────────────────────────

export { analyticsAgentDefinition as _analyticsAgentDefinition };
