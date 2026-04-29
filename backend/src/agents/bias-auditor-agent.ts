import { z } from 'zod';
import { AgentRuntime, type AgentDefinition, type AgentContext, type AgentTool } from './runtime';
import { createHITLCheckpoint } from './hitl';
import { computeAdverseImpact, generateComplianceReport } from '../lib/compliance-compute';
import { prisma } from '../utils/prisma';
import logger from '../lib/logger';
import crypto from 'crypto';

// ── Output Schema ──────────────────────────────────────────────────────

export const ComplianceAuditSchema = z.object({
  reports: z.array(z.object({
    attribute: z.string(),
    stage: z.string(),
    groups: z.array(z.object({
      name: z.string(),
      applicants: z.number(),
      selected: z.number(),
      selectionRate: z.number(),
    })),
    adverseImpactRatio: z.number(),
    fourFifthsPass: z.boolean(),
    finding: z.string(),
    recommendation: z.string(),
  })),
  overallCompliance: z.boolean(),
  narrative: z.string().min(50).describe('Human-readable compliance report narrative'),
  methodology: z.string().describe('Description of the methodology used'),
  generatedAt: z.string(),
});

export type ComplianceAudit = z.infer<typeof ComplianceAuditSchema>;

// ── System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a compliance auditor specializing in employment law and the EEOC Uniform Guidelines on Employee Selection Procedures (29 CFR 1607).

Your role:
1. Use the query_demographic_data tool to fetch REAL selection rates from the database.
2. Use the generate_compliance_report tool to get a full multi-attribute compliance report.
3. The 4/5ths rule numbers are computed via SQL — do NOT recalculate them.
4. Your job is to interpret the data and generate a clear narrative report.
5. Flag any groups where the adverse impact ratio is below 0.80.
6. Recommend specific actions to address disparities.
7. Document the methodology used (EEOC Uniform Guidelines, 29 CFR 1607).
8. NEVER fabricate demographic data — only use what the tools return.

