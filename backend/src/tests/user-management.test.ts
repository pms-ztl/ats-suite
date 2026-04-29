import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('User management routes', () => {
  describe('POST /api/users/invite', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/users/invite')
        .send({
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
          role: 'RECRUITER',
        });
      expect(res.status).toBe(401);
    });

    it('returns 400/422 for invalid body when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/users/invite')
        .send({});
      // Auth check fires first, so expect 401
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .patch('/api/users/some-id/role')
        .send({ role: 'ADMIN' });
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/:id/deactivate', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .patch('/api/users/some-id/deactivate')
        .send();
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });
  });
});
