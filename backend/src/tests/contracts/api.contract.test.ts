import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { ApiOkSchema, ApiErrorSchema, HealthSchema } from './schemas';

describe('API Contract Tests', () => {
  describe('Health endpoint contract', () => {
    it('GET /api/health matches schema', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);

      const parsed = ApiOkSchema.safeParse(res.body);
      expect(parsed.success).toBe(true);

      if (parsed.success) {
        const health = HealthSchema.safeParse(parsed.data.data);
        expect(health.success).toBe(true);
      }
    });
  });

  describe('Auth endpoint contracts', () => {
    it('POST /api/auth/login with bad data returns error envelope', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bad', password: '' });

      // Zod parse error → 422, AppError → 4xx — either way must have error envelope
      expect(res.status).toBeGreaterThanOrEqual(400);

      const parsed = ApiErrorSchema.safeParse(res.body);
      expect(parsed.success).toBe(true);
    });

    it('GET /api/auth/me without token returns 401 error envelope', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);

      const parsed = ApiErrorSchema.safeParse(res.body);
      expect(parsed.success).toBe(true);
    });
  });

  describe('Protected route contracts (require 401 without token)', () => {
    const routes = [
      { method: 'get', path: '/api/candidates' },
      { method: 'get', path: '/api/requisitions' },
      { method: 'get', path: '/api/interviews' },
      { method: 'get', path: '/api/screening/intake' },
      { method: 'get', path: '/api/analytics' },
    ] as const;

    for (const route of routes) {
      it(`${route.method.toUpperCase()} ${route.path} returns 401 error envelope`, async () => {
        const res = await (request(app) as any)[route.method](route.path);
        expect(res.status).toBe(401);

        const parsed = ApiErrorSchema.safeParse(res.body);
        expect(parsed.success).toBe(true);
      });
    }
  });
});
