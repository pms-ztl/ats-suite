# tenant-service

Tenant registry, branding, plan changes, retention config, and self-service
onboarding (`@cdc-ats/tenant-service`). Owns the `Tenant` table (the row IS the
tenant). Reached through the api-gateway under `/internal/*`.

Default port: **4002** (`PORT`).

## Key endpoints

Mounted in `src/app.ts` (all under `/internal`):

- `/internal/tenants` (`tenants.ts`) — `POST /` (create), `GET /`, `GET /:id`,
  `GET /stats`, `PATCH /:id`, `DELETE /:id`, `PUT /:id/stripe-customer`,
  `PUT /:id/plan-from-stripe`.
- `/internal/plan-changes` (`plan-changes.ts`) — tenant plan-change requests
  (create/list/approve) used by the super-admin console.
- `/internal` (`branding.ts`) — `GET|PUT /branding`, `GET|PUT /retention`,
  `GET /public-branding/:slug` (public tenant branding by slug).
- `/internal` (`ui-config.ts`) — per-tenant UI configuration.
- `/internal/onboarding` (`onboarding.ts`) — tenant self-service onboarding steps.
- `/internal/gdpr` (`gdpr.ts`) — GDPR export/erasure legs for tenant data.

Also serves `/health`, `/healthz`, `/metrics`.

## Events

**Produces** (via NATS, best-effort): `tenant.created` / `platform.tenant.created`
(emitted when a tenant is created/registered, driving downstream billing and
notification setup).

No event subscriptions in this service.

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `NATS_URL`, `TENANT_APP_DATABASE_URL`
(RLS app-role connection for the self-service branding/onboarding routers).

The Prisma datasource reads `TENANT_DATABASE_URL` (superuser client) from
`prisma/schema.prisma`. RLS is opt-in: default client is admin; a `prismaRls`
client (keyed on `id`) is used by the routers that touch the caller's own tenant
row, while registry/super-admin/saga/plan-change paths stay on admin.

## Run

```bash
npm run dev --workspace=@cdc-ats/tenant-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=tenant-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
