# interview-service

Interviews, rounds, panels, feedback, artifacts, calendar/scheduling, and the
interview AI agents (intelligence, scheduling) (`@cdc-ats/interview-service`).
Mints the collab-service room tokens. Reached through the api-gateway under
`/internal/*`.

Default port: **4006** (`PORT`).

## Key endpoints

Mounted in `src/app.ts`:

- `/internal/interviews` (`interviews.ts`, `artifacts.ts`) — `GET /`, `POST /`,
  `GET /:id`, `POST /:id/feedback`, `GET|POST /:id/panel`,
  `DELETE /:id/panel/:userId`, `POST /applications/:id/advance-round`, plus
  interview-room artifacts (notes/code/whiteboard/PDF).
- `/internal/rounds` (`rounds.ts`) — `GET /`, `PUT /`, `POST /`, `PATCH /:id`,
  `DELETE /:id` (configurable interview rounds; plan-gated).
- `/internal/interview-intelligence` (`agent-intelligence.ts`) — interview
  intelligence AI agent (plan-gated at the gateway).
- `/internal/scheduling` (`agent-scheduling.ts`) — interview scheduling AI agent
  (plan-gated at the gateway).
- `/internal/calendar` (`calendar-oauth.ts`) — Google / Microsoft calendar OAuth
  connect + free/busy.
- `/internal/gdpr` (`gdpr.ts`) — GDPR export/erasure legs for interview data.

Also serves `/health`, `/healthz`, `/metrics`.

## Events

**Produces**: `interview.round.started` (published from `lib/round-progression.ts`;
consumed by candidate-service to advance the pipeline stage),
`interview.scheduled` (from the scheduling agent; consumed by notification-service),
and `interview.feedback.created` (from the feedback route on `POST
/internal/interviews/:id/feedback`; consumed by notification-service to notify the
tenant a scorecard landed).

No event subscriptions in this service.

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `NATS_URL`,
`INTERVIEW_APP_DATABASE_URL` (RLS app-role), `INTERNAL_SERVICE_TOKEN`,
`IDENTITY_SERVICE_URL`, `JOB_SERVICE_URL`, `BILLING_SERVICE_URL`,
`AGENTIC_SCHEDULING`.

- Built-in room: `APP_URL` (frontend base for the room link
  `${APP_URL}/interview/room/{interviewId}?t=<joinToken>`; NO external meeting tool),
  `INTERVIEW_JOIN_TOKEN_SECRET` (falls back to `COLLAB_TOKEN_SECRET`) — signs the
  candidate guest-join token validated by `POST /public/interview/join`.
- Collab room tokens: `COLLAB_TOKEN_SECRET`, `COLLAB_WS_PUBLIC_URL`.
- Calendar OAuth: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`,
  `MS_OAUTH_CLIENT_ID`, `MS_OAUTH_CLIENT_SECRET`, `MS_OAUTH_TENANT`,
  `CALENDAR_OAUTH_TOKENS`, `CALENDAR_ICS_FEEDS`.

The Prisma datasource reads `INTERVIEW_DATABASE_URL` (superuser) from
`prisma/schema.prisma`; request routes use the RLS client via
`INTERVIEW_APP_DATABASE_URL`.

## Run

```bash
npm run dev --workspace=@cdc-ats/interview-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=interview-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
