import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Production Hardening', () => {
  // Backup scripts
  it('backup.sh exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../../scripts/backup.sh'))).toBe(true);
  });

  it('restore.sh exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../../scripts/restore.sh'))).toBe(true);
  });

  // Security docs
  it('security-audit-checklist.md exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../../docs/security-audit-checklist.md'))).toBe(true);
  });

  it('backup-restore runbook exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../../docs/runbooks/backup-restore.md'))).toBe(true);
  });

  // Load test scripts
  it('k6 smoke test exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../../load-tests/smoke.js'))).toBe(true);
  });

  it('k6 stress test exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../../load-tests/stress.js'))).toBe(true);
  });

  // Security hardening verification
  it('no Math.random in production agent/compliance code', () => {
    const agentsDir = path.join(__dirname, '../agents');
    const complianceFile = path.join(__dirname, '../lib/compliance-compute.ts');
    const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.ts')).map(f => path.join(agentsDir, f));
    files.push(complianceFile);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toContain('Math.random');
    }
  });

  it('no eval() in backend source', () => {
    const srcDir = path.join(__dirname, '..');
    const files = getAllTsFiles(srcDir);
    for (const file of files) {
      if (file.includes('node_modules') || file.includes('test')) continue;
      const content = fs.readFileSync(file, 'utf-8');
      // Match eval( but not "evaluate" or "evalData"
      const matches = content.match(/\beval\s*\(/g);
      expect(matches).toBeNull();
    }
  });

  it('.env is in .gitignore', () => {
    const gitignore = fs.readFileSync(path.join(__dirname, '../../.gitignore'), 'utf-8');
    expect(gitignore).toContain('.env');
  });

  it('docker-compose requires JWT_SECRET (no default)', () => {
    const compose = fs.readFileSync(path.join(__dirname, '../../../docker-compose.yml'), 'utf-8');
    expect(compose).toContain('JWT_SECRET:?');
    expect(compose).not.toContain('change-me-in-production-minimum-32-chars');
  });
});

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.includes('.next')) {
      files.push(...getAllTsFiles(fullPath));
    } else if (entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}
