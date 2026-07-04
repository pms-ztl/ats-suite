# job-service

Requisitions, job postings, custom application forms, the public job feed and
public apply, JD authoring, job-board distribution, and CDC/college partners
(`@cdc-ats/job-service`). Reached through the api-gateway; also serves public
routes for candidate apply and the job feed.

Default port: **4004** (`PORT`).

## Key endpoints

Mounted in `src/app.ts`:

- `/internal/requisitions` (`requisitions.ts`) — `GET /`, `GET /overview`,
  `GET /platform-stats`, `POST /`, `GET /:id`, `PATCH /:id`, `GET|PUT /:id/form`
  (custom application form builder).
- `/internal/job-postings` (`job-postings.ts`) — `POST /` (publish), `GET /`,
  `POST /backfill-open`, `PATCH /:id`.
- `/internal/jd-author` (`jd-author.ts`) — AI job-description authoring.
- `/internal/job-distribution` (`job-distribution.ts`) — per-board post/status/close
  (PROFESSIONAL+, module-gated at the gateway).
- `/internal/colleges` (`colleges.ts`) — CDC / college partner management.
- `/internal/gdpr` (`gdpr.ts`) — GDPR export/erasure legs for job data.
- `/public/feed` (`feed.ts`) — per-tenant XML/JSON job feed (feed-token authorized).
- `/public` (`public.ts`) — `GET /jobs`, `GET /jobs/:slug`, `GET /jobs/:slug/form`,
  `POST /jobs/:slug/apply`, `POST /jobs/:slug/apply-custom`, `GET /applications/:id/status`.
- `/internal/inbound-job-application` (`inbound-job-application.ts`) — raw-body
  job-board inbound application webhook (HMAC-verified, mounted before tenantContext).

Also serves `/health`, `/healthz`, `/metrics`.

## Events

**Produces**: `application.received` and `jobboard.application.received` (a new
application enters the pipeline), `job.closed`, and `agent.completed` (JD-author AI
run cost). Emitted via NATS best-effort.

No event subscriptions in this service (ingestion is inbound-HTTP driven).

## Background workers (BullMQ, require `REDIS_URL`)

`apply-ingest.worker`, `board-post.worker`, `board-sync.worker`,
`board-close.worker`, `google-indexing.worker`.

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `NATS_URL`, `REDIS_URL`, `APP_URL`,
`JOB_APP_DATABASE_URL` (RLS app-role), `INTERNAL_SERVICE_TOKEN`,
`RESUME_SERVICE_URL`, `SCREENING_SERVICE_URL`, `CANDIDATE_SERVICE_URL`,
`NOTIFICATION_SERVICE_URL`, `BILLING_SERVICE_URL`, `FEED_CONTACT_EMAIL`.

- Public apply / anti-abuse: `PUBLIC_APPLY_MAX_RESUME_BYTES`, `TURNSTILE_SECRET`,
  `TURNSTILE_TIMEOUT_MS`, `APPLY_IDEMPOTENCY_LOCK_STALE_MS`.
- Worker tuning: `APPLY_INGEST_CONCURRENCY`, `APPLY_INGEST_RATE_MAX`,
  `APPLY_INGEST_RATE_DURATION_MS`, and `BOARD_POST_*`, `BOARD_SYNC_*`,
  `BOARD_CLOSE_*`, `GOOGLE_INDEXING_*` counterparts.
- Resume file scanning (ClamAV): `CLAMAV_ENABLED`, `CLAMAV_HOST`, `CLAMAV_PORT`,
  `CLAMAV_TIMEOUT_MS`, `CLAMAV_MAX_BYTES`, `CLAMAV_FAIL_OPEN`.
- Incoming-resume S3 store: `S3_ENDPOINT`, `S3_REGION`, `S3_INCOMING_BUCKET`,
  `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`,
  `INCOMING_GET_TIMEOUT_MS`, `INCOMING_STAT_TIMEOUT_MS`.
- Google indexing service account: `GOOGLE_INDEXING_SA_JSON`,
  `GOOGLE_INDEXING_DAILY_BUDGET`.

The Prisma datasource reads `JOB_DATABASE_URL` (superuser) from
`prisma/schema.prisma`; request routes use the RLS client via
`JOB_APP_DATABASE_URL`. Public-by-slug and inbound webhooks use the admin client.

## Run

```bash
npm run dev --workspace=@cdc-ats/job-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=job-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
