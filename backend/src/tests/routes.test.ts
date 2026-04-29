import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

const PROTECTED_ROUTES = [
  '/api/candidates',
  '/api/requisitions',
  '/api/interviews',
  '/api/screening',
  '/api/analytics',
  '/api/bias',
  '/api/compliance',
  '/api/sourcing',
  '/api/decisions',
  '/api/scheduling',
  '/api/mobility',
  '/api/onboarding',
];

describe('Protected routes require auth', () => {
  for (const route of PROTECTED_ROUTES) {
    it(`GET ${route} returns 401 without token`, async () => {
      const res = await request(app).get(route);
      expect(res.status).toBe(401);
    });
  }
});
