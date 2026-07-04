# screening-service

AI candidate screening: scores a parsed resume against a requisition's
requirements and produces a verdict (PASS / REVIEW / REJECT) with per-requirement
evidence (`@cdc-ats/screening-service`). Reached through the api-gateway under
`/internal/screening`.

Default port: **4008** (`PORT`).

## Key endpoints

Mounted in `src/app.ts` under `/internal/screening` (`screening.ts`):

- `POST /score` — run the screener against a candidate/requisition.
- `GET /` — list screening results.
- `GET /:id` — a single screening result.
- `GET /audit/:requisitionId` — screening audit trail for a requisition.

Also serves `/health`, `/healthz`, `/metrics`.

## Events

**Produces**: `screening.completed` (a candidate has been scored),
`screening.review_requested` (human review flagged), and `agent.completed`
(candidate-screener AI run cost). Published via NATS.

**Consumes** (via subscribers in `lib/subscribers.ts`): `tenant.*.resume.parsed`
— when a resume finishes parsing, the screening worker automatically runs the
candidate-screener against the matching open requisition.

## Background workers (BullMQ, require `REDIS_URL`)

`screening.worker` (runs the LLM candidate-screener for queued
resume-parsed events; plan-gated via billing check-agent).

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `NATS_URL`, `REDIS_URL`,
`SCREENING_APP_DATABASE_URL` (RLS app-role), `INTERNAL_SERVICE_TOKEN`,
`CANDIDATE_SERVICE_URL`, `JOB_SERVICE_URL`, `RESUME_SERVICE_URL`,
`BILLING_SERVICE_URL`, `AGENTIC_SCREENER`.

- Scoring thresholds: `SCREENING_PASS_BAR`, `SCREENING_REVIEW_BAR`.
- Worker tuning: `SCREENING_CONCURRENCY`, `SCREENING_RATE_MAX`.

The Prisma datasource reads `SCREENING_DATABASE_URL` (superuser) from
`prisma/schema.prisma`; request routes use the RLS client via
`SCREENING_APP_DATABASE_URL`.

## Run

```bash
npm run dev --workspace=@cdc-ats/screening-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=screening-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
