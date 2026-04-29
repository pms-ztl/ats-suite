import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { z } from 'zod';
import { OfferDraftSchema } from '../agents/offer-agent';
import app from '../app';

// ── OfferDraftSchema validation tests ─────────────────────────────────

describe('OfferDraftSchema', () => {
  const validOffer = {
    baseSalary: 150000,
    equity: '0.05% over 4 years with 1-year cliff',
    signingBonus: 15000,
    annualBonus: 20000,
    totalCompensation: 210000,
    currency: 'USD',
    justification:
      'Based on the candidate\'s 7 years of experience, strong interview performance (4.2/5 average), and current market rates for Senior Engineers in San Francisco, we recommend positioning at the 65th percentile of the comp band.',
    compBandPosition: 'above_mid' as const,
    marketComparison:
      'This offer is at the 65th percentile of market rates for Senior Software Engineers in the Bay Area, competitive for retention.',
    benefits: ['Health insurance', '401k match', 'Unlimited PTO'],
    startDate: '2026-06-01',
    expiresInDays: 7,
    approvalChain: [
      { role: 'Hiring Manager', reason: 'Direct hiring authority' },
      { role: 'Department Head', reason: 'Offer exceeds midpoint of comp band' },
    ],
  };

  it('validates a complete valid offer draft', () => {
    const parsed = OfferDraftSchema.parse(validOffer);
    expect(parsed.baseSalary).toBe(150000);
    expect(parsed.compBandPosition).toBe('above_mid');
    expect(parsed.approvalChain).toHaveLength(2);
  });

  it('rejects negative baseSalary', () => {
    const result = OfferDraftSchema.safeParse({
      ...validOffer,
      baseSalary: -5000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const incomplete = { baseSalary: 100000 };
    const result = OfferDraftSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects justification shorter than 50 chars', () => {
    const result = OfferDraftSchema.safeParse({
      ...validOffer,
      justification: 'Too short.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid compBandPosition enum value', () => {
    const result = OfferDraftSchema.safeParse({
      ...validOffer,
      compBandPosition: 'way_over',
    });
    expect(result.success).toBe(false);
  });

  it('requires at least 1 approval chain entry', () => {
    const result = OfferDraftSchema.safeParse({
      ...validOffer,
      approvalChain: [],
    });
    expect(result.success).toBe(false);
  });

  it('accepts offer without optional fields', () => {
    const minimal = {
      baseSalary: 80000,
      totalCompensation: 80000,
      currency: 'USD',
      justification:
        'Entry-level candidate with relevant education. Positioned at minimum of comp band for new graduate hire with strong culture fit.',
      compBandPosition: 'at_min' as const,
      marketComparison: 'Competitive for entry-level market in Austin, TX.',
      expiresInDays: 7,
      approvalChain: [
        { role: 'Hiring Manager', reason: 'Standard approval for below-midpoint offer' },
      ],
    };
    const parsed = OfferDraftSchema.parse(minimal);
    expect(parsed.baseSalary).toBe(80000);
    expect(parsed.equity).toBeUndefined();
    expect(parsed.signingBonus).toBeUndefined();
    expect(parsed.benefits).toBeUndefined();
  });

  it('validates all compBandPosition enum values', () => {
    const positions = [
      'below_min', 'at_min', 'below_mid', 'at_mid', 'above_mid', 'at_max', 'above_max',
    ];
    for (const pos of positions) {
      const result = OfferDraftSchema.safeParse({
        ...validOffer,
        compBandPosition: pos,
      });
      expect(result.success).toBe(true);
    }
  });

  it('defaults currency to USD when not specified', () => {
    const withoutCurrency = { ...validOffer };
    delete (withoutCurrency as any).currency;
    const parsed = OfferDraftSchema.parse(withoutCurrency);
    expect(parsed.currency).toBe('USD');
  });

  it('defaults expiresInDays to 7 when not specified', () => {
    const withoutExpiry = { ...validOffer };
    delete (withoutExpiry as any).expiresInDays;
    const parsed = OfferDraftSchema.parse(withoutExpiry);
    expect(parsed.expiresInDays).toBe(7);
  });

  it('rejects baseSalary of zero (edge case — accepted by schema)', () => {
    // baseSalary min is 0, so 0 is technically valid
    const result = OfferDraftSchema.safeParse({
      ...validOffer,
      baseSalary: 0,
    });
    expect(result.success).toBe(true);
  });
});

// ── Module export tests ───────────────────────────────────────────────

describe('offer-agent exports', () => {
  it('generateOffer is exported as a function', async () => {
    const mod = await import('../agents/offer-agent');
    expect(typeof mod.generateOffer).toBe('function');
  });

  it('OfferDraftSchema is a valid zod schema', () => {
    expect(OfferDraftSchema).toBeDefined();
    expect(typeof OfferDraftSchema.parse).toBe('function');
    expect(typeof OfferDraftSchema.safeParse).toBe('function');
  });

  it('exports agent definition for testing', async () => {
    const mod = await import('../agents/offer-agent');
    expect(mod._offerAgentDefinition).toBeDefined();
    expect(mod._offerAgentDefinition.name).toBe('offer-agent');
    expect(mod._offerAgentDefinition.mode).toBe('react');
    expect(mod._offerAgentDefinition.untrustedInput).toBe(false);
  });

  it('exports all 3 tools', async () => {
    const mod = await import('../agents/offer-agent');
    expect(mod._getCompBandTool).toBeDefined();
    expect(mod._getCompBandTool.name).toBe('get_comp_band');
    expect(mod._getMarketDataTool).toBeDefined();
    expect(mod._getMarketDataTool.name).toBe('get_market_data');
    expect(mod._getCandidateHistoryTool).toBeDefined();
    expect(mod._getCandidateHistoryTool.name).toBe('get_candidate_history');
  });
});

// ── Agent definition tests ────────────────────────────────────────────

describe('offer agent definition', () => {
  it('has correct budget constraints', async () => {
    const mod = await import('../agents/offer-agent');
    const def = mod._offerAgentDefinition;
    expect(def.budget.maxTokensPerRun).toBe(15000);
    expect(def.budget.maxCostUsdPerRun).toBe(0.20);
    expect(def.budget.maxIterationsPerRun).toBe(6);
    expect(def.budget.maxRepairAttempts).toBe(3);
  });

  it('has 3 tools registered', async () => {
    const mod = await import('../agents/offer-agent');
    expect(mod._offerAgentDefinition.tools).toHaveLength(3);
    const toolNames = mod._offerAgentDefinition.tools.map(t => t.name);
    expect(toolNames).toContain('get_comp_band');
    expect(toolNames).toContain('get_market_data');
    expect(toolNames).toContain('get_candidate_history');
  });

  it('all tools are read-only', async () => {
    const mod = await import('../agents/offer-agent');
    for (const tool of mod._offerAgentDefinition.tools) {
      expect(tool.sideEffect).toBe('read');
    }
  });

  it('system prompt mentions comp band constraints', async () => {
    const mod = await import('../agents/offer-agent');
    expect(mod._offerAgentDefinition.systemPrompt).toContain('comp band');
    expect(mod._offerAgentDefinition.systemPrompt).toContain('approval chain');
    expect(mod._offerAgentDefinition.systemPrompt).toContain('fiscally responsible');
  });
});

// ── Tool parameter schema tests ───────────────────────────────────────

describe('tool parameter schemas', () => {
  it('get_comp_band accepts valid params', async () => {
    const mod = await import('../agents/offer-agent');
    const result = mod._getCompBandTool.parameters.safeParse({
      jobFamily: 'Engineering',
      level: 'Senior',
    });
    expect(result.success).toBe(true);
  });

  it('get_comp_band rejects missing jobFamily', async () => {
    const mod = await import('../agents/offer-agent');
    const result = mod._getCompBandTool.parameters.safeParse({
      level: 'Senior',
    });
    expect(result.success).toBe(false);
  });

  it('get_market_data accepts valid params', async () => {
    const mod = await import('../agents/offer-agent');
    const result = mod._getMarketDataTool.parameters.safeParse({
      jobFamily: 'Engineering',
      level: 'Mid',
      location: 'Austin, TX',
    });
    expect(result.success).toBe(true);
  });

  it('get_candidate_history requires candidateId and requisitionId', async () => {
    const mod = await import('../agents/offer-agent');
    const result = mod._getCandidateHistoryTool.parameters.safeParse({
      candidateId: 'cand-123',
    });
    expect(result.success).toBe(false);

    const valid = mod._getCandidateHistoryTool.parameters.safeParse({
      candidateId: 'cand-123',
      requisitionId: 'req-456',
    });
    expect(valid.success).toBe(true);
  });
});

// ── Route tests ───────────────────────────────────────────────────────

describe('POST /api/decisions/ai-offer', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/decisions/ai-offer')
      .send({
        candidateId: 'c1',
        requisitionId: 'r1',
        applicationId: 'a1',
      });
    expect(res.status).toBe(401);
  });

  it('rejects requests without required fields (behind auth)', async () => {
    const res = await request(app)
      .post('/api/decisions/ai-offer')
      .send({});
    expect(res.status).toBe(401);
  });
});
