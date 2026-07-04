# CDC ATS — OpenAPI contracts

These are **generated-from-code contracts**, not aspirational specs. Every path
and method listed here corresponds to a route that actually exists today in the
service source. They were derived by reading, per service:

- `apps/<service>/src/index.ts` + `apps/<service>/src/app.ts` (the router mounts,
  which set the `/internal/*` prefixes and the auth/tenant-context middleware
  order), and
- each `apps/<service>/src/routes/*.ts` (the concrete `router.<method>(path, ...)`
  definitions, their role guards, and their zod request validators),

cross-checked against the shared primitives in `packages/common`
(`readAuthHeaders`, the `{ success, data }` / `{ success, error }` envelope, the
error-handler codes, and `createHealthRouter`) and the DTOs in
`packages/contracts`.

## Files

| File | Service | Default port | Public prefix |
| --- | --- | --- | --- |
| `_shared.yaml` | shared components (envelope, auth headers, error responses, health) | — | — |
| `api-gateway.yaml` | api-gateway (the only public surface) | 4000 | `/api/*` |
| `identity-service.yaml` | identity | 4001 | via gateway |
| `tenant-service.yaml` | tenant | 4002 | via gateway |
| `billing-service.yaml` | billing | 4003 | via gateway |
| `job-service.yaml` | job | 4004 | via gateway |
| `candidate-service.yaml` | candidate | 4005 | via gateway |
| `interview-service.yaml` | interview | 4006 | via gateway |
| `resume-service.yaml` | resume | 4007 | via gateway |
| `screening-service.yaml` | screening | 4008 | via gateway |
| `notification-service.yaml` | notification | 4009 | via gateway |
| `search-service.yaml` | search | 4010 | via gateway |
| `agent-service.yaml` | agent | 4011 | via gateway |
| `analytics-service.yaml` | analytics | 4012 | via gateway (`/api/reporting`) |
| `compliance-service.yaml` | compliance | 4013 | via gateway (`/api/audit`) |
| `assessment-service.yaml` | assessment | 4014 | via gateway |
| `onboarding-service.yaml` | onboarding | 4015 | via gateway |
| `collab-service.yaml` | collab (WebSocket relay, no REST) | 4016 | WS `/rt` |

`api-gateway.yaml` contains the authoritative **proxy prefix map** (public
`/api/*` prefix → backend service : `/internal/*` base) in its `info.description`,
plus full detail for the routes the gateway handles in-process (auth, read
aggregators, gateway-hosted AI agents, GDPR fan-out, embed, super-admin fan-outs,
impersonation, and the API-key public-ingest surface).

## Conventions encoded in every spec

- **Auth headers.** Backend `/internal/*` routes trust the gateway-stamped
  `X-User-Id`, `X-Tenant-Id`, `X-User-Role`, `X-User-Email` headers and, when
  `INTERNAL_SERVICE_TOKEN` is configured, require the `X-Internal-Service` token
  (`readAuthHeaders` — see `_shared.yaml#/components/parameters`). Public-webhook
  routes (Stripe, Twilio, Judge0, inbound email/job/assessment, OAuth callbacks)
  opt out of the token and verify a provider signature or an opaque token
  instead; those are marked PUBLIC in each spec.
- **Response envelope.** Success is `{ success: true, data: <T> }`; the paginated
  helper wraps `{ data, total, page, pages }`. Errors are
  `{ success: false, error: { code, message, details? } }` with stable codes
  (`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
  `ROUTE_NOT_FOUND`, `PLAN_LIMIT`, `RATE_LIMITED`, `INTERNAL_ERROR`). All are
  `$ref`-ed from `_shared.yaml`.
- **Health + metrics.** Every service exposes `/healthz`, `/livez`, `/readyz`,
  and `/metrics` via `@cdc-ats/common`. `collab-service` is the exception: it has
  hand-rolled non-standard `/health`, `/healthz`, and `/metrics` shapes (noted in
  its spec).
- **Deep object schemas.** For the larger services, request/response bodies are
  described with a reference to the owning zod validator / Prisma model rather
  than fully inlined (e.g. "DashboardDocumentSchema", "UiConfigSchema",
  "FormFieldSchema"). Where a validator is small it is inlined verbatim (search,
  agent, analytics, compliance, screening `/score`, requisition create, the
  `notifications/system` body, etc.). Every route path + method is always listed.
- **Events.** Publish/subscribe subjects are noted inline in the route summaries
  where a route emits an event (e.g. `application.hired`, `interview.scheduled`,
  `assessment.completed`, `module.toggled`). The event payload schemas live in
  `packages/contracts/src/events` and are out of scope for these HTTP contracts.

## `$ref` resolution

Cross-file references use relative paths, e.g.
`./_shared.yaml#/components/schemas/SuccessEnvelope`. Bundle before serving to a
UI with a resolver such as:

```
npx @redocly/cli bundle contracts/openapi/api-gateway.yaml -o bundled/api-gateway.yaml
# or
npx swagger-cli bundle contracts/openapi/candidate-service.yaml -o bundled/candidate-service.yaml
```

Each file is also independently valid OpenAPI 3.1 (the `$ref`s resolve as long as
`_shared.yaml` sits alongside it in this directory).

## Keeping these in sync with the code

These contracts are hand-authored FROM the code, so they can drift if a route is
added or changed without updating the matching YAML. To keep them honest:

1. **When you add or change a route** (`router.<method>` in any
   `apps/<service>/src/routes/*.ts`, or a new mount in `app.ts`), update the same
   entry in the corresponding `contracts/openapi/<service>.yaml`, and — if it is
   reachable publicly — the proxy prefix map + any in-process route in
   `api-gateway.yaml`.
2. **Diff routes vs. specs.** The route inventory used to author these can be
   regenerated with a grep over the mounted routers:

   ```
   rg -n 'router\.(get|post|put|patch|delete)\s*\(' apps/*/src/routes
   ```

   Compare that list against the `paths:` in each spec. A path present in one but
   not the other is drift to reconcile.
3. **Validate the YAML** whenever you edit it:

   ```
   npx @redocly/cli lint contracts/openapi/*.yaml
   ```

4. **Do not add aspirational endpoints.** If a route does not exist in the source
   today, it does not belong here. Prefer an honest omission over a fictional
   contract.
