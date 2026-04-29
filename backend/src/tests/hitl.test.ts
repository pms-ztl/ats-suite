import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('HITL & Agent Runs API', () => {
  describe('GET /api/agents/hitl', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/agents/hitl');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/agents/runs', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/agents/runs');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/agents/hitl/:id/resolve', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/agents/hitl/fake-id/resolve')
        .send({ status: 'APPROVED' });
      expect(res.status).toBe(401);
    });
  });
});

describe('Langfuse observability', () => {
  it('getLangfuse returns null when not configured', async () => {
    // Clear env vars to ensure Langfuse is not configured
    const origPublic = process.env.LANGFUSE_PUBLIC_KEY;
    const origSecret = process.env.LANGFUSE_SECRET_KEY;
    delete process.env.LANGFUSE_PUBLIC_KEY;
    delete process.env.LANGFUSE_SECRET_KEY;

    // Dynamic import to avoid module-level caching issues
    const { getLangfuse } = await import('../agents/observability');
    const client = getLangfuse();
    expect(client).toBeNull();

    // Restore
    if (origPublic) process.env.LANGFUSE_PUBLIC_KEY = origPublic;
    if (origSecret) process.env.LANGFUSE_SECRET_KEY = origSecret;
  });
});

describe('Prompt manager', () => {
  it('exports are callable functions', async () => {
    const { getActivePrompt, createPromptVersion, listPromptVersions } = await import('../agents/prompt-manager');
    expect(typeof getActivePrompt).toBe('function');
    expect(typeof createPromptVersion).toBe('function');
    expect(typeof listPromptVersions).toBe('function');
  });
});

describe('Agents barrel export', () => {
  it('re-exports all modules', async () => {
    const agents = await import('../agents/index');
    expect(typeof agents.createHITLCheckpoint).toBe('function');
    expect(typeof agents.resolveHITLCheckpoint).toBe('function');
    expect(typeof agents.getPendingCheckpoints).toBe('function');
    expect(typeof agents.checkSLABreaches).toBe('function');
    expect(typeof agents.getLangfuse).toBe('function');
    expect(typeof agents.createAgentTrace).toBe('function');
    expect(typeof agents.logGeneration).toBe('function');
    expect(typeof agents.flushLangfuse).toBe('function');
    expect(typeof agents.getActivePrompt).toBe('function');
    expect(typeof agents.createPromptVersion).toBe('function');
    expect(typeof agents.listPromptVersions).toBe('function');
  });
});
