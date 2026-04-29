import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { z } from 'zod';
import { InterviewKitSchema } from '../agents/interview-kit-agent';
import app from '../app';

// ── Valid test data ─────────────────────────────────────────────────────

const validKit = {
  questions: [
    {
      question: 'Describe a complex distributed system you designed and the trade-offs you made.',
      purpose: 'Evaluates system design experience and decision-making ability',
      scoringGuide: {
        excellent: 'Clearly articulates multiple trade-offs with specific examples and metrics',
        good: 'Describes a system with some trade-off discussion but lacks specifics',
        poor: 'Cannot describe a system or trade-offs in meaningful detail',
      },
      timeMinutes: 10,
      followUps: [
        'What would you change if you could redesign it?',
        'How did you handle failure modes?',
      ],
      category: 'technical' as const,
    },
    {
      question: 'Tell me about a time you had to lead a team through a difficult project deadline.',
      purpose: 'Evaluates leadership under pressure and communication skills',
      scoringGuide: {
        excellent: 'Shows clear leadership actions, team empathy, and successful outcome',
        good: 'Describes the situation but leadership actions are less clear',
        poor: 'Blames others or cannot articulate their leadership role',
      },
      timeMinutes: 8,
      followUps: ['How did you communicate with stakeholders?'],
      category: 'behavioral' as const,
    },
    {
      question: 'If you discovered a critical production bug during a product launch, how would you handle it?',
      purpose: 'Evaluates crisis management and prioritization skills',
      scoringGuide: {
        excellent: 'Has a clear triage process, communicates proactively, balances urgency with quality',
        good: 'Would fix the bug but communication plan is unclear',
        poor: 'Panics or has no structured approach to incident response',
      },
      timeMinutes: 7,
      followUps: ['What if the fix could break another feature?'],
      category: 'situational' as const,
    },
  ],
  totalTimeMinutes: 25,
  focusAreas: ['System Design', 'Leadership', 'Crisis Management'],
  candidateBrief: 'Senior backend engineer with 8 years of experience in distributed systems and microservices architecture at mid-size startups.',
  interviewTips: [
    'Start with a warm-up question to put the candidate at ease',
    'Allow the candidate to ask questions at the end',
  ],
};

// ── InterviewKitSchema validation tests ─────────────────────────────────

describe('InterviewKitSchema', () => {
  it('validates a complete valid interview kit', () => {
    const parsed = InterviewKitSchema.parse(validKit);
    expect(parsed.questions).toHaveLength(3);
    expect(parsed.totalTimeMinutes).toBe(25);
    expect(parsed.focusAreas).toContain('System Design');
  });

  it('rejects fewer than 3 questions', () => {
    const result = InterviewKitSchema.safeParse({
      ...validKit,
      questions: validKit.questions.slice(0, 2),
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 10 questions', () => {
    const elevenQuestions = Array(11).fill(validKit.questions[0]);
    const result = InterviewKitSchema.safeParse({
      ...validKit,
      questions: elevenQuestions,
    });
    expect(result.success).toBe(false);
  });

  it('requires scoring guide on each question', () => {
    const noScoringGuide = {
      ...validKit,
      questions: [
        {
          question: 'Describe your experience with TypeScript.',
          purpose: 'Evaluates TypeScript knowledge',
          timeMinutes: 5,
          followUps: [],
          category: 'technical',
        },
        ...validKit.questions.slice(1),
      ],
    };
    const result = InterviewKitSchema.safeParse(noScoringGuide);
    expect(result.success).toBe(false);
  });

  it('rejects question shorter than 10 characters', () => {
    const shortQuestion = {
      ...validKit,
      questions: [
        { ...validKit.questions[0], question: 'Too short' },
        ...validKit.questions.slice(1),
      ],
    };
    const result = InterviewKitSchema.safeParse(shortQuestion);
    expect(result.success).toBe(false);
  });

  it('rejects candidateBrief shorter than 20 characters', () => {
    const result = InterviewKitSchema.safeParse({
      ...validKit,
      candidateBrief: 'Too short.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty focusAreas', () => {
    const result = InterviewKitSchema.safeParse({
      ...validKit,
      focusAreas: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid question category', () => {
    const result = InterviewKitSchema.safeParse({
      ...validKit,
      questions: [
        { ...validKit.questions[0], category: 'invalid_category' },
        ...validKit.questions.slice(1),
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects timeMinutes outside 1-30 range', () => {
    const zeroTime = {
      ...validKit,
      questions: [
        { ...validKit.questions[0], timeMinutes: 0 },
        ...validKit.questions.slice(1),
      ],
    };
    expect(InterviewKitSchema.safeParse(zeroTime).success).toBe(false);

    const tooLong = {
      ...validKit,
      questions: [
        { ...validKit.questions[0], timeMinutes: 31 },
        ...validKit.questions.slice(1),
      ],
    };
    expect(InterviewKitSchema.safeParse(tooLong).success).toBe(false);
  });

  it('rejects more than 3 followUps per question', () => {
    const tooManyFollowUps = {
      ...validKit,
      questions: [
        {
          ...validKit.questions[0],
          followUps: ['Q1?', 'Q2?', 'Q3?', 'Q4?'],
        },
        ...validKit.questions.slice(1),
      ],
    };
    const result = InterviewKitSchema.safeParse(tooManyFollowUps);
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 interviewTips', () => {
    const result = InterviewKitSchema.safeParse({
      ...validKit,
      interviewTips: ['Tip 1', 'Tip 2', 'Tip 3', 'Tip 4', 'Tip 5', 'Tip 6'],
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid enum categories', () => {
    const categories = ['technical', 'behavioral', 'situational', 'culture', 'experience'] as const;
    for (const cat of categories) {
      const kit = {
        ...validKit,
        questions: validKit.questions.map(q => ({ ...q, category: cat })),
      };
      const result = InterviewKitSchema.safeParse(kit);
      expect(result.success).toBe(true);
    }
  });

  it('accepts empty followUps array', () => {
    const kit = {
      ...validKit,
      questions: validKit.questions.map(q => ({ ...q, followUps: [] })),
    };
    const result = InterviewKitSchema.safeParse(kit);
    expect(result.success).toBe(true);
  });
});

// ── Module export tests ─────────────────────────────────────────────────

describe('interview-kit-agent exports', () => {
  it('generateInterviewKit is exported as a function', async () => {
    const mod = await import('../agents/interview-kit-agent');
    expect(typeof mod.generateInterviewKit).toBe('function');
  });

  it('InterviewKitSchema is a valid zod schema', () => {
    expect(InterviewKitSchema).toBeDefined();
    expect(typeof InterviewKitSchema.parse).toBe('function');
    expect(typeof InterviewKitSchema.safeParse).toBe('function');
  });
});

// ── Route tests ─────────────────────────────────────────────────────────

describe('POST /api/interviews/ai-kit', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/interviews/ai-kit')
      .send({
        requisitionId: 'req-123',
        candidateId: 'cand-456',
        interviewType: 'technical',
      });
    expect(res.status).toBe(401);
  });

  it('returns 401 when sending empty body without auth', async () => {
    const res = await request(app)
      .post('/api/interviews/ai-kit')
      .send({});
    expect(res.status).toBe(401);
  });
});
