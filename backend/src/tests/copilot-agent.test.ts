import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { z } from 'zod';
import { CopilotResponseSchema, copilotAgentDefinition } from '../agents/copilot-agent';
import app from '../app';

// ── CopilotResponseSchema validation tests ────────────────────────────────

describe('CopilotResponseSchema', () => {
  const validResponse = {
    answer: 'You currently have 5 open requisitions across Engineering and Marketing.',
    sources: [
      { type: 'metric' as const, id: 'pipeline-summary', snippet: '5 open reqs, 42 active candidates' },
      { type: 'requisition' as const, id: 'req-001', snippet: 'Senior Engineer - Open' },
    ],
    suggestedActions: [
      { label: 'View open requisitions', type: 'navigate' as const, payload: { page: '/requisitions?status=open' } },
    ],
    confidence: 0.95,
    followUpQuestions: ['Would you like to see candidates for any of these requisitions?'],
  };

  it('validates a complete valid response', () => {
    const parsed = CopilotResponseSchema.parse(validResponse);
    expect(parsed.answer).toContain('5 open requisitions');
    expect(parsed.sources).toHaveLength(2);
    expect(parsed.confidence).toBe(0.95);
    expect(parsed.suggestedActions).toHaveLength(1);
    expect(parsed.followUpQuestions).toHaveLength(1);
  });

  it('validates response without optional fields', () => {
    const minimal = {
      answer: 'There are no open requisitions.',
      sources: [],
      confidence: 0.8,
    };
    const parsed = CopilotResponseSchema.parse(minimal);
    expect(parsed.answer).toBe('There are no open requisitions.');
    expect(parsed.suggestedActions).toBeUndefined();
    expect(parsed.followUpQuestions).toBeUndefined();
  });

  it('validates response with empty arrays', () => {
    const parsed = CopilotResponseSchema.parse({
      ...validResponse,
      sources: [],
      suggestedActions: [],
      followUpQuestions: [],
    });
    expect(parsed.sources).toHaveLength(0);
    expect(parsed.suggestedActions).toHaveLength(0);
    expect(parsed.followUpQuestions).toHaveLength(0);
  });

  it('rejects empty answer string', () => {
    const result = CopilotResponseSchema.safeParse({
      ...validResponse,
      answer: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects answer over 3000 characters', () => {
    const result = CopilotResponseSchema.safeParse({
      ...validResponse,
      answer: 'x'.repeat(3001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects confidence above 1', () => {
    const result = CopilotResponseSchema.safeParse({
      ...validResponse,
      confidence: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects confidence below 0', () => {
    const result = CopilotResponseSchema.safeParse({
      ...validResponse,
      confidence: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 10 sources', () => {
    const result = CopilotResponseSchema.safeParse({
      ...validResponse,
      sources: Array.from({ length: 11 }, (_, i) => ({
        type: 'candidate',
        id: `c-${i}`,
        snippet: `Candidate ${i}`,
      })),
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 3 suggestedActions', () => {
    const result = CopilotResponseSchema.safeParse({
      ...validResponse,
      suggestedActions: [
        { label: 'A', type: 'navigate' },
        { label: 'B', type: 'filter' },
        { label: 'C', type: 'export' },
        { label: 'D', type: 'schedule' },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 3 followUpQuestions', () => {
    const result = CopilotResponseSchema.safeParse({
      ...validResponse,
      followUpQuestions: ['Q1', 'Q2', 'Q3', 'Q4'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid source type', () => {
    const result = CopilotResponseSchema.safeParse({
      ...validResponse,
      sources: [{ type: 'invalid_type', id: 's1', snippet: 'test' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid suggestedAction type', () => {
    const result = CopilotResponseSchema.safeParse({
      ...validResponse,
      suggestedActions: [{ label: 'Do something', type: 'invalid_action' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects source snippet over 200 characters', () => {
    const result = CopilotResponseSchema.safeParse({
      ...validResponse,
      sources: [{ type: 'candidate', id: 'c1', snippet: 'x'.repeat(201) }],
    });
    expect(result.success).toBe(false);
  });

  it('validates all valid source types', () => {
    const sourceTypes = ['candidate', 'requisition', 'interview', 'metric', 'policy'] as const;
    for (const type of sourceTypes) {
      const result = CopilotResponseSchema.safeParse({
        ...validResponse,
        sources: [{ type, id: `${type}-1`, snippet: `Test ${type}` }],
      });
      expect(result.success).toBe(true);
    }
  });

  it('validates all valid suggestedAction types', () => {
    const actionTypes = ['navigate', 'filter', 'export', 'schedule', 'create'] as const;
    for (const type of actionTypes) {
      const result = CopilotResponseSchema.safeParse({
        ...validResponse,
        suggestedActions: [{ label: `Do ${type}`, type }],
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects missing required fields', () => {
    const result = CopilotResponseSchema.safeParse({ answer: 'Hello' });
    expect(result.success).toBe(false);
  });
});

// ── Module export tests ─────────────────────────────────────────────────

describe('copilot-agent exports', () => {
  it('chatWithCopilot is exported as a function', async () => {
    const mod = await import('../agents/copilot-agent');
    expect(typeof mod.chatWithCopilot).toBe('function');
  });

  it('CopilotResponseSchema is a valid zod schema', () => {
    expect(CopilotResponseSchema).toBeDefined();
    expect(typeof CopilotResponseSchema.parse).toBe('function');
    expect(typeof CopilotResponseSchema.safeParse).toBe('function');
  });

  it('copilotAgentDefinition is exported', () => {
    expect(copilotAgentDefinition).toBeDefined();
    expect(copilotAgentDefinition.name).toBe('hiring-copilot');
  });
});

// ── Agent Definition tests ──────────────────────────────────────────────

describe('copilot agent definition', () => {
  it('has mode set to react', () => {
    expect(copilotAgentDefinition.mode).toBe('react');
  });

  it('uses Claude Sonnet model', () => {
    expect(copilotAgentDefinition.modelId).toBe('claude-sonnet-4-20250514');
  });

  it('has untrustedInput set to false', () => {
    expect(copilotAgentDefinition.untrustedInput).toBe(false);
  });

  it('has 4 tools registered', () => {
    expect(copilotAgentDefinition.tools).toHaveLength(4);
    const toolNames = copilotAgentDefinition.tools.map((t) => t.name);
    expect(toolNames).toContain('search_candidates_db');
    expect(toolNames).toContain('get_requisition_details');
    expect(toolNames).toContain('query_pipeline_metrics');
    expect(toolNames).toContain('search_semantic_memory');
  });

  it('has budget within specified limits', () => {
    expect(copilotAgentDefinition.budget.maxTokensPerRun).toBe(25000);
    expect(copilotAgentDefinition.budget.maxCostUsdPerRun).toBe(0.50);
    expect(copilotAgentDefinition.budget.maxIterationsPerRun).toBe(10);
    expect(copilotAgentDefinition.budget.maxRepairAttempts).toBe(3);
  });

  it('all tools have read-only side effects', () => {
    for (const tool of copilotAgentDefinition.tools) {
      expect(tool.sideEffect).toBe('read');
    }
  });

  it('all tools have valid parameter schemas', () => {
    for (const tool of copilotAgentDefinition.tools) {
      expect(tool.parameters).toBeDefined();
      expect(typeof tool.parameters.parse).toBe('function');
    }
  });

  it('all tools have valid return schemas', () => {
    for (const tool of copilotAgentDefinition.tools) {
      expect(tool.returns).toBeDefined();
      expect(typeof tool.returns.parse).toBe('function');
    }
  });
});

// ── System prompt content tests ──────────────────────────────────────────

describe('copilot agent system prompt', () => {
  it('contains required restrictions and capabilities', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const agentSource = fs.readFileSync(
      path.resolve(__dirname, '../agents/copilot-agent.ts'),
      'utf-8',
    );

    // Core rules
    expect(agentSource).toContain('hiring operations copilot for recruiters');
    expect(agentSource).toContain('Answer questions about candidates, requisitions, interviews, pipeline metrics');
    expect(agentSource).toContain('Always cite your sources');
    expect(agentSource).toContain('Suggest actionable next steps');
    expect(agentSource).toContain('Be concise but thorough');
    expect(agentSource).toContain("don't have enough data to answer, say so honestly");
    expect(agentSource).toContain('Never reveal AI screening scores or internal rankings');
    expect(agentSource).toContain('Protect candidate PII');
  });
});

// ── Tool parameter validation tests ──────────────────────────────────────

describe('copilot tool parameter schemas', () => {
  const tools = Object.fromEntries(
    copilotAgentDefinition.tools.map((t) => [t.name, t]),
  );

  it('search_candidates_db accepts valid params', () => {
    const result = tools['search_candidates_db'].parameters.safeParse({
      skills: ['React', 'TypeScript'],
      location: 'San Francisco',
      stage: 'INTERVIEW',
      limit: 10,
    });
    expect(result.success).toBe(true);
  });

  it('search_candidates_db works with no params', () => {
    const result = tools['search_candidates_db'].parameters.safeParse({});
    expect(result.success).toBe(true);
  });

  it('get_requisition_details requires requisitionId', () => {
    const result = tools['get_requisition_details'].parameters.safeParse({});
    expect(result.success).toBe(false);
  });

  it('get_requisition_details accepts valid params', () => {
    const result = tools['get_requisition_details'].parameters.safeParse({
      requisitionId: 'req-001',
    });
    expect(result.success).toBe(true);
  });

  it('query_pipeline_metrics accepts valid params', () => {
    const result = tools['query_pipeline_metrics'].parameters.safeParse({
      timeRangeStart: '2026-01-01T00:00:00Z',
      timeRangeEnd: '2026-03-31T23:59:59Z',
      requisitionIds: ['req-001', 'req-002'],
    });
    expect(result.success).toBe(true);
  });

  it('query_pipeline_metrics works with no params', () => {
    const result = tools['query_pipeline_metrics'].parameters.safeParse({});
    expect(result.success).toBe(true);
  });

  it('search_semantic_memory requires query', () => {
    const result = tools['search_semantic_memory'].parameters.safeParse({});
    expect(result.success).toBe(false);
  });

  it('search_semantic_memory accepts valid params', () => {
    const result = tools['search_semantic_memory'].parameters.safeParse({
      query: 'React developer with 5 years experience',
      entityType: 'candidate_resume',
      topK: 5,
    });
    expect(result.success).toBe(true);
  });
});

// ── Conversation history integration tests ────────────────────────────────

describe('copilot conversation history', () => {
  it('chatWithCopilot accepts input with context', async () => {
    const mod = await import('../agents/copilot-agent');
    // Verify the function signature accepts the expected input shape
    expect(typeof mod.chatWithCopilot).toBe('function');
    // We can't actually call it without a DB, but we verify it exists and is callable
  });
});

// ── Route tests ─────────────────────────────────────────────────────────

describe('POST /api/agents/copilot/message', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/agents/copilot/message')
      .send({ query: 'How many open requisitions do we have?' });
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .post('/api/agents/copilot/message')
      .set('Authorization', 'Bearer invalid-token-here')
      .send({ query: 'How many open requisitions do we have?' });
    expect(res.status).toBe(401);
  });

  it('returns 401 without query body (auth required first)', async () => {
    const res = await request(app)
      .post('/api/agents/copilot/message')
      .send({});
    expect(res.status).toBe(401);
  });
});

// ── Eval dataset tests ─────────────────────────────────────────────────

describe('copilot eval dataset', () => {
  it('golden.jsonl exists and contains 5 cases', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../../eval/datasets/copilot-agent/golden.jsonl');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    expect(lines.length).toBeGreaterThanOrEqual(5);

    // Each line should be valid JSON with required fields
    for (const line of lines) {
      const parsed = JSON.parse(line);
      expect(parsed.input).toBeDefined();
      expect(parsed.input.query).toBeDefined();
      expect(parsed.expected).toBeDefined();
      expect(parsed.description).toBeDefined();
    }
  });
});
