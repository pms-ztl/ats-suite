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

describe('Candidates API', () => {
  describe('GET /api/candidates', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/candidates');
      expect(res.status).toBe(401);
    });

    it('returns 200 with valid token', async () => {
      const res = await request(app)
        .get('/api/candidates')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
    });

    it('returns array in data field', async () => {
      const res = await request(app)
        .get('/api/candidates')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('supports ?search= param', async () => {
      const res = await request(app)
        .get('/api/candidates?search=john')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });

    it('supports ?page=&pageSize= params', async () => {
      const res = await request(app)
        .get('/api/candidates?page=1&pageSize=5')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('POST /api/candidates', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .send({ firstName: 'Test', lastName: 'User', email: 'test@example.com' });
      expect(res.status).toBe(401);
    });

    it('returns 422 for empty body (Zod validation)', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({});
      // Zod validation failure — expect 422 or 400
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('GET /api/candidates/:id', () => {
    it('returns 404 for nonexistent ID', async () => {
      const res = await request(app)
        .get('/api/candidates/nonexistent-id-000')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(404);
    });
  });
});
