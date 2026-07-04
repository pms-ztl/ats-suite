# notification-service

Notifications, in-app team messaging, email/SMS delivery, HITL checkpoints,
email templates, integrations, webhooks, provider credentials, and platform
support/compliance (`@cdc-ats/notification-service`). Fans domain events out to
per-user delivery channels. Reached through the api-gateway under `/internal/*`.

Default port: **4009** (`PORT`).

## Key endpoints

Mounted in `src/app.ts`:

- `/internal/notifications` (`notifications.ts`) — `GET /`, `GET /unread-count`,
  `PATCH /:id/read`, `POST /read-all`, `GET /stream` (per-user SSE), `POST /system`
  (system notification with an absolute `link` URL).
- `/internal/messages` (`messages.ts`) — `GET|POST /conversations`,
  `GET /conversations/:id/messages`, `POST /conversations/:id/messages`,
  `POST /conversations/:id/read` (tenant-isolated real-time team chat over SSE).
- `/internal/hitl` (`hitl.ts`) — human-in-the-loop checkpoints.
- `/internal/email-templates` (`email-templates.ts`) — per-tenant email templates.
- `/internal/integrations` (`integrations.ts`), `/internal/webhooks` (`webhooks.ts`),
  `/internal/provider-credentials` (`provider-credentials.ts`) — outbound
  integrations, tenant webhooks, and provider credential storage.
- `/internal/support` (`support.ts`), `/internal/compliance` (`compliance.ts`),
  `/internal/platform` (`platform.ts`) — super-admin support/compliance/platform reads.
- `/internal/inbound-email` (`inbound-email.ts`) — inbound email provider webhooks.
- `/internal/cloud-sync` (`cloud-sync.ts`) — Google Drive / Dropbox cloud sync
  (public webhook, optional auth).
- `/internal/twilio` (`sms-apply.ts`) — inbound SMS apply webhook (urlencoded,
  public webhook).

Also serves `/health`, `/healthz`, `/metrics`.

## Events

No `publishEvent` in this service. It is the primary event **consumer**: via
subscribers it listens for `platform.tenant.created`,
`platform.agent.kill-switch.toggled`, `tenant.*.application.hired`,
`tenant.*.application.rejected`, `tenant.*.offer.approved`,
`tenant.*.assessment.completed`, `tenant.*.interview.feedback.submitted`,
`tenant.*.interview.scheduled`, `tenant.*.bulk-upload.completed`,
`tenant.*.plan-change.requested`, and `tenant.*.tenant.plan-changed`, turning each
into notifications / deliveries.

## Background workers (BullMQ, require `REDIS_URL`)

`delivery.worker` (email/SMS delivery); an optional cloud-sync worker (disabled
via `DISABLE_CLOUD_SYNC_WORKER`).

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `NATS_URL`, `REDIS_URL`, `APP_URL`,
`PUBLIC_API_URL`, `CORS_ORIGIN`, `NOTIFICATION_APP_DATABASE_URL` (RLS app-role),
`IDENTITY_SERVICE_URL`, `TENANT_SERVICE_URL`, `CANDIDATE_SERVICE_URL`,
`RESUME_SERVICE_URL`, `DELIVERY_WORKER_CONCURRENCY`, `DISABLE_CLOUD_SYNC_WORKER`.

- Email: `SMTP_URL`, `SMTP_FROM`, `MAILGUN_WEBHOOK_SIGNING_KEY`,
  `POSTMARK_WEBHOOK_TOKEN`.
- SMS: `TWILIO_AUTH_TOKEN`.
- Cloud sync OAuth: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`,
  `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET`.

The Prisma datasource reads `NOTIFICATION_DATABASE_URL` (superuser) from
`prisma/schema.prisma`. RLS is opt-in: a `prismaRls` client
(`NOTIFICATION_APP_DATABASE_URL`) is used only by the pure per-tenant routers
(hitl, email-templates, integrations, webhooks); the default client stays admin
for the cross-tenant majority (NULL-tenant notifications, delivery worker,
subscribers, provider webhooks, super-admin routes).

## Run

```bash
npm run dev --workspace=@cdc-ats/notification-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=notification-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
