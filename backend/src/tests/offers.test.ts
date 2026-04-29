import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { signAccessToken } from '../lib/jwt';
import { prisma } from '../utils/prisma';
import { sendForESign, checkESignStatus } from '../lib/esign';
import { initiateBackgroundCheck, checkBGStatus } from '../lib/background-check';
import app from '../app';

const mockPrisma = prisma as any;

function makeToken() {
  return signAccessToken({
    sub: 'user-001',
    email: 'admin@acme.com',
    role: 'ADMIN',
    tenantId: 'tenant-001',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Reset default mocks
  mockPrisma.offer.findMany.mockResolvedValue([]);
  mockPrisma.offer.findFirst.mockResolvedValue(null);
  mockPrisma.offer.create.mockResolvedValue({ id: 'offer-001', status: 'DRAFT', tenantId: 'tenant-001' });
  mockPrisma.offer.update.mockResolvedValue({ id: 'offer-001', status: 'APPROVED', tenantId: 'tenant-001' });
  mockPrisma.offer.count.mockResolvedValue(0);
  mockPrisma.offerApproval.create.mockResolvedValue({ id: 'approval-001' });
  mockPrisma.offerApproval.count.mockResolvedValue(0);
  mockPrisma.backgroundCheck.create.mockResolvedValue({ id: 'bg-001' });
  mockPrisma.backgroundCheck.findFirst.mockResolvedValue(null);
  mockPrisma.auditTrailEntry.create.mockResolvedValue({});
});

// ── Auth guard tests ──────────────────────────────────────────────────────

describe('GET /api/offers', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/offers');
    expect(res.status).toBe(401);
  });

  it('returns 200 with valid token', async () => {
    const token = makeToken();
    const res = await request(app)
      .get('/api/offers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('returns paginated results', async () => {
    const token = makeToken();
    mockPrisma.offer.findMany.mockResolvedValue([{ id: 'offer-1', status: 'DRAFT' }]);
    mockPrisma.offer.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/offers?page=1&pageSize=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.total).toBe(1);
  });
});

describe('POST /api/offers', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/offers').send({});
    expect(res.status).toBe(401);
  });

  it('validates required fields', async () => {
    const token = makeToken();
    const res = await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('creates offer with valid data', async () => {
    const token = makeToken();
    mockPrisma.requisition.findFirst.mockResolvedValue({ id: 'req-001', tenantId: 'tenant-001' });
    mockPrisma.offer.create.mockResolvedValue({
      id: 'offer-new',
      status: 'DRAFT',
      salaryAmount: 120000,
      tenantId: 'tenant-001',
    });

    const res = await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        requisitionId: 'req-001',
        candidateId: 'cand-001',
        salaryAmount: 120000,
      });
    expect(res.status).toBe(201);
    expect(mockPrisma.offer.create).toHaveBeenCalled();
  });
});

describe('PATCH /api/offers/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).patch('/api/offers/offer-001').send({});
    expect(res.status).toBe(401);
  });

  it('returns 404 when offer not found', async () => {
    const token = makeToken();
    mockPrisma.offer.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/offers/offer-999')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'APPROVED' });
    expect(res.status).toBe(404);
  });

  it('updates offer status', async () => {
    const token = makeToken();
    mockPrisma.offer.findFirst.mockResolvedValue({ id: 'offer-001', tenantId: 'tenant-001', status: 'DRAFT' });
    mockPrisma.offer.update.mockResolvedValue({ id: 'offer-001', status: 'APPROVED' });

    const res = await request(app)
      .patch('/api/offers/offer-001')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'APPROVED' });
    expect(res.status).toBe(200);
  });
});

describe('POST /api/offers/:id/approve', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/offers/offer-001/approve').send({});
    expect(res.status).toBe(401);
  });

  it('creates approval and updates offer', async () => {
    const token = makeToken();
    mockPrisma.offer.findFirst.mockResolvedValue({ id: 'offer-001', tenantId: 'tenant-001', status: 'PENDING_APPROVAL' });
    mockPrisma.offerApproval.count.mockResolvedValue(0);
    mockPrisma.offerApproval.create.mockResolvedValue({ id: 'appr-001', status: 'APPROVED' });
    mockPrisma.offer.update.mockResolvedValue({ id: 'offer-001', status: 'APPROVED' });

    const res = await request(app)
      .post('/api/offers/offer-001/approve')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'APPROVED', comments: 'Looks good' });
    expect(res.status).toBe(200);
    expect(mockPrisma.offerApproval.create).toHaveBeenCalled();
    expect(mockPrisma.offer.update).toHaveBeenCalled();
  });
});

// ── E-signature stub tests ─────────────────────────────────────────────────

describe('sendForESign', () => {
  it('is exported and callable', () => {
    expect(typeof sendForESign).toBe('function');
  });

  it('returns envelope ID in stub mode', async () => {
    const result = await sendForESign({
      recipientEmail: 'candidate@example.com',
      recipientName: 'Jane Doe',
      documentTitle: 'Offer Letter - SWE',
      documentContent: 'Your offer details...',
      callbackUrl: 'http://localhost:4000/api/offers/o1/esign-callback',
    });
    expect(result.envelopeId).toMatch(/^esign-stub-/);
    expect(result.status).toBe('created');
  });
});

describe('checkESignStatus', () => {
  it('returns pending status in stub mode', async () => {
    const result = await checkESignStatus('esign-stub-123');
    expect(result.status).toBe('pending');
  });
});

// ── Background check stub tests ───────────────────────────────────────────

describe('initiateBackgroundCheck', () => {
  it('is exported and callable', () => {
    expect(typeof initiateBackgroundCheck).toBe('function');
  });

  it('returns check ID in stub mode', async () => {
    const result = await initiateBackgroundCheck({
      candidateId: 'cand-001',
      tenantId: 'tenant-001',
      checkType: 'standard',
      candidateEmail: 'jane@example.com',
      candidateName: 'Jane Doe',
    });
    expect(result.checkId).toMatch(/^bgcheck-/);
    expect(result.status).toBe('initiated');
    expect(result.provider).toBe('stub');
  });
});

describe('checkBGStatus', () => {
  it('is exported and callable', () => {
    expect(typeof checkBGStatus).toBe('function');
  });

  it('returns not_found when check does not exist', async () => {
    mockPrisma.backgroundCheck.findFirst.mockResolvedValue(null);
    const result = await checkBGStatus('bgcheck-999', 'tenant-001');
    expect(result.status).toBe('not_found');
  });

  it('returns status from DB record', async () => {
    mockPrisma.backgroundCheck.findFirst.mockResolvedValue({
      id: 'bgcheck-001',
      status: 'COMPLETED',
      completedAt: new Date('2026-01-15'),
    });
    const result = await checkBGStatus('bgcheck-001', 'tenant-001');
    expect(result.status).toBe('COMPLETED');
    expect(result.completedAt).toBeDefined();
  });
});
