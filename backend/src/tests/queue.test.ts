import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ioredis before importing queue module
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

  function MockWorker() {
    return {
      on: vi.fn(),
      close: vi.fn().mockResolvedValue(undefined),
    };
  }

  function MockQueueEvents() {
    return {};
  }

  return {
    Queue: MockQueue,
    Worker: MockWorker,
    QueueEvents: MockQueueEvents,
  };
});

describe('Queue Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports enqueueResumeParse as a function', async () => {
    const { enqueueResumeParse } = await import('../lib/queue');
    expect(typeof enqueueResumeParse).toBe('function');
  });

  it('exports enqueueScreening as a function', async () => {
    const { enqueueScreening } = await import('../lib/queue');
    expect(typeof enqueueScreening).toBe('function');
  });

  it('exports enqueueNotification as a function', async () => {
    const { enqueueNotification } = await import('../lib/queue');
    expect(typeof enqueueNotification).toBe('function');
  });

  it('QUEUE_NAMES has correct values', async () => {
    const { QUEUE_NAMES } = await import('../lib/queue');
    expect(QUEUE_NAMES.RESUME_PARSE).toBe('resume-parse');
    expect(QUEUE_NAMES.SCREENING).toBe('ai-screening');
    expect(QUEUE_NAMES.NOTIFICATION).toBe('notification');
  });

  it('enqueueResumeParse returns a job ID', async () => {
    const { enqueueResumeParse } = await import('../lib/queue');
    const jobId = await enqueueResumeParse({
      candidateId: 'cand-1',
      tenantId: 'tenant-1',
      userId: 'user-1',
      resumeId: 'resume-1',
    });
    expect(jobId).toBe('test-job-123');
  });

  it('enqueueScreening returns a job ID', async () => {
    const { enqueueScreening } = await import('../lib/queue');
    const jobId = await enqueueScreening({
      candidateId: 'cand-1',
      requisitionId: 'req-1',
      tenantId: 'tenant-1',
      userId: 'user-1',
    });
    expect(jobId).toBe('test-job-123');
  });

  it('enqueueNotification returns a job ID', async () => {
    const { enqueueNotification } = await import('../lib/queue');
    const jobId = await enqueueNotification({
      type: 'email',
      tenantId: 'tenant-1',
      payload: { to: 'test@example.com', subject: 'Test', html: '<p>Test</p>' },
    });
    expect(jobId).toBe('test-job-123');
  });

  it('ResumeParseJobData type has required fields', async () => {
    const { enqueueResumeParse } = await import('../lib/queue');
    // TypeScript compile-time check: all required fields present
    const data = {
      candidateId: 'c1',
      tenantId: 't1',
      userId: 'u1',
      resumeId: 'r1',
    };
    // If this compiles and runs, the type shape is correct
    const jobId = await enqueueResumeParse(data);
    expect(typeof jobId).toBe('string');
  });

  it('ScreeningJobData type has required fields', async () => {
    const { enqueueScreening } = await import('../lib/queue');
    const data = {
      candidateId: 'c1',
      requisitionId: 'req1',
      tenantId: 't1',
      userId: 'u1',
    };
    const jobId = await enqueueScreening(data);
    expect(typeof jobId).toBe('string');
  });

  it('exports closeQueues for graceful shutdown', async () => {
    const { closeQueues } = await import('../lib/queue');
    expect(typeof closeQueues).toBe('function');
  });

  it('exports getRedisConnection as a function', async () => {
    const { getRedisConnection } = await import('../lib/queue');
    expect(typeof getRedisConnection).toBe('function');
  });
});

describe('Worker Startup', () => {
  it('startWorkers does not throw without Redis (test mode)', async () => {
    // Set test env so workers skip Redis check
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    delete process.env.REDIS_URL;

    const { startWorkers } = await import('../workers');
    expect(() => startWorkers()).not.toThrow();

    process.env.NODE_ENV = origEnv;
  });
});
