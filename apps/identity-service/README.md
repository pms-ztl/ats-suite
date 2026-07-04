# identity-service

Authentication, users, roles, SSO, API keys, and audit (`@cdc-ats/identity-service`).
Owns the `User` table and the login/register sagas. Reached only through the
api-gateway (routes are mounted under `/internal/*`).

Default port: **4001** (`PORT`).

## Key endpoints

Mounted in `src/app.ts`:

- `/internal/users` (`users.ts`, `dashboards.ts`) — `POST /verify-credentials`
  (login credential check), `POST /` (create), `POST /invite`, `GET /`, `GET /:id`,
  `GET /seats`, `GET /my-team`, `PATCH /:id/role`, `PATCH /:id/deactivate`,
  `DELETE /:id`, plus platform operator/stats reads and per-user dashboard/preference
  storage.
- `/internal/auth` (`auth-polish.ts`) — `POST /forgot-password`, `/reset-password`,
  `/request-email-verification`, `/verify-email`, `/change-password`, invite info +
  accept, and MFA `POST /mfa/setup|verify|disable|challenge`.
- `/internal/sso` (`sso.ts`) — SAML/OIDC discovery, initiate, callback.
- `/internal/api-keys` (`api-keys.ts`) — tenant API key issuance/listing/revocation.
- `/internal/audit` (`audit.ts`) — audit-log reads (also used by super-admin fan-out).
- `/internal/gdpr` (`gdpr.ts`) — GDPR export/erasure legs for user data.

Also serves `/health`, `/healthz`, `/metrics`.

## Events

No `publishEvent`/`subscribeToEvents` calls in this service. Identity does not
publish or consume NATS events; it is a synchronous request/response service.

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `IDENTITY_APP_DATABASE_URL`
(RLS app-role connection for per-tenant user-management handlers),
`TENANT_SERVICE_URL`, `PUBLIC_API_URL`.

The Prisma datasource reads `IDENTITY_DATABASE_URL` (superuser client) from
`prisma/schema.prisma`. RLS is opt-in here: the default client is admin; a
`prismaRls` client (using `IDENTITY_APP_DATABASE_URL`) is used only by the pure
per-tenant handlers, while login/register-saga/super-admin/invite stay on admin.

## Run

```bash
npm run dev --workspace=@cdc-ats/identity-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=identity-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
