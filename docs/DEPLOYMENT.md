# ATS Deployment Guide

## Quick Start (Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+ (optional -- enables auto-pipeline)

### 1. Clone & Install
```bash
git clone <repo-url> && cd ats
cd backend && npm install
cd ../frontend && npm install
```

### 2. First-Run Setup
```bash
cd backend
./scripts/first-run.sh
```
This generates .env, runs migrations, seeds the database, and validates configuration.

### 3. Start Development Servers
```bash
# Terminal 1
cd backend && npm run dev    # http://localhost:4000

# Terminal 2
cd frontend && npm run dev   # http://localhost:3000
```

### 4. Login
- URL: http://localhost:3000
- Email: admin@acme.com
- Password: Password123!

## Docker Deployment

### 1. Set Environment
```bash
export JWT_SECRET=$(openssl rand -base64 64)
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...
```

### 2. Start Services
```bash
docker-compose up -d
```

Services started:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Langfuse (port 3001)
- Backend API (port 4000)
- Frontend (port 3000)

### 3. Run Migrations & Seed
```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run db:seed
```

## Production Deployment

### Environment Variables (Required)
| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection | postgresql://user:pass@host:5432/ats_db |
| JWT_SECRET | At least 64 character secret | (generate with openssl rand -base64 64) |
| CORS_ORIGIN | Frontend URL | https://ats.yourcompany.com |
| NODE_ENV | Environment | production |

### Environment Variables (Optional)
| Variable | Description | Default |
|----------|-------------|---------|
| ANTHROPIC_API_KEY | Claude API key | (AI agents disabled without this) |
| OPENAI_API_KEY | OpenAI API key | (Embeddings disabled) |
| REDIS_URL | Redis connection | (Auto-pipeline disabled) |
| SENTRY_DSN | Sentry error tracking | (Disabled) |
| LANGFUSE_PUBLIC_KEY | Langfuse tracing | (Disabled) |
| LANGFUSE_SECRET_KEY | Langfuse tracing | (Disabled) |
| SENDGRID_API_KEY | Email delivery | (Falls back to SMTP) |

### Health Checks
- Liveness: GET /healthz
- Readiness: GET /readyz (checks DB)
- Health: GET /api/health

### Monitoring
- Prometheus metrics: GET /metrics
- Langfuse dashboard: http://localhost:3001 (if configured)
- Sentry: dashboard at sentry.io (if configured)

## Database Management

### Backups
```bash
npm run backup                      # Creates backup in ./backups/
./scripts/backup.sh /path/to/dir   # Custom output directory
```

### Restore
```bash
./scripts/restore.sh ./backups/ats_backup_YYYYMMDD.sql.gz
```

## Testing

### Run All Tests
```bash
cd backend && npm test           # 691+ backend tests
cd frontend && npm test          # 27+ frontend tests
```

### Run Agent Evaluations
```bash
cd backend && npm run eval       # Runs all agent evals
npm run eval:adversarial         # Runs injection defense tests
```

### Load Testing
```bash
k6 run backend/load-tests/smoke.js     # 10 VUs, 30s
k6 run backend/load-tests/stress.js    # Ramp to 100 VUs
```
