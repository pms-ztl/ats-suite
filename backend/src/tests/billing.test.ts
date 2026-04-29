import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { getDailyCeiling, checkTenantBudget, isAgentEnabled, setAgentEnabled } from '../lib/billing';
import { signAccessToken } from '../lib/jwt';
import { prisma } from '../utils/prisma';
import app from '../app';

// Get typed reference to mocked prisma (mocked in setup.ts)
const mockPrisma = prisma as any;

function makeToken() {
  return signAccessToken({
    sub: 'user-001',
    email: 'admin@acme.com',
    role: 'ADMIN',
    tenantId: 'tenant-001',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.integrationConfig.findFirst.mockResolvedValue(null);
  mockPrisma.agentRun.aggregate.mockResolvedValue({ _sum: { costUsd: 0 } });
  mockPrisma.agentRun.findMany.mockResolvedValue([]);
});

// ── Unit tests for billing service ──────────────────────────────────────

describe('getDailyCeiling', () => {
  it('returns default $50 when no config exists', async () => {
    const ceiling = await getDailyCeiling('tenant-001');
    expect(ceiling).toBe(50);
  });

  it('returns custom ceiling from IntegrationConfig', async () => {
    mockPrisma.integrationConfig.findFirst.mockResolvedValue({
      id: 'cfg-1',
      config: { dailyCeilingUsd: 100 },
    });
    const ceiling = await getDailyCeiling('tenant-001');
    expect(ceiling).toBe(100);
  });
});

describe('checkTenantBudget', () => {
  it('returns allowed:true when no runs today', async () => {
    const result = await checkTenantBudget('tenant-001');
    expect(result.allowed).toBe(true);
    expect(result.currentCostUsd).toBe(0);
    expect(result.ceilingUsd).toBe(50);
  });

  it('returns allowed:false when cost exceeds ceiling', async () => {
    mockPrisma.agentRun.aggregate.mockResolvedValue({ _sum: { costUsd: 55 } });
    const result = await checkTenantBudget('tenant-001');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Daily cost ceiling');
    expect(result.currentCostUsd).toBe(55);
  });

  it('returns allowed:false when cost equals ceiling exactly', async () => {
    mockPrisma.agentRun.aggregate.mockResolvedValue({ _sum: { costUsd: 50 } });
    const result = await checkTenantBudget('tenant-001');
    expect(result.allowed).toBe(false);
  });
});

describe('isAgentEnabled', () => {
  it('returns true by default when no kill switch config', async () => {
    const enabled = await isAgentEnabled('tenant-001', 'resume-parser');
    expect(enabled).toBe(true);
  });

  it('returns false when agent is in disabled list', async () => {
    mockPrisma.integrationConfig.findFirst.mockResolvedValue({
      id: 'cfg-1',
      config: { disabledAgents: ['resume-parser'] },
    });
    const enabled = await isAgentEnabled('tenant-001', 'resume-parser');
    expect(enabled).toBe(false);
  });

  it('returns true when agent is not in disabled list', async () => {
    mockPrisma.integrationConfig.findFirst.mockResolvedValue({
      id: 'cfg-1',
      config: { disabledAgents: ['candidate-screener'] },
    });
    const enabled = await isAgentEnabled('tenant-001', 'resume-parser');
    expect(enabled).toBe(true);
  });
});

describe('setAgentEnabled', () => {
  it('creates config when none exists and disables agent', async () => {
    await setAgentEnabled('tenant-001', 'resume-parser', false);
    expect(mockPrisma.integrationConfig.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 'tenant-001',
        provider: 'AGENT_KILL_SWITCH',
        config: { disabledAgents: ['resume-parser'] },
      }),
    });
  });

  it('updates existing config to enable agent', async () => {
    mockPrisma.integrationConfig.findFirst.mockResolvedValue({
      id: 'cfg-1',
      config: { disabledAgents: ['resume-parser', 'jd-author'] },
    });
    await setAgentEnabled('tenant-001', 'resume-parser', true);
    expect(mockPrisma.integrationConfig.update).toHaveBeenCalledWith({
      where: { id: 'cfg-1' },
      data: { config: { disabledAgents: ['jd-author'] } },
    });
  });
});

// ── Route tests (auth enforcement) ──────────────────────────────────────

describe('GET /api/billing/usage', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/billing/usage');
    expect(res.status).toBe(401);
  });

  it('returns 200 with valid token', async () => {
    const token = makeToken();
    const res = await request(app)
      .get('/api/billing/usage')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalRuns');
    expect(res.body.data).toHaveProperty('totalCostUsd');
    expect(res.body.data).toHaveProperty('byAgent');
  });
});

describe('GET /api/billing/budget', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/billing/budget');
    expect(res.status).toBe(401);
  });

  it('returns 200 with valid token', async () => {
    const token = makeToken();
    const res = await request(app)
      .get('/api/billing/budget')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('allowed');
    expect(res.body.data).toHaveProperty('ceilingUsd');
  });
});

describe('GET /api/billing/agents', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/billing/agents');
    expect(res.status).toBe(401);
  });

  it('returns 200 with agent status list', async () => {
    const token = makeToken();
    const res = await request(app)
      .get('/api/billing/agents')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(5);
    expect(res.body.data[0]).toHaveProperty('agentType');
    expect(res.body.data[0]).toHaveProperty('enabled');
  });
});

describe('POST /api/billing/agents/:type/toggle', () => {
  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/billing/agents/resume-parser/toggle')
      .send({ enabled: false });
    expect(res.status).toBe(401);
  });

  it('returns 400 without enabled field', async () => {
    const token = makeToken();
    const res = await request(app)
      .post('/api/billing/agents/resume-parser/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 200 with valid toggle', async () => {
    const token = makeToken();
    const res = await request(app)
      .post('/api/billing/agents/resume-parser/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ enabled: false });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ agentType: 'resume-parser', enabled: false });
  });
});
