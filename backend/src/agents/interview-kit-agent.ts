import { z } from 'zod';
import { AgentRuntime, type AgentDefinition, type AgentContext } from './runtime';
import { prisma } from '../utils/prisma';
import logger from '../lib/logger';
import crypto from 'crypto';

// ── Output Schema ──────────────────────────────────────────────────────

export const InterviewKitSchema = z.object({
  questions: z.array(z.object({
    question: z.string().min(10),
    purpose: z.string().describe('What this question evaluates'),
    scoringGuide: z.object({
      excellent: z.string().describe('What an excellent answer looks like'),
      good: z.string(),
      poor: z.string(),
    }),
    timeMinutes: z.number().min(1).max(30),
    followUps: z.array(z.string()).max(3),
    category: z.enum(['technical', 'behavioral', 'situational', 'culture', 'experience']),
  })).min(3).max(10),
  totalTimeMinutes: z.number(),
  focusAreas: z.array(z.string()).min(1),
  candidateBrief: z.string().min(20).describe('Brief summary of candidate background for interviewer context'),
  interviewTips: z.array(z.string()).max(5).describe('Tips for conducting this interview'),
});

export type InterviewKit = z.infer<typeof InterviewKitSchema>;

// ── System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert interview designer for a hiring team. Generate structured interview questions tailored to the candidate and role.

Rules:
- Questions must be relevant to the requisition requirements
- Include a mix of categories (technical, behavioral, situational)
- Each question needs a clear scoring rubric (excellent/good/poor)
- Provide follow-up questions for deeper probing
- Consider the candidate's background when framing questions
- Avoid illegal/discriminatory questions (age, family status, religion, etc.)
- Total time should match the allotted interview duration
- Provide a brief candidate summary so the interviewer has context
- Focus on job-relevant competencies and skills
- Ensure scoring guides are specific and actionable, not vague
- Follow-up questions should probe deeper into the candidate's initial answer`;

// ── Agent Definition ───────────────────────────────────────────────────

const interviewKitDefinition: AgentDefinition = {
  name: 'interview-kit',
  systemPrompt: SYSTEM_PROMPT,
  tools: [],
  outputSchema: InterviewKitSchema,
  budget: {
    maxTokensPerRun: 15000,
    maxIterationsPerRun: 4,
    maxCostUsdPerRun: 0.20,
    maxRepairAttempts: 3,
  },
  modelId: 'claude-sonnet-4-20250514',
  mode: 'single-call',
  untrustedInput: false,
};

// ── Public API ─────────────────────────────────────────────────────────

export interface GenerateInterviewKitInput {
  requisitionId: string;
  candidateId: string;
  interviewType: 'technical' | 'behavioral' | 'culture' | 'final';
  interviewerRole: string;
  durationMinutes: number;
  tenantId: string;
  userId: string;
}

export interface GenerateInterviewKitResult {
  kit: InterviewKit;
  runId: string;
  tokensUsed: number;
  costUsd: number;
}

/**
 * Generate a structured interview kit using the Interview Kit Agent.
 *
 * 1. Fetches requisition details and candidate profile from DB
 * 2. Builds a rich prompt with requirements + candidate background
 * 3. Calls AgentRuntime.run() with structured output
 * 4. Returns the generated interview kit with run metadata
 */
