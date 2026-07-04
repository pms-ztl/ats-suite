# assessment-service

Online assessments (OA): native authoring, candidate take flow, auto-grading
(including a Judge0 code-execution sidecar), and five external OA-vendor
integrations (`@cdc-ats/assessment-service`). Reached through the api-gateway;
also serves public candidate-take and inbound-webhook routes.

Default port: **4014** (`PORT`).

## Key endpoints

Mounted in `src/app.ts`:

- `/internal/assessments` (`assessments.ts`, `invites.ts`, `results.ts`) —
  `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `GET|PUT /:id/schema` (authoring),
  plus invites and results.
- `/internal/public/assessment` (`public-take.ts`) — public candidate take flow
  (no auth; tenant resolved from the invite token), including start/submit.
- `/internal/judge0` (`judge0-callback.ts`) — public Judge0 code-execution
  verdict callback (opaque submission token is the credential; raw proxy).
- `/internal/inbound-assessment` (`inbound-assessment.ts`) — public inbound
  webhook from external OA vendors (Codility, HackerEarth, iMocha, TestGorilla),
  HMAC-verified over the raw body.
- `/internal/gdpr` (`gdpr.ts`) — GDPR export/erasure legs for OA data
  (Attempt/Answer/AssessmentResult/ProctorEvent/Invite).

Also serves `/health`, `/healthz`, `/metrics`.

## Events

**Produces**: `assessment.invited` (invite sent), `assessment.started`,
`assessment.submitted`, and `assessment.completed` (grading done; consumed by
candidate-service and notification-service). Published via NATS.

No event subscriptions in this service (vendor results arrive via inbound webhooks
and the poll worker).

## Background workers (BullMQ, require `REDIS_URL`)

`grading.worker` (auto-grade attempts), `provider-invite.worker` (dispatch invites
to external vendors), `assessment-poll.worker` (poll vendors for results).

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `NATS_URL`, `REDIS_URL`, `APP_URL`,
`GATEWAY_PUBLIC_URL`, `ASSESSMENT_APP_DATABASE_URL` (RLS app-role),
`INTERNAL_SERVICE_TOKEN`, `CANDIDATE_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`,
`BILLING_SERVICE_URL`.

- Grading tuning: `GRADING_CONCURRENCY`, `GRADING_RATE_MAX`,
  `ASSESSMENT_REVIEW_MARGIN`, `ASSESSMENT_ESSAY_CONFIDENCE_FLOOR`.
- Provider invite / poll tuning: `PROVIDER_INVITE_CONCURRENCY`,
  `PROVIDER_INVITE_RATE_MAX`, `PROVIDER_INVITE_RATE_DURATION_MS`,
  `ASSESSMENT_POLL_INTERVAL_MIN`, `ASSESSMENT_POLL_MAX_PER_TICK`,
  `ASSESSMENT_POLL_EXPIRY_GRACE_MS`.
- Judge0 sidecar: `JUDGE0_URL`, `JUDGE0_AUTH_TOKEN`, `JUDGE0_CALLBACK_BASE_URL`,
  `JUDGE0_DEFAULT_LANGUAGE_ID`, `JUDGE0_CPU_LIMIT`, `JUDGE0_WALL_LIMIT`,
  `JUDGE0_MEMORY_LIMIT_KB`, `JUDGE0_REAP_DELAY_MS`, `JUDGE0_RAPIDAPI_HOST`,
  `JUDGE0_RAPIDAPI_KEY`.

The Prisma datasource reads `ASSESSMENT_DATABASE_URL` (superuser) from
`prisma/schema.prisma`; authenticated request routes use the RLS client via
`ASSESSMENT_APP_DATABASE_URL`. Public take/callback/inbound routes use the admin
client and are mounted before `tenantContext`.

## Run

```bash
npm run dev --workspace=@cdc-ats/assessment-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=assessment-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
