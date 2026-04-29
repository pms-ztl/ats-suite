#!/bin/bash
# ATS Database Restore Script
# Usage: ./scripts/restore.sh <backup_file>
# WARNING: This will OVERWRITE the target database

set -euo pipefail

BACKUP_FILE="${1:?Usage: ./scripts/restore.sh <backup_file.sql.gz>}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-ats_db}"
DB_USER="${DB_USER:-ats}"

echo "WARNING: This will OVERWRITE database ${DB_NAME} on ${DB_HOST}:${DB_PORT}"
echo "   Backup file: ${BACKUP_FILE}"
read -p "   Type 'RESTORE' to confirm: " CONFIRM

if [ "$CONFIRM" != "RESTORE" ]; then
  echo "Restore cancelled"
  exit 1
fi

echo "Restoring from ${BACKUP_FILE}..."

gunzip -c "$BACKUP_FILE" | pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
  -d "$DB_NAME" --clean --if-exists --no-owner --verbose 2>/dev/null

echo "Restore complete"
echo "Running Prisma migrations..."
cd "$(dirname "$0")/.." && npx prisma migrate deploy
echo "Migrations applied"
