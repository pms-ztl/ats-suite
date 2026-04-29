import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { signAccessToken } from '../lib/jwt';

function makeToken() {
  return signAccessToken({
    sub: 'test-user-id',
    email: 'test@acme.com',
    role: 'ADMIN',
    tenantId: 'test-tenant-id',
  });
}

describe('Scheduling API', () => {
  describe('GET /api/scheduling', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/scheduling');
      expect(res.status).toBe(401);
    });

    it('returns 200 with valid token', async () => {
      const res = await request(app)
        .get('/api/scheduling')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/scheduling/availability', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/scheduling/availability');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/scheduling', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/scheduling')
        .send({ title: 'Interview' });
      expect(res.status).toBe(401);
    });

    it('returns 422 for invalid body with token', async () => {
      const res = await request(app)
        .post('/api/scheduling')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({});
      // Zod validation failure — expect 422 or 400
      expect([400, 422]).toContain(res.status);
    });
  });
});
