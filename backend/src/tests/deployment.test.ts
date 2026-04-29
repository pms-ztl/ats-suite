import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const BACKEND_ROOT = path.resolve(__dirname, '..', '..');
const PROJECT_ROOT = path.resolve(BACKEND_ROOT, '..');

describe('Deployment Readiness', () => {
  describe('First-run setup script', () => {
    const scriptPath = path.join(BACKEND_ROOT, 'scripts', 'first-run.sh');

    it('first-run.sh exists', () => {
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('first-run.sh contains prerequisite checks', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('node');
      expect(content).toContain('npm');
      expect(content).toContain('prisma');
    });

    it('first-run.sh generates JWT_SECRET', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('JWT_SECRET');
      expect(content).toContain('crypto');
    });

    it('first-run.sh checks database connectivity', () => {
      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('DATABASE_URL');
      expect(content).toContain('prisma');
    });
  });

  describe('Documentation', () => {
    it('DEPLOYMENT.md exists', () => {
      const filePath = path.join(PROJECT_ROOT, 'docs', 'DEPLOYMENT.md');
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('## Quick Start');
      expect(content).toContain('## Docker Deployment');
      expect(content).toContain('## Production Deployment');
    });

    it('ADMIN-GUIDE.md exists', () => {
      const filePath = path.join(PROJECT_ROOT, 'docs', 'ADMIN-GUIDE.md');
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('## Key Workflows');
      expect(content).toContain('## 12 AI Agents');
    });

    it('ARCHITECTURE.md exists', () => {
      const filePath = path.join(PROJECT_ROOT, 'docs', 'ARCHITECTURE.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('README.md exists at project root', () => {
      const filePath = path.join(PROJECT_ROOT, 'README.md');
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('12');
      expect(content).toContain('AI');
      expect(content).toContain('Quick Start');
    });
  });

  describe('Docker configuration', () => {
    const composePath = path.join(PROJECT_ROOT, 'docker-compose.yml');

    it('docker-compose.yml exists', () => {
      expect(fs.existsSync(composePath)).toBe(true);
    });

    it('docker-compose.yml defines postgres service', () => {
      const content = fs.readFileSync(composePath, 'utf-8');
      expect(content).toContain('postgres');
      expect(content).toContain('5432');
    });

    it('docker-compose.yml defines redis service', () => {
      const content = fs.readFileSync(composePath, 'utf-8');
      expect(content).toContain('redis');
      expect(content).toContain('6379');
    });

    it('docker-compose.yml defines backend service', () => {
      const content = fs.readFileSync(composePath, 'utf-8');
      expect(content).toContain('backend');
      expect(content).toContain('4000');
    });

    it('docker-compose.yml defines frontend service', () => {
      const content = fs.readFileSync(composePath, 'utf-8');
      expect(content).toContain('frontend');
      expect(content).toContain('3000');
    });
  });

  describe('Required npm scripts', () => {
    const pkgPath = path.join(BACKEND_ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    const requiredScripts = [
      'dev',
      'build',
      'start',
      'test',
      'backup',
      'restore',
      'setup',
      'eval',
    ];

    for (const script of requiredScripts) {
      it(`npm script exists: ${script}`, () => {
        expect(pkg.scripts).toHaveProperty(script);
        expect(pkg.scripts[script]).toBeTruthy();
      });
    }
  });
});
