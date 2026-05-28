# Operations Runbook

How to keep CDC ATS healthy in production. Covers monitoring,
alerting, common incidents, and backup/restore.

## At a glance

| URL | What |
|---|---|
| `http://<host>:9090` | Prometheus — query metrics, browse alert state |
| `http://<host>:9093` | Alertmanager — see active/silenced alerts, route config |
| `http://<host>:3001` | Grafana — dashboards |
| `http://<host>:16686` | Jaeger — distributed traces |

Local: replace `<host>` with `localhost`. Production: substitute your deployed hostnames (see `k8s/` manifests).

## Alerting (Phase 31d)

Alerts are defined in [`infra/alerts.yml`](../infra/alerts.yml) and routed
by [`infra/alertmanager.yml`](../infra/alertmanager.yml).

### Severity ladder

| Severity | Where it goes | Response time |
|---|---|---|
| **critical** | PagerDuty page + `#ops-critical` Slack | Now |
| **warning**  | `#ops-warnings` Slack | Within business hours |
| **info**     | Prometheus only (no notification) | When you have time |

### Alert catalog

| Alert | What it means | First action |
|---|---|---|
| `ServiceDown` | A scrape target is unreachable for 2m | `docker logs cdc-ats-<service>` or `kubectl logs -l app=<service>` |
| `ServiceUnhealthy` | `/health/ready` failing for 3m | Service is up but a dep (DB/NATS/Redis) is down — check it |
| `HighErrorRate` | >5% 5xx rate for 5m | Roll back the last deploy if it correlates |
| `HighClientErrorRate` | >10% non-auth 4xx for 10m | Frontend regression or integration drift |
| `HighP99Latency` | p99 > 2s for 10m | Slow query, exhausted pool, or downstream slowdown |
| `StripeWebhookFailures` | >5 failed webhook deliveries in 10m | Subscription state drifting; check `StripeWebhookEvent.processingError` |
| `EmailDeliveryBacklog` | Queue > 100 for 15m | BullMQ worker stuck or SMTP down |
| `AgentCostSpike` | Tenant burning > $50/h in LLM costs | Investigate; consider per-tenant agent kill switch |

### Wiring to real notification channels

The shipped config uses environment variable placeholders so the same file
works in dev (no notifications) and prod (real PagerDuty + Slack):

```bash
# In your deployment env file
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...
PAGERDUTY_SERVICE_KEY=your-32-char-integration-key
```

Then restart Alertmanager (`docker compose restart alertmanager` or
`kubectl rollout restart deployment/alertmanager`).

### Silencing during planned maintenance

```bash
# Silence the ServiceDown alert for billing-service for 30 minutes
curl -X POST http://localhost:9093/api/v2/silences \
  -H 'Content-Type: application/json' \
  -d '{
    "matchers": [
      {"name":"alertname","value":"ServiceDown","isRegex":false},
      {"name":"job","value":"billing-service","isRegex":false}
    ],
    "startsAt":"'"$(date -u +%FT%TZ)"'",
    "endsAt":"'"$(date -u -d '+30 min' +%FT%TZ)"'",
    "createdBy":"deploy.sh",
    "comment":"Planned: billing-service rolling restart"
  }'
```

## Common incidents

### Service down

1. Confirm with Prometheus (`up{job="<service>"}`)
2. Check container logs
3. If it's crash-looping with a Prisma error, the most likely cause is a
   pending migration that didn't run — `prisma migrate deploy` from a one-shot pod
4. If it's an OOMKilled, bump the container limit and look at recent code changes
   for memory leaks (BullMQ queues that never drain are a common culprit)

### Stripe webhooks failing

1. Open Stripe Dashboard → Developers → Webhooks → click the failing endpoint
2. Compare Stripe's "Recent deliveries" to our `StripeWebhookEvent` table:
   ```sql
   SELECT id, type, "processingError", "processedAt"
   FROM "StripeWebhookEvent"
   ORDER BY "createdAt" DESC
   LIMIT 20;
   ```
3. To replay a specific event: copy the payload from `StripeWebhookEvent.payload`
   and POST it back through `stripe events resend evt_xxx` from the CLI

### Plan stuck on wrong tier

If a tenant's `Tenant.plan` doesn't match what Stripe says:

1. Check `StripeSubscription` in billing-service DB — what does it think the plan is?
2. Check `TenantPlanCache` in billing-service — does it match?
3. Run `stripe subscriptions retrieve sub_xxx` to see the actual Stripe state
4. Manual fix: PUT `/internal/tenants/:id/plan-from-stripe` with `{plan, stripeStatus}`
   — that's the same endpoint the webhook hits

### Invite email never arrived (Phase 31a)

1. Check the audit log: `SELECT * FROM "AuditEvent" WHERE action='USER_INVITED' ORDER BY "createdAt" DESC LIMIT 5;`
2. Check the BullMQ delivery queue in Redis: `redis-cli -p 6381 KEYS 'bull:delivery:*'`
3. Check notification-service logs: `docker logs cdc-ats-notification-service | grep <email>`
4. As a manual workaround, copy the `InviteToken.token` from the DB and hand the
   user the `/accept-invite?token=...` URL directly

### Emails verification stuck (Phase 31b)

1. Same as above for delivery
2. To force-verify a user (e.g. for support):
   ```sql
   UPDATE "User" SET "emailVerified"=true, "emailVerifiedAt"=NOW()
   WHERE email='user@company.com';
   ```

## Backup / restore

See [`BACKUP.md`](BACKUP.md) for the full procedure. Quick reference:

- **Nightly**: automated pg_dump of all 10 DBs to S3 (or local dir in dev)
- **Restore drill**: documented quarterly procedure to validate backups
- **RTO**: 15 minutes (single service) / 60 minutes (full platform)
- **RPO**: 24 hours (pg_dump cadence) — tighten with WAL-G for sub-minute

## Adding a new alert

1. Add the rule to `infra/alerts.yml` under an appropriate group
2. Test the expression in Prometheus → Graph
3. Test the route in Alertmanager → http://localhost:9093/#/status → Receivers
4. `docker compose restart prometheus alertmanager`
5. Document the alert in the catalog above
