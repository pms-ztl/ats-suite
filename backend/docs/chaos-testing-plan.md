# Chaos Testing Plan

## Top 5 Failure Modes to Test

### 1. Database Connection Failure

- **Inject**: Kill PostgreSQL process or block port 5432
- **Expected**: API returns 503, health check goes unhealthy, reconnect on recovery
- **Verify**: No data corruption, pending transactions rolled back

### 2. LLM Provider Unavailable (Anthropic API down)

- **Inject**: Set ANTHROPIC_API_KEY to invalid value or block api.anthropic.com
- **Expected**: Agent runs fail with FAILED status, HITL escalation, error logged
- **Verify**: No silent failures, user sees clear error message, fallback to manual process

### 3. Redis Cache Failure (when added)

- **Inject**: Kill Redis process
- **Expected**: App continues without cache (degraded performance), cache misses logged
- **Verify**: No crashes, all reads fall through to DB

### 4. High Concurrency Calendar Booking Race

- **Inject**: 10 simultaneous scheduling requests for the same time slot
- **Expected**: Only 1 succeeds, others get conflict error (optimistic locking)
- **Verify**: No double-bookings in ScheduleEvent table

### 5. HITL Queue SLA Breach

- **Inject**: Create HITL checkpoint and let SLA timer expire
- **Expected**: Escalation triggered, manager notified, checkpoint marked escalated
- **Verify**: Candidate is not left in limbo, process continues via escalation path

## Execution Schedule

- Run chaos tests monthly in staging environment
- Automated: Database failover test (weekly via CI)
- Manual: LLM provider failure + calendar race condition (monthly)

## Prerequisites

- Staging environment with production-like data volume
- Monitoring dashboards (Prometheus/Grafana) active during tests
- On-call engineer present for manual chaos tests
- Rollback procedures documented and tested

## Runbook Template

For each chaos test:

1. **Pre-check**: Verify system healthy, monitoring active
2. **Inject**: Apply the failure condition
3. **Observe**: Monitor logs, metrics, alerts for 5-10 minutes
4. **Verify**: Check expected behaviors against actual
5. **Recover**: Remove failure condition, confirm full recovery
6. **Document**: Record findings, open issues for unexpected behavior
