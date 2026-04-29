import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { z } from 'zod';
import {
  SourcingResultSchema,
  sourcingAgentDefinition,
  getRequisitionDetailsTool,
  searchCandidatesDbTool,
  searchTalentPoolTool,
} from '../agents/sourcing-agent';
import app from '../app';

// ── SourcingResultSchema validation tests ─────────────────────────────

describe('SourcingResultSchema', () => {
  const validResult = {
    candidates: [
      {
        id: 'cand-1',
        name: 'Jane Smith',
        matchScore: 0.92,
        rationale: 'Strong React and TypeScript experience with 5 years of production work.',
        source: 'database' as const,
        skills: ['React', 'TypeScript', 'Next.js'],
      },
      {
        id: 'cand-2',
        name: 'John Doe',
        matchScore: 0.78,
        rationale: 'Good Node.js background with some frontend experience in React projects.',
        source: 'semantic_search' as const,
        skills: ['Node.js', 'React', 'PostgreSQL'],
      },
    ],
    searchStrategiesUsed: ['database', 'semantic_search'],
    totalScanned: 150,
    summary: 'Found 2 strong candidates matching the Senior Frontend Engineer role requirements.',
  };

  it('validates a complete valid result', () => {
    const parsed = SourcingResultSchema.parse(validResult);
    expect(parsed.candidates).toHaveLength(2);
    expect(parsed.totalScanned).toBe(150);
    expect(parsed.searchStrategiesUsed).toContain('database');
  });

  it('accepts empty candidates array', () => {
    const result = SourcingResultSchema.safeParse({
      ...validResult,
      candidates: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects matchScore above 1', () => {
    const result = SourcingResultSchema.safeParse({
      ...validResult,
      candidates: [{ ...validResult.candidates[0], matchScore: 1.5 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects matchScore below 0', () => {
    const result = SourcingResultSchema.safeParse({
      ...validResult,
      candidates: [{ ...validResult.candidates[0], matchScore: -0.1 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid source enum value', () => {
    const result = SourcingResultSchema.safeParse({
      ...validResult,
      candidates: [{ ...validResult.candidates[0], source: 'linkedin' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects rationale shorter than 10 chars', () => {
    const result = SourcingResultSchema.safeParse({
      ...validResult,
      candidates: [{ ...validResult.candidates[0], rationale: 'Short' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects summary shorter than 20 chars', () => {
    const result = SourcingResultSchema.safeParse({
      ...validResult,
      summary: 'Too short.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 50 candidates', () => {
    const tooMany = Array.from({ length: 51 }, (_, i) => ({
      id: `cand-${i}`,
      name: `Candidate ${i}`,
      matchScore: 0.5,
      rationale: 'A reasonable rationale for matching this candidate to the role.',
      source: 'database' as const,
      skills: ['React'],
    }));
    const result = SourcingResultSchema.safeParse({
      ...validResult,
      candidates: tooMany,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const incomplete = { totalScanned: 10 };
    const result = SourcingResultSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('validates all three source types', () => {
    const sources = ['database', 'talent_pool', 'semantic_search'] as const;
    for (const source of sources) {
      const result = SourcingResultSchema.safeParse({
        ...validResult,
        candidates: [{ ...validResult.candidates[0], source }],
      });
      expect(result.success).toBe(true);
    }
  });
});

// ── Agent definition tests ────────────────────────────────────────────

describe('sourcingAgentDefinition', () => {
  it('has correct name', () => {
    expect(sourcingAgentDefinition.name).toBe('talent-sourcer');
  });

  it('uses react mode', () => {
    expect(sourcingAgentDefinition.mode).toBe('react');
  });

  it('has 3 tools registered', () => {
    expect(sourcingAgentDefinition.tools).toHaveLength(3);
  });

  it('has correct tool names', () => {
    const names = sourcingAgentDefinition.tools.map(t => t.name);
    expect(names).toContain('get_requisition_details');
    expect(names).toContain('search_candidates_db');
    expect(names).toContain('search_talent_pool');
  });

  it('uses Claude Sonnet model', () => {
    expect(sourcingAgentDefinition.modelId).toBe('claude-sonnet-4-20250514');
  });

  it('has untrustedInput set to false', () => {
    expect(sourcingAgentDefinition.untrustedInput).toBe(false);
  });

  it('has correct budget limits', () => {
    expect(sourcingAgentDefinition.budget.maxTokensPerRun).toBe(20000);
    expect(sourcingAgentDefinition.budget.maxCostUsdPerRun).toBe(0.50);
    expect(sourcingAgentDefinition.budget.maxIterationsPerRun).toBe(8);
    expect(sourcingAgentDefinition.budget.maxRepairAttempts).toBe(3);
  });

  it('system prompt includes required strategy steps', () => {
    const prompt = sourcingAgentDefinition.systemPrompt;
    expect(prompt).toContain('get_requisition_details');
    expect(prompt).toContain('candidate database');
    expect(prompt).toContain('semantic talent pool');
    expect(prompt).toContain('matchScore');
  });
});

// ── Tool definition tests ─────────────────────────────────────────────

describe('Tool: get_requisition_details', () => {
  it('has read side effect', () => {
    expect(getRequisitionDetailsTool.sideEffect).toBe('read');
  });

  it('validates parameters schema', () => {
    const result = getRequisitionDetailsTool.parameters.safeParse({ requisitionId: 'req-1' });
    expect(result.success).toBe(true);
  });

  it('rejects missing requisitionId', () => {
    const result = getRequisitionDetailsTool.parameters.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('Tool: search_candidates_db', () => {
  it('has read side effect', () => {
    expect(searchCandidatesDbTool.sideEffect).toBe('read');
  });

  it('validates parameters with skills array', () => {
    const result = searchCandidatesDbTool.parameters.safeParse({
      skills: ['React', 'TypeScript'],
      location: 'San Francisco',
      limit: 10,
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty parameters (all optional filters)', () => {
    const result = searchCandidatesDbTool.parameters.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects limit above 50', () => {
    const result = searchCandidatesDbTool.parameters.safeParse({ limit: 100 });
    expect(result.success).toBe(false);
  });

  it('rejects limit below 1', () => {
    const result = searchCandidatesDbTool.parameters.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });
});

describe('Tool: search_talent_pool', () => {
  it('has read side effect', () => {
    expect(searchTalentPoolTool.sideEffect).toBe('read');
  });

  it('validates parameters with query', () => {
    const result = searchTalentPoolTool.parameters.safeParse({
      query: 'senior frontend engineer react typescript',
      topK: 15,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty query', () => {
    const result = searchTalentPoolTool.parameters.safeParse({ query: '' });
    expect(result.success).toBe(false);
  });

  it('rejects topK above 50', () => {
    const result = searchTalentPoolTool.parameters.safeParse({
      query: 'engineer',
      topK: 100,
    });
    expect(result.success).toBe(false);
  });

  it('has low cost tag (uses embeddings)', () => {
    expect(searchTalentPoolTool.costTag).toBe('low');
  });
});

// ── Module export tests ───────────────────────────────────────────────

describe('sourcing-agent exports', () => {
  it('sourceCandidates is exported as a function', async () => {
    const mod = await import('../agents/sourcing-agent');
    expect(typeof mod.sourceCandidates).toBe('function');
  });

  it('SourcingResultSchema is a valid zod schema', () => {
    expect(SourcingResultSchema).toBeDefined();
    expect(typeof SourcingResultSchema.parse).toBe('function');
    expect(typeof SourcingResultSchema.safeParse).toBe('function');
  });
});

// ── Route tests ───────────────────────────────────────────────────────

describe('POST /api/sourcing/ai-search', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/sourcing/ai-search')
      .send({ requisitionId: 'req-1' });
    expect(res.status).toBe(401);
  });

  it('returns 401 with empty body (auth required before validation)', async () => {
    const res = await request(app)
      .post('/api/sourcing/ai-search')
      .send({});
    expect(res.status).toBe(401);
  });
});
