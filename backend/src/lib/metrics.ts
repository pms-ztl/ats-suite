import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

export const registry = new Registry();

// Collect default Node.js metrics
collectDefaultMetrics({ register: registry, prefix: 'ats_' });

// HTTP request metrics
export const httpRequestDuration = new Histogram({
  name: 'ats_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

export const httpRequestTotal = new Counter({
  name: 'ats_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

// Business metrics
export const candidatesCreated = new Counter({
  name: 'ats_candidates_created_total',
  help: 'Total candidates created',
  labelNames: ['tenantId'],
  registers: [registry],
});

export const interviewsScheduled = new Counter({
  name: 'ats_interviews_scheduled_total',
  help: 'Total interviews scheduled',
  labelNames: ['tenantId'],
  registers: [registry],
});

export const activeRequisitions = new Gauge({
  name: 'ats_active_requisitions',
  help: 'Number of open requisitions',
  labelNames: ['tenantId'],
  registers: [registry],
});

export const authErrors = new Counter({
  name: 'ats_auth_errors_total',
  help: 'Total authentication errors',
  labelNames: ['reason'],
  registers: [registry],
});
