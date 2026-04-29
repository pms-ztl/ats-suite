import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { z } from 'zod';
import { InterviewAnalysisSchema } from '../agents/interview-intelligence-agent';
import app from '../app';

// ── Valid test data ─────────────────────────────────────────────────────

const validAnalysis = {
  transcript: 'This is a complete interview transcript that covers technical questions about system design, behavioral questions about teamwork, and culture fit discussions over the course of 45 minutes.',
  summary: 'Strong technical candidate with excellent system design knowledge and clear communication. Demonstrated deep PostgreSQL expertise and solid TypeScript skills. Minor concerns around stakeholder management experience.',
  signals: [
    {
      skill: 'System Design',
      evidence: 'Candidate described a microservices migration with clear reasoning for service boundaries',
      rating: 'strong' as const,
    },
    {
      skill: 'PostgreSQL',
      evidence: 'Explained indexing strategies, query optimization, and connection pooling in detail',
      rating: 'strong' as const,
    },
    {
      skill: 'Communication',
      evidence: 'Clearly articulated complex technical concepts with appropriate analogies',
      rating: 'adequate' as const,
    },
  ],
  scorecard: {
    dimensions: [
      {
        name: 'Technical Competency',
        score: 4,
        evidence: 'Strong system design knowledge with real-world examples of microservices architecture',
      },
      {
        name: 'Communication',
        score: 4,
        evidence: 'Clear and concise explanations of complex topics with good use of examples',
      },
      {
        name: 'Culture Fit',
        score: 3,
        evidence: 'Shows collaborative tendencies but limited examples of cross-team work',
      },
    ],
    overallRecommendation: 'YES' as const,
    summary: 'Recommend advancing to final round. Strong technical skills and communication.',
  },
  keyMoments: [
    {
      timestamp: '12:34',
      description: 'Candidate gave an exceptional explanation of event sourcing patterns',
      significance: 'positive' as const,
    },
    {
      description: 'Struggled to explain how they handled a disagreement with a product manager',
      significance: 'negative' as const,
    },
  ],
  durationMinutes: 45,
};

// ── InterviewAnalysisSchema validation tests ───────────────────────────

describe('InterviewAnalysisSchema', () => {
  it('validates a complete valid analysis', () => {
    const parsed = InterviewAnalysisSchema.parse(validAnalysis);
    expect(parsed.signals).toHaveLength(3);
    expect(parsed.scorecard.overallRecommendation).toBe('YES');
    expect(parsed.durationMinutes).toBe(45);
  });

  it('rejects transcript shorter than 50 characters', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      transcript: 'Too short.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects summary shorter than 50 characters', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      summary: 'Too short.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects summary longer than 500 characters', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      summary: 'A'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty signals array', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      signals: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects signal with evidence shorter than 10 characters', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      signals: [{ skill: 'TypeScript', evidence: 'Short', rating: 'strong' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid signal rating', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      signals: [{ skill: 'TypeScript', evidence: 'Good knowledge of generics and type narrowing', rating: 'amazing' }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid signal ratings', () => {
    const ratings = ['strong', 'adequate', 'weak', 'not_observed'] as const;
    for (const rating of ratings) {
      const analysis = {
        ...validAnalysis,
        signals: [{ skill: 'Test', evidence: 'Evidence for this signal rating test case', rating }],
      };
      expect(InterviewAnalysisSchema.safeParse(analysis).success).toBe(true);
    }
  });

  it('rejects fewer than 2 scorecard dimensions', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      scorecard: {
        ...validAnalysis.scorecard,
        dimensions: [validAnalysis.scorecard.dimensions[0]],
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects scorecard dimension score outside 1-5 range', () => {
    const tooLow = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      scorecard: {
        ...validAnalysis.scorecard,
        dimensions: [
          { name: 'Test', score: 0, evidence: 'Some evidence here' },
          { name: 'Test2', score: 3, evidence: 'More evidence here' },
        ],
      },
    });
    expect(tooLow.success).toBe(false);

    const tooHigh = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      scorecard: {
        ...validAnalysis.scorecard,
        dimensions: [
          { name: 'Test', score: 6, evidence: 'Some evidence here' },
          { name: 'Test2', score: 3, evidence: 'More evidence here' },
        ],
      },
    });
    expect(tooHigh.success).toBe(false);
  });

  it('rejects invalid overallRecommendation', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      scorecard: {
        ...validAnalysis.scorecard,
        overallRecommendation: 'MAYBE',
      },
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid recommendations', () => {
    const recs = ['STRONG_YES', 'YES', 'NEUTRAL', 'NO', 'STRONG_NO'] as const;
    for (const rec of recs) {
      const analysis = {
        ...validAnalysis,
        scorecard: { ...validAnalysis.scorecard, overallRecommendation: rec },
      };
      expect(InterviewAnalysisSchema.safeParse(analysis).success).toBe(true);
    }
  });

  it('rejects more than 10 key moments', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      keyMoments: Array(11).fill({
        description: 'A notable moment during the interview',
        significance: 'neutral',
      }),
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative durationMinutes', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      durationMinutes: -5,
    });
    expect(result.success).toBe(false);
  });

  it('accepts zero durationMinutes', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      durationMinutes: 0,
    });
    expect(result.success).toBe(true);
  });

  it('accepts key moments with optional timestamp', () => {
    const withTimestamp = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      keyMoments: [
        { timestamp: '05:23', description: 'Good example given', significance: 'positive' },
      ],
    });
    expect(withTimestamp.success).toBe(true);

    const withoutTimestamp = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      keyMoments: [
        { description: 'Good example given', significance: 'positive' },
      ],
    });
    expect(withoutTimestamp.success).toBe(true);
  });

  it('rejects scorecard summary shorter than 20 characters', () => {
    const result = InterviewAnalysisSchema.safeParse({
      ...validAnalysis,
      scorecard: {
        ...validAnalysis.scorecard,
        summary: 'Too short.',
      },
    });
    expect(result.success).toBe(false);
  });
});

