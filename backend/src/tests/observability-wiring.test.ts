import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registry } from '../lib/metrics';

// Force metric registration
import '../lib/slo';

describe('Sentry integration', () => {
  beforeEach(() => {
    // Clear env vars before each test
    delete process.env.SENTRY_DSN;
  });

  it('initSentry is callable without DSN (no crash)', async () => {
    const { initSentry } = await import('../lib/sentry');
    expect(() => initSentry()).not.toThrow();
  });

  it('captureException is callable without init (no crash)', async () => {
    const { captureException } = await import('../lib/sentry');
    expect(() => captureException(new Error('test error'))).not.toThrow();
  });

  it('captureException accepts context without crashing', async () => {
    const { captureException } = await import('../lib/sentry');
    expect(() =>
      captureException(new Error('test'), { path: '/api/test', method: 'GET' })
    ).not.toThrow();
  });

  it('setUserContext is callable without init (no crash)', async () => {
    const { setUserContext } = await import('../lib/sentry');
    expect(() => setUserContext('user-1', 'tenant-1')).not.toThrow();
  });

  it('exports Sentry namespace', async () => {
    const { Sentry } = await import('../lib/sentry');
    expect(Sentry).toBeDefined();
    expect(typeof Sentry.init).toBe('function');
  });

  it('exports isSentryInitialized', async () => {
    const { isSentryInitialized } = await import('../lib/sentry');
    expect(typeof isSentryInitialized).toBe('function');
    // Without DSN, should not be initialized
    expect(isSentryInitialized()).toBe(false);
  });
});

describe('Langfuse observability', () => {
  beforeEach(() => {
    delete process.env.LANGFUSE_PUBLIC_KEY;
    delete process.env.LANGFUSE_SECRET_KEY;
  });

  it('getLangfuse returns null without config', async () => {
    // Re-import to get fresh state
    const { getLangfuse } = await import('../agents/observability');
    const client = getLangfuse();
    expect(client).toBeNull();
  });

  it('createAgentTrace returns null without config', async () => {
    const { createAgentTrace } = await import('../agents/observability');
    const trace = createAgentTrace({
      runId: 'test-run-1',
      agentType: 'resume-parser',
      tenantId: 'tenant-1',
      userId: 'user-1',
      input: { userMessage: 'test' },
    });
    expect(trace).toBeNull();
  });

  it('logGeneration does not throw without config', async () => {
    const { logGeneration } = await import('../agents/observability');
    expect(() =>
      logGeneration({
        traceId: 'test-run-1',
        name: 'resume-parser-llm_call',
        model: 'claude-sonnet-4-20250514',
        input: 'test prompt',
        output: { result: 'test' },
        tokensIn: 100,
        tokensOut: 50,
        costUsd: 0.001,
        latencyMs: 500,
      })
    ).not.toThrow();
  });

  it('flushLangfuse returns a promise', async () => {
    const { flushLangfuse } = await import('../agents/observability');
    const result = flushLangfuse();
    expect(result).toBeInstanceOf(Promise);
    await result; // Should resolve (Langfuse not configured = no-op)
  });
});

describe('Agent Prometheus metrics registration', () => {
  it('agentRunTotal is registered', async () => {
    const metrics = await registry.getMetricsAsJSON();
    const found = metrics.find((m) => m.name === 'ats_agent_runs_total');
    expect(found).toBeDefined();
    expect(found!.type).toBe('counter');
  });

  it('agentRunDuration is registered', async () => {
    const metrics = await registry.getMetricsAsJSON();
    const found = metrics.find((m) => m.name === 'ats_agent_run_duration_seconds');
    expect(found).toBeDefined();
    expect(found!.type).toBe('histogram');
  });

  it('agentTokensUsed is registered', async () => {
    const metrics = await registry.getMetricsAsJSON();
    const found = metrics.find((m) => m.name === 'ats_agent_tokens_total');
    expect(found).toBeDefined();
    expect(found!.type).toBe('counter');
  });

  it('agentCostUsd is registered', async () => {
    const metrics = await registry.getMetricsAsJSON();
    const found = metrics.find((m) => m.name === 'ats_agent_cost_usd_total');
    expect(found).toBeDefined();
    expect(found!.type).toBe('counter');
  });

  it('agentRepairLoops is registered', async () => {
    const metrics = await registry.getMetricsAsJSON();
    const found = metrics.find((m) => m.name === 'ats_agent_repair_loops_total');
    expect(found).toBeDefined();
    expect(found!.type).toBe('counter');
  });

  it('tenantDailyCost gauge is registered', async () => {
    const metrics = await registry.getMetricsAsJSON();
    const found = metrics.find((m) => m.name === 'ats_tenant_daily_cost_usd');
    expect(found).toBeDefined();
    expect(found!.type).toBe('gauge');
  });
});
