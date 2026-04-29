import { z } from 'zod';
import { AgentRuntime, type AgentDefinition, type AgentContext } from './runtime';
import { prisma } from '../utils/prisma';
import logger from '../lib/logger';
import crypto from 'crypto';

// ── Output Schema ──────────────────────────────────────────────────────

export const JDOutputSchema = z.object({
  description: z.string().min(100).describe('Full job description text, at least 100 characters'),
  requirements: z.array(z.string()).min(3).describe('Required qualifications and skills (minimum 3)'),
  niceToHave: z.array(z.string()).describe('Nice-to-have qualifications'),
  biasFlags: z.array(z.object({
    text: z.string().describe('The flagged text snippet'),
    issue: z.string().describe('Description of the bias concern'),
    suggestion: z.string().describe('Suggested replacement or fix'),
    severity: z.enum(['low', 'medium', 'high']).describe('Severity of the bias issue'),
  })).describe('Self-identified bias flags in the generated content'),
  inclusivityScore: z.number().min(0).max(100).describe('Inclusivity score from 0-100'),
});

export type JDOutput = z.infer<typeof JDOutputSchema>;

// ── System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert job description writer for an AI-powered applicant tracking system. Your goal is to generate inclusive, welcoming, and bias-free job descriptions that attract diverse talent.

## Phase 1: Generate the Job Description

Write a compelling job description following these rules:

1. Use inclusive, gender-neutral language throughout.
2. Use "you" language to directly address prospective candidates and make them feel welcome.
3. Focus on skills, outcomes, and impact — not pedigree, prestige, or credentials.
4. Describe what the person will DO, not who they should BE.
5. List concrete, measurable requirements rather than vague traits.
6. Clearly separate required qualifications from nice-to-have qualifications.
7. Include information about team culture, growth opportunities, and what success looks like.

## Phase 2: Self-Review for Bias

After generating the JD, review it for the following bias patterns and flag any issues:

### Gender-Coded Terms (flag as medium/high severity)
- Masculine-coded: "rockstar", "ninja", "guru", "hacker", "dominate", "aggressive", "manpower", "chairman", "he/she"
- Replace with: "specialist", "expert", "lead", "developer", "team member", "workforce", "chairperson", "they/you"

### Age-Coded Terms (flag as high severity)
- "Digital native", "young and dynamic", "energetic", "fresh graduate only", "recent graduate"
- Replace with: "tech-savvy", "motivated", "enthusiastic", "early-career" (when appropriate)

### Ability-Coded Terms (flag as high severity)
- "Able-bodied", "stands for long periods", "must be able to lift", "walk between offices"
- Replace with inclusive language or note reasonable accommodations

### Exclusionary Requirements (flag as medium severity)
- Unnecessary degree requirements when skills matter more
- Overly specific years of experience that exclude career changers
- Company-specific jargon or acronyms without explanation

### Pedigree Bias (flag as medium severity)
- "Top-tier university", "Fortune 500 experience", "Ivy League"
- Focus on demonstrated skills and outcomes instead

## Inclusivity Score Guidelines
- 90-100: Excellent — welcoming, gender-neutral, no bias flags, uses "you" language
- 70-89: Good — mostly inclusive with minor improvements possible
- 50-69: Needs improvement — some biased language or exclusionary patterns
- 0-49: Poor — significant bias issues that would deter diverse candidates

Generate the description field as a complete, publication-ready job description including sections for About the Role, What You Will Do, What We Are Looking For, Nice to Have, and Why Join Us.`;

// ── Agent Definition ───────────────────────────────────────────────────

const jdAuthorDefinition: AgentDefinition = {
  name: 'jd-author',
  systemPrompt: SYSTEM_PROMPT,
  tools: [],
  outputSchema: JDOutputSchema,
  budget: {
    maxTokensPerRun: 20000,
    maxIterationsPerRun: 4,
    maxCostUsdPerRun: 0.30,
    maxRepairAttempts: 3,
  },
  modelId: 'claude-sonnet-4-20250514',
  mode: 'single-call',
};

// ── Public API ─────────────────────────────────────────────────────────

export interface GenerateJDInput {
  title: string;
  department: string;
  skills: string[];
  level: string;
  location: string;
  salaryRange?: string;
  companyContext?: string;
  tenantId: string;
  userId: string;
  requisitionId?: string;
}

export interface GenerateJDResult {
  jd: JDOutput;
  runId: string;
  tokensUsed: number;
  costUsd: number;
}

/**
 * Generate an inclusive, bias-checked job description using the JD Author Agent.
 *
 * 1. Builds a structured prompt from intake form data
 * 2. Calls AgentRuntime with structured output + self-bias-check
 * 3. Optionally stores JD on the Requisition record
 * 4. Creates audit trail entry
 */
export async function generateJD(input: GenerateJDInput): Promise<GenerateJDResult> {
  const runId = crypto.randomUUID();

  // Build the user message from intake form data
  const salaryLine = input.salaryRange ? `Salary Range: ${input.salaryRange}` : '';
  const companyLine = input.companyContext
    ? `Company Context: ${input.companyContext}`
    : '';

  const userMessage = `Generate an inclusive job description for the following position:

Title: ${input.title}
Department: ${input.department}
Level: ${input.level}
Location: ${input.location}
Required Skills: ${input.skills.join(', ')}
${salaryLine}
${companyLine}

Generate:
1. A complete, publication-ready job description (description field)
2. A list of required qualifications (requirements field, minimum 3)
3. A list of nice-to-have qualifications (niceToHave field)
4. Self-review for bias issues (biasFlags field)
5. An inclusivity score (inclusivityScore field)`.trim();

  logger.info({
    title: input.title,
    department: input.department,
    level: input.level,
    runId,
  }, 'Starting JD generation');

  // Run the agent
  const runtime = new AgentRuntime(jdAuthorDefinition);
  const ctx: AgentContext = {
    tenantId: input.tenantId,
    userId: input.userId,
    runId,
    agentType: 'jd-author',
  };

  const result = await runtime.run<JDOutput>(ctx, userMessage);
  const jd = result.output;

  // Optionally store on requisition
  if (input.requisitionId) {
    await prisma.requisition.update({
      where: { id: input.requisitionId },
      data: {
        description: jd.description,
        requirements: jd.requirements as any,
      },
    }).catch(err => logger.error({ err, requisitionId: input.requisitionId }, 'Failed to update requisition with generated JD'));
  }

  // Create audit trail entry
  await prisma.auditTrailEntry.create({
    data: {
      tenantId: input.tenantId,
      action: 'AI_JD_GENERATION',
      resourceType: 'Requisition',
      resourceId: input.requisitionId || runId,
      actorId: input.userId,
      actorType: 'AGENT',
      after: {
        agentRunId: runId,
        inclusivityScore: jd.inclusivityScore,
        biasFlags: jd.biasFlags.length,
        requirementsCount: jd.requirements.length,
      },
      metadata: {
        agentType: 'jd-author',
        modelId: 'claude-sonnet-4-20250514',
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
      },
    },
  }).catch(err => logger.error({ err }, 'Failed to create JD generation audit trail'));

  logger.info({
    title: input.title,
    runId,
    inclusivityScore: jd.inclusivityScore,
    biasFlags: jd.biasFlags.length,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  }, 'JD generation completed');

  return {
    jd,
    runId,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  };
}
