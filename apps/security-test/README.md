# security-test

Cross-tenant isolation penetration test (`@cdc-ats/security-test`). Not a service:
it is a one-shot script that verifies tenant isolation end to end through the
api-gateway.

## What it does

Runs `src/cross-tenant.ts`. It provisions two tenants (A and B) with admin users,
creates resources under each, then attempts every cross-tenant access pattern as
Tenant A and asserts each one is rejected. It writes a `SECURITY_REPORT.md` in the
repo root summarizing pass/fail.

Exit code:

- `0` — every isolation assertion passed.
- `1` — at least one isolation breach was detected (read the report).

A second script, `src/seed-demo.ts`, provisions demo fixtures used alongside the
test.

## Endpoints / events

None. This package exposes no HTTP endpoints and publishes/consumes no NATS
events; it only calls the gateway APIs as a client.

## Environment variables

Read directly in `src/`: `API_BASE` (the gateway API base; defaults to
`http://localhost:4000/api`).

## Run

```bash
npm run test:cross-tenant --workspace=@cdc-ats/security-test
```

Runs `tsx src/cross-tenant.ts`. The gateway and backend services must be running
(locally or via the Docker demo stack) before invoking. Example with an explicit
target:

```bash
API_BASE=http://localhost:4000/api node --import tsx apps/security-test/src/cross-tenant.ts
```
