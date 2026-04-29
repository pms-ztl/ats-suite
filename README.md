# ATS -- AI-Powered Applicant Tracking System

Enterprise-grade applicant tracking system with 12 real AI agents powered by Claude and OpenAI. Not mock implementations -- every agent makes actual LLM calls with structured output, human-in-the-loop checkpoints, and full audit trails.

## What Makes This Different

- **12 production AI agents** that call Claude/OpenAI via Vercel AI SDK (not stubs or mock responses)
- **Human-in-the-loop** review queues for every AI decision that affects candidates
- **ReAct agent loops** with planning, tool use, and memory (not single-shot prompts)
- **Bias auditing** with EEOC 4/5ths rule computed from real hiring data
- **GDPR compliance** with right-to-erasure, data export, consent tracking, and retention policies
- **Row Level Security** ensuring complete tenant isolation at the database level
- **Auto-pipeline** via BullMQ: upload a resume and it flows through parse > screen > rank automatically
- **691+ backend tests**, 27+ frontend tests, agent eval suite, and adversarial injection defense tests

## Quick Start

```bash
cd backend && npm install && npm run setup
cd ../frontend && npm install && npm run dev
```

The setup script generates secrets, runs migrations, seeds the database, and validates your configuration. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full details.

## Architecture

| Layer | Stack | Port |
|-------|-------|------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui | 3000 |
| Backend | Express 5, TypeScript, Prisma ORM, PostgreSQL 16 | 4000 |
| AI | Vercel AI SDK 4.x, @ai-sdk/anthropic, @ai-sdk/openai, pgvector | -- |
| Workers | BullMQ, Redis 7, auto-pipeline orchestration | -- |
| Observability | Prometheus, Pino, Langfuse, Sentry | -- |
| Auth | JWT (argon2), RBAC (Admin/Recruiter/Hiring Manager/Interviewer/Compliance Officer) | -- |

## 12 AI Agents

| Agent | Purpose | Trigger |
|-------|---------|---------|
| Resume Parser | Extracts structured candidate data from PDF/DOCX | Auto on upload |
| Screening Agent | Scores candidates against requisition criteria | Auto after parse (HITL on rejections) |
| JD Author | Generates inclusive, bias-free job descriptions | Manual |
| Scheduling Agent | Proposes optimal interview time slots | Manual |
| Candidate Chat | Answers candidate questions about roles and process | Candidate portal widget |
| Sourcing Agent | Finds matching candidates from talent pool | Manual |
| Interview Kit | Generates role-specific interview questions | Manual |
| Interview Intelligence | Analyzes interview recordings for insights | Manual |
| Offer Agent | Drafts competitive compensation packages | Manual |
| Recruiter Copilot | Natural-language Q&A over pipeline data | Manual |
| Analytics Agent | Generates pipeline insights and bottleneck analysis | Manual |
| Bias Auditor | Computes adverse impact metrics from real hiring data | Manual + scheduled |

Every agent uses structured output (Zod schemas), includes cost tracking, respects tenant isolation, and logs to Langfuse for observability.

## Key Features

- **Pipeline Management** -- Kanban boards, stage transitions, bulk actions, candidate timeline
- **Requisition Workflow** -- Draft > Approval > Published lifecycle with role-based permissions
- **Interview Scheduling** -- Calendar integration, iCal invites, availability management
- **Analytics Dashboard** -- Recharts-powered hiring funnel, time-to-hire, source effectiveness
- **Email Integration** -- SendGrid + Nodemailer with templated notifications and iCal attachments
- **Billing & Cost Control** -- Per-agent token tracking, daily cost ceilings, usage dashboards
- **Multi-tenant** -- Complete tenant isolation via RLS, scoped queries, and tenant-aware middleware
- **Compliance** -- GDPR data subject requests, EEOC reporting, full audit trail

## API Documentation

| Endpoint | Description |
|----------|-------------|
| http://localhost:4000/api/docs | Swagger UI |
| http://localhost:4000/api/openapi.json | OpenAPI JSON spec |
| http://localhost:4000/metrics | Prometheus metrics |
| http://localhost:4000/api/health | Health check |

## Testing

```bash
# Backend unit + integration tests (691+ tests)
cd backend && npm test

# Frontend tests (27+ tests)
cd frontend && npm test

# Agent evaluation suite
cd backend && npm run eval

# Adversarial prompt injection defense tests
cd backend && npm run eval:adversarial

# Load tests (requires k6)
cd backend && npm run load-test:smoke
cd backend && npm run load-test:stress
```

## Deployment Options

### Development
```bash
cd backend && npm run setup   # First-time setup
npm run dev                   # Start backend
```

### Docker
```bash
export JWT_SECRET=$(openssl rand -base64 64)
docker-compose up -d
```
Starts PostgreSQL, Redis, Langfuse, backend, and frontend.

### Production
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for environment variables, health checks, database management, and monitoring configuration.

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) -- Setup, Docker, production deployment, database management
- [Admin Guide](docs/ADMIN-GUIDE.md) -- Workflows, agent configuration, compliance reporting
- [Architecture](docs/ARCHITECTURE.md) -- System design, data flow, agent architecture

## Tech Stack

- **Runtime:** Node.js 22, TypeScript 6, Express 5.2
- **Database:** PostgreSQL 16, Prisma 7.6, pgvector
- **Frontend:** Next.js 14, React 18, Tailwind 3.4, shadcn/ui
- **AI:** Vercel AI SDK 4.x, Claude (Anthropic), GPT-4o (OpenAI)
- **Workers:** BullMQ, Redis 7 (IORedis)
- **Auth:** JWT with argon2 hashing, RBAC, tenant-scoped
- **Observability:** Prometheus (prom-client), Pino, Langfuse, Sentry
- **Testing:** Vitest, Playwright, k6 load testing
- **Infrastructure:** Docker, GitHub Actions CI
