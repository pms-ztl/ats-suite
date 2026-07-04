# candidate-service

Candidates, applications, offers, the hiring pipeline, and the candidate-facing
AI agents (sourcing, offer, candidate-experience) (`@cdc-ats/candidate-service`).
Owns candidate PII and application state. Reached through the api-gateway under
`/internal/*`.

Default port: **4005** (`PORT`).

## Key endpoints

Mounted in `src/app.ts`:

- `/internal/candidates` (`candidates.ts`, `interview-questions.ts`) — `GET /`,
  `GET /overview`, `GET /platform-stats`, `POST /`, `POST /upsert-from-application`,
  `GET /:id`, `GET /:id/applications`, `GET /:id/attachments`, `PATCH /:id`.
- `/internal/candidates/import` (`import.ts`) — CSV / ranked bulk candidate import.
- `/internal/applications` (`applications.ts`) — `POST /`, `GET /`, `GET /time-to-hire`,
  `PATCH /:id`, `POST /attachments`, `POST /:id/hire`, `POST /:id/reject`.
- `/internal/offers` (`offers.ts`) — `GET /`, `GET /:id`, `POST /`, `PATCH /:id`,
  `POST /:id/approve`, `POST /:id/accept`.
- `/internal/sourcing` (`agent-sourcing.ts`), `/internal/offer` (`agent-offer.ts`),
  `/internal/candidate-experience` (`agent-experience.ts`) — the candidate-facing
  AI agent routes (plan-gated at the gateway).
- `/internal/gdpr` (`gdpr.ts`) — GDPR export/erasure legs for candidate data.

Also serves `/health`, `/healthz`, `/metrics`.

## Events

**Produces**: `application.hired`, `application.rejected`, `offer.approved`,
`offer.accepted` (decision events, published in `lib/decision-events.ts`; consumed
by notification-service and onboarding-service).

**Consumes** (via subscribers in `lib/subscribers.ts`): `tenant.*.resume.parsed`
(link a parsed resume to a candidate), `tenant.*.assessment.completed` (attach OA
results to the application), `tenant.*.interview.round.started` (advance pipeline
stage forward-only).

## Background workers (BullMQ, require `REDIS_URL`)

`retention-purge.worker` (periodic candidate-data retention purge).

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `NATS_URL`, `REDIS_URL`,
`CANDIDATE_APP_DATABASE_URL` (RLS app-role), `JOB_SERVICE_URL`,
`INTERVIEW_SERVICE_URL`, `TENANT_SERVICE_URL`, `RETENTION_PURGE_INTERVAL_MIN`, and
the agent feature flags `AGENTIC_SOURCING`, `AGENTIC_OFFER`, `AGENTIC_EXPERIENCE`.

The Prisma datasource reads `CANDIDATE_DATABASE_URL` (superuser client) from
`prisma/schema.prisma`; request routes use the RLS client via
`CANDIDATE_APP_DATABASE_URL`. Background workers and NATS subscribers use the
admin client (`prismaAdmin`).

## Run

```bash
npm run dev --workspace=@cdc-ats/candidate-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=candidate-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
