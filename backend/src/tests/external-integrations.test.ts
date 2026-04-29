import { describe, it, expect, beforeEach } from 'vitest';

describe('External Integrations — Stub Mode', () => {
  // Ensure no real API keys are set during tests
  beforeEach(() => {
    delete process.env.DOCUSIGN_INTEGRATION_KEY;
    delete process.env.DOCUSIGN_USER_ID;
    delete process.env.DOCUSIGN_ACCOUNT_ID;
    delete process.env.CHECKR_API_KEY;
    delete process.env.DEEPGRAM_API_KEY;
  });

  describe('E-Sign Integration', () => {
    it('sendForESign returns stub result without DocuSign credentials', async () => {
      const { sendForESign } = await import('../lib/esign');
      const result = await sendForESign({
        recipientEmail: 'test@example.com',
        recipientName: 'Test User',
        documentTitle: 'Offer Letter',
        documentContent: '<p>Your offer</p>',
        callbackUrl: 'https://example.com/callback',
        tenantId: 'tenant-1',
      });
      expect(result.envelopeId).toMatch(/^esign-stub-/);
      expect(result.status).toBe('created');
      expect(result.signUrl).toBeNull();
    });

    it('sendForESign returns provider=stub without credentials', async () => {
      const { sendForESign } = await import('../lib/esign');
      const result = await sendForESign({
        recipientEmail: 'test@example.com',
        recipientName: 'Test User',
        documentTitle: 'Offer Letter',
        documentContent: '<p>Your offer</p>',
        callbackUrl: 'https://example.com/callback',
        tenantId: 'tenant-1',
      });
      expect(result.provider).toBe('stub');
    });

    it('checkESignStatus returns pending for stub envelope IDs', async () => {
      const { checkESignStatus } = await import('../lib/esign');
      const result = await checkESignStatus('esign-stub-1234567890');
      expect(result.status).toBe('pending');
    });

    it('checkESignStatus returns unknown for non-stub IDs without credentials', async () => {
      const { checkESignStatus } = await import('../lib/esign');
      const result = await checkESignStatus('real-envelope-id-123');
      expect(result.status).toBe('unknown');
    });

    it('stub response has correct shape', async () => {
      const { sendForESign } = await import('../lib/esign');
      const result = await sendForESign({
        recipientEmail: 'a@b.com',
        recipientName: 'A B',
        documentTitle: 'Doc',
        documentContent: 'content',
        callbackUrl: 'https://example.com',
        tenantId: 'tenant-1',
      });
      expect(result).toHaveProperty('envelopeId');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('signUrl');
      expect(result).toHaveProperty('provider');
    });
  });

  describe('Background Check Integration', () => {
    it('initiateBackgroundCheck returns stub result without Checkr key', async () => {
      const { initiateBackgroundCheck } = await import('../lib/background-check');
      const result = await initiateBackgroundCheck({
        candidateId: 'cand-1',
        tenantId: 'tenant-1',
        checkType: 'standard',
        candidateEmail: 'test@example.com',
        candidateName: 'Test User',
      });
      expect(result.checkId).toMatch(/^bgcheck-/);
      expect(result.status).toBe('initiated');
    });

    it('initiateBackgroundCheck returns provider=stub without key', async () => {
      const { initiateBackgroundCheck } = await import('../lib/background-check');
      const result = await initiateBackgroundCheck({
        candidateId: 'cand-2',
        tenantId: 'tenant-1',
        checkType: 'basic',
        candidateEmail: 'test2@example.com',
        candidateName: 'Jane Doe',
      });
      expect(result.provider).toBe('stub');
    });

    it('checkBGStatus returns not_found for nonexistent check', async () => {
      const { checkBGStatus } = await import('../lib/background-check');
      const result = await checkBGStatus('nonexistent-id', 'tenant-1');
      expect(result.status).toBe('not_found');
      expect(result.provider).toBe('unknown');
    });

    it('stub response has correct shape', async () => {
      const { initiateBackgroundCheck } = await import('../lib/background-check');
      const result = await initiateBackgroundCheck({
        candidateId: 'cand-3',
        tenantId: 'tenant-1',
        checkType: 'enhanced',
        candidateEmail: 'test3@example.com',
        candidateName: 'Bob Smith',
      });
      expect(result).toHaveProperty('checkId');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('provider');
    });
  });

  describe('Module exports', () => {
    it('esign module exports all expected functions', async () => {
      const esign = await import('../lib/esign');
      expect(typeof esign.sendForESign).toBe('function');
      expect(typeof esign.checkESignStatus).toBe('function');
    });

    it('background-check module exports all expected functions', async () => {
      const bgCheck = await import('../lib/background-check');
      expect(typeof bgCheck.initiateBackgroundCheck).toBe('function');
      expect(typeof bgCheck.checkBGStatus).toBe('function');
    });
  });
});
