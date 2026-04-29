import { z } from 'zod';
import { AgentRuntime, type AgentDefinition, type AgentContext, type AgentTool } from './runtime';
import { createHITLCheckpoint } from './hitl';
import { checkExternalAvailability } from '../lib/calendar-sync';
import { prisma } from '../utils/prisma';
import logger from '../lib/logger';
import crypto from 'crypto';

// ── Output Schema ──────────────────────────────────────────────────────

const ProposedSlotSchema = z.object({
  start: z.string().datetime().describe('Slot start time in ISO 8601'),
  end: z.string().datetime().describe('Slot end time in ISO 8601'),
  score: z.number().min(0).max(1).describe('Suitability score 0-1 (1 = ideal)'),
  availableParticipants: z.array(z.string()).describe('Emails of participants available in this slot'),
  conflicts: z.array(z.string()).describe('Emails of participants with conflicts in this slot'),
});

export const SchedulingResultSchema = z.object({
  proposedSlots: z.array(ProposedSlotSchema).min(1).max(5).describe('Ranked proposed interview slots'),
  selectedSlot: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).nullable().describe('Pre-selected best slot, or null if HITL required'),
  reasoning: z.string().min(20).describe('Explanation of why these slots were chosen'),
});

export type SchedulingResult = z.infer<typeof SchedulingResultSchema>;

// ── System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an interview scheduling assistant. Find optimal meeting times considering:
- All participant availability (from calendar freebusy data)
- Time zone preferences
- Avoid lunch hours (12-1pm) unless no alternative
- Prefer morning slots (9am-12pm)
- Minimize conflicts across participants
- Never propose weekend slots (Saturday/Sunday) unless explicitly requested
- Rank proposed slots by score: 1.0 = all participants free + morning + no lunch conflict

Scoring rubric:
- Start with 1.0
- Subtract 0.2 if any participant has a conflict
- Subtract 0.1 if the slot is during lunch (12-1pm local time)
- Subtract 0.05 if the slot is in the afternoon (after 1pm)
- Subtract 0.3 if the slot is on a weekend

