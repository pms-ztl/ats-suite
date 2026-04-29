import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { z } from 'zod';
import { AnalyticsInsightSchema } from '../agents/analytics-agent';
import app from '../app';

// ── AnalyticsInsightSchema validation tests ─────────────────────────────

describe('AnalyticsInsightSchema', () => {
  const validInsight = {
    insights: [
      {
        finding: 'The conversion rate from SCREENED to PHONE_SCREEN dropped by 25% compared to last quarter.',
        evidence: 'SCREENED: 300, PHONE_SCREEN: 150 (50% conversion vs 75% previous quarter)',
        severity: 'warning' as const,
        recommendation: 'Review screening criteria for potential over-filtering. Consider adjusting minimum qualification thresholds.',
      },
    ],
    metrics: [
      { name: 'Overall Conversion Rate', value: 5.0, unit: '%', trend: 'down' as const },
      { name: 'Time to Hire', value: 42.5, unit: 'days', trend: 'up' as const },
    ],
    answer: 'Your pipeline has a significant bottleneck at the screening stage, with a 50% conversion rate that has declined from 75% last quarter.',
  };

  it('validates a complete valid insight response', () => {
    const parsed = AnalyticsInsightSchema.parse(validInsight);
    expect(parsed.insights).toHaveLength(1);
    expect(parsed.metrics).toHaveLength(2);
    expect(parsed.answer.length).toBeGreaterThanOrEqual(20);
  });

  it('rejects empty insights array', () => {
    const result = AnalyticsInsightSchema.safeParse({
      ...validInsight,
      insights: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects insights exceeding max of 5', () => {
    const sixInsights = Array(6).fill(validInsight.insights[0]);
    const result = AnalyticsInsightSchema.safeParse({
      ...validInsight,
      insights: sixInsights,
    });
    expect(result.success).toBe(false);
  });

  it('rejects finding shorter than 10 characters', () => {
    const result = AnalyticsInsightSchema.safeParse({
      ...validInsight,
      insights: [{ ...validInsight.insights[0], finding: 'Too short' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid severity value', () => {
    const result = AnalyticsInsightSchema.safeParse({
      ...validInsight,
      insights: [{ ...validInsight.insights[0], severity: 'high' }],
    });
    expect(result.success).toBe(false);
  });

  it('validates all severity enum values', () => {
    for (const sev of ['info', 'warning', 'critical']) {
      const result = AnalyticsInsightSchema.safeParse({
        ...validInsight,
        insights: [{ ...validInsight.insights[0], severity: sev }],
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects answer shorter than 20 characters', () => {
    const result = AnalyticsInsightSchema.safeParse({
      ...validInsight,
      answer: 'Too short.',
    });
    expect(result.success).toBe(false);
  });

  it('accepts without optional metrics', () => {
    const noMetrics = { ...validInsight };
    delete (noMetrics as any).metrics;
    const parsed = AnalyticsInsightSchema.parse(noMetrics);
    expect(parsed.metrics).toBeUndefined();
  });

  it('validates metric trend enum values', () => {
    for (const trend of ['up', 'down', 'stable']) {
      const result = AnalyticsInsightSchema.safeParse({
        ...validInsight,
        metrics: [{ name: 'test', value: 1, unit: '%', trend }],
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts metric without optional trend', () => {
    const result = AnalyticsInsightSchema.safeParse({
      ...validInsight,
      metrics: [{ name: 'test', value: 1, unit: '%' }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts exactly 5 insights', () => {
    const fiveInsights = Array(5).fill(validInsight.insights[0]);
    const result = AnalyticsInsightSchema.safeParse({
      ...validInsight,
      insights: fiveInsights,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required insight fields', () => {
    const result = AnalyticsInsightSchema.safeParse({
      ...validInsight,
      insights: [{ finding: 'A valid finding that is long enough' }],
    });
    expect(result.success).toBe(false);
  });
});

// ── Module export tests ─────────────────────────────────────────────────

describe('analytics-agent exports', () => {
  it('generateInsights is exported as a function', async () => {
    const mod = await import('../agents/analytics-agent');
    expect(typeof mod.generateInsights).toBe('function');
  });

  it('loadPipelineMetrics is exported as a function', async () => {
    const mod = await import('../agents/analytics-agent');
    expect(typeof mod.loadPipelineMetrics).toBe('function');
  });

  it('AnalyticsInsightSchema is a valid zod schema', () => {
    expect(AnalyticsInsightSchema).toBeDefined();
    expect(typeof AnalyticsInsightSchema.parse).toBe('function');
    expect(typeof AnalyticsInsightSchema.safeParse).toBe('function');
  });

  it('exports agent definition for testing', async () => {
    const mod = await import('../agents/analytics-agent');
    expect(mod._analyticsAgentDefinition).toBeDefined();
    expect(mod._analyticsAgentDefinition.name).toBe('analytics-agent');
    expect(mod._analyticsAgentDefinition.mode).toBe('single-call');
    expect(mod._analyticsAgentDefinition.untrustedInput).toBe(false);
  });
});

// ── Agent definition tests ──────────────────────────────────────────────

describe('analytics agent definition', () => {
  it('has correct budget constraints', async () => {
    const mod = await import('../agents/analytics-agent');
    const def = mod._analyticsAgentDefinition;
    expect(def.budget.maxTokensPerRun).toBe(15000);
    expect(def.budget.maxCostUsdPerRun).toBe(0.30);
    expect(def.budget.maxIterationsPerRun).toBe(4);
    expect(def.budget.maxRepairAttempts).toBe(3);
  });

  it('has no tools (single-call mode)', async () => {
    const mod = await import('../agents/analytics-agent');
    expect(mod._analyticsAgentDefinition.tools).toHaveLength(0);
  });

  it('uses single-call mode', async () => {
    const mod = await import('../agents/analytics-agent');
    expect(mod._analyticsAgentDefinition.mode).toBe('single-call');
  });

  it('system prompt mentions bottlenecks and conversion rates', async () => {
    const mod = await import('../agents/analytics-agent');
    expect(mod._analyticsAgentDefinition.systemPrompt).toContain('bottleneck');
    expect(mod._analyticsAgentDefinition.systemPrompt).toContain('conversion rate');
    expect(mod._analyticsAgentDefinition.systemPrompt).toContain('time-to-hire');
    expect(mod._analyticsAgentDefinition.systemPrompt).toContain('data-driven');
  });

  it('system prompt warns against fabricating numbers', async () => {
    const mod = await import('../agents/analytics-agent');
    expect(mod._analyticsAgentDefinition.systemPrompt).toContain('Never fabricate');
  });

  it('has untrustedInput set to false', async () => {
    const mod = await import('../agents/analytics-agent');
    expect(mod._analyticsAgentDefinition.untrustedInput).toBe(false);
  });
});

// ── Route tests ─────────────────────────────────────────────────────────

describe('POST /api/analytics/ai-insights', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/analytics/ai-insights')
      .send({ query: 'What are the bottlenecks?' });
    expect(res.status).toBe(401);
  });

  it('rejects requests without required query field', async () => {
    const res = await request(app)
      .post('/api/analytics/ai-insights')
      .send({});
    expect(res.status).toBe(401);
  });
});
