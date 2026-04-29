import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// ── Mock AI SDK packages (must be before runtime import) ───────────────
vi.mock('ai', () => ({
  generateObject: vi.fn(),
  generateText: vi.fn(),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn(() => ({ modelId: 'mock-anthropic' })),
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => ({ modelId: 'mock-openai' })),
}));

// ── Mock prisma before any imports that use it ─────────────────────────
vi.mock('../utils/prisma', () => {
  const mockPrisma = {
    agentRun: {
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
    agentTrace: {
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  };
  return { default: mockPrisma, prisma: mockPrisma };
});

// Mock logger
vi.mock('../lib/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { AgentRuntime, type AgentDefinition, type AgentContext } from '../agents/runtime';
import { toolRegistry } from '../agents/tool-registry';
import { redactPII } from '../agents/pii-redactor';

// ── Helpers ────────────────────────────────────────────────────────────

const testOutputSchema = z.object({
  score: z.number(),
  summary: z.string(),
});

function makeDefinition(overrides?: Partial<AgentDefinition>): AgentDefinition {
  return {
    name: 'test-agent',
    systemPrompt: 'You are a test agent.',
    tools: [],
    outputSchema: testOutputSchema,
    budget: {
      maxTokensPerRun: 10000,
      maxIterationsPerRun: 5,
      maxCostUsdPerRun: 1.0,
      maxRepairAttempts: 3,
    },
    mode: 'single-call',
    ...overrides,
  };
}

function makeContext(overrides?: Partial<AgentContext>): AgentContext {
  return {
    tenantId: 'tenant-1',
    userId: 'user-1',
    runId: 'run-1',
    agentType: 'test-agent',
    ...overrides,
  };
}

// ── AgentRuntime tests ─────────────────────────────────────────────────

describe('AgentRuntime', () => {
  it('accepts a valid definition', () => {
    const def = makeDefinition();
    const runtime = new AgentRuntime(def);
    expect(runtime).toBeInstanceOf(AgentRuntime);
  });

  it('throws BUDGET_EXCEEDED when iterations exceeded', () => {
    const def = makeDefinition({
      budget: {
        maxTokensPerRun: 100000,
        maxIterationsPerRun: 2,
        maxCostUsdPerRun: 10,
        maxRepairAttempts: 3,
      },
    });
    const runtime = new AgentRuntime(def);

    // Manually increment iterations past the limit by accessing internal state
    // We use checkBudget which is exposed for testing
    (runtime as any).iterations = 3;
    expect(() => runtime.checkBudget()).toThrow('BUDGET_EXCEEDED: Max iterations (2) exceeded');
  });

  it('throws BUDGET_EXCEEDED when cost exceeded', () => {
    const def = makeDefinition({
      budget: {
        maxTokensPerRun: 100000,
        maxIterationsPerRun: 100,
        maxCostUsdPerRun: 0.5,
        maxRepairAttempts: 3,
      },
    });
    const runtime = new AgentRuntime(def);

    (runtime as any).totalCostUsd = 0.6;
    expect(() => runtime.checkBudget()).toThrow('BUDGET_EXCEEDED: Max cost ($0.5) exceeded');
  });

  it('throws BUDGET_EXCEEDED when tokens exceeded', () => {
    const def = makeDefinition({
      budget: {
        maxTokensPerRun: 1000,
        maxIterationsPerRun: 100,
        maxCostUsdPerRun: 10,
        maxRepairAttempts: 3,
      },
    });
    const runtime = new AgentRuntime(def);

    (runtime as any).totalTokensIn = 800;
    (runtime as any).totalTokensOut = 300;
    expect(() => runtime.checkBudget()).toThrow('BUDGET_EXCEEDED: Max tokens (1000) exceeded');
  });

  it('does not throw when within budget', () => {
    const def = makeDefinition();
    const runtime = new AgentRuntime(def);

    (runtime as any).iterations = 1;
    (runtime as any).totalTokensIn = 100;
    (runtime as any).totalTokensOut = 100;
    (runtime as any).totalCostUsd = 0.01;
    expect(() => runtime.checkBudget()).not.toThrow();
  });
});

// ── ToolRegistry tests ─────────────────────────────────────────────────

describe('ToolRegistry', () => {
  beforeEach(() => {
    toolRegistry.clear();
  });

  const makeTool = (name: string) => ({
    name,
    description: `Test tool: ${name}`,
    parameters: z.object({ input: z.string() }),
    returns: z.object({ output: z.string() }),
    sideEffect: 'read' as const,
    rateLimit: { maxPerMinute: 10, maxPerRun: 50 },
    costTag: 'free' as const,
    requiredScope: ['test'],
    execute: vi.fn().mockResolvedValue({ output: 'ok' }),
  });

  it('registers and retrieves tools', () => {
    const tool = makeTool('tool-a');
    toolRegistry.register(tool);

    const retrieved = toolRegistry.get('tool-a');
    expect(retrieved).toBeDefined();
    expect(retrieved!.name).toBe('tool-a');
  });

  it('throws on duplicate registration', () => {
    const tool = makeTool('tool-dup');
    toolRegistry.register(tool);

    expect(() => toolRegistry.register(tool)).toThrow('Tool already registered: tool-dup');
  });

  it('throws on missing tool in getForAgent', () => {
    expect(() => toolRegistry.getForAgent(['nonexistent'])).toThrow(
      'Tool not found in registry: nonexistent',
    );
  });

  it('returns all registered tools', () => {
    toolRegistry.register(makeTool('t1'));
    toolRegistry.register(makeTool('t2'));
    toolRegistry.register(makeTool('t3'));

    const all = toolRegistry.getAll();
    expect(all).toHaveLength(3);
  });

  it('generates tool descriptions for LLM prompt', () => {
    toolRegistry.register(makeTool('search'));
    toolRegistry.register(makeTool('fetch'));

    const desc = toolRegistry.describeTools(['search', 'fetch']);
    expect(desc).toContain('search');
    expect(desc).toContain('fetch');
    expect(desc).toContain('[read]');
  });
});

// ── PII Redactor tests ─────────────────────────────────────────────────

describe('PII Redactor', () => {
  it('redacts SSN', () => {
    const result = redactPII('My SSN is 123-45-6789.');
    expect(result.text).toContain('[SSN_REDACTED]');
    expect(result.text).not.toContain('123-45-6789');
    expect(result.redactions).toHaveLength(1);
    expect(result.redactions[0].type).toBe('SSN');
  });

  it('redacts email addresses', () => {
    const result = redactPII('Contact me at john@example.com please.');
    expect(result.text).toContain('[EMAIL_REDACTED]');
    expect(result.text).not.toContain('john@example.com');
  });

  it('redacts phone numbers', () => {
    const result = redactPII('Call me at (555) 123-4567.');
    expect(result.text).toContain('[PHONE_REDACTED]');
    expect(result.text).not.toContain('(555) 123-4567');
  });

  it('redacts date of birth patterns', () => {
    const result = redactPII('DOB: 01/15/1990');
    expect(result.text).toContain('[DOB_REDACTED]');
    expect(result.text).not.toContain('01/15/1990');
  });

  it('redacts SSN, email, phone, and DOB in one pass', () => {
    const input =
      'SSN: 123-45-6789, Email: test@foo.com, Phone: 555-123-4567, DOB: 03/25/1985';
    const result = redactPII(input);
    expect(result.text).not.toContain('123-45-6789');
    expect(result.text).not.toContain('test@foo.com');
    expect(result.text).not.toContain('03/25/1985');
    expect(result.redactions.length).toBeGreaterThanOrEqual(3);
  });

  it('preserves email when keepEmail option is true', () => {
    const result = redactPII('Email me at keep@this.com.', { keepEmail: true });
    expect(result.text).toContain('keep@this.com');
    // Should not have EMAIL in redactions
    expect(result.redactions.find((r) => r.type === 'EMAIL')).toBeUndefined();
  });

  it('returns empty redactions for clean text', () => {
    const result = redactPII('This is a clean sentence with no PII.');
    expect(result.text).toBe('This is a clean sentence with no PII.');
    expect(result.redactions).toHaveLength(0);
  });
});
