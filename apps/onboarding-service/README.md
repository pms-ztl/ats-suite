# onboarding-service

New-hire onboarding cases plus the public onboarding portal a hired candidate
uses to submit their details (`@cdc-ats/onboarding-service`). Reached through the
api-gateway at `/api/onboarding-cases`; also serves a public portal route.

Default port: **4015** (`PORT`).

## Key endpoints

Mounted in `src/app.ts`:

- `/internal/onboarding-cases` (`onboarding.ts`) — `GET /`, `GET /:id`, `POST /`
  (create/list onboarding cases; recruiter/admin facing).
- `/public/onboarding` (`portal.ts`) — the token-authorized new-hire portal:
  `GET /:token` (load the case), `POST /:token/pan`, `POST /:token/bank`,
  `POST /:token/tasks/:taskId/complete`.

Also serves `/health`, `/healthz`, `/metrics`.

## Events

No `publishEvent` in this service.

**Consumes** (via subscribers in `src/subscribers.ts`):
`tenant.*.application.hired` and `tenant.*.offer.accepted` — either event opens a
new onboarding case for the hired candidate.

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `NATS_URL`,
`ONBOARDING_APP_DATABASE_URL` (RLS app-role), and `KYC_PROVIDER`.

The Prisma datasource reads `ONBOARDING_DATABASE_URL` (superuser) from
`prisma/schema.prisma`.

## Run

```bash
npm run dev --workspace=@cdc-ats/onboarding-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=onboarding-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
