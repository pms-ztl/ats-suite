# Runbook: HITL SLA Breach (ALR-005)

## Alert
- **Trigger**: Human-in-the-loop checkpoint pending > 4 hours without review
- **Severity**: P2
- **Channels**: Slack, Email to hiring manager

## Diagnosis
1. Check pending HITL items: `GET /api/agents/hitl?status=PENDING`
2. Identify the checkpoint type (screening rejection, interview invite, JD publish)
3. Check if assigned reviewer is available
4. Check if notification was delivered (email/Slack logs)

## Remediation
1. If reviewer absent: Reassign to another team member with appropriate permissions
2. If notification not delivered: Resend notification, check email/Slack integration
3. If item is stale (>24h): Escalate to hiring manager for immediate review
4. If systemic backlog: Temporarily increase reviewer pool or batch-approve low-risk items

## SLA Targets
- Screening rejections: Review within 4 hours during business hours
- Interview invites: Review within 2 hours during business hours
- JD publish: Review within 8 hours

## Escalation
- If SLA breached by >2x: Notify hiring manager
- If >10 items in backlog: Notify department head, consider pausing agent intake
