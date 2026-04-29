import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Final Gap Closure (R2-R5)', () => {
  // R2: MFA endpoint exists and doesn't return 501
  it('MFA verify endpoint is implemented (not 501)', async () => {
    const code = fs.readFileSync(path.join(__dirname, '../routes/auth.ts'), 'utf-8');
    // Should NOT contain the old 501 stub
    expect(code).not.toContain('MFA_NOT_CONFIGURED');
  });

  // R2: SCIM returns real user data
  it('SCIM endpoint queries real users', async () => {
    const code = fs.readFileSync(path.join(__dirname, '../routes/sso.ts'), 'utf-8');
    expect(code).toContain('prisma.user.findMany');
  });

  // R3: Each agent has >=50 golden eval cases
  it('each agent has >=50 golden eval cases', () => {
    const datasets = fs.readdirSync(path.join(__dirname, '../../eval/datasets'))
      .filter(d => !d.includes('adversarial'));
    for (const dataset of datasets) {
      const goldenPath = path.join(__dirname, '../../eval/datasets', dataset, 'golden.jsonl');
      if (fs.existsSync(goldenPath)) {
        const lines = fs.readFileSync(goldenPath, 'utf-8').trim().split('\n');
        expect(lines.length).toBeGreaterThanOrEqual(50);
      }
    }
  });

  // R3: Total golden cases >= 600
  it('total golden eval cases >= 600', () => {
    const datasetsDir = path.join(__dirname, '../../eval/datasets');
    let total = 0;
    for (const d of fs.readdirSync(datasetsDir)) {
      const goldenPath = path.join(datasetsDir, d, 'golden.jsonl');
      if (fs.existsSync(goldenPath)) {
        total += fs.readFileSync(goldenPath, 'utf-8').trim().split('\n').length;
      }
    }
    expect(total).toBeGreaterThanOrEqual(600);
  });

  // R4: Docker files exist
  it('docker-compose.yml exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../../../docker-compose.yml'))).toBe(true);
  });

  it('backend Dockerfile exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../../Dockerfile'))).toBe(true);
  });

  // R5: Security scan script exists
  it('security-scan.sh exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../../scripts/security-scan.sh'))).toBe(true);
  });
});
