#!/bin/bash
# ATS Database Backup Script
# Usage: ./scripts/backup.sh [output_dir]
# Requires: pg_dump, PGPASSWORD or .pgpass

set -euo pipefail

OUTPUT_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${OUTPUT_DIR}/ats_backup_${TIMESTAMP}.sql.gz"

# Parse DATABASE_URL or use defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-ats_db}"
DB_USER="${DB_USER:-ats}"

mkdir -p "$OUTPUT_DIR"

echo "Starting backup of ${DB_NAME}..."
echo "   Host: ${DB_HOST}:${DB_PORT}"
echo "   Output: ${BACKUP_FILE}"

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --format=custom --compress=9 --verbose \
  --exclude-table-data='_prisma_migrations' \
  2>/dev/null | gzip > "$BACKUP_FILE"

FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup complete: ${BACKUP_FILE} (${FILE_SIZE})"

# Cleanup old backups (keep last 30)
ls -t "${OUTPUT_DIR}"/ats_backup_*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm
echo "Old backups cleaned (keeping last 30)"
