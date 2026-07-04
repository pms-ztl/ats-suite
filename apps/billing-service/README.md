# billing-service

Plans, plan limits, agent kill-switches, per-run AI spend, modules, and Stripe
integration (`@cdc-ats/billing-service`). Backs the AI plan-gating the gateway
enforces and the super-admin billing/models screens. Reached through the
api-gateway under `/internal/*`.

Default port: **4003** (`PORT`).

## Key endpoints

Mounted in `src/app.ts`:

- `/internal/billing` (`billing.ts`, `modules.ts`) — `GET /plan-limits`,
  `GET /overview`, `GET /usage`, `GET /spend-trend`, `GET /agents`,
  `POST /agents/:type/toggle` (kill switch), `GET /check-resume-quota`,
  `GET /check-agent` (the gateway plan-gate dependency), `GET /limits`, plus
  per-tenant module toggles.
- `/internal/platform` (`platform.ts`, `modules.ts`) — super-admin platform reads:
  invoices, per-provider/per-agent model spend (`/models`), feature flags, and
  the platform module catalog.
- `/internal/stripe` (`stripe.ts`) — Stripe checkout session creation, subscription
  sync, and webhook handling.

Also serves `/health`, `/healthz`, `/metrics`.

## Events

**Produces**: `platform.agent.kill-switch.toggled` (emitted when an agent kill
switch state changes; consumed by notification-service for the alert feed).

**Consumes** (via subscribers): `platform.tenant.created` (provision a plan cache
row for a new tenant), `tenant.*.agent.completed` (record `AgentRunCost` for AI
spend aggregation), `tenant.*.tenant.plan-changed` (update the plan cache).

Stripe webhook event types handled in-process (not NATS):
`checkout.session.completed`, `customer.subscription.created|updated|deleted`.

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `NATS_URL`, `APP_URL`,
`BILLING_APP_DATABASE_URL` (RLS app-role connection), `IDENTITY_SERVICE_URL`,
`TENANT_SERVICE_URL`, and Stripe config `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PROFESSIONAL`, `STRIPE_SUCCESS_URL`,
`STRIPE_CANCEL_URL`.

The Prisma datasource reads `BILLING_DATABASE_URL` (superuser client) from
`prisma/schema.prisma`. RLS policies apply on the request path via
`BILLING_APP_DATABASE_URL`; subscribers, super-admin platform routes, and the
Stripe router/webhook use the admin client.

## Run

```bash
npm run dev --workspace=@cdc-ats/billing-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=billing-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
