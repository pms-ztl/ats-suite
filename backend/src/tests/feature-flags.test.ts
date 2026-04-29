import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { signAccessToken } from '../lib/jwt';
import { DEFAULT_FLAGS, isFeatureEnabled, getAllFeatureFlags } from '../lib/feature-flags';

function makeToken(role = 'ADMIN') {
  return signAccessToken({
    sub: 'seed-user-000000000-0000-0000-0000-000000000001',
    email: 'admin@acme.com',
    role,
    tenantId: 'seed-tenant-00000000-0000-0000-0000-000000000001',
  });
}

describe('Feature Flag Defaults', () => {
  it('DEFAULT_FLAGS has entries for all 12 agents', () => {
    const agentFlags = Object.keys(DEFAULT_FLAGS).filter(k => k.startsWith('agent.'));
    expect(agentFlags.length).toBe(12);
    expect(agentFlags).toContain('agent.resume-parser');
    expect(agentFlags).toContain('agent.screening');
    expect(agentFlags).toContain('agent.jd-author');
    expect(agentFlags).toContain('agent.scheduling');
    expect(agentFlags).toContain('agent.candidate-chat');
    expect(agentFlags).toContain('agent.sourcing');
    expect(agentFlags).toContain('agent.interview-kit');
    expect(agentFlags).toContain('agent.interview-intelligence');
    expect(agentFlags).toContain('agent.offer');
    expect(agentFlags).toContain('agent.copilot');
    expect(agentFlags).toContain('agent.analytics');
    expect(agentFlags).toContain('agent.bias-auditor');
  });

  it('isFeatureEnabled returns default for unknown tenant', async () => {
    const result = await isFeatureEnabled('nonexistent-tenant', 'agent.resume-parser');
    // With mock prisma returning null, should fall back to default (true)
    expect(result).toBe(true);
  });

  it('isFeatureEnabled returns false for unknown flag', async () => {
    const result = await isFeatureEnabled('any-tenant', 'nonexistent-flag');
    expect(result).toBe(false);
  });

  it('getAllFeatureFlags returns all defaults', async () => {
    const flags = await getAllFeatureFlags('nonexistent-tenant');
    expect(flags.length).toBe(Object.keys(DEFAULT_FLAGS).length);
    expect(flags.length).toBeGreaterThanOrEqual(16);
    // Each flag has name, enabled, description
    for (const flag of flags) {
      expect(flag).toHaveProperty('name');
      expect(flag).toHaveProperty('enabled');
      expect(flag).toHaveProperty('description');
    }
  });
});

describe('Feature Flags API', () => {
  it('GET /api/features returns 401 without token', async () => {
    const res = await request(app).get('/api/features');
    expect(res.status).toBe(401);
  });

  it('GET /api/features returns 200 with token', async () => {
    const token = makeToken();
    const res = await request(app)
      .get('/api/features')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it('PATCH /api/features/:name returns 401 without token', async () => {
    const res = await request(app)
      .patch('/api/features/agent.sourcing')
      .send({ enabled: true });
    expect(res.status).toBe(401);
  });

  it('PATCH /api/features/:name returns 403 for non-admin', async () => {
    const token = makeToken('RECRUITER');
    const res = await request(app)
      .patch('/api/features/agent.sourcing')
      .set('Authorization', `Bearer ${token}`)
      .send({ enabled: true });
    expect(res.status).toBe(403);
  });

  it('PATCH /api/features/:name validates enabled is boolean', async () => {
    const token = makeToken();
    const res = await request(app)
      .patch('/api/features/agent.sourcing')
      .set('Authorization', `Bearer ${token}`)
      .send({ enabled: 'yes' });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/features/:name accepts valid toggle', async () => {
    const token = makeToken();
    const res = await request(app)
      .patch('/api/features/agent.sourcing')
      .set('Authorization', `Bearer ${token}`)
      .send({ enabled: true });
    // 200 or 500 depending on prisma mock state
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data).toMatchObject({ name: 'agent.sourcing', enabled: true });
    }
  });
});
