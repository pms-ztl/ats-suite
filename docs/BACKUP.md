# Backup & Disaster Recovery

How CDC ATS gets backed up and how to restore. Owner: whoever's on-call.

## What we back up

Every service has its own Postgres database. The backup script dumps **all 9**
in one run so backups are point-in-time consistent across the platform:

| Database | Owns |
|---|---|
| `identity_db` | Users, MFA, invite/verify/reset tokens, audit log, SSO config |
| `tenant_db` | Tenants, branding, onboarding state, plan changes, retention config |
| `billing_db` | Plan cache, agent costs, Stripe subscription mirror, kill switches |
| `job_db` | Requisitions, job postings, form schemas |
| `candidate_db` | Candidates, applications, notes, attachment metadata |
| `interview_db` | Rounds, interviews, panelists, feedback |
| `resume_db` | Parsed resumes |
| `screening_db` | Screening results |
| `notification_db` | Notification history, email templates, delivery log |

**Not backed up by these scripts:** Redis (ephemeral — BullMQ queues
re-hydrate on worker restart), NATS Jetstream (persistent on disk, separate
backup), raw object storage (S3 lifecycle policy handles its own backups).

## Schedule

- **Production**: nightly at 03:00 UTC via Kubernetes CronJob
  (`infra/k8s/charts/cdc-ats/templates/backup-cronjob.yaml`)
- **Local dev**: manual via `./scripts/backup-all-dbs.sh`
- **Retention**: 30 days local, 90 days S3 (S3 lifecycle policy moves to
  Glacier after 30 days for cost)

## Where backups live

| Where | Path |
|---|---|
| Local dev | `./backups/<UTC-timestamp>/` (gitignored) |
| K8s cluster | PVC `cdc-ats-backups` mounted at `/backups` |
| S3 | `s3://${AWS_S3_BACKUP_BUCKET}/<UTC-timestamp>/` (if configured) |

Each backup directory contains:
```
20260528T030000Z/
  identity_db.sql.gz
  tenant_db.sql.gz
  billing_db.sql.gz
  ...
  MANIFEST.txt
```

## Targets

| Metric | Target | What it means |
|---|---|---|
| **RTO** | 60 min (full platform) / 15 min (single service) | Time from "we know" → "back online" |
| **RPO** | 24h | Most recent point we can recover to |

To tighten RPO sub-minute, enable WAL-G on the Postgres pod (out of scope
for the v1 runbook).

## How to back up manually

### Local dev (docker compose)

```bash
# Default: dumps to ./backups/<timestamp>/
./scripts/backup-all-dbs.sh

# Custom location
BACKUP_DIR=/mnt/backups ./scripts/backup-all-dbs.sh

# Also upload to S3
AWS_S3_BACKUP_BUCKET=my-cdc-ats-backups \
  AWS_ACCESS_KEY_ID=AKIA... \
  AWS_SECRET_ACCESS_KEY=... \
  ./scripts/backup-all-dbs.sh
```

### Production (Kubernetes)

```bash
# Trigger a manual backup outside the schedule
kubectl create job --from=cronjob/cdc-ats-backup cdc-ats-backup-manual-$(date +%s)

# Watch it run
kubectl logs -f job/cdc-ats-backup-manual-...

# Verify the backup landed in the PVC
kubectl exec -it deploy/cdc-ats-backup-shell -- ls -lh /backups/
```

## How to restore

### Single database (most common — e.g. you reverted a bad migration)

```bash
# 1. Stop the service that owns the DB to prevent writes during restore
docker compose stop identity-service     # or kubectl scale --replicas=0 …

# 2. Restore
./scripts/restore-db.sh identity_db ./backups/20260528T030000Z

# 3. Restart the service
docker compose start identity-service
```

### Test restore without overwriting (verification drill)

```bash
# Restores into identity_db_test instead of identity_db
TARGET_DB_NAME=identity_db_test \
  ./scripts/restore-db.sh identity_db ./backups/20260528T030000Z

# Verify
psql -h localhost -p 5434 -U postgres -d identity_db_test \
  -c 'SELECT count(*) FROM "User";'

# Clean up when done
psql -h localhost -p 5434 -U postgres -d postgres \
  -c 'DROP DATABASE identity_db_test;'
```

### Full platform restore

If everything is gone, do them in dependency order:

```bash
BACKUP=./backups/20260528T030000Z

# 1. Identity first — nothing else works without users
./scripts/restore-db.sh identity_db "${BACKUP}"
# 2. Tenant — plan info needed by billing's plan cache
./scripts/restore-db.sh tenant_db "${BACKUP}"
# 3. Billing — needed by services that gate on agents
./scripts/restore-db.sh billing_db "${BACKUP}"
# 4. The rest in parallel
./scripts/restore-db.sh job_db        "${BACKUP}" &
./scripts/restore-db.sh candidate_db  "${BACKUP}" &
./scripts/restore-db.sh interview_db  "${BACKUP}" &
./scripts/restore-db.sh resume_db     "${BACKUP}" &
./scripts/restore-db.sh screening_db  "${BACKUP}" &
./scripts/restore-db.sh notification_db "${BACKUP}" &
wait

# 5. Restart all services so they re-establish DB connections cleanly
docker compose restart
```

### Recovering from S3 only (PVC also lost)

```bash
mkdir -p ./restored
aws s3 sync s3://my-cdc-ats-backups/20260528T030000Z/ ./restored/
./scripts/restore-db.sh identity_db ./restored
# ... etc per "Full platform restore" above
```

## Quarterly restore drill

**The only backup that matters is one you've tested.** Run this every
calendar quarter:

1. Pick the most recent backup
2. Restore each DB to a `*_drill` shadow database (use `TARGET_DB_NAME`)
3. Run these queries and record the counts in your incident log:
   ```sql
   -- identity_db_drill
   SELECT count(*) FROM "User" WHERE "isActive" = true;
   -- tenant_db_drill
   SELECT count(*) FROM "Tenant" WHERE status = 'ACTIVE';
   -- candidate_db_drill
   SELECT count(*) FROM "Candidate";
   ```
4. Confirm counts are within 1% of live (some drift over the recovery window
   is normal; >10% means the backup is stale or corrupted)
5. Drop the `*_drill` databases
6. Sign off in the drill log — date, who, results

If a drill fails, treat it as a P1 incident and fix the backup pipeline
before the next scheduled backup.

## Common failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `pg_dump: connection failed` | DB pod down or wrong host | Check `PG_HOST` env in the CronJob |
| `permission denied for table X` | DB role missing | Run as superuser; the script already uses `--no-owner --no-privileges` |
| `disk full` during dump | PVC sized too small | Bump `backup.pvcSize` in `values.yaml` and re-apply |
| S3 upload fails silently | Missing AWS creds | `kubectl describe secret cdc-ats-backup-aws-creds` |
| Restore fails with foreign-key errors | Restored DBs in wrong order | See "Full platform restore" — identity → tenant → billing → rest |

## Security notes

- Backups contain ALL data including hashed passwords, MFA secrets, and SSO
  client secrets. Treat them as crown jewels: encrypted-at-rest (S3 SSE),
  IAM-restricted bucket access, no public read.
- The pg_dump uses `--no-owner --no-privileges` so dumps are portable
  between environments (dev/staging/prod can all share a restore tool).
- Service tokens, JWT secrets, and Stripe API keys live in env / k8s
  Secrets — they're NOT in the DB and NOT in these backups. Back those
  up separately (1Password, Vault, sealed-secrets, etc.).
