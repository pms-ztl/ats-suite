#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Seed demo data through the gateway API, then upgrade the demo tenants to
# ENTERPRISE so plan-gated AI features are unlocked. Idempotent: the seed skips
# if "Pinnacle Tech" already exists, so it is safe to run on every `up`.
# Reads API_URL, TENANT_DATABASE_URL, BILLING_DATABASE_URL.
# ─────────────────────────────────────────────────────────────────────────────
set -u
cd /repo

echo "==> Waiting for the gateway..."
for i in $(seq 1 80); do
  if curl -fsS "http://api-gateway:4000/healthz" >/dev/null 2>&1; then echo "    gateway is up"; break; fi
  sleep 3
done
# let downstream services finish booting after the gateway answers
sleep 10

echo "==> Seeding demo data (idempotent)..."
API_URL="${API_URL:-http://api-gateway:4000/api}" npx tsx apps/seed-data/src/seed.ts \
  || echo "    !! seed reported errors (continuing)"

echo "==> Unlocking AI: set demo tenants to ENTERPRISE..."
psql "$TENANT_DATABASE_URL" -v ON_ERROR_STOP=0 -c "UPDATE \"Tenant\" SET plan='ENTERPRISE';" \
  || echo "    !! tenant plan upgrade skipped"
psql "$BILLING_DATABASE_URL" -v ON_ERROR_STOP=0 -c "UPDATE \"TenantPlanCache\" SET plan='ENTERPRISE';" \
  || echo "    !! billing plan cache upgrade skipped"

echo "==> Seed complete. The demo is ready."
