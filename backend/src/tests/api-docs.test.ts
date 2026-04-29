import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('API Docs & Metrics', () => {
  it('GET /api/docs returns 200 or 301 (Swagger UI)', async () => {
    const res = await request(app).get('/api/docs/');
    // swagger-ui-express may serve directly (200) or redirect (301/302)
    expect([200, 301, 302]).toContain(res.status);
  });

  it('GET /api/openapi.json returns valid JSON with openapi field', async () => {
    const res = await request(app).get('/api/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('openapi');
    expect(res.body.openapi).toMatch(/^3\./);
  });

  it('GET /metrics returns 200 with prometheus format', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    // Prometheus text format typically includes content type with 'text/plain' or 'text/plain; version=0.0.4'
    expect(res.headers['content-type']).toMatch(/text/);
  });
});
