# Runbook: API Error Rate Spike (ALR-001)

## Alert
- **Trigger**: 5xx error rate > 5% for 5 minutes
- **Severity**: P1
- **Channels**: Slack, PagerDuty

## Diagnosis
1. Check Grafana dashboard: API Error Rate panel
2. Check application logs: `docker logs ats-backend --since 5m | grep ERROR`
3. Check database connectivity: `curl http://localhost:4000/readyz`
4. Check recent deployments: `git log --oneline -5`

## Remediation
1. If database is down: Restart PostgreSQL, check disk space
2. If specific endpoint failing: Check route handler for unhandled errors
3. If after deploy: Rollback to previous version
4. If external service (LLM/Calendar): Check provider status page

## Escalation
- If not resolved in 15 minutes: Escalate to on-call engineer
- If data integrity risk: Notify engineering manager
