import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { z } from 'zod';
import { SchedulingResultSchema } from '../agents/scheduling-agent';
import app from '../app';

// ── SchedulingResultSchema validation tests ─────────────────────────────

describe('SchedulingResultSchema', () => {
  const validResult = {
    proposedSlots: [
      {
        start: '2026-04-13T09:00:00Z',
        end: '2026-04-13T10:00:00Z',
        score: 0.95,
        availableParticipants: ['alice@company.com', 'bob@company.com'],
        conflicts: [],
      },
      {
        start: '2026-04-13T10:00:00Z',
        end: '2026-04-13T11:00:00Z',
        score: 0.9,
        availableParticipants: ['alice@company.com'],
        conflicts: ['bob@company.com'],
      },
    ],
    selectedSlot: null,
    reasoning: 'Morning slots selected based on all participant availability and preference for early hours.',
  };

  it('validates a complete valid result', () => {
    const parsed = SchedulingResultSchema.parse(validResult);
    expect(parsed.proposedSlots).toHaveLength(2);
    expect(parsed.selectedSlot).toBeNull();
    expect(parsed.reasoning).toContain('Morning');
  });

  it('accepts selectedSlot with start and end', () => {
    const withSelected = {
      ...validResult,
      selectedSlot: { start: '2026-04-13T09:00:00Z', end: '2026-04-13T10:00:00Z' },
    };
    const parsed = SchedulingResultSchema.parse(withSelected);
    expect(parsed.selectedSlot).not.toBeNull();
  });

  it('rejects empty proposedSlots array', () => {
    const result = SchedulingResultSchema.safeParse({
      ...validResult,
      proposedSlots: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 proposed slots', () => {
    const tooMany = Array.from({ length: 6 }, (_, i) => ({
      start: `2026-04-13T0${9 + i}:00:00Z`,
      end: `2026-04-13T${10 + i}:00:00Z`,
      score: 0.8,
      availableParticipants: ['a@b.com'],
      conflicts: [],
    }));
    const result = SchedulingResultSchema.safeParse({
      ...validResult,
      proposedSlots: tooMany,
    });
    expect(result.success).toBe(false);
  });

  it('rejects score above 1', () => {
    const result = SchedulingResultSchema.safeParse({
      ...validResult,
      proposedSlots: [{ ...validResult.proposedSlots[0], score: 1.5 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects score below 0', () => {
    const result = SchedulingResultSchema.safeParse({
      ...validResult,
      proposedSlots: [{ ...validResult.proposedSlots[0], score: -0.1 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects reasoning shorter than 20 chars', () => {
    const result = SchedulingResultSchema.safeParse({
      ...validResult,
      reasoning: 'Too short.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = SchedulingResultSchema.safeParse({ proposedSlots: [] });
    expect(result.success).toBe(false);
  });

  it('rejects invalid datetime in slot start', () => {
    const result = SchedulingResultSchema.safeParse({
      ...validResult,
      proposedSlots: [{ ...validResult.proposedSlots[0], start: 'not-a-date' }],
    });
    expect(result.success).toBe(false);
  });
});

// ── Module export tests ────────────────────────────────────────────────

describe('scheduling-agent exports', () => {
  it('scheduleInterview is exported as a function', async () => {
    const mod = await import('../agents/scheduling-agent');
    expect(typeof mod.scheduleInterview).toBe('function');
  });

  it('handleSchedulingApproval is exported as a function', async () => {
    const mod = await import('../agents/scheduling-agent');
    expect(typeof mod.handleSchedulingApproval).toBe('function');
  });

  it('SchedulingResultSchema is a valid zod schema', () => {
    expect(SchedulingResultSchema).toBeDefined();
    expect(typeof SchedulingResultSchema.parse).toBe('function');
    expect(typeof SchedulingResultSchema.safeParse).toBe('function');
  });
});

// ── Route tests ────────────────────────────────────────────────────────

describe('POST /api/scheduling/ai-schedule', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/scheduling/ai-schedule')
      .send({
        interviewId: 'int-1',
        participants: [{ email: 'a@b.com', name: 'A', role: 'Interviewer' }],
        durationMinutes: 60,
        dateRange: { start: '2026-04-13T09:00:00Z', end: '2026-04-13T17:00:00Z' },
        timezone: 'America/New_York',
      });
    expect(res.status).toBe(401);
  });

  it('returns 401 without required fields and no auth', async () => {
    const res = await request(app)
      .post('/api/scheduling/ai-schedule')
      .send({});
    expect(res.status).toBe(401);
  });
});
