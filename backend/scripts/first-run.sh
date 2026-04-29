#!/bin/bash
# ATS First-Run Setup Script
# Guides a new user through configuring and starting the ATS
# Usage: ./scripts/first-run.sh

set -euo pipefail

echo ""
echo "================================================================"
echo "   ATS -- AI-Powered Applicant Tracking System"
echo "   First-Run Setup"
echo "================================================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "ERROR: npm is required."; exit 1; }

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "ERROR: Node.js 20+ required (found v$(node --version))"
  exit 1
fi
echo "  [OK] Node.js $(node --version)"

# Check if .env exists
if [ ! -f ".env" ]; then
  echo ""
  echo "Creating .env file from template..."
  cp .env.example .env

  # Generate JWT secret
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
  else
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
  fi
  echo "  [OK] JWT_SECRET generated (64 bytes)"

  echo ""
  echo "WARNING: Please edit .env to configure:"
  echo "  - DATABASE_URL (PostgreSQL connection string)"
  echo "  - ANTHROPIC_API_KEY (for AI agents)"
  echo "  - OPENAI_API_KEY (for embeddings)"
  echo "  - REDIS_URL (for background workers)"
  echo ""
  read -p "Press Enter after editing .env, or Ctrl+C to abort..."
else
  echo "  [OK] .env file exists"
fi

# Source .env
set -a
source .env
set +a

# Check database connectivity
echo ""
echo "Checking database..."
npx prisma db push --skip-generate 2>/dev/null && echo "  [OK] Database schema synced" || {
  echo "  ERROR: Cannot connect to database. Check DATABASE_URL in .env"
  echo "     Expected format: postgresql://user:password@host:5432/dbname"
  exit 1
}

# Generate Prisma client
echo "  Generating Prisma client..."
npx prisma generate 2>/dev/null
echo "  [OK] Prisma client generated"

# Run migrations
echo "  Running migrations..."
npx prisma migrate deploy 2>/dev/null && echo "  [OK] Migrations applied" || {
  echo "  WARNING: Migration deploy failed -- trying db push instead..."
  npx prisma db push 2>/dev/null
  echo "  [OK] Schema pushed"
}

# Apply RLS policies
echo "  Applying Row Level Security policies..."
if [ -f "prisma/rls_policies.sql" ]; then
  npx prisma db execute --file prisma/rls_policies.sql 2>/dev/null && echo "  [OK] RLS policies applied" || {
    echo "  WARNING: Could not auto-apply RLS policies. Run manually:"
    echo "     psql \$DATABASE_URL < prisma/rls_policies.sql"
  }
fi

# Seed database
echo ""
echo "Seeding database..."
npm run db:seed 2>/dev/null && echo "  [OK] Database seeded" || {
  echo "  WARNING: Seeding failed -- you may need to seed manually: npm run db:seed"
}

# Install frontend dependencies if needed
echo ""
echo "Checking frontend..."
if [ -d "../frontend" ]; then
  cd ../frontend
  if [ ! -d "node_modules" ]; then
    echo "  Installing frontend dependencies..."
    npm install 2>/dev/null
  fi
  echo "  [OK] Frontend ready"
  cd ../backend
fi

# Validate
echo ""
echo "Validation..."

# Check API keys
if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  echo "  [OK] ANTHROPIC_API_KEY configured (AI agents will work)"
else
  echo "  [WARN] ANTHROPIC_API_KEY not set -- AI agents will not function"
fi

if [ -n "${OPENAI_API_KEY:-}" ]; then
  echo "  [OK] OPENAI_API_KEY configured (embeddings will work)"
else
  echo "  [WARN] OPENAI_API_KEY not set -- embeddings will not generate"
fi

if [ -n "${REDIS_URL:-}" ]; then
  echo "  [OK] REDIS_URL configured (auto-pipeline will work)"
else
  echo "  [WARN] REDIS_URL not set -- auto-pipeline disabled (manual triggers only)"
fi

echo ""
echo "================================================================"
echo "   Setup Complete!"
echo "================================================================"
echo ""
echo "   Start the backend:"
echo "     cd backend && npm run dev"
echo ""
echo "   Start the frontend:"
echo "     cd frontend && npm run dev"
echo ""
echo "   Login:"
echo "     URL:      http://localhost:3000"
echo "     Email:    admin@acme.com"
echo "     Password: Password123!"
echo ""
echo "   API Docs:   http://localhost:4000/api/docs"
echo "   Metrics:    http://localhost:4000/metrics"
echo "   Health:     http://localhost:4000/api/health"
echo ""
echo "================================================================"
