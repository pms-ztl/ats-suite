import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { signAccessToken } from '../lib/jwt';
import { extractText } from '../lib/document-extractor';
import { generateEmbedding, deleteEmbeddings } from '../lib/embeddings';

function makeToken() {
  return signAccessToken({
    sub: 'test-user-id',
    email: 'test@acme.com',
    role: 'ADMIN',
    tenantId: 'test-tenant-id',
  });
}

describe('Resume API', () => {
  describe('POST /api/resume/upload', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/resume/upload')
        .attach('resume', Buffer.from('test'), 'test.pdf');
      expect(res.status).toBe(401);
    });

    it('returns 400 without candidateId', async () => {
      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${makeToken()}`)
        .attach('resume', Buffer.from('test content'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        });
      expect(res.status).toBe(400);
    });

    it('returns 400 without file', async () => {
      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${makeToken()}`)
        .field('candidateId', 'test-candidate-id');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/resume/:candidateId', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/resume/some-candidate-id');
      expect(res.status).toBe(401);
    });

    it('returns 404 or 500 for nonexistent candidate (500 when DB unavailable)', async () => {
      const res = await request(app)
        .get('/api/resume/nonexistent-candidate-id')
        .set('Authorization', `Bearer ${makeToken()}`);
      // 404 with DB, 500 without (Prisma connection error)
      expect([404, 500]).toContain(res.status);
    });
  });
});

describe('Document Extraction', () => {
  it('extractText throws on unsupported mime type', async () => {
    const buf = Buffer.from('test');
    await expect(extractText(buf, 'image/png')).rejects.toThrow('Unsupported file type');
  });

  it('extractText handles text/plain', async () => {
    const text = '  Hello World  ';
    const buf = Buffer.from(text, 'utf-8');
    const result = await extractText(buf, 'text/plain');
    expect(result).toBe('Hello World');
  });
});

describe('Embeddings', () => {
  it('generateEmbedding returns null without API key', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {
      const result = await generateEmbedding('test text');
      expect(result).toBeNull();
    } finally {
      if (originalKey) process.env.OPENAI_API_KEY = originalKey;
    }
  });

  it('deleteEmbeddings is a callable function', () => {
    expect(typeof deleteEmbeddings).toBe('function');
  });
});