When generating the output:
- reports: Reflect the data returned by the tools exactly. Map group data to the output format.
- overallCompliance: true only if ALL reports pass the 4/5ths rule.
- narrative: Write a clear, professional compliance narrative summarizing findings, risks, and recommendations.
- methodology: Describe the EEOC 4/5ths rule methodology used.
- generatedAt: Use the current ISO timestamp from the tool results.`;

// ── Tools ──────────────────────────────────────────────────────────────

const queryDemographicDataTool: AgentTool = {
  name: 'query_demographic_data',
  description: 'Query demographic group counts and selection rates for a specific protected attribute and pipeline stage. Calls computeAdverseImpact() which runs SQL aggregation on actual hiring data. Returns group-level selection rates, adverse impact ratio, and 4/5ths rule pass/fail.',
  parameters: z.object({
    protectedAttribute: z.string().describe('The protected attribute to analyze, e.g., "race", "gender", "source"'),
    stage: z.string().optional().describe('Pipeline stage to filter by, e.g., "SCREENED", "INTERVIEW". Omit for all stages.'),
  }),
  returns: z.object({
    attribute: z.string(),
    stage: z.string(),
    groups: z.array(z.object({
      groupName: z.string(),
      applicantCount: z.number(),
      selectedCount: z.number(),
      selectionRate: z.number(),
    })),
    adverseImpactRatio: z.number(),
    fourFifthsPass: z.boolean(),
    highestRateGroup: z.string(),
    lowestRateGroup: z.string(),
    sampleSize: z.number(),
    recommendation: z.string(),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 10, maxPerRun: 10 },
  costTag: 'free',
  requiredScope: ['compliance:read'],
  execute: async (params: any, ctx: AgentContext) => {
    // Extract timeRange from the context (set by caller via inputData)
    // The tool reads from a closure context set by runComplianceAudit
    const timeRange = (globalThis as any).__biasAuditorTimeRange?.[ctx.runId] || {
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      end: new Date(),
    };

    const result = await computeAdverseImpact({
      tenantId: ctx.tenantId,
      timeRange,
      protectedAttribute: params.protectedAttribute,
      stage: params.stage,
    });

    return {
      attribute: result.attribute,
      stage: result.stage,
      groups: result.groups.map(g => ({
        groupName: g.groupName,
        applicantCount: g.applicantCount,
        selectedCount: g.selectedCount,
        selectionRate: g.selectionRate,
      })),
      adverseImpactRatio: result.adverseImpactRatio,
      fourFifthsPass: result.fourFifthsPass,
      highestRateGroup: result.highestRateGroup,
      lowestRateGroup: result.lowestRateGroup,
      sampleSize: result.sampleSize,
      recommendation: result.recommendation,
    };
  },
};

const generateComplianceReportTool: AgentTool = {
  name: 'generate_compliance_report',
  description: 'Generate a full compliance report across multiple protected attributes and stages. Calls generateComplianceReport() which runs SQL aggregation on actual hiring data. Returns multi-attribute adverse impact analysis with overall compliance status.',
  parameters: z.object({
    attributes: z.array(z.string()).min(1).describe('Protected attributes to analyze, e.g., ["race", "gender", "source"]'),
    stages: z.array(z.string()).optional().describe('Pipeline stages to analyze. Omit to analyze all stages.'),
  }),
  returns: z.object({
    tenantId: z.string(),
    timeRange: z.object({ start: z.string(), end: z.string() }),
    reports: z.array(z.object({
      attribute: z.string(),
      stage: z.string(),
      groups: z.array(z.object({
        groupName: z.string(),
        applicantCount: z.number(),
        selectedCount: z.number(),
        selectionRate: z.number(),
      })),
      adverseImpactRatio: z.number(),
      fourFifthsPass: z.boolean(),
      highestRateGroup: z.string(),
      lowestRateGroup: z.string(),
      recommendation: z.string(),
      sampleSize: z.number(),
    })),
    overallCompliance: z.boolean(),
    generatedAt: z.string(),
    methodology: z.string(),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 5, maxPerRun: 3 },
  costTag: 'low',
  requiredScope: ['compliance:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const timeRange = (globalThis as any).__biasAuditorTimeRange?.[ctx.runId] || {
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      end: new Date(),
    };

    const report = await generateComplianceReport({
      tenantId: ctx.tenantId,
      timeRange,
      attributes: params.attributes,
      stages: params.stages,
    });

    return {
      tenantId: report.tenantId,
      timeRange: report.timeRange,
      reports: report.reports.map(r => ({
        attribute: r.attribute,
        stage: r.stage,
        groups: r.groups.map(g => ({
          groupName: g.groupName,
          applicantCount: g.applicantCount,
          selectedCount: g.selectedCount,
          selectionRate: g.selectionRate,
        })),
        adverseImpactRatio: r.adverseImpactRatio,
        fourFifthsPass: r.fourFifthsPass,
        highestRateGroup: r.highestRateGroup,
        lowestRateGroup: r.lowestRateGroup,
        recommendation: r.recommendation,
        sampleSize: r.sampleSize,
      })),
      overallCompliance: report.overallCompliance,
      generatedAt: report.generatedAt,
      methodology: report.methodology,
    };
  },
};

// ── Agent Definition ──────────────────────────────────────────────────

const biasAuditorDefinition: AgentDefinition = {
  name: 'bias-auditor-agent',
  systemPrompt: SYSTEM_PROMPT,
  tools: [queryDemographicDataTool, generateComplianceReportTool],
  outputSchema: ComplianceAuditSchema,
  budget: {
    maxTokensPerRun: 15000,
    maxIterationsPerRun: 6,
    maxCostUsdPerRun: 0.10,
    maxRepairAttempts: 3,
  },
  modelId: 'claude-sonnet-4-20250514',
  mode: 'react',
  untrustedInput: false,
};

// ── Public API ─────────────────────────────────────────────────────────

export interface RunComplianceAuditInput {
  tenantId: string;
  userId: string;
  timeRange: { start: Date; end: Date };
  attributes: string[];
  stages?: string[];
}

export interface RunComplianceAuditResult {
  audit: ComplianceAudit;
  runId: string;
  hitlCheckpointId: string;
  tokensUsed: number;
  costUsd: number;
}

/**
 * Run an AI-powered compliance audit using the Bias Auditor Agent.
 * 1. Agent calls tools that execute SQL-based demographic analysis
 * 2. LLM generates narrative interpretation of the SQL-computed data
 * 3. Creates MANDATORY HITL checkpoint for compliance officer review
 * 4. Returns the audit report, run ID, and HITL checkpoint ID
 */
export async function runComplianceAudit(input: RunComplianceAuditInput): Promise<RunComplianceAuditResult> {
  const runId = crypto.randomUUID();

  // Store time range in a run-scoped context for tool access
  if (!(globalThis as any).__biasAuditorTimeRange) {
    (globalThis as any).__biasAuditorTimeRange = {};
  }
  (globalThis as any).__biasAuditorTimeRange[runId] = input.timeRange;

  try {
    // Build the user message
    const parts: string[] = [
      `Run a compliance audit for adverse impact analysis.`,
      ``,
      `Time Range: ${input.timeRange.start.toISOString().split('T')[0]} to ${input.timeRange.end.toISOString().split('T')[0]}`,
      `Protected Attributes to Analyze: ${input.attributes.join(', ')}`,
    ];

    if (input.stages && input.stages.length > 0) {
      parts.push(`Pipeline Stages to Analyze: ${input.stages.join(', ')}`);
    }

    parts.push(
      ``,
      `Instructions:`,
      `1. Use the generate_compliance_report tool with the specified attributes${input.stages ? ' and stages' : ''}.`,
      `2. Review the results and generate a professional narrative report.`,
      `3. Flag any attributes/stages that FAIL the 4/5ths rule (adverse impact ratio < 0.80).`,
      `4. Provide specific, actionable recommendations for each failure.`,
      `5. Set overallCompliance to true ONLY if ALL reports pass the 4/5ths rule.`,
      `6. Include the generatedAt timestamp from the report.`,
    );

    const userMessage = parts.join('\n');

    logger.info({
      tenantId: input.tenantId,
      attributes: input.attributes,
      stages: input.stages,
      runId,
    }, 'Starting compliance audit');

    // Run the ReAct agent
    const runtime = new AgentRuntime(biasAuditorDefinition);
    const ctx: AgentContext = {
      tenantId: input.tenantId,
      userId: input.userId,
      runId,
      agentType: 'bias-auditor-agent',
    };

    const result = await runtime.run<ComplianceAudit>(ctx, userMessage);
    const audit = result.output;

    // MANDATORY HITL checkpoint — compliance officer must review every report
    const hitlCheckpointId = await createHITLCheckpoint({
      tenantId: input.tenantId,
      agentRunId: runId,
      type: 'review',
      action: `AI compliance audit: ${audit.overallCompliance ? 'PASS' : 'FAIL'} — ${audit.reports.length} attribute(s) analyzed`,
      payload: {
        type: 'compliance_audit',
        audit,
        attributes: input.attributes,
        stages: input.stages,
        timeRange: {
          start: input.timeRange.start.toISOString(),
          end: input.timeRange.end.toISOString(),
        },
      },
      slaMinutes: 1440, // 24 hours for compliance audits
    });

    // Audit trail
    await prisma.auditTrailEntry.create({
      data: {
        tenantId: input.tenantId,
        action: 'AI_COMPLIANCE_AUDIT_GENERATED',
        resourceType: 'ComplianceAudit',
        resourceId: runId,
        actorId: input.userId,
        actorType: 'AGENT',
        metadata: {
          agentType: 'bias-auditor-agent',
          attributes: input.attributes,
          overallCompliance: audit.overallCompliance,
          reportsCount: audit.reports.length,
          hitlCheckpointId,
          tokensUsed: result.tokensUsed,
          costUsd: result.costUsd,
        },
      },
    }).catch(err => logger.error({ err }, 'Failed to create compliance audit trail'));

    logger.info({
      runId,
      overallCompliance: audit.overallCompliance,
      reportsCount: audit.reports.length,
      hitlCheckpointId,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
    }, 'Compliance audit completed');

    return {
      audit,
      runId,
      hitlCheckpointId,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
    };
  } finally {
    // Clean up run-scoped context
    delete (globalThis as any).__biasAuditorTimeRange?.[runId];
  }
}

// ── Exports for testing ────────────────────────────────────────────────

export { biasAuditorDefinition as _biasAuditorDefinition };
export { queryDemographicDataTool as _queryDemographicDataTool };
export { generateComplianceReportTool as _generateComplianceReportTool };
