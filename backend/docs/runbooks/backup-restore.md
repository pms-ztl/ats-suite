# Runbook: Backup & Restore

## Scheduled Backups
- Run daily: `./scripts/backup.sh /var/backups/ats`
- Cron: `0 2 * * * /app/scripts/backup.sh /var/backups/ats`
- Retention: last 30 backups kept automatically

## Manual Backup
```bash
cd backend
./scripts/backup.sh ./backups
```

## Restore Procedure
1. Stop the application: `docker-compose stop backend`
2. Run restore: `./scripts/restore.sh ./backups/ats_backup_YYYYMMDD_HHMMSS.sql.gz`
3. Verify: `curl http://localhost:4000/api/health`
4. Start application: `docker-compose start backend`

## Restore to Different Environment
1. Copy backup file to target host
2. Set DB_HOST, DB_PORT, DB_NAME, DB_USER environment variables
3. Run restore script
4. Run `npx prisma migrate deploy` to apply any pending migrations
5. Run `npx prisma db seed` if seeding is needed

## Verification After Restore
- [ ] Health check returns 200
- [ ] Login works with known credentials
- [ ] Candidate list shows expected data
- [ ] Agent runs history is intact
