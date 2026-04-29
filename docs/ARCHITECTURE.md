# ATS Architecture Summary

## System Overview
AI-powered Applicant Tracking System with genuine agentic capabilities.

## Tech Stack
- **Backend**: Express 5, TypeScript, Prisma 7, PostgreSQL 16
- **Frontend**: Next.js 14, React 18, Tailwind, shadcn/ui
- **AI**: Vercel AI SDK 4 → Claude Sonnet 4 (primary), GPT-4.1 (fallback), Haiku 3.5 (chat)
- **Vector**: pgvector (1536d, HNSW, cosine similarity)
- **Observability**: Prometheus + Pino + Langfuse
- **Auth**: JWT + OIDC (Google, Microsoft)
- **Queue**: BullMQ (planned)
- **Deploy**: Docker + GitHub Actions CI

## Agent Catalog (V1)
1. Resume Parser — Claude Sonnet → ParsedResumeSchema → PII redacted
2. Screening Agent — Claude Sonnet → scored dimensions + HITL on rejections
3. JD Author — Claude Sonnet → inclusive JD + bias self-check
4. Scheduling Agent — Claude Sonnet → calendar freebusy tools + HITL before invites
5. Candidate Experience — Haiku → chat with guardrails + escalation

## Key Endpoints
- Auth: /api/auth/login, /me, /refresh
- Candidates: /api/candidates (CRUD + /parse + /ai-screen)
- Requisitions: /api/requisitions (CRUD + /ai-draft)
- Interviews: /api/interviews (CRUD + feedback)
- Scheduling: /api/scheduling (CRUD + /ai-schedule)
- Agents: /api/agents/runs, /hitl
- Compliance: /api/compliance/gdpr/*, /adverse-impact
- Billing: /api/billing/usage, /budget, /agents

## Multi-Tenancy
Shared schema + Postgres RLS on 69 tables. Tenant context set via Prisma middleware.

## Test Coverage
296+ automated tests (backend + frontend). Eval gate at 80% pass rate per agent.
