# Runbook: Cross-Tenant Data Leak (ALR-010)

## Alert
- **Trigger**: RLS bypass detected OR data returned with mismatched tenantId
- **Severity**: P0 (CRITICAL)
- **Channels**: PagerDuty (immediate), Slack, Email to CTO

## IMMEDIATE ACTIONS (within 5 minutes)
1. **STOP**: Do NOT dismiss this alert. This is the highest severity incident.
2. Verify the alert is not a false positive:
   - Check the request log entry for the flagged request
   - Confirm the response payload contains data from a different tenant
3. If confirmed: Activate incident response

## Incident Response
1. **Isolate**: Disable the affected endpoint immediately
   - Add to blocklist in rate limiter or nginx
   - `POST /api/admin/circuit-breaker/open?endpoint={path}`
2. **Contain**: Identify all requests from the affected session
   - Query audit log for the session token / user ID
   - Determine scope: How many records were exposed? Which tenants?
3. **Preserve evidence**: Snapshot logs, database state, request traces
4. **Notify**: Alert affected tenant admins within 1 hour (GDPR Art. 33: 72h to DPA)

## Root Cause Investigation
1. Check if RLS policies are active: `SELECT * FROM pg_policies WHERE tablename = '{table}'`
2. Check if Prisma middleware set tenantId correctly on the request
3. Check if any raw SQL queries bypass the ORM
4. Check if a recent migration dropped or altered RLS policies
5. Check if the user's JWT contains the correct tenantId claim

## Remediation
1. Fix the RLS gap or middleware bug
2. Deploy hotfix with expedited review
3. Run cross-tenant leakage test suite to confirm fix
4. Re-enable the endpoint only after test passes

## Post-Incident
- File incident report within 24 hours
- Schedule post-mortem within 48 hours
- If personal data was exposed: Begin GDPR breach notification process
- Update cross-tenant test suite to cover the gap
- Consider adding runtime tenant assertion middleware as defense-in-depth

## Escalation
- Immediate: CTO, Engineering Manager, DPO (Data Protection Officer)
- If personal data exposed: Legal team for GDPR notification obligations
- If >100 records affected: Consider external security audit
