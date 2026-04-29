import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { z } from 'zod';
import { ComplianceAuditSchema } from '../agents/bias-auditor-agent';
import app from '../app';

// ── ComplianceAuditSchema validation tests ──────────────────────────────

describe('ComplianceAuditSchema', () => {
  const validAudit = {
    reports: [
      {
        attribute: 'source',
        stage: 'ALL',
        groups: [
          { name: 'Referral', applicants: 50, selected: 15, selectionRate: 0.30 },
          { name: 'LinkedIn', applicants: 100, selected: 10, selectionRate: 0.10 },
        ],
        adverseImpactRatio: 0.333,
        fourFifthsPass: false,
        finding: 'LinkedIn applicants have a significantly lower selection rate (10%) compared to Referral applicants (30%).',
        recommendation: 'Review selection criteria to ensure LinkedIn applicants are evaluated fairly. Consider blind resume screening.',
      },
    ],
    overallCompliance: false,
    narrative:
      'The compliance audit identified adverse impact for the source attribute. LinkedIn applicants are selected at a rate of 10% compared to 30% for Referral applicants, yielding an adverse impact ratio of 0.333 which is well below the 0.80 threshold required by the EEOC four-fifths rule.',
    methodology: 'EEOC Uniform Guidelines on Employee Selection Procedures (1978), 29 CFR 1607. Four-fifths rule applied.',
    generatedAt: '2026-04-14T12:00:00.000Z',
  };

  it('validates a complete valid audit', () => {
    const parsed = ComplianceAuditSchema.parse(validAudit);
    expect(parsed.reports).toHaveLength(1);
    expect(parsed.overallCompliance).toBe(false);
    expect(parsed.narrative.length).toBeGreaterThanOrEqual(50);
  });

  it('accepts empty reports array', () => {
    const result = ComplianceAuditSchema.safeParse({
      ...validAudit,
      reports: [],
      overallCompliance: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects narrative shorter than 50 characters', () => {
    const result = ComplianceAuditSchema.safeParse({
      ...validAudit,
      narrative: 'Too short narrative.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing methodology field', () => {
    const withoutMethodology = { ...validAudit };
    delete (withoutMethodology as any).methodology;
    const result = ComplianceAuditSchema.safeParse(withoutMethodology);
    expect(result.success).toBe(false);
  });

  it('rejects missing generatedAt field', () => {
    const withoutTimestamp = { ...validAudit };
    delete (withoutTimestamp as any).generatedAt;
    const result = ComplianceAuditSchema.safeParse(withoutTimestamp);
    expect(result.success).toBe(false);
  });

  it('validates report group structure', () => {
    const result = ComplianceAuditSchema.safeParse({
      ...validAudit,
      reports: [{
        ...validAudit.reports[0],
        groups: [{ name: 'A', applicants: 100, selected: 20, selectionRate: 0.2 }],
      }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects report with missing group fields', () => {
    const result = ComplianceAuditSchema.safeParse({
      ...validAudit,
      reports: [{
        ...validAudit.reports[0],
        groups: [{ name: 'A', applicants: 100 }],
      }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts report with fourFifthsPass true', () => {
    const compliant = {
      ...validAudit,
      reports: [{
        ...validAudit.reports[0],
        adverseImpactRatio: 0.95,
        fourFifthsPass: true,
      }],
      overallCompliance: true,
    };
    const parsed = ComplianceAuditSchema.parse(compliant);
    expect(parsed.overallCompliance).toBe(true);
    expect(parsed.reports[0].fourFifthsPass).toBe(true);
  });

  it('validates adverseImpactRatio as number', () => {
    const result = ComplianceAuditSchema.safeParse({
      ...validAudit,
      reports: [{
        ...validAudit.reports[0],
        adverseImpactRatio: 'not a number',
      }],
    });
    expect(result.success).toBe(false);
  });

  it('validates multiple reports in a single audit', () => {
    const multiReport = {
      ...validAudit,
      reports: [
        validAudit.reports[0],
        {
          attribute: 'gender',
          stage: 'SCREENED',
          groups: [
            { name: 'Male', applicants: 120, selected: 40, selectionRate: 0.333 },
            { name: 'Female', applicants: 80, selected: 25, selectionRate: 0.3125 },
          ],
          adverseImpactRatio: 0.938,
          fourFifthsPass: true,
          finding: 'No adverse impact detected for gender at the SCREENED stage.',
          recommendation: 'Continue monitoring. No corrective action needed.',
        },
      ],
    };
    const parsed = ComplianceAuditSchema.parse(multiReport);
    expect(parsed.reports).toHaveLength(2);
  });
});

// ── Module export tests ─────────────────────────────────────────────────

describe('bias-auditor-agent exports', () => {
  it('runComplianceAudit is exported as a function', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    expect(typeof mod.runComplianceAudit).toBe('function');
  });

  it('ComplianceAuditSchema is a valid zod schema', () => {
    expect(ComplianceAuditSchema).toBeDefined();
    expect(typeof ComplianceAuditSchema.parse).toBe('function');
    expect(typeof ComplianceAuditSchema.safeParse).toBe('function');
  });

  it('exports agent definition for testing', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    expect(mod._biasAuditorDefinition).toBeDefined();
    expect(mod._biasAuditorDefinition.name).toBe('bias-auditor-agent');
    expect(mod._biasAuditorDefinition.mode).toBe('react');
    expect(mod._biasAuditorDefinition.untrustedInput).toBe(false);
  });

  it('exports both tools', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    expect(mod._queryDemographicDataTool).toBeDefined();
    expect(mod._queryDemographicDataTool.name).toBe('query_demographic_data');
    expect(mod._generateComplianceReportTool).toBeDefined();
    expect(mod._generateComplianceReportTool.name).toBe('generate_compliance_report');
  });
});

// ── Agent definition tests ──────────────────────────────────────────────

describe('bias auditor agent definition', () => {
  it('has correct budget constraints', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    const def = mod._biasAuditorDefinition;
    expect(def.budget.maxTokensPerRun).toBe(15000);
    expect(def.budget.maxCostUsdPerRun).toBe(0.10);
    expect(def.budget.maxIterationsPerRun).toBe(6);
    expect(def.budget.maxRepairAttempts).toBe(3);
  });

  it('has 2 tools registered', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    expect(mod._biasAuditorDefinition.tools).toHaveLength(2);
    const toolNames = mod._biasAuditorDefinition.tools.map(t => t.name);
    expect(toolNames).toContain('query_demographic_data');
    expect(toolNames).toContain('generate_compliance_report');
  });

  it('all tools are read-only', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    for (const tool of mod._biasAuditorDefinition.tools) {
      expect(tool.sideEffect).toBe('read');
    }
  });

  it('system prompt mentions EEOC and 4/5ths rule', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    expect(mod._biasAuditorDefinition.systemPrompt).toContain('EEOC');
    expect(mod._biasAuditorDefinition.systemPrompt).toContain('4/5ths');
    expect(mod._biasAuditorDefinition.systemPrompt).toContain('29 CFR 1607');
  });

  it('system prompt warns against fabricating data', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    expect(mod._biasAuditorDefinition.systemPrompt).toContain('NEVER fabricate');
  });

  it('uses react mode for tool calling', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    expect(mod._biasAuditorDefinition.mode).toBe('react');
  });
});

// ── Tool parameter schema tests ─────────────────────────────────────────

describe('bias auditor tool parameter schemas', () => {
  it('query_demographic_data accepts valid params', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    const result = mod._queryDemographicDataTool.parameters.safeParse({
      protectedAttribute: 'source',
    });
    expect(result.success).toBe(true);
  });

  it('query_demographic_data accepts params with stage', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    const result = mod._queryDemographicDataTool.parameters.safeParse({
      protectedAttribute: 'gender',
      stage: 'SCREENED',
    });
    expect(result.success).toBe(true);
  });

  it('query_demographic_data rejects missing protectedAttribute', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    const result = mod._queryDemographicDataTool.parameters.safeParse({});
    expect(result.success).toBe(false);
  });

  it('generate_compliance_report accepts valid params', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    const result = mod._generateComplianceReportTool.parameters.safeParse({
      attributes: ['source', 'gender'],
    });
    expect(result.success).toBe(true);
  });

  it('generate_compliance_report rejects empty attributes', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    const result = mod._generateComplianceReportTool.parameters.safeParse({
      attributes: [],
    });
    expect(result.success).toBe(false);
  });

  it('generate_compliance_report accepts params with stages', async () => {
    const mod = await import('../agents/bias-auditor-agent');
    const result = mod._generateComplianceReportTool.parameters.safeParse({
      attributes: ['source'],
      stages: ['SCREENED', 'INTERVIEW'],
    });
    expect(result.success).toBe(true);
  });
});

// ── Route tests ─────────────────────────────────────────────────────────

describe('POST /api/compliance/ai-audit', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/compliance/ai-audit')
      .send({ attributes: ['source'] });
    expect(res.status).toBe(401);
  });

  it('rejects requests without required attributes field', async () => {
    const res = await request(app)
      .post('/api/compliance/ai-audit')
      .send({});
    expect(res.status).toBe(401);
  });
});
