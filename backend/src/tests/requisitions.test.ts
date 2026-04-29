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

describe('Requisitions API', () => {
  describe('GET /api/requisitions', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/requisitions');
      expect(res.status).toBe(401);
    });

    it('returns 200 with valid token', async () => {
      const res = await request(app)
        .get('/api/requisitions')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
    });

    it('supports ?status= filter', async () => {
      const res = await request(app)
        .get('/api/requisitions?status=OPEN')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('POST /api/requisitions', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/requisitions')
        .send({ title: 'Engineer' });
      expect(res.status).toBe(401);
    });

    it('returns 422 for invalid body', async () => {
      const res = await request(app)
        .post('/api/requisitions')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({});
      // Zod validation failure — expect 422 or 400
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('GET /api/requisitions/:id', () => {
    it('returns 404 for nonexistent ID', async () => {
      const res = await request(app)
        .get('/api/requisitions/nonexistent-id-000')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/requisitions/:id', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .patch('/api/requisitions/some-id')
        .send({ title: 'Updated' });
      expect(res.status).toBe(401);
    });
  });
});
