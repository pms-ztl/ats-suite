import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// ── Mock AI SDK packages (must be before runtime import) ───────────────
const mockGenerateObject = vi.fn();
const mockGenerateText = vi.fn();
const mockTool = vi.fn((config: any) => config);

vi.mock('ai', () => ({
  generateObject: (opts: any) => mockGenerateObject(opts),
  generateText: (opts: any) => mockGenerateText(opts),
  tool: (config: any) => mockTool(config),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn(() => ({ modelId: 'mock-anthropic' })),
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => ({ modelId: 'mock-openai' })),
}));

// ── Mock prisma ───────────────────────────────────────────────────────
vi.mock('../utils/prisma', () => {
  const mockPrisma = {
    agentRun: {
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
    agentTrace: {
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    agentRun_aggregate: vi.fn().mockResolvedValue({ _sum: { costUsd: 0 } }),
  };
  return { default: mockPrisma, prisma: mockPrisma };
});

// ── Mock billing ──────────────────────────────────────────────────────
vi.mock('../lib/billing', () => ({
  isAgentEnabled: vi.fn().mockResolvedValue(true),
  checkTenantBudget: vi.fn().mockResolvedValue({ allowed: true }),
}));

// ── Mock logger ───────────────────────────────────────────────────────
vi.mock('../lib/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { AgentRuntime, type AgentDefinition, type AgentContext } from '../agents/runtime';
import { toAISDKTool, toAISDKTools } from '../agents/tool-adapter';

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

const makeAgentTool = (name: string, executeFn?: any) => ({
  name,
  description: `Test tool: ${name}`,
  parameters: z.object({ query: z.string() }),
  returns: z.object({ result: z.string() }),
  sideEffect: 'read' as const,
  rateLimit: { maxPerMinute: 10, maxPerRun: 5 },
  costTag: 'free' as const,
  requiredScope: ['test:read'],
  execute: executeFn || vi.fn().mockResolvedValue({ result: 'ok' }),
});

// ── Tests ──────────────────────────────────────────────────────────────

describe('AgentDefinition mode flag', () => {
  it('accepts single-call mode', () => {
    const def = makeDefinition({ mode: 'single-call' });
    const runtime = new AgentRuntime(def);
    expect(runtime).toBeInstanceOf(AgentRuntime);
  });

  it('accepts react mode', () => {
    const def = makeDefinition({ mode: 'react' });
    const runtime = new AgentRuntime(def);
    expect(runtime).toBeInstanceOf(AgentRuntime);
  });

  it('mode flag is present on the definition type', () => {
    const def = makeDefinition();
    // TypeScript compilation ensures mode is required — runtime check
    expect(def.mode).toBe('single-call');
  });
});

describe('Single-call mode (generateWithRepair)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses generateObject for single-call agents', async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: { score: 85, summary: 'Good candidate' },
      usage: { inputTokens: 100, outputTokens: 50 },
    });

    const def = makeDefinition({ mode: 'single-call' });
    const runtime = new AgentRuntime(def);
    const ctx = makeContext();

    const result = await runtime.run(ctx, 'Evaluate this candidate');

    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
    expect(mockGenerateText).not.toHaveBeenCalled();
    expect(result.output).toEqual({ score: 85, summary: 'Good candidate' });
  });

  it('single-call agents still work unchanged (resume-parser pattern)', async () => {
    mockGenerateObject.mockResolvedValueOnce({
      object: { score: 90, summary: 'Excellent' },
      usage: { inputTokens: 200, outputTokens: 100 },
    });

    const def = makeDefinition({ mode: 'single-call', tools: [] });
    const runtime = new AgentRuntime(def);
    const ctx = makeContext();

    const result = await runtime.run(ctx, 'Parse this resume');

    expect(result.output).toEqual({ score: 90, summary: 'Excellent' });
    expect(result.tokensUsed).toBe(300);
    expect(result.costUsd).toBeGreaterThan(0);
  });
});

