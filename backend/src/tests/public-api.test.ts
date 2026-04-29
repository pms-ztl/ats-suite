import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Public API endpoints', () => {
  // ── GET /api/public/jobs ───────────────────────────────────────────────

  it('GET /api/public/jobs returns 200 without auth', async () => {
    const res = await request(app).get('/api/public/jobs');
    expect(res.status).toBe(200);
    // Response should have data array and meta
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('page');
    expect(res.body.meta).toHaveProperty('pageSize');
  });

  it('GET /api/public/jobs does NOT require Authorization header', async () => {
    const res = await request(app).get('/api/public/jobs');
    // Should succeed without any auth headers
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('GET /api/public/jobs supports search parameter', async () => {
    const res = await request(app).get('/api/public/jobs?search=engineer');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/public/jobs supports pagination parameters', async () => {
    const res = await request(app).get('/api/public/jobs?page=1&pageSize=5');
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.pageSize).toBe(5);
  });

  it('GET /api/public/jobs supports department filter', async () => {
    const res = await request(app).get('/api/public/jobs?department=Engineering');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/public/jobs supports location filter', async () => {
    const res = await request(app).get('/api/public/jobs?location=Remote');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/public/jobs supports tenant filter', async () => {
    const res = await request(app).get('/api/public/jobs?tenant=acme');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/public/jobs caps pageSize at 50', async () => {
    const res = await request(app).get('/api/public/jobs?pageSize=200');
    expect(res.status).toBe(200);
    expect(res.body.meta.pageSize).toBe(50);
  });

  // ── GET /api/public/jobs/:slug ─────────────────────────────────────────

  it('GET /api/public/jobs/:slug returns 404 for nonexistent slug', async () => {
    const res = await request(app).get('/api/public/jobs/does-not-exist-xyz');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  // ── POST /api/public/apply ─────────────────────────────────────────────

  it('POST /api/public/apply validates required fields (422)', async () => {
    const res = await request(app)
      .post('/api/public/apply')
      .send({});
    // Zod validation returns 422
    expect(res.status).toBe(422);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/public/apply requires jobPostingId', async () => {
    const res = await request(app)
      .post('/api/public/apply')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      });
    expect(res.status).toBe(422);
  });

  it('POST /api/public/apply validates email format', async () => {
    const res = await request(app)
      .post('/api/public/apply')
      .send({
        jobPostingId: 'some-id',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'not-an-email',
      });
    expect(res.status).toBe(422);
  });

  it('POST /api/public/apply returns 404 for invalid jobPostingId', async () => {
    const res = await request(app)
      .post('/api/public/apply')
      .send({
        jobPostingId: 'nonexistent-id',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      });
    expect(res.status).toBe(404);
  });

  // ── GET /api/public/status ─────────────────────────────────────────────

  it('GET /api/public/status requires email parameter', async () => {
    const res = await request(app).get('/api/public/status');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/public/status returns 200 with valid email', async () => {
    const res = await request(app).get(
      '/api/public/status?email=test@example.com'
    );
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.email).toBe('test@example.com');
    expect(Array.isArray(res.body.data.applications)).toBe(true);
    expect(typeof res.body.data.totalApplications).toBe('number');
  });

  it('GET /api/public/status returns empty applications for unknown email', async () => {
    const res = await request(app).get(
      '/api/public/status?email=nobody@nowhere.test'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.applications).toHaveLength(0);
    expect(res.body.data.totalApplications).toBe(0);
  });

  // ── Rate limiting headers ──────────────────────────────────────────────

  it('Public endpoints include rate limiting headers', async () => {
    const res = await request(app).get('/api/public/jobs');
    expect(res.status).toBe(200);
    // Standard rate limit headers
    expect(res.headers).toHaveProperty('ratelimit-limit');
    expect(res.headers).toHaveProperty('ratelimit-remaining');
  });
});
