# Runbook: Agent Error Rate > 5% (ALR-003)

## Alert
- **Trigger**: Agent failure rate > 5% over 1 hour
- **Severity**: P1

## Diagnosis
1. Check which agent is failing: `GET /api/observability/agent-costs`
2. Check Langfuse traces for the failing agent type
3. Check if LLM provider is responding: Try a manual API call
4. Check if cost ceiling has been reached: `GET /api/billing/budget`

## Remediation
1. If LLM provider down: Agents degrade gracefully to FAILED status + HITL
2. If budget exceeded: Wait for next day reset, or increase ceiling
3. If prompt causing failures: Rollback to previous prompt version
4. If schema validation failing: Check repair loop rate, may need output schema update

## Mitigation
- Disable the failing agent via kill switch: `POST /api/billing/agents/{type}/toggle`
- Manually process HITL queue items that were generated
