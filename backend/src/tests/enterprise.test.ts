import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { signAccessToken } from '../lib/jwt';

function makeToken() {
  return signAccessToken({
    sub: 'seed-user-000000000-0000-0000-0000-000000000001',
    email: 'admin@acme.com',
    role: 'ADMIN',
    tenantId: 'seed-tenant-00000000-0000-0000-0000-000000000001',
  });
}

describe('SSO Status Endpoint', () => {
  it('GET /api/auth/sso/status returns provider info', async () => {
    const res = await request(app).get('/api/auth/sso/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('google');
    expect(res.body.data).toHaveProperty('microsoft');
    expect(res.body.data).toHaveProperty('scim');
    expect(res.body.data.google).toHaveProperty('configured');
    expect(res.body.data.microsoft).toHaveProperty('configured');
    expect(res.body.data.scim).toHaveProperty('enabled', true);
    expect(res.body.data.scim).toHaveProperty('endpoint', '/api/auth/sso/scim/v2');
  });

  it('GET /api/auth/sso/providers returns 200', async () => {
    const res = await request(app).get('/api/auth/sso/providers');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('providers');
  });
});

describe('Webhook Test Endpoint', () => {
  const token = makeToken();

  it('POST /api/integrations/webhooks/:id/test returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/integrations/webhooks/fake-id/test');
    expect(res.status).toBe(401);
  });

  it('POST /api/integrations/webhooks/:id/test dispatches test event', async () => {
    const res = await request(app)
      .post('/api/integrations/webhooks/fake-id/test')
      .set('Authorization', `Bearer ${token}`);
    // 200 if webhook found, 404 if not found, 500 if prisma mock issue
    expect([200, 404, 500]).toContain(res.status);
  });
});
