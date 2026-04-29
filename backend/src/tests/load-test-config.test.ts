import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const BACKEND_ROOT = path.resolve(__dirname, '..', '..');

describe('Load Test Configuration', () => {
  it('load-tests/smoke.js exists', () => {
    const p = path.join(BACKEND_ROOT, 'load-tests', 'smoke.js');
    expect(fs.existsSync(p)).toBe(true);
  });

  it('load-tests/stress.js exists', () => {
    const p = path.join(BACKEND_ROOT, 'load-tests', 'stress.js');
    expect(fs.existsSync(p)).toBe(true);
  });

  it('load-tests/agent-load.js exists', () => {
    const p = path.join(BACKEND_ROOT, 'load-tests', 'agent-load.js');
    expect(fs.existsSync(p)).toBe(true);
  });

  it('smoke.js contains p95 < 500ms threshold', () => {
    const content = fs.readFileSync(
      path.join(BACKEND_ROOT, 'load-tests', 'smoke.js'),
      'utf-8',
    );
    expect(content).toContain("http_req_duration: ['p(95)<500']");
  });

  it('smoke.js contains error rate threshold', () => {
    const content = fs.readFileSync(
      path.join(BACKEND_ROOT, 'load-tests', 'smoke.js'),
      'utf-8',
    );
    expect(content).toContain("http_req_failed: ['rate<0.01']");
  });

  it('stress.js contains staged ramp-up config', () => {
    const content = fs.readFileSync(
      path.join(BACKEND_ROOT, 'load-tests', 'stress.js'),
      'utf-8',
    );
    expect(content).toContain('stages');
    expect(content).toContain('target: 100');
  });

  it('agent-load.js has higher duration threshold for agents', () => {
    const content = fs.readFileSync(
      path.join(BACKEND_ROOT, 'load-tests', 'agent-load.js'),
      'utf-8',
    );
    expect(content).toContain("http_req_duration: ['p(95)<15000']");
  });

  it('docs/chaos-testing-plan.md exists and covers 5 failure modes', () => {
    const p = path.join(BACKEND_ROOT, 'docs', 'chaos-testing-plan.md');
    expect(fs.existsSync(p)).toBe(true);
    const content = fs.readFileSync(p, 'utf-8');
    expect(content).toContain('Database Connection Failure');
    expect(content).toContain('LLM Provider Unavailable');
    expect(content).toContain('Redis Cache Failure');
    expect(content).toContain('High Concurrency Calendar Booking Race');
    expect(content).toContain('HITL Queue SLA Breach');
  });

  it('package.json contains load-test scripts', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(BACKEND_ROOT, 'package.json'), 'utf-8'),
    );
    expect(pkg.scripts['load-test:smoke']).toBe('k6 run load-tests/smoke.js');
    expect(pkg.scripts['load-test:stress']).toBe('k6 run load-tests/stress.js');
    expect(pkg.scripts['load-test:agents']).toBe('k6 run load-tests/agent-load.js');
  });
});