Always propose between 1 and 5 slots. Set selectedSlot to null — the recruiter will pick via HITL.
Provide clear reasoning citing participant availability data.`;

// ── Tools ──────────────────────────────────────────────────────────────

const checkInternalAvailabilityTool: AgentTool = {
  name: 'check_internal_availability',
  description: 'Query the ScheduleEvent table for conflicts in a time range for a given tenant',
  parameters: z.object({
    startAt: z.string().datetime().describe('Range start in ISO 8601'),
    endAt: z.string().datetime().describe('Range end in ISO 8601'),
  }),
  returns: z.object({
    conflicts: z.array(z.object({
      id: z.string(),
      title: z.string(),
      startAt: z.string(),
      endAt: z.string(),
      attendees: z.unknown(),
    })),
    totalConflicts: z.number(),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 30, maxPerRun: 5 },
  costTag: 'free',
  requiredScope: ['scheduling:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const events = await prisma.scheduleEvent.findMany({
      where: {
        tenantId: ctx.tenantId,
        status: { not: 'CANCELLED' },
        OR: [
          { startAt: { gte: new Date(params.startAt), lt: new Date(params.endAt) } },
          { endAt: { gt: new Date(params.startAt), lte: new Date(params.endAt) } },
          {
            startAt: { lte: new Date(params.startAt) },
            endAt: { gte: new Date(params.endAt) },
          },
        ],
      },
      orderBy: { startAt: 'asc' },
      take: 50,
    });

    return {
      conflicts: events.map(e => ({
        id: e.id,
        title: e.title || 'Untitled',
        startAt: e.startAt.toISOString(),
        endAt: e.endAt.toISOString(),
        attendees: e.attendeeIds,
      })),
      totalConflicts: events.length,
    };
  },
};

const checkExternalAvailabilityTool: AgentTool = {
  name: 'check_external_availability',
  description: 'Check freebusy status on connected Google Calendar for participant emails in a time range',
  parameters: z.object({
    emails: z.array(z.string().email()).min(1).describe('Participant emails to check'),
    startAt: z.string().datetime().describe('Range start in ISO 8601'),
    endAt: z.string().datetime().describe('Range end in ISO 8601'),
  }),
  returns: z.object({
    availability: z.record(z.string(), z.boolean()).nullable()
      .describe('Map of email -> isAvailable, or null if no calendar integration'),
  }),
  sideEffect: 'external',
  rateLimit: { maxPerMinute: 10, maxPerRun: 5 },
  costTag: 'low',
  requiredScope: ['scheduling:read', 'calendar:read'],
  execute: async (params: any, ctx: AgentContext) => {
    const result = await checkExternalAvailability(
      ctx.userId,
      ctx.tenantId,
      params.emails,
      new Date(params.startAt),
      new Date(params.endAt),
    );
    return { availability: result };
  },
};

// ── Agent Definition ───────────────────────────────────────────────────

const schedulingAgentDefinition: AgentDefinition = {
  name: 'interview-scheduler',
  systemPrompt: SYSTEM_PROMPT,
  tools: [checkInternalAvailabilityTool, checkExternalAvailabilityTool],
  outputSchema: SchedulingResultSchema,
  budget: {
    maxTokensPerRun: 8000,
    maxIterationsPerRun: 8, // ReAct iterations: multiple tool calls + final output + repairs
    maxCostUsdPerRun: 0.10,
    maxRepairAttempts: 3,
  },
  modelId: 'claude-sonnet-4-20250514',
  mode: 'react',
};

// ── Public API ─────────────────────────────────────────────────────────

export interface ScheduleInterviewInput {
  interviewId: string;
  participants: Array<{ email: string; name: string; role: string }>;
  durationMinutes: number;
  dateRange: { start: string; end: string };
  timezone: string;
  tenantId: string;
  userId: string;
  preferences?: {
    preferMorning?: boolean;
    avoidLunch?: boolean;
    allowWeekends?: boolean;
  };
}

export interface ScheduleInterviewResult {
  proposedSlots: SchedulingResult['proposedSlots'];
  hitlCheckpointId: string;
  runId: string;
  tokensUsed: number;
  costUsd: number;
}

/**
 * Run the scheduling agent to propose optimal interview slots.
 * Creates a HITL checkpoint for recruiter approval — no events or invites are sent.
 */
export async function scheduleInterview(input: ScheduleInterviewInput): Promise<ScheduleInterviewResult> {
  const runId = crypto.randomUUID();

  // Build user message with all scheduling context
  const participantList = input.participants
    .map(p => `- ${p.name} (${p.email}) — ${p.role}`)
    .join('\n');

  const prefsSection = input.preferences
    ? `Preferences: ${input.preferences.preferMorning ? 'Prefer morning.' : ''} ${input.preferences.avoidLunch ? 'Avoid lunch.' : ''} ${input.preferences.allowWeekends ? 'Weekends OK.' : 'No weekends.'}`
    : 'Preferences: Prefer morning, avoid lunch, no weekends.';

  const userMessage = `Schedule an interview with the following details:

Interview ID: ${input.interviewId}
Duration: ${input.durationMinutes} minutes
Date Range: ${input.dateRange.start} to ${input.dateRange.end}
Timezone: ${input.timezone}
${prefsSection}

Participants:
${participantList}