// ── Module export tests ─────────────────────────────────────────────────

describe('interview-intelligence-agent exports', () => {
  it('analyzeInterview is exported as a function', async () => {
    const mod = await import('../agents/interview-intelligence-agent');
    expect(typeof mod.analyzeInterview).toBe('function');
  });

  it('InterviewAnalysisSchema is a valid zod schema', () => {
    expect(InterviewAnalysisSchema).toBeDefined();
    expect(typeof InterviewAnalysisSchema.parse).toBe('function');
    expect(typeof InterviewAnalysisSchema.safeParse).toBe('function');
  });
});

// ── Route tests ─────────────────────────────────────────────────────────

describe('POST /api/interviews/ai-analyze', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/interviews/ai-analyze')
      .send({
        interviewId: 'int-123',
        transcript: 'Some transcript text here for analysis purposes.',
        consentToken: 'consent-abc',
      });
    expect(res.status).toBe(401);
  });

  it('returns 401 when sending empty body without auth', async () => {
    const res = await request(app)
      .post('/api/interviews/ai-analyze')
      .send({});
    expect(res.status).toBe(401);
  });

  it('returns 401 when missing consent token without auth', async () => {
    const res = await request(app)
      .post('/api/interviews/ai-analyze')
      .send({
        interviewId: 'int-123',
        transcript: 'Some transcript text here.',
      });
    expect(res.status).toBe(401);
  });
});

// ── Consent requirement tests ───────────────────────────────────────────

describe('analyzeInterview consent validation', () => {
  it('rejects when consentToken is empty string', async () => {
    const { analyzeInterview } = await import('../agents/interview-intelligence-agent');
    await expect(
      analyzeInterview({
        interviewId: 'int-123',
        transcript: 'Some transcript text.',
        consentToken: '',
        tenantId: 'tenant-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow('CONSENT_REQUIRED');
  });

  it('rejects when consentToken is whitespace only', async () => {
    const { analyzeInterview } = await import('../agents/interview-intelligence-agent');
    await expect(
      analyzeInterview({
        interviewId: 'int-123',
        transcript: 'Some transcript text.',
        consentToken: '   ',
        tenantId: 'tenant-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow('CONSENT_REQUIRED');
  });
});
