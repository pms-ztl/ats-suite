import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { signAccessToken } from '../lib/jwt';
import { prisma } from '../utils/prisma';
import { syncToExternalCalendar, checkExternalAvailability } from '../lib/calendar-sync';

function makeToken() {
  return signAccessToken({
    sub: 'test-user-id',
    email: 'test@acme.com',
    role: 'ADMIN',
    tenantId: 'test-tenant-id',
  });
}

describe('Calendar Sync Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('syncToExternalCalendar', () => {
    it('returns synced:false when no integration exists', async () => {
      vi.mocked(prisma.integrationConfig.findFirst).mockResolvedValue(null);

      const result = await syncToExternalCalendar('user-1', 'tenant-1', {
        id: 'evt-1',
        summary: 'Test Interview',
        startAt: new Date('2026-04-15T10:00:00Z'),
        endAt: new Date('2026-04-15T11:00:00Z'),
      });

      expect(result.synced).toBe(false);
      expect(result.provider).toBe('none');
      expect(result.externalEventId).toBeNull();
    });

    it('returns synced:false when integration has no access token', async () => {
      vi.mocked(prisma.integrationConfig.findFirst).mockResolvedValue({
        id: 'ic-1',
        tenantId: 'tenant-1',
        integrationType: 'CALENDAR',
        provider: 'GOOGLE_CALENDAR',
        config: {},
        status: 'ACTIVE',
        lastSyncAt: null,
        createdAt: new Date(),
      } as any);

      const result = await syncToExternalCalendar('user-1', 'tenant-1', {
        id: 'evt-2',
        summary: 'Test Interview',
        startAt: new Date('2026-04-15T10:00:00Z'),
        endAt: new Date('2026-04-15T11:00:00Z'),
      });

      expect(result.synced).toBe(false);
      expect(result.provider).toBe('none');
    });
  });

  describe('checkExternalAvailability', () => {
    it('returns null when no integration exists', async () => {
      vi.mocked(prisma.integrationConfig.findFirst).mockResolvedValue(null);

      const result = await checkExternalAvailability(
        'user-1',
        'tenant-1',
        ['interviewer@example.com'],
        new Date('2026-04-15T10:00:00Z'),
        new Date('2026-04-15T11:00:00Z')
      );

      expect(result).toBeNull();
    });
  });
});

describe('Scheduling API with Calendar Sync', () => {
  describe('GET /api/scheduling', () => {
    it('returns 200 with valid token', async () => {
      const res = await request(app)
        .get('/api/scheduling')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/scheduling/availability/check', () => {
    it('returns availability info with externalAvailability field', async () => {
      const res = await request(app)
        .post('/api/scheduling/availability/check')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({
          startAt: '2026-04-15T10:00:00Z',
          endAt: '2026-04-15T11:00:00Z',
          attendees: [{ email: 'test@example.com' }],
        });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('available');
      expect(res.body.data).toHaveProperty('externalAvailability');
    });
  });

  describe('POST /api/scheduling', () => {
    it('returns 422 for invalid body', async () => {
      const res = await request(app)
        .post('/api/scheduling')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({});
      expect([400, 422]).toContain(res.status);
    });
  });
});
