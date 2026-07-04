# api-gateway

The single public entry point (`@cdc-ats/api-gateway`). Every browser and public
request lands here; the gateway authenticates it, stamps the verified JWT claims
as internal headers, and proxies to the owning backend service on its `/internal/*`
route. Backend services are not exposed directly.

Default port: **4000** (`PORT`).

## Responsibilities

- **Auth**: `/api/auth/*` (login, refresh, logout, register-company, forgot/reset
  password, email verification, invite accept, MFA setup/verify/disable/challenge,
  SSO discover/initiate/callback) proxied to identity-service. Downstream JWT
  verification via `gatewayAuth()`.
- **Header stamping**: `forwardHeaders(targetUrl, "/internal/...")` strips any
  client-supplied identity headers and re-stamps the verified `X-User-Id`,
  `X-Tenant-Id`, `X-User-Role` before proxying (this is what makes bodied
  POST/PUT writes carry auth downstream).
- **Rate limiting**: general limiter, per-tenant limiter (`/api`), auth limiter,
  and a dedicated public-apply limiter on `/api/public/jobs/:slug/apply` and
  `/apply-custom`.
- **AI plan gating**: `requireAgentPlan(<agentType>)` in front of every agent
  route (jd-author, sourcing, offer, candidate-experience, interview-intelligence,
  scheduling, analytics, bias-auditor, copilot) → billing check → 402 if not in plan.
- **Super-admin fan-out**: `/api/super-admin/*` (guarded by `requireSuperAdmin`)
  aggregates tenants, plan-change requests, platform billing/models/modules,
  integrations, webhooks, audit, operators, support across services.
- **Public passthrough**: `/api/public/*` (jobs feed, apply, branding) and raw
  proxies for inbound webhooks (`/api/inbound-assessment`, `/api/inbound-job-application`,
  `/api/internal/judge0/callback`) that must reach a service unauthenticated with a
  raw body.
- **Public ingest API**: `/api/v1/*` (API-key authenticated) and `/api/embed/*`.

## Key route groups

Proxied to their target service `/internal/*` mount (representative):

| Gateway path | Target service |
| --- | --- |
| `/api/auth/*` | identity-service `/internal/auth`, `/internal/users` |
| `/api/users`, `/api/api-keys`, `/api/audit` | identity-service |
| `/api/tenants`, `/api/branding`, `/api/retention`, `/api/onboarding` | tenant-service |
| `/api/billing`, `/api/super-admin/platform` | billing-service |
| `/api/requisitions`, `/api/job-postings`, `/api/colleges`, `/api/jd-author` | job-service |
| `/api/candidates`, `/api/applications`, `/api/offers`, `/api/sourcing`, `/api/offer`, `/api/candidate-experience` | candidate-service |
| `/api/interviews`, `/api/rounds`, `/api/interview-intelligence`, `/api/scheduling` | interview-service |
| `/api/resume` | resume-service |
| `/api/screening` | screening-service |
| `/api/search` | search-service |
| `/api/agents` | agent-service |
| `/api/reporting`, `/api/analytics` | analytics-service |
| `/api/audit` (compliance) | compliance-service |
| `/api/notifications`, `/api/messages`, `/api/hitl`, `/api/integrations`, `/api/webhooks`, `/api/support`, `/api/twilio` | notification-service |
| `/api/onboarding-cases` | onboarding-service |

Also serves `/health`, `/healthz` (readiness gated on boot), and `/metrics`.

## Events

The gateway connects to NATS on boot (best-effort). It publishes agent cost
events from its in-process agent routers and subscribes to `module.toggled`
(via `subscribeModuleToggles`) to bust the module-gate cache. If `NATS_URL` is
unset the gateway still serves; agent-cost publishing is skipped.

## Environment variables

Read directly in `src/`:

- Core: `PORT`, `NODE_ENV`, `NATS_URL`, `REDIS_URL`, `APP_URL`, `CORS_ORIGIN`, `TRUST_PROXY`
- Downstream targets (fallback to `http://localhost:400x`): `IDENTITY_SERVICE_URL`,
  `TENANT_SERVICE_URL`, `BILLING_SERVICE_URL`, `JOB_SERVICE_URL`,
  `CANDIDATE_SERVICE_URL`, `INTERVIEW_SERVICE_URL`, `RESUME_SERVICE_URL`,
  `SCREENING_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`, `SEARCH_SERVICE_URL`,
  `AGENT_SERVICE_URL`, `ANALYTICS_SERVICE_URL`, `COMPLIANCE_SERVICE_URL`,
  `ASSESSMENT_SERVICE_URL`, `ONBOARDING_SERVICE_URL`
- Auth/JWT: `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ACCESS_EXPIRES`,
  `JWT_REFRESH_EXPIRES`, `INTERNAL_SERVICE_TOKEN`, `EMBED_SECRET`
- Rate limits: `DISABLE_RATE_LIMIT`, `AUTH_RATE_LIMIT_MAX`, `GATEWAY_RATE_LIMIT_MAX`,
  `TENANT_RATE_LIMIT_PER_MINUTE`, `PUBLIC_APPLY_BURST`, `PUBLIC_APPLY_WINDOW_MS`
- Agent feature flags: `AGENTIC_ANALYTICS`, `AGENTIC_BIAS`, `AGENTIC_COPILOT`
- Socket/timeout tuning: `GATEWAY_KEEPALIVE_TIMEOUT_MS`, `GATEWAY_HEADERS_TIMEOUT_MS`,
  `GATEWAY_MAX_CONNECTIONS`, `GATEWAY_INTER_SERVICE_TIMEOUT_MS`,
  `GATEWAY_AGENT_SOCKET_TIMEOUT_MS`, `GATEWAY_AGENT_MAX_SOCKETS`,
  `GATEWAY_AGENT_MAX_FREE_SOCKETS`

## Run

```bash
npm run dev --workspace=@cdc-ats/api-gateway
```

Runs `tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image
via `infra/Dockerfile.service` (`--build-arg SERVICE=api-gateway`, `npm run build`
= `tsc`); code changes require an image rebuild and container recreate.
