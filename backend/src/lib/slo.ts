import { Counter, Histogram, Gauge } from 'prom-client';
import { registry } from './metrics';

// ── Agent-specific metrics ──────────────────────────────────────────────

export const agentRunDuration = new Histogram({
  name: 'ats_agent_run_duration_seconds',
  help: 'Duration of agent runs in seconds',
  labelNames: ['agent_type', 'status', 'tenant_id'],
  buckets: [0.5, 1, 2, 5, 10, 20, 30, 60],
  registers: [registry],
});

export const agentRunTotal = new Counter({
  name: 'ats_agent_runs_total',
  help: 'Total number of agent runs',
  labelNames: ['agent_type', 'status', 'tenant_id'],
  registers: [registry],
});

export const agentTokensUsed = new Counter({
  name: 'ats_agent_tokens_total',
  help: 'Total tokens consumed by agent runs',
  labelNames: ['agent_type', 'model', 'tenant_id', 'direction'],
  registers: [registry],
});

export const agentCostUsd = new Counter({
  name: 'ats_agent_cost_usd_total',
  help: 'Total cost in USD of agent runs',
  labelNames: ['agent_type', 'model', 'tenant_id'],
  registers: [registry],
});

export const agentRepairLoops = new Counter({
  name: 'ats_agent_repair_loops_total',
  help: 'Number of repair loop attempts',
  labelNames: ['agent_type', 'tenant_id'],
  registers: [registry],
});

export const agentHITLEscalations = new Counter({
  name: 'ats_agent_hitl_escalations_total',
  help: 'Number of HITL escalations',
  labelNames: ['agent_type', 'checkpoint_type', 'tenant_id'],
  registers: [registry],
});

export const tenantDailyCost = new Gauge({
  name: 'ats_tenant_daily_cost_usd',
  help: 'Current day cost per tenant in USD',
  labelNames: ['tenant_id'],
  registers: [registry],
});

// ── SLO definitions (as code) ──────────────────────────────────────────

export interface SLODefinition {
  name: string;
  service: string;
  metric: string;
  target: number;
  unit: string;
  window: string;
  alertThreshold: number;
  alertSeverity: 'P1' | 'P2' | 'P3';
}

export const SLO_CATALOG: SLODefinition[] = [
  // Service SLOs
  { name: 'API Availability', service: 'api-gateway', metric: 'ats_http_requests_total{status_code!~"5.."}', target: 99.9, unit: '%', window: '30d', alertThreshold: 99.5, alertSeverity: 'P1' },
  { name: 'API Latency p95', service: 'api-gateway', metric: 'ats_http_request_duration_seconds', target: 0.2, unit: 'seconds', window: '30d', alertThreshold: 0.5, alertSeverity: 'P2' },
  { name: 'API Latency p99', service: 'api-gateway', metric: 'ats_http_request_duration_seconds', target: 0.5, unit: 'seconds', window: '30d', alertThreshold: 1.0, alertSeverity: 'P2' },

  // Agent SLOs
  { name: 'Resume Parser Latency p95', service: 'resume-parser', metric: 'ats_agent_run_duration_seconds{agent_type="resume-parser"}', target: 8, unit: 'seconds', window: '7d', alertThreshold: 15, alertSeverity: 'P2' },
  { name: 'Resume Parser Error Rate', service: 'resume-parser', metric: 'ats_agent_runs_total{agent_type="resume-parser",status="FAILED"}', target: 2, unit: '%', window: '7d', alertThreshold: 5, alertSeverity: 'P2' },
  { name: 'Screening Agent Latency p95', service: 'candidate-screener', metric: 'ats_agent_run_duration_seconds{agent_type="candidate-screener"}', target: 12, unit: 'seconds', window: '7d', alertThreshold: 25, alertSeverity: 'P2' },
  { name: 'Screening Agent Error Rate', service: 'candidate-screener', metric: 'ats_agent_runs_total{agent_type="candidate-screener",status="FAILED"}', target: 2, unit: '%', window: '7d', alertThreshold: 5, alertSeverity: 'P1' },
  { name: 'JD Author Latency p95', service: 'jd-author', metric: 'ats_agent_run_duration_seconds{agent_type="jd-author"}', target: 10, unit: 'seconds', window: '7d', alertThreshold: 20, alertSeverity: 'P3' },
  { name: 'Scheduling Agent Latency p95', service: 'interview-scheduler', metric: 'ats_agent_run_duration_seconds{agent_type="interview-scheduler"}', target: 6, unit: 'seconds', window: '7d', alertThreshold: 12, alertSeverity: 'P2' },
  { name: 'Candidate Chat Latency p95', service: 'candidate-assistant', metric: 'ats_agent_run_duration_seconds{agent_type="candidate-assistant"}', target: 4, unit: 'seconds', window: '7d', alertThreshold: 8, alertSeverity: 'P2' },

  // Cost SLOs
  { name: 'Tenant Daily Cost', service: 'billing', metric: 'ats_tenant_daily_cost_usd', target: 50, unit: 'USD', window: '1d', alertThreshold: 40, alertSeverity: 'P3' },
];

// ── SLO endpoint helper ────────────────────────────────────────────────

export function getSLOStatus(): Array<SLODefinition & { status: 'healthy' | 'warning' | 'breached' }> {
  // In production, this would query Prometheus and compute actual SLO status.
  // For now, return the catalog with all healthy (actual monitoring requires Grafana).
  return SLO_CATALOG.map(slo => ({ ...slo, status: 'healthy' as const }));
}
