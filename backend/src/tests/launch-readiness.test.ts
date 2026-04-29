import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const BACKEND_ROOT = path.resolve(__dirname, '..', '..');

describe('Launch Readiness', () => {
  describe('Runbooks', () => {
    const runbookDir = path.join(BACKEND_ROOT, 'docs', 'runbooks');

    const expectedRunbooks = [
      'api-errors.md',
      'agent-errors.md',
      'cost-critical.md',
      'hitl-sla.md',
      'cross-tenant.md',
    ];

    it('runbooks directory exists', () => {
      expect(fs.existsSync(runbookDir)).toBe(true);
    });

    for (const runbook of expectedRunbooks) {
      it(`runbook exists: ${runbook}`, () => {
        const filePath = path.join(runbookDir, runbook);
        expect(fs.existsSync(filePath)).toBe(true);
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content.length).toBeGreaterThan(100);
        expect(content).toContain('## Alert');
      });
    }

    it('cross-tenant runbook is P0 severity', () => {
      const content = fs.readFileSync(
        path.join(runbookDir, 'cross-tenant.md'),
        'utf-8',
      );
      expect(content).toContain('P0');
      expect(content).toContain('CRITICAL');
    });
  });

  describe('Launch Checklist', () => {
    const checklistPath = path.join(BACKEND_ROOT, 'docs', 'launch-checklist.md');

    it('launch-checklist.md exists', () => {
      expect(fs.existsSync(checklistPath)).toBe(true);
    });

    it('contains all required sections', () => {
      const content = fs.readFileSync(checklistPath, 'utf-8');
      const requiredSections = [
        'Infrastructure',
        'Security',
        'Data',
        'Agents',
        'Compliance',
        'Monitoring',
        'Testing',
      ];
      for (const section of requiredSections) {
        expect(content).toContain(`## ${section}`);
      }
    });

    it('contains actionable checklist items', () => {
      const content = fs.readFileSync(checklistPath, 'utf-8');
      const checkboxCount = (content.match(/- \[ \]/g) || []).length;
      expect(checkboxCount).toBeGreaterThanOrEqual(30);
    });
  });

  describe('Architecture Document', () => {
    const archPath = path.resolve(BACKEND_ROOT, '..', 'docs', 'ARCHITECTURE.md');

    it('ARCHITECTURE.md exists', () => {
      expect(fs.existsSync(archPath)).toBe(true);
    });

    it('documents all 5 agents', () => {
      const content = fs.readFileSync(archPath, 'utf-8');
      expect(content).toContain('Resume Parser');
      expect(content).toContain('Screening Agent');
      expect(content).toContain('JD Author');
      expect(content).toContain('Scheduling Agent');
      expect(content).toContain('Candidate Experience');
    });

    it('documents tech stack', () => {
      const content = fs.readFileSync(archPath, 'utf-8');
      expect(content).toContain('Express 5');
      expect(content).toContain('Prisma 7');
      expect(content).toContain('pgvector');
    });
  });

  describe('OpenAPI Spec', () => {
    it('openapi.ts exports a valid spec with new paths', async () => {
      const { swaggerSpec } = await import('../openapi');
      const spec = swaggerSpec as Record<string, any>;
      expect(spec).toBeDefined();
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info.title).toBe('ATS API');

      const paths = spec.paths || {};
      const expectedPaths = [
        '/api/agents/runs',
        '/api/agents/hitl',
        '/api/resume/upload',
        '/api/resume/parse',
        '/api/screening/ai-screen',
        '/api/requisitions/ai-draft',
        '/api/scheduling/ai-schedule',
        '/api/candidate-chat/message',
        '/api/compliance/gdpr/access',
        '/api/compliance/gdpr/erase',
        '/api/compliance/adverse-impact',
        '/api/billing/usage',
        '/api/billing/budget',
        '/api/observability/slos',
      ];

      for (const p of expectedPaths) {
        expect(paths).toHaveProperty(p);
      }
    });

    it('spec includes security schemes', async () => {
      const { swaggerSpec } = await import('../openapi');
      const spec = swaggerSpec as Record<string, any>;
      const schemes = spec.components?.securitySchemes;
      expect(schemes).toHaveProperty('bearerAuth');
      expect(schemes).toHaveProperty('cookieAuth');
    });
  });
});
