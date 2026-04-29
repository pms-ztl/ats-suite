export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: 'P1' | 'P2' | 'P3';
  runbookUrl: string;
  notifyChannels: string[];
}

export const ALERT_CATALOG: AlertRule[] = [
  { id: 'ALR-001', name: 'API Error Rate Spike', condition: 'rate(ats_http_requests_total{status_code=~"5.."}[5m]) > 0.05', severity: 'P1', runbookUrl: '/runbooks/api-errors.md', notifyChannels: ['slack', 'pagerduty'] },
  { id: 'ALR-002', name: 'API Latency p95 > 500ms', condition: 'histogram_quantile(0.95, rate(ats_http_request_duration_seconds_bucket[5m])) > 0.5', severity: 'P2', runbookUrl: '/runbooks/api-latency.md', notifyChannels: ['slack'] },
  { id: 'ALR-003', name: 'Agent Error Rate > 5%', condition: 'rate(ats_agent_runs_total{status="FAILED"}[1h]) / rate(ats_agent_runs_total[1h]) > 0.05', severity: 'P1', runbookUrl: '/runbooks/agent-errors.md', notifyChannels: ['slack', 'pagerduty'] },
  { id: 'ALR-004', name: 'Agent Latency Spike', condition: 'histogram_quantile(0.95, rate(ats_agent_run_duration_seconds_bucket[5m])) > 30', severity: 'P2', runbookUrl: '/runbooks/agent-latency.md', notifyChannels: ['slack'] },
  { id: 'ALR-005', name: 'Tenant Daily Cost > 80%', condition: 'ats_tenant_daily_cost_usd > 40', severity: 'P3', runbookUrl: '/runbooks/cost-alert.md', notifyChannels: ['slack'] },
  { id: 'ALR-006', name: 'Tenant Daily Cost > 100%', condition: 'ats_tenant_daily_cost_usd > 50', severity: 'P1', runbookUrl: '/runbooks/cost-critical.md', notifyChannels: ['slack', 'pagerduty'] },
  { id: 'ALR-007', name: 'HITL SLA Breach', condition: 'ats_agent_hitl_escalations_total increase > 10 in 1h', severity: 'P2', runbookUrl: '/runbooks/hitl-sla.md', notifyChannels: ['slack'] },
  { id: 'ALR-008', name: 'Database Connection Pool Exhausted', condition: 'pg_stat_activity_count > 90', severity: 'P1', runbookUrl: '/runbooks/db-connections.md', notifyChannels: ['slack', 'pagerduty'] },
  { id: 'ALR-009', name: 'Cross-Tenant Leak Detection', condition: 'ats_cross_tenant_violations_total > 0', severity: 'P1', runbookUrl: '/runbooks/cross-tenant.md', notifyChannels: ['slack', 'pagerduty', 'email'] },
  { id: 'ALR-010', name: 'Repair Loop Rate High', condition: 'rate(ats_agent_repair_loops_total[1h]) / rate(ats_agent_runs_total[1h]) > 0.2', severity: 'P2', runbookUrl: '/runbooks/repair-loops.md', notifyChannels: ['slack'] },
  { id: 'ALR-011', name: 'PII Redaction Failure', condition: 'ats_pii_redaction_failures_total > 0', severity: 'P1', runbookUrl: '/runbooks/pii-leak.md', notifyChannels: ['slack', 'pagerduty', 'email'] },
  { id: 'ALR-012', name: 'Embedding Generation Backlog', condition: 'ats_embedding_queue_size > 100', severity: 'P3', runbookUrl: '/runbooks/embedding-backlog.md', notifyChannels: ['slack'] },
];