describe('ReAct mode (runReActLoop)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses generateText for react agents', async () => {
    // First call: model produces final text (no tool calls)
    mockGenerateText.mockResolvedValueOnce({
      text: 'The candidate scores 80 and is a good fit.',
      toolCalls: [],
      toolResults: [],
      usage: { inputTokens: 200, outputTokens: 100 },
      finishReason: 'stop',
    });

    // Then validateFinalOutput calls generateObject
    mockGenerateObject.mockResolvedValueOnce({
      object: { score: 80, summary: 'Good fit' },
      usage: { inputTokens: 100, outputTokens: 50 },
    });

    const def = makeDefinition({ mode: 'react' });
    const runtime = new AgentRuntime(def);
    const ctx = makeContext();

    const result = await runtime.run(ctx, 'Screen this candidate');

    expect(mockGenerateText).toHaveBeenCalledTimes(1);
    // generateObject called once for final validation
    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
    expect(result.output).toEqual({ score: 80, summary: 'Good fit' });
  });

  it('handles tool calls then final output', async () => {
    const executeFn = vi.fn().mockResolvedValue({ result: 'tool-output' });
    const agentTool = makeAgentTool('search_db', executeFn);

    // First iteration: model calls a tool
    mockGenerateText.mockResolvedValueOnce({
      text: '',
      toolCalls: [
        { toolName: 'search_db', toolCallId: 'tc1', input: { query: 'test' } },
      ],
      toolResults: [
        { toolCallId: 'tc1', output: { result: 'tool-output' } },
      ],
      usage: { inputTokens: 100, outputTokens: 50 },
      finishReason: 'tool-calls',
    });

    // Second iteration: model produces final text
    mockGenerateText.mockResolvedValueOnce({
      text: 'Based on the search, score is 75.',
      toolCalls: [],
      toolResults: [],
      usage: { inputTokens: 150, outputTokens: 80 },
      finishReason: 'stop',
    });

    // validateFinalOutput
    mockGenerateObject.mockResolvedValueOnce({
      object: { score: 75, summary: 'Based on search results' },
      usage: { inputTokens: 80, outputTokens: 40 },
    });

    const def = makeDefinition({
      mode: 'react',
      tools: [agentTool],
    });
    const runtime = new AgentRuntime(def);
    const ctx = makeContext();

    const result = await runtime.run(ctx, 'Search and evaluate');

    expect(mockGenerateText).toHaveBeenCalledTimes(2);
    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
    expect(result.output).toEqual({ score: 75, summary: 'Based on search results' });
  });

  it('enforces budget in ReAct loop', async () => {
    // Always return tool calls to exhaust iterations
    mockGenerateText.mockResolvedValue({
      text: '',
      toolCalls: [
        { toolName: 'search_db', toolCallId: 'tc1', input: { query: 'test' } },
      ],
      toolResults: [
        { toolCallId: 'tc1', output: { result: 'data' } },
      ],
      usage: { inputTokens: 100, outputTokens: 50 },
      finishReason: 'tool-calls',
    });

    const def = makeDefinition({
      mode: 'react',
      tools: [makeAgentTool('search_db')],
      budget: {
        maxTokensPerRun: 100000,
        maxIterationsPerRun: 3,
        maxCostUsdPerRun: 10,
        maxRepairAttempts: 1,
      },
    });
    const runtime = new AgentRuntime(def);
    const ctx = makeContext();

    await expect(runtime.run(ctx, 'Loop forever')).rejects.toThrow('BUDGET_EXCEEDED');
  });
});

