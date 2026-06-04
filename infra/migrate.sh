#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Create every service's database schema for the Docker demo.
#   - 9 core services have full Prisma migrations -> `migrate deploy`
#   - notification also gets a `db push` (in-app chat tables were pushed, not migrated)
#   - 4 extra services have schemas but no migrations -> `db push`
#   - candidate gets its raw-SQL embedding columns (not in the schema)
# Best-effort: a failure in one service is logged and does not stop the rest.
# Reads <SVC>_DATABASE_URL env vars (set in docker-compose.demo.yml).
# ─────────────────────────────────────────────────────────────────────────────
set -u
cd /repo

mig() {  # service-dir  database-url
  echo "==> [$1] prisma migrate deploy"
  DATABASE_URL="$2" npx prisma migrate deploy --schema "apps/$1/prisma/schema.prisma" \
    || echo "    !! [$1] migrate deploy failed (continuing)"
}
push() { # service-dir  database-url  [extra flags]
  echo "==> [$1] prisma db push"
  DATABASE_URL="$2" npx prisma db push --schema "apps/$1/prisma/schema.prisma" --skip-generate ${3:-} \
    || echo "    !! [$1] db push failed (continuing)"
}

# --- 9 core services (have migrations) ---
mig identity-service     "$IDENTITY_DATABASE_URL"
mig tenant-service       "$TENANT_DATABASE_URL"
mig billing-service      "$BILLING_DATABASE_URL"
mig job-service          "$JOB_DATABASE_URL"
mig candidate-service    "$CANDIDATE_DATABASE_URL"
mig interview-service    "$INTERVIEW_DATABASE_URL"
mig resume-service       "$RESUME_DATABASE_URL"
mig screening-service    "$SCREENING_DATABASE_URL"
mig notification-service "$NOTIFICATION_DATABASE_URL"

# --- notification: add in-app messaging tables (pushed, not migrated) ---
push notification-service "$NOTIFICATION_DATABASE_URL"

# --- 4 extra services (schemas, no migrations) ---
push search-service     "$SEARCH_DATABASE_URL"     "--accept-data-loss"
push agent-service      "$AGENT_DATABASE_URL"      "--accept-data-loss"
push analytics-service  "$ANALYTICS_DATABASE_URL"  "--accept-data-loss"
push compliance-service "$COMPLIANCE_DATABASE_URL" "--accept-data-loss"

# --- candidate: raw-SQL embedding columns (managed outside the Prisma schema) ---
echo "==> [candidate] embedding columns"
psql "$CANDIDATE_DATABASE_URL" -v ON_ERROR_STOP=0 -c \
  'ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "embedding" jsonb; ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "embeddedAt" timestamptz;' \
  || echo "    !! [candidate] embedding SQL failed (continuing)"

echo "==> Migrations complete."
