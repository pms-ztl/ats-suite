import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { z } from 'zod';
import { JDOutputSchema } from '../agents/jd-author-agent';
import app from '../app';

// ── JDOutputSchema validation tests ──────────────────────────────────

describe('JDOutputSchema', () => {
  const validJD = {
    description:
      'About the Role\n\nWe are looking for a Senior Frontend Engineer to join our team. You will build and maintain modern web applications using React and TypeScript, collaborating closely with designers and backend engineers to deliver exceptional user experiences.',
    requirements: [
      'Strong proficiency in React and TypeScript',
      'Experience building production single-page applications',
      'Familiarity with modern CSS frameworks and responsive design',
    ],
    niceToHave: [
      'Experience with Next.js or similar SSR frameworks',
      'Familiarity with design systems and component libraries',
    ],
    biasFlags: [],
    inclusivityScore: 88,
  };

  it('validates a complete valid JD output', () => {
    const parsed = JDOutputSchema.parse(validJD);
    expect(parsed.description).toContain('Senior Frontend Engineer');
    expect(parsed.requirements).toHaveLength(3);
    expect(parsed.inclusivityScore).toBe(88);
  });

  it('rejects description shorter than 100 characters', () => {
    const result = JDOutputSchema.safeParse({
      ...validJD,
      description: 'Too short.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects fewer than 3 requirements', () => {
    const result = JDOutputSchema.safeParse({
      ...validJD,
      requirements: ['Skill A', 'Skill B'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const incomplete = { description: validJD.description };
    const result = JDOutputSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects inclusivityScore above 100', () => {
    const result = JDOutputSchema.safeParse({
      ...validJD,
      inclusivityScore: 150,
    });
    expect(result.success).toBe(false);
  });

  it('rejects inclusivityScore below 0', () => {
    const result = JDOutputSchema.safeParse({
      ...validJD,
      inclusivityScore: -10,
    });
    expect(result.success).toBe(false);
  });

  it('validates biasFlags structure', () => {
    const withFlags = {
      ...validJD,
      biasFlags: [
        {
          text: 'rockstar developer',
          issue: 'Gender-coded masculine language',
          suggestion: 'Use "skilled developer" instead',
          severity: 'medium' as const,
        },
      ],
    };
    const parsed = JDOutputSchema.parse(withFlags);
    expect(parsed.biasFlags).toHaveLength(1);
    expect(parsed.biasFlags[0].severity).toBe('medium');
  });

  it('rejects invalid severity in biasFlags', () => {
    const result = JDOutputSchema.safeParse({
      ...validJD,
      biasFlags: [
        {
          text: 'ninja',
          issue: 'Gender-coded',
          suggestion: 'Use specialist',
          severity: 'critical',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty niceToHave array', () => {
    const result = JDOutputSchema.safeParse({
      ...validJD,
      niceToHave: [],
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty biasFlags array', () => {
    const result = JDOutputSchema.safeParse({
      ...validJD,
      biasFlags: [],
    });
    expect(result.success).toBe(true);
  });
});

// ── Module export tests ──────────────────────────────────────────────

describe('jd-author-agent exports', () => {
  it('generateJD is exported as a function', async () => {
    const mod = await import('../agents/jd-author-agent');
    expect(typeof mod.generateJD).toBe('function');
  });

  it('JDOutputSchema is a valid zod schema', () => {
    expect(JDOutputSchema).toBeDefined();
    expect(typeof JDOutputSchema.parse).toBe('function');
    expect(typeof JDOutputSchema.safeParse).toBe('function');
  });
});

// ── Route tests ──────────────────────────────────────────────────────

describe('POST /api/requisitions/ai-draft', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/requisitions/ai-draft')
      .send({
        title: 'Senior Engineer',
        department: 'Engineering',
        skills: ['React'],
        level: 'Senior',
        location: 'Remote',
      });
    expect(res.status).toBe(401);
  });

  it('returns 401 when sending empty body without auth', async () => {
    const res = await request(app)
      .post('/api/requisitions/ai-draft')
      .send({});
    expect(res.status).toBe(401);
  });
});