describe('toAISDKTool', () => {
  it('converts AgentTool to AI SDK tool format', () => {
    const agentTool = makeAgentTool('my_tool');
    const ctx = makeContext();

    const sdkTool = toAISDKTool(agentTool, ctx);

    // mockTool captures the config passed to tool()
    expect(mockTool).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Test tool: my_tool',
        parameters: agentTool.parameters,
      }),
    );
  });

  it('preserves tool description', () => {
    const agentTool = makeAgentTool('desc_tool');
    agentTool.description = 'Custom description for testing';
    const ctx = makeContext();

    toAISDKTool(agentTool, ctx);

    expect(mockTool).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Custom description for testing',
      }),
    );
  });

  it('preserves tool parameters schema', () => {
    const customParams = z.object({ id: z.string(), limit: z.number() });
    const agentTool = makeAgentTool('param_tool');
    (agentTool as any).parameters = customParams;
    const ctx = makeContext();

    toAISDKTool(agentTool, ctx);

    expect(mockTool).toHaveBeenCalledWith(
      expect.objectContaining({
        parameters: customParams,
      }),
    );
  });

  it('execute wrapper calls the original tool execute with context', async () => {
    const executeFn = vi.fn().mockResolvedValue({ result: 'executed' });
    const agentTool = makeAgentTool('exec_tool', executeFn);
    const ctx = makeContext();

    // Since mockTool returns the config, the result has an execute property
    const sdkTool = toAISDKTool(agentTool, ctx) as any;
    await sdkTool.execute({ query: 'test' }, {} as any);

    expect(executeFn).toHaveBeenCalledWith({ query: 'test' }, ctx);
  });
});

describe('toAISDKTools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('produces a record with correct keys', () => {
    const tools = [makeAgentTool('tool_a'), makeAgentTool('tool_b'), makeAgentTool('tool_c')];
    const ctx = makeContext();

    const result = toAISDKTools(tools, ctx);

    expect(Object.keys(result)).toEqual(['tool_a', 'tool_b', 'tool_c']);
  });

  it('produces empty record for empty tools array', () => {
    const ctx = makeContext();
    const result = toAISDKTools([], ctx);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('calls toAISDKTool for each tool', () => {
    const tools = [makeAgentTool('x'), makeAgentTool('y')];
    const ctx = makeContext();

    toAISDKTools(tools, ctx);

    // mockTool is called once per tool
    expect(mockTool).toHaveBeenCalledTimes(2);
  });
});

describe('Budget enforcement in ReAct loop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws BUDGET_EXCEEDED when token limit exceeded mid-loop', async () => {
    // Return large token usage to exceed budget
    mockGenerateText.mockResolvedValue({
      text: '',
      toolCalls: [
        { toolName: 'search_db', toolCallId: 'tc1', input: { query: 'test' } },
      ],
      toolResults: [
        { toolCallId: 'tc1', output: { result: 'data' } },
      ],
      usage: { inputTokens: 5000, outputTokens: 5000 },
      finishReason: 'tool-calls',
    });

    const def = makeDefinition({
      mode: 'react',
      tools: [makeAgentTool('search_db')],
      budget: {
        maxTokensPerRun: 8000, // Will exceed after 1 iteration
        maxIterationsPerRun: 10,
        maxCostUsdPerRun: 10,
        maxRepairAttempts: 1,
      },
    });
    const runtime = new AgentRuntime(def);
    const ctx = makeContext();

    await expect(runtime.run(ctx, 'Search')).rejects.toThrow('BUDGET_EXCEEDED');
  });

  it('throws BUDGET_EXCEEDED when cost limit exceeded mid-loop', async () => {
    // Return usage that will exceed cost limit
    mockGenerateText.mockResolvedValue({
      text: '',
      toolCalls: [
        { toolName: 'search_db', toolCallId: 'tc1', input: { query: 'test' } },
      ],
      toolResults: [
        { toolCallId: 'tc1', output: { result: 'data' } },
      ],
      usage: { inputTokens: 50000, outputTokens: 50000 },
      finishReason: 'tool-calls',
    });

    const def = makeDefinition({
      mode: 'react',
      tools: [makeAgentTool('search_db')],
      budget: {
        maxTokensPerRun: 1000000,
        maxIterationsPerRun: 10,
        maxCostUsdPerRun: 0.01, // Very small cost limit
        maxRepairAttempts: 1,
      },
    });
    const runtime = new AgentRuntime(def);
    const ctx = makeContext();

    await expect(runtime.run(ctx, 'Search')).rejects.toThrow('BUDGET_EXCEEDED');
  });
});