Find optimal time slots. Use the tools to check internal calendar conflicts and external calendar availability. Propose 1-5 ranked slots.`;

  logger.info({
    interviewId: input.interviewId,
    participantCount: input.participants.length,
    durationMinutes: input.durationMinutes,
    runId,
  }, 'Starting interview scheduling agent');

  // Run the agent
  const runtime = new AgentRuntime(schedulingAgentDefinition);
  const ctx: AgentContext = {
    tenantId: input.tenantId,
    userId: input.userId,
    runId,
    agentType: 'interview-scheduler',
  };

  const result = await runtime.run<SchedulingResult>(ctx, userMessage);
  const scheduling = result.output;

  // MANDATORY HITL — agent proposes, recruiter approves
  const hitlCheckpointId = await createHITLCheckpoint({
    tenantId: input.tenantId,
    agentRunId: runId,
    type: 'approval',
    action: `AI scheduling proposes ${scheduling.proposedSlots.length} interview slot(s) for review`,
    payload: {
      interviewId: input.interviewId,
      participants: input.participants,
      durationMinutes: input.durationMinutes,
      timezone: input.timezone,
      proposedSlots: scheduling.proposedSlots,
      reasoning: scheduling.reasoning,
    },
    slaMinutes: 120, // 2 hours for scheduling decisions
  });

  logger.info({
    interviewId: input.interviewId,
    runId,
    slotsProposed: scheduling.proposedSlots.length,
    hitlCheckpointId,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  }, 'Interview scheduling agent completed — awaiting HITL approval');

  // Audit trail
  await prisma.auditTrailEntry.create({
    data: {
      tenantId: input.tenantId,
      action: 'AI_SCHEDULE_PROPOSED',
      resourceType: 'ScheduleEvent',
      resourceId: input.interviewId,
      actorId: input.userId,
      actorType: 'AGENT',
      after: {
        agentRunId: runId,
        slotsProposed: scheduling.proposedSlots.length,
        hitlCheckpointId,
      },
      metadata: {
        agentType: 'interview-scheduler',
        modelId: 'claude-sonnet-4-20250514',
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
      },
    },
  }).catch(err => logger.error({ err }, 'Failed to create scheduling audit trail'));

  return {
    proposedSlots: scheduling.proposedSlots,
    hitlCheckpointId,
    runId,
    tokensUsed: result.tokensUsed,
    costUsd: result.costUsd,
  };
}

// ── HITL Resolution Handler ────────────────────────────────────────────

/**
 * Called when a recruiter approves a scheduling HITL checkpoint.
 * Re-checks for conflicts that may have appeared between proposal and approval,
 * then creates the ScheduleEvent, syncs to calendar, and sends invites.
 */
export async function handleSchedulingApproval(
  checkpointId: string,
  selectedSlot: { start: string; end: string },
  approvedBy: string,
): Promise<{ eventId: string; conflictsDetected: boolean; newConflicts: number }> {
  const checkpoint = await prisma.hITLCheckpoint.findUnique({ where: { id: checkpointId } });
  if (!checkpoint) throw new Error('Checkpoint not found');

  const payload = checkpoint.payload as Record<string, any>;
  const tenantId = checkpoint.tenantId;

  // Race condition handling: re-check for conflicts that appeared after proposal
  const conflictCheck = await prisma.scheduleEvent.count({
    where: {
      tenantId,
      status: { not: 'CANCELLED' },
      OR: [
        { startAt: { gte: new Date(selectedSlot.start), lt: new Date(selectedSlot.end) } },
        { endAt: { gt: new Date(selectedSlot.start), lte: new Date(selectedSlot.end) } },
        {
          startAt: { lte: new Date(selectedSlot.start) },
          endAt: { gte: new Date(selectedSlot.end) },
        },
      ],
    },
  });

  const conflictsDetected = conflictCheck > 0;

  if (conflictsDetected) {
    logger.warn({
      checkpointId,
      newConflicts: conflictCheck,
      selectedSlot,
    }, 'New conflicts detected after scheduling HITL approval — event created with warning');
  }

  // Create the ScheduleEvent
  const participants = (payload.participants as Array<{ email: string; name: string; role: string }>) || [];
  const event = await prisma.scheduleEvent.create({
    data: {
      tenantId,
      title: `Interview — ${payload.interviewId}`,
      description: `AI-scheduled interview. ${conflictsDetected ? `WARNING: ${conflictCheck} new conflict(s) detected.` : ''}`,
      startAt: new Date(selectedSlot.start),
      endAt: new Date(selectedSlot.end),
      attendeeIds: participants.map(p => p.email),
      organizerId: approvedBy,
    },
  });

  logger.info({
    eventId: event.id,
    checkpointId,
    selectedSlot,
    conflictsDetected,
  }, 'Schedule event created after HITL approval');

  return {
    eventId: event.id,
    conflictsDetected,
    newConflicts: conflictCheck,
  };
}