export async function generateInterviewKit(
  input: GenerateInterviewKitInput,
): Promise<GenerateInterviewKitResult> {
  const runId = crypto.randomUUID();

  // Fetch requisition details
  const requisition = await prisma.requisition.findFirst({
    where: { id: input.requisitionId, tenantId: input.tenantId },
    select: {
      id: true,
      title: true,
      department: true,
      description: true,
      requirements: true,
      location: true,
    },
  });

  if (!requisition) {
    throw new Error(`Requisition not found: ${input.requisitionId}`);
  }

  // Fetch candidate profile with skills relation
  const candidate = await prisma.candidate.findFirst({
    where: { id: input.candidateId, tenantId: input.tenantId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      resumeUrl: true,
      summary: true,
      source: true,
      tags: true,
      skills: {
        select: {
          proficiency: true,
          yearsExperience: true,
          skill: { select: { name: true } },
        },
      },
    },
  });

  if (!candidate) {
    throw new Error(`Candidate not found: ${input.candidateId}`);
  }

  // Build the user message from requisition and candidate data
  const requirementsList = Array.isArray(requisition.requirements)
    ? (requisition.requirements as string[]).join('\n  - ')
    : requisition.requirements || 'Not specified';

  const skillsList = candidate.skills.length > 0
    ? candidate.skills.map(s => {
        const prof = s.proficiency ? ` (${s.proficiency})` : '';
        const yrs = s.yearsExperience ? ` - ${s.yearsExperience}y` : '';
        return `${s.skill.name}${prof}${yrs}`;
      }).join(', ')
    : 'Not specified';

  const candidateSummary = candidate.summary || 'No summary available';
  const candidateTags = candidate.tags.length > 0 ? candidate.tags.join(', ') : 'None';

  const userMessage = `Generate an interview kit for the following interview:

## Interview Details
- Type: ${input.interviewType}
- Duration: ${input.durationMinutes} minutes
- Interviewer Role: ${input.interviewerRole}

## Requisition
- Title: ${requisition.title}
- Department: ${requisition.department || 'Not specified'}
- Location: ${requisition.location || 'Not specified'}
- Description: ${requisition.description || 'Not provided'}
- Requirements:
  - ${requirementsList}

## Candidate
- Name: ${candidate.firstName} ${candidate.lastName}
- Skills: ${skillsList}
- Summary: ${candidateSummary}
- Tags: ${candidateTags}
- Source: ${candidate.source || 'Not specified'}

## Instructions
Generate:
1. ${input.interviewType === 'final' ? '5-8' : '3-7'} interview questions appropriate for a ${input.interviewType} interview
2. A scoring rubric (excellent/good/poor) for each question
3. Follow-up questions for deeper probing
4. A candidate brief summarizing their background for the interviewer
5. Tips for conducting this specific interview
6. Ensure total question time adds up to approximately ${input.durationMinutes} minutes
7. Mix question categories appropriately for a ${input.interviewType} interview`.trim();

  logger.info({
    requisitionId: input.requisitionId,
    candidateId: input.candidateId,
    interviewType: input.interviewType,
    durationMinutes: input.durationMinutes,
    runId,
  }, 'Starting interview kit generation');

  // Run the agent
  const runtime = new AgentRuntime(interviewKitDefinition);
  const ctx: AgentContext = {
    tenantId: input.tenantId,
    userId: input.userId,
    runId,
    agentType: 'interview-kit',
  };

  const result = await runtime.run<InterviewKit>(ctx, userMessage);
  const kit = result.output;

  // Create audit trail entry
  await prisma.auditTrailEntry.create({
    data: {
      tenantId: input.tenantId,
      action: 'AI_INTERVIEW_KIT_GENERATION',
      resourceType: 'Interview',
      resourceId: runId,
      actorId: input.userId,
      actorType: 'AGENT',
      after: {
        agentRunId: runId,
        requisitionId: input.requisitionId,
        candidateId: input.candidateId,
        interviewType: input.interviewType,
        questionsCount: kit.questions.length,
        totalTimeMinutes: kit.totalTimeMinutes,
      },
      metadata: {
        agentType: 'interview-kit',
        modelId: 'claude-sonnet-4-20250514',
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
      },
    },
  }).catch(err => logger.error({ err }, 'Failed to create interview kit audit trail'));

  logger.info({
    requisitionId: input.requisitionId,
    candidateId: input.candidateId,
    runId,
    questionsCount: kit.questions.length,
    totalTimeMinutes: kit.totalTimeMinutes,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  }, 'Interview kit generation completed');

  return {
    kit,
    runId,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  };
}
