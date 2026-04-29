import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Middleware — security headers', () => {
  it('GET /api/health sets X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('GET /api/health sets Referrer-Policy header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['referrer-policy']).toBeDefined();
  });

  it('GET /api/health does not expose X-Powered-By', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('Middleware — rate limiter', () => {
  it('includes ratelimit headers', async () => {
    const res = await request(app).get('/api/health');
    // express-rate-limit with standardHeaders: true emits RateLimit-* headers
    const hasRateLimit =
      res.headers['ratelimit-limit'] !== undefined ||
      res.headers['x-ratelimit-limit'] !== undefined ||
      res.headers['ratelimit-policy'] !== undefined;
    expect(hasRateLimit).toBe(true);
  });
});

describe('Middleware — CORS', () => {
  it('preflight returns proper headers for localhost:3000', async () => {
    const res = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });
});
