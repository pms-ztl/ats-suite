# Runbook: Tenant Cost Ceiling Breach (ALR-004)

## Alert
- **Trigger**: Tenant daily LLM spend exceeds configured ceiling ($50/day default)
- **Severity**: P2
- **Channels**: Slack, Email to tenant admin

## Diagnosis
1. Identify the tenant: Check alert payload for `tenantId`
2. Check cost breakdown: `GET /api/billing/usage?tenantId={id}`
3. Check which agent consumed most: `GET /api/observability/agent-costs?tenantId={id}`
4. Check if runaway loop: Look for repeated agent runs on same candidate/requisition

## Remediation
1. If runaway loop detected: Kill the agent process, investigate trigger
2. If legitimate high usage: Contact tenant admin to increase ceiling
3. If single agent dominating: Check if prompt is causing excessive retries
4. If cost tracking drift: Reconcile with LLM provider invoice

## Prevention
- Review per-agent token budgets monthly
- Set up graduated alerts at 50%, 80%, 95% of ceiling
- Consider switching expensive operations to cheaper models (Haiku for classification)

## Escalation
- If ceiling breached by >200%: Notify engineering manager immediately
- If multiple tenants affected: Check for platform-wide issue (model pricing change)
