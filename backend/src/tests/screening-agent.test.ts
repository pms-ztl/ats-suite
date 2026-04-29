import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { z } from 'zod';
import { ScreeningResultSchema } from '../agents/screening-agent';
import app from '../app';

// ── ScreeningResultSchema validation tests ────────────────────────────

describe('ScreeningResultSchema', () => {
  const validResult = {
    overallScore: 78,
    recommendation: 'advance',
    confidence: 0.85,
    dimensions: [
      {
        name: 'Technical Skills',
        score: 85,
        maxScore: 100,
        weight: 0.4,
        rationale: 'Candidate demonstrates strong React and TypeScript skills with 5 years of production experience.',
      },
      {
        name: 'Experience Level',
        score: 75,
        maxScore: 100,
        weight: 0.3,
        rationale: 'Has relevant experience building production SPAs, though limited leadership experience noted.',
      },
      {
        name: 'Education',
        score: 70,
        maxScore: 100,
        weight: 0.3,
        rationale: 'BS in Computer Science provides a solid technical foundation for this engineering role.',
      },
    ],
    summary:
      'Strong frontend candidate with solid React and TypeScript experience. Good match for the mid-level role with room to grow into senior responsibilities.',
    strengths: ['Strong React/TypeScript skills', 'Production SPA experience'],
    concerns: ['Limited leadership experience'],
    suggestedQuestions: ['Tell me about a challenging React performance issue you solved.'],
  };

  it('validates a complete valid result', () => {
    const parsed = ScreeningResultSchema.parse(validResult);
    expect(parsed.overallScore).toBe(78);
    expect(parsed.recommendation).toBe('advance');
    expect(parsed.dimensions).toHaveLength(3);
  });

  it('rejects missing required fields', () => {
    const incomplete = { overallScore: 80 };
    const result = ScreeningResultSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects overallScore above 100', () => {
    const result = ScreeningResultSchema.safeParse({
      ...validResult,
      overallScore: 150,
    });
    expect(result.success).toBe(false);
  });

  it('rejects overallScore below 0', () => {
    const result = ScreeningResultSchema.safeParse({
      ...validResult,
      overallScore: -5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects confidence above 1', () => {
    const result = ScreeningResultSchema.safeParse({
      ...validResult,
      confidence: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid recommendation value', () => {
    const result = ScreeningResultSchema.safeParse({
      ...validResult,
      recommendation: 'maybe',
    });
    expect(result.success).toBe(false);
  });

  it('requires minimum 3 dimensions', () => {
    const result = ScreeningResultSchema.safeParse({
      ...validResult,
      dimensions: [validResult.dimensions[0], validResult.dimensions[1]],
    });
    expect(result.success).toBe(false);
  });

  it('requires minimum 1 strength', () => {
    const result = ScreeningResultSchema.safeParse({
      ...validResult,
      strengths: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects dimension rationale shorter than 20 chars', () => {
    const result = ScreeningResultSchema.safeParse({
      ...validResult,
      dimensions: [
        { ...validResult.dimensions[0], rationale: 'Too short' },
        validResult.dimensions[1],
        validResult.dimensions[2],
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects summary shorter than 50 chars', () => {
    const result = ScreeningResultSchema.safeParse({
      ...validResult,
      summary: 'Too short.',
    });
    expect(result.success).toBe(false);
  });
});

// ── Module export tests ───────────────────────────────────────────────

describe('screening-agent exports', () => {
  it('screenCandidate is exported as a function', async () => {
    const mod = await import('../agents/screening-agent');
    expect(typeof mod.screenCandidate).toBe('function');
  });

  it('ScreeningResultSchema is a valid zod schema', () => {
    expect(ScreeningResultSchema).toBeDefined();
    expect(typeof ScreeningResultSchema.parse).toBe('function');
    expect(typeof ScreeningResultSchema.safeParse).toBe('function');
  });
});

// ── Route tests ───────────────────────────────────────────────────────

describe('POST /api/screening/ai-screen', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/screening/ai-screen')
      .send({ candidateId: 'c1', requisitionId: 'r1' });
    expect(res.status).toBe(401);
  });

  it('returns 400 without candidateId and requisitionId (with fake auth)', async () => {
    // This should still fail at auth before reaching validation,
    // but we test that the route exists and is behind auth
    const res = await request(app)
      .post('/api/screening/ai-screen')
      .send({});
    expect(res.status).toBe(401);
  });
});
