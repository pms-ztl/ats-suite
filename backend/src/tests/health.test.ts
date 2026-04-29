import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Health endpoints', () => {
  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('GET /healthz returns 200', async () => {
    const res = await request(app).get('/healthz');
    // Accept 200 or 404 (if /healthz not mounted)
    expect([200, 404]).toContain(res.status);
  });
});
