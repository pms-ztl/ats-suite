#!/usr/bin/env bash
# Phase 31e — restore a single CDC ATS Postgres database from a backup.
#
# Usage:
#   ./scripts/restore-db.sh <database> <backup-dir>
#   ./scripts/restore-db.sh identity_db ./backups/20260528T030000Z
#
# Will:
#   1. Verify the dump file exists.
#   2. Drop + recreate the target database (DESTRUCTIVE — confirms first).
#   3. Restore from the .sql.gz dump.
#
# To restore to a different name (e.g. for verification without overwriting
# prod), set TARGET_DB_NAME:
#   TARGET_DB_NAME=identity_db_restore_test ./scripts/restore-db.sh identity_db ./backups/...

set -euo pipefail

DB_NAME="${1:?Usage: $0 <database> <backup-dir>}"
BACKUP_DIR="${2:?Usage: $0 <database> <backup-dir>}"
TARGET="${TARGET_DB_NAME:-${DB_NAME}}"

PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5434}"
PG_USER="${PG_USER:-postgres}"
PG_PASSWORD="${PG_PASSWORD:-postgres}"

DUMP_FILE="${BACKUP_DIR}/${DB_NAME}.sql.gz"

if [[ ! -f "${DUMP_FILE}" ]]; then
  echo "ERROR: dump file not found: ${DUMP_FILE}" >&2
  exit 1
fi

export PGPASSWORD="${PG_PASSWORD}"

echo "==> CDC ATS restore"
echo "    Source dump:  ${DUMP_FILE}"
echo "    Target host:  ${PG_USER}@${PG_HOST}:${PG_PORT}"
echo "    Target DB:    ${TARGET}"
echo ""
echo "This will DROP and recreate the database ${TARGET}."
read -rp "Type the database name to confirm: " confirm
if [[ "${confirm}" != "${TARGET}" ]]; then
  echo "Aborted." >&2
  exit 1
fi

# Drop + recreate. Use template1 so we don't block on connections to the
# target. --force terminates any active sessions on the target first.
echo "==> Dropping ${TARGET}…"
psql --host="${PG_HOST}" --port="${PG_PORT}" --username="${PG_USER}" \
  --dbname=postgres \
  -c "DROP DATABASE IF EXISTS \"${TARGET}\" WITH (FORCE);"

echo "==> Creating ${TARGET}…"
psql --host="${PG_HOST}" --port="${PG_PORT}" --username="${PG_USER}" \
  --dbname=postgres \
  -c "CREATE DATABASE \"${TARGET}\";"

echo "==> Restoring from ${DUMP_FILE}…"
gunzip -c "${DUMP_FILE}" | psql \
  --host="${PG_HOST}" --port="${PG_PORT}" --username="${PG_USER}" \
  --dbname="${TARGET}" \
  --single-transaction \
  --set ON_ERROR_STOP=on

echo ""
echo "==> Restore complete. Verifying with row counts:"
psql --host="${PG_HOST}" --port="${PG_PORT}" --username="${PG_USER}" \
  --dbname="${TARGET}" \
  -c "SELECT schemaname, relname, n_live_tup
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC
      LIMIT 20;"
