# Deploy runbook

How to apply pending migrations + bring the stack up cleanly. Read this
before your first production deploy AND every time the migration list
changes.

## Pending migrations (as of Phase 37)

The migrations below were authored in offline development and **have not
been applied to any live database yet**. On first deploy, `prisma migrate
deploy` against each service's database will apply them in order.

| Migration | Database | What it adds |
|---|---|---|
| `20260528050000_add_onboarding` | `tenant_db` | `Tenant.onboardingSteps` JSON + dismissed/completed timestamps (Phase 29) |
| `20260528060000_add_stripe` | `billing_db` | `StripeSubscription` + `StripeWebhookEvent` tables (Phase 30) |
| `20260528060500_add_stripe_customer_id` | `tenant_db` | `Tenant.stripeCustomerId` (Phase 30) |
| `20260528070000_add_email_verification` | `identity_db` | `User.emailVerified` + `EmailVerification` table; backfills existing users to `true` (Phase 31b) |
| `20260528080000_add_support_tickets` | `notification_db` | `SupportTicket` + `SupportTicketMessage` (Phase 32b) |
| `20260528090000_add_plan_change_activation` | `tenant_db` | `PlanChangeRequest.paymentMethod` + `activatedAt`; backfills legacy approved rows (Phase 33a) |
| `20260528100000_add_tenant_api_keys` | `identity_db` | `TenantApiKey` (Phase 34b) |
| `20260528110000_add_sms_conversations` | `notification_db` | `SmsConversation` + `SmsConvoStep` enum (Phase 34e) |
| `20260528120000_add_parsed_summary` | `candidate_db` | `Candidate.parsedSummary` JSON (Phase 35c) |
| `20260528130000_add_parsed_summary_fair` | `candidate_db` | `Candidate.parsedSummaryFair` JSON (Phase 37j) |

## Apply order

Apply per-service. Each service has its own database; there are no
cross-DB dependencies.

```bash
# From the repo root:
for service in identity tenant billing job candidate interview resume screening notification; do
  echo "=== $service ==="
  (cd apps/$service-service && npx prisma migrate deploy)
done
```

For a single service, e.g. candidate-service:

```bash
cd apps/candidate-service
npx prisma migrate deploy
```

## Verifying

After applying:

```bash
# Each service exposes /health/ready — checks DB connectivity.
for port in 4001 4002 4003 4004 4005 4006 4007 4008 4009; do
  echo -n "Port $port: "
  curl -s http://localhost:$port/health/ready | head -c 120
  echo
done
```

All should return `{"status":"ready",...}`.

## Rollback

Prisma `migrate deploy` is forward-only. To roll back a single migration,
generate the inverse SQL by hand and apply it directly with `psql`. Do NOT
try to use `prisma migrate reset` against a database with real data — it
drops the schema.

For the Phase 37j migration (most recent), rollback is:

```sql
-- candidate_db
ALTER TABLE "Candidate" DROP COLUMN "parsedSummaryFair";
```

The migration table entry will then need to be removed:

```sql
DELETE FROM _prisma_migrations WHERE migration_name = '20260528130000_add_parsed_summary_fair';
```

## Re-parse trigger after the parsedSummary migration

Phase 35c added `Candidate.parsedSummary`; Phase 37 enriches it.
Candidates uploaded BEFORE this migration have `parsedSummary = null`.
To backfill:

```bash
# Run the resume parser again for every candidate with a resume but no parsed summary
psql $CANDIDATE_DATABASE_URL -tA -c "
  SELECT c.id FROM \"Candidate\" c
  WHERE c.\"parsedSummary\" IS NULL
" | while read candidate_id; do
  curl -X POST "$API_BASE/internal/resume/reparse/$candidate_id" \
    -H "X-User-Id: system" \
    -H "X-Tenant-Id: $(psql ... fetch tenant)" \
    -H "X-User-Role: ADMIN"
done
```

(That `/internal/resume/reparse` endpoint doesn't exist yet — a follow-up
adds it. Until then, the simplest backfill is "upload the resume again,"
which will replace the existing parse.)

## Order of operations on a fresh deploy

1. `docker compose up -d postgres redis nats minio` (or k8s equivalent)
2. Wait for healthy: `docker compose ps`
3. Apply all migrations (script above)
4. `docker compose up -d` for the application services
5. Verify `/health/ready` on each service
6. Smoke-test login + a single candidate creation

## Common failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Migration fails with "relation already exists" | Migration partially applied | Inspect `_prisma_migrations` table; either mark as applied (`prisma migrate resolve --applied`) or roll back + retry |
| Migration fails with "column does not exist" on an earlier migration | Service was running an older migration set | Check `prisma/migrations/` matches the deployed image |
| `resume-service` exits with "S3 storage not configured" | Phase 36c guard | Set `S3_*` env vars OR set `NODE_ENV != production` for text-only mode |
| `Candidate.parsedSummary` stays null after resume upload | NATS subscriber not running | Confirm `candidate-service` log includes "candidate-service NATS subscribers started" |
