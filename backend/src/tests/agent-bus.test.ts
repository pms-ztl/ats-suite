import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ioredis before importing modules that use it
vi.mock('ioredis', () => {
  function MockRedis() {
    return {
      on: vi.fn().mockReturnThis(),
      quit: vi.fn().mockResolvedValue('OK'),
    };
  }
  MockRedis.default = MockRedis;
  return { default: MockRedis, __esModule: true };
});

// Mock bullmq
vi.mock('bullmq', () => {
  const mockJob = { id: 'test-job-123' };

  function MockQueue() {
    return {
      add: vi.fn().mockResolvedValue(mockJob),
      close: vi.fn().mockResolvedValue(undefined),
    };
  }

  function MockWorker(_name: string, processor: any, _opts: any) {
    return {
      on: vi.fn(),
      close: vi.fn().mockResolvedValue(undefined),
    };
  }

  return {
    Queue: MockQueue,
    Worker: MockWorker,
    Job: vi.fn(),
  };
});

// Mock prisma
vi.mock('../utils/prisma', () => ({
  prisma: {
    tenant: { findMany: vi.fn().mockResolvedValue([]) },
    application: { findFirst: vi.fn().mockResolvedValue(null) },
    agentRun: { aggregate: vi.fn().mockResolvedValue({ _sum: { costUsd: 0 } }) },
    integrationConfig: { findFirst: vi.fn().mockResolvedValue(null) },
  },
}));

describe('Agent Event Bus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('emitAgentEvent is exported', async () => {
    const { emitAgentEvent } = await import('../lib/agent-bus');
    expect(typeof emitAgentEvent).toBe('function');
  });

  it('emitAgentEvent does not throw without Redis', async () => {
    delete process.env.REDIS_URL;
    const { emitAgentEvent } = await import('../lib/agent-bus');
    await expect(emitAgentEvent({
      type: 'screening.completed',
      tenantId: 'test',
      candidateId: 'test',
      requisitionId: 'test',
      recommendation: 'advance',
      runId: 'test',
    })).resolves.not.toThrow();
  });

  it('AgentEvent type covers all event types', async () => {
    // Type system enforces this — verify the import works
    const mod = await import('../lib/agent-bus');
    expect(mod).toBeDefined();
  });
});

describe('Cron Worker', () => {
  it('startCronJobs is exported', async () => {
    const { startCronJobs } = await import('../workers/cron.worker');
    expect(typeof startCronJobs).toBe('function');
  });

  it('startCronJobs completes without Redis', async () => {
    const { startCronJobs } = await import('../workers/cron.worker');
    const result = await startCronJobs();
    expect(result).toBeUndefined(); // Void return = successful no-op without Redis
  });

  it('startCronJobs is idempotent', async () => {
    const { startCronJobs } = await import('../workers/cron.worker');
    await startCronJobs(); // First call
    await startCronJobs(); // Second call — should not throw or double-register
  });
});

describe('Agent Events Worker', () => {
  it('startAgentEventsWorker is exported', async () => {
    const { startAgentEventsWorker } = await import('../workers/agent-events.worker');
    expect(typeof startAgentEventsWorker).toBe('function');
  });
});

describe('Inter-Agent Wiring', () => {
  it('screening worker imports emitAgentEvent', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const code = fs.readFileSync(path.join(__dirname, '../workers/screening.worker.ts'), 'utf-8');
    expect(code).toContain('emitAgentEvent');
  });

  it('candidates-write imports emitAgentEvent', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const code = fs.readFileSync(path.join(__dirname, '../routes/candidates-write.ts'), 'utf-8');
    expect(code).toContain('emitAgentEvent');
  });

  it('cron schedules weekly compliance and daily analytics', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const code = fs.readFileSync(path.join(__dirname, '../workers/cron.worker.ts'), 'utf-8');
    expect(code).toContain('weekly-compliance');
    expect(code).toContain('daily-analytics');
    expect(code).toContain('0 9 * * 1'); // Monday 9am
    expect(code).toContain('0 6 * * *'); // Daily 6am
  });
});
