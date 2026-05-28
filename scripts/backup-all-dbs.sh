#!/usr/bin/env bash
# Phase 31e — back up every CDC ATS Postgres database.
#
# Iterates the 9 service DBs (identity, tenant, billing, job, candidate,
# interview, resume, screening, notification), runs pg_dump per database,
# compresses to .sql.gz, and ships the bundle to either S3 (if AWS env
# vars set) or a local directory.
#
# Usage:
#   ./scripts/backup-all-dbs.sh                 # local-only, to ./backups/
#   BACKUP_DIR=/mnt/backups ./scripts/backup-all-dbs.sh
#   AWS_S3_BACKUP_BUCKET=my-bucket ./scripts/backup-all-dbs.sh
#
# Designed to be idempotent — re-running creates a new timestamped
# directory, never overwrites. Run nightly via cron or k8s CronJob.
#
# Required: pg_dump 16+, gzip, optionally aws CLI.

set -euo pipefail

# ── config ──────────────────────────────────────────────────────────────
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5434}"
PG_USER="${PG_USER:-postgres}"
PG_PASSWORD="${PG_PASSWORD:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# The 9 service databases. Add new ones here as services are added.
DATABASES=(
  identity_db
  tenant_db
  billing_db
  job_db
  candidate_db
  interview_db
  resume_db
  screening_db
  notification_db
)

# ── prep ────────────────────────────────────────────────────────────────
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT_DIR="${BACKUP_DIR}/${STAMP}"
mkdir -p "${OUT_DIR}"

export PGPASSWORD="${PG_PASSWORD}"

echo "==> CDC ATS backup starting at ${STAMP}"
echo "    Target dir: ${OUT_DIR}"
echo "    Source:     ${PG_USER}@${PG_HOST}:${PG_PORT}"

# ── per-db dump ─────────────────────────────────────────────────────────
TOTAL_BYTES=0
for db in "${DATABASES[@]}"; do
  echo -n "    ${db} ... "
  out="${OUT_DIR}/${db}.sql.gz"
  if pg_dump \
      --host="${PG_HOST}" \
      --port="${PG_PORT}" \
      --username="${PG_USER}" \
      --format=plain \
      --no-owner \
      --no-privileges \
      --clean \
      --if-exists \
      "${db}" 2>/dev/null | gzip --best > "${out}"; then
    bytes=$(wc -c < "${out}")
    TOTAL_BYTES=$((TOTAL_BYTES + bytes))
    printf 'ok (%s)\n' "$(numfmt --to=iec "${bytes}" 2>/dev/null || echo "${bytes}B")"
  else
    echo "FAILED"
    exit 1
  fi
done

# ── manifest ────────────────────────────────────────────────────────────
# Plain-text index so a human can see what's in the bundle without unzipping.
{
  echo "CDC ATS backup manifest"
  echo "Created: ${STAMP}"
  echo "Total size: $(numfmt --to=iec "${TOTAL_BYTES}" 2>/dev/null || echo "${TOTAL_BYTES}B")"
  echo ""
  echo "Databases:"
  ls -lh "${OUT_DIR}"/*.sql.gz | awk '{print "  " $9 " " $5}'
} > "${OUT_DIR}/MANIFEST.txt"

cat "${OUT_DIR}/MANIFEST.txt"

# ── optional S3 upload ──────────────────────────────────────────────────
if [[ -n "${AWS_S3_BACKUP_BUCKET:-}" ]]; then
  echo ""
  echo "==> Uploading to s3://${AWS_S3_BACKUP_BUCKET}/${STAMP}/"
  if ! command -v aws >/dev/null 2>&1; then
    echo "ERROR: aws CLI not found. Install it or unset AWS_S3_BACKUP_BUCKET." >&2
    exit 1
  fi
  aws s3 sync "${OUT_DIR}" "s3://${AWS_S3_BACKUP_BUCKET}/${STAMP}/" \
    --storage-class STANDARD_IA \
    --no-progress
fi

# ── retention prune (local only — S3 lifecycle policy handles cloud) ────
echo ""
echo "==> Pruning local backups older than ${RETENTION_DAYS} days"
find "${BACKUP_DIR}" -mindepth 1 -maxdepth 1 -type d -mtime "+${RETENTION_DAYS}" -exec rm -rf {} \;

echo ""
echo "==> Backup complete: ${OUT_DIR}"
