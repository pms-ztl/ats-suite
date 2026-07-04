# Production Readiness

An honest enterprise-readiness checklist for the CDC ATS, mapped to real code and
config. Each item states what is **DONE** (with the file that implements it), what is
**PARTIAL** (works but with a stated caveat), or a **TODO** (an interface exists but
the production wiring does not). Nothing here is claimed done that isn't; the point
of this document is to be the honest baseline an operator can trust.

Cross-references: `docs/SCALABILITY.md` (how it scales), `DECISIONS.md` (why
specific engineering choices were made as-built), `DEFERRED.md` (integrations that
need a vendor credential to activate).

Legend: **DONE** · **PARTIAL** · **TODO**

---

## 1. Multi-tenancy and data isolation

| Item | Status | Where |
|---|---|---|
| Tenant scoping on every request | **DONE** | Gateway verifies the JWT and stamps `X-Tenant-Id` / `X-User-Id` / `X-User-Role`; services read them via `readAuthHeaders` (`packages/common/src/middleware/auth-headers.ts`). `getTenantId(req)` throws 403 if absent. |
| Postgres Row-Level Security | **DONE (all 9 DB-backed services)** | Per-service `prisma/apply-rls.ts` creates a non-superuser `ats_app` role with `ENABLE`/`FORCE` policies keyed on `current_setting('app.current_tenant_id')`; `tenantContext` middleware binds the tenant per request. Request paths use the RLS client; trusted cross-tenant paths (workers, subscribers, super-admin, public-by-slug) use an admin client. Cross-tenant reads verified blocked. |
| `tenantId` on every domain event | **DONE** | NATS events (`resume.parsed`, `assessment.completed`, `assessment.invited`, …) carry `tenantId` in the envelope; consumers scope by it. |
| Tenant-isolated in-app messaging | **DONE** | A conversation lives in one tenant; RLS makes cross-tenant messaging impossible (`notification-service` Conversation/Message models). |

Caveat: `agent` / `analytics` / `compliance` / `search` have no dedicated database
in the demo (the postgres-init creates 9 DBs), so they are not RLS targets until
provisioned - they operate on data owned by the RLS-enforced services.

---

## 2. AuthN / AuthZ and field-level access

| Item | Status | Where |
|---|---|---|
| JWT auth (argon2 password hashing) | **DONE** | identity-service; argon2id. |
| RBAC roles (ADMIN / RECRUITER / HIRING_MANAGER / INTERVIEWER) | **DONE** | `requireRole(...)` guards (e.g. `apps/assessment-service/src/routes/invites.ts` requires ADMIN/RECRUITER/HIRING_MANAGER). |
| Internal service-token enforcement | **DONE** | `readAuthHeaders` requires the gateway's `X-Internal-Service` token when `INTERNAL_SERVICE_TOKEN` is set; every service returns 403 on a direct internal call without it. Provider-webhook routes opt out via `publicWebhook`. |
| Server-side field visibility | **DONE** | Field-level visibility is enforced server-side, not just hidden in the UI (customization batch). |
| AI feature plan-gating | **DONE** | Gateway `requireAgentPlan(agentType)` → billing `/internal/billing/check-agent` → 402 `PLAN_LIMIT` when not in plan / kill-switched, in front of every agent route. |
| Secrets at rest (integration credentials) | **DONE** | OA-vendor and job-board credentials are AES-256-GCM encrypted (`ATS_CONFIG_ENC_KEY`); secret fields are write-only in the UI and never echoed back (`settings/integrations/page.tsx`). |
| Unverified internal service token is a bearer token, not mTLS | **PARTIAL** | Internal calls are authenticated by a shared bearer token, not mutual TLS. Acceptable inside a trusted cluster network; a zero-trust deployment would want mesh mTLS. Tracked in `DECISIONS.md`. |

---

## 3. Health, readiness, and lifecycle

| Item | Status | Where |
|---|---|---|
| Liveness / readiness / health endpoints | **DONE** | `packages/common/src/lib/health.ts` mounts `/healthz` (alive), `/livez` (responsive), `/readyz` (checks DB/Redis/NATS, 200/503). The frontend has none and is probed on `/`. |
| k8s probes wired to real endpoints | **DONE** | Every Deployment in `deploy/k8s/` has `startupProbe` (/healthz), `livenessProbe` (/livez), `readinessProbe` (/readyz); frontend probes `/`. |
| Graceful shutdown / connection draining | **DONE** | `packages/common/src/lib/shutdown.ts`: SIGTERM → mark unready → grace delay → close server → cleanup hooks (Prisma/NATS/BullMQ) → hard-kill backstop. Makes rolling deploys and HPA scale-in lossless. |
| Per-request timeout | **DONE** | `packages/common/src/middleware/request-timeout.ts`; gateway inter-service timeout `GATEWAY_INTER_SERVICE_TIMEOUT_MS` (default 3s) frees sockets fast under load. |

---

## 4. Observability

| Item | Status | Where |
|---|---|---|
| Structured logging | **DONE** | Pino JSON logs, one factory (`packages/common/src/lib/logger.ts`); `serviceName` on every line. |
| Request/tenant correlation in logs | **DONE** | `requestId()` middleware reads/generates `X-Request-Id` (`packages/common/src/middleware/request-id.ts`); the error handler and handlers log `requestId` + `tenantId` + `path`. |
| Prometheus metrics | **DONE** | `packages/common/src/lib/metrics.ts` exposes `/metrics` per service (`http_requests_total`, `http_request_duration_seconds`, default process metrics). Deployments carry `prometheus.io/scrape` annotations. |
| Log aggregation (Loki) | **PARTIAL** | The logger streams to Loki when `LOKI_URL` is set; Loki/Grafana/Prometheus themselves live in `infra/docker-compose.full.yml`, not the demo stack or `deploy/k8s`. Deploy the observability stack (or a managed equivalent) and set the env. |
| Distributed tracing (OpenTelemetry) | **PARTIAL** | `packages/common/src/lib/otel.ts` exists; `OTEL_DISABLED=true` in the demo/k8s config. Point it at a collector and flip the flag to enable. |
| Error tracking (Sentry) | **PARTIAL** | `packages/common/src/lib/sentry.ts` exists; enabled by DSN env. |
| HPA autoscaling metrics (RPS/queue-depth) | **TODO** | HPAs scale on CPU only; RPS/queue-depth targets need a Prometheus Adapter / KEDA (the `/metrics` data exists). See `docs/SCALABILITY.md` §5. |

---

## 5. Correctness and resilience

| Item | Status | Where |
|---|---|---|
| Idempotency (public apply) | **DONE** | `ApplicationIdempotency` ledger (one Application per `(tenantId, idempotencyKey)`); BullMQ `jobId = applicationId` coalesces retries; forward-only `ingestStage` guard (`apps/job-service/src/lib/apply-ingest-queue.ts`). |
| Idempotency (vendor assessment results) | **DONE** | `ingestVendorResult` is the single source of truth for webhook (push) + poll (pull); keyed on a synthetic attempt id per invite, byte-identical + idempotent between the two paths. |
| Consistent error envelope | **DONE** | `{ success:false, error:{ code, message, details? } }` via `packages/common/src/lib/response.ts` + `error.ts` (`AppError`, typed `Errors.*` factories with HTTP status + machine code). |
| Retry + backoff on async work | **DONE** | BullMQ queues set `attempts` + exponential `backoff` (e.g. apply-ingest 5 attempts / 10s exponential). |
| Real-data-or-honest-empty discipline | **DONE** | Vendor results are stored ONLY when the vendor actually reported a score; a completion with no numeric result routes to manual (HITL) review rather than fabricating a zero (`apps/assessment-service/src/routes/inbound-assessment.ts`, poll worker). No auto-reject (GDPR Art. 22). |
| Rate limiting (edge) | **PARTIAL** | Per-IP limiters in the gateway with the `trust proxy` fix; the shared-Redis store that makes ceilings correct across replicas needs `rate-limit-redis` declared (see `docs/SCALABILITY.md` §3 - an honest gap). |

---

## 6. Data lifecycle and migrations

| Item | Status | Where |
|---|---|---|
| Versioned schema migrations | **PARTIAL** | 9 core services ship real Prisma migrations applied via `prisma migrate deploy` (`infra/migrate.sh`). The extra services (and a few pushed tables, e.g. in-app chat) use `prisma db push`, which is schema-sync, not a versioned migration history. Bring those onto `migrate` before treating every schema as fully version-controlled. |
| Migration Job in k8s | **DONE** | `deploy/k8s/30-migrator-job.yaml` runs `infra/migrate.sh`; the README documents the ordered bring-up (migrator must complete before app services). |
| Backups | **PARTIAL** | `docs/BACKUP.md` documents the approach; automated scheduled backups are an operator/managed-Postgres responsibility, not wired into these manifests. |
| GDPR data-subject flows | **DONE** | GDPR/DSR routes exist (`apps/assessment-service/src/routes/gdpr.ts`, retention-purge worker); EEOC/bias auditing present. See `docs/COMPLIANCE.md`. |

---

## 7. Deployment and infrastructure

| Item | Status | Where |
|---|---|---|
| Static, reproducible service images | **DONE** | `infra/Dockerfile.service` (`npm run build` = tsc) + `infra/Dockerfile.frontend` (Next standalone) + `infra/Dockerfile.tools`. |
| Full compose stack (demo) | **DONE** | `docker-compose.demo.yml` - the whole system on one host (single-replica; see the single-host caveat in `docs/SCALABILITY.md` §7). |
| Kubernetes manifests | **PARTIAL (untested on a live cluster)** | `deploy/k8s/` mirrors the demo compose service-for-service (Deployments+Services, StatefulSets for infra, migrator/seeder Jobs, Ingress). `deploy/k8s/README.md` is explicit: these have NOT been applied to a live cluster; resource requests/limits are estimates; Ingress host/TLS are placeholders. |
| Horizontal Pod Autoscalers | **PARTIAL (derived, untested)** | `deploy/k8s/55-autoscalers.yaml` - CPU-based HPAs for the six hot-path deployables. Requires `autoscaling/v2` + `metrics-server`. Target %/replica bounds are engineering estimates (see the file header). |
| Connection pooling at scale (PgBouncer) | **TODO** | Bounded per-service Prisma pools are set (`connection_limit` on job-service); PgBouncer is a compose profile (OFF) and NOT in the k8s manifests. Add it before running near the HPA replica ceilings (`docs/SCALABILITY.md` §6). |
| Ingress host + TLS | **TODO** | `deploy/k8s/70-ingress.yaml` uses placeholder host `app.cdc-ats.example.com` + cert `cdc-ats-tls`. Set your own. |
| CI | **DONE** | `.github/workflows/ci.yml`. |
| Secrets management | **PARTIAL** | k8s Secrets (`11-secrets.example.yaml` is a template with weak demo placeholders - copy, replace every value, apply). No external secrets manager (Vault / cloud KMS-backed CSI) is wired; add one for production. `ATS_CONFIG_ENC_KEY` encrypts integration creds at rest. |

---

## 8. What to do before going live (the honest gap list)

The items an operator should close before treating this as production-grade, all
called out above and none of them silently assumed done:

1. **Declare `rate-limit-redis`** in `apps/api-gateway/package.json` and set
   `TRUST_PROXY` to match your ingress, so rate-limit ceilings are correct across
   replicas (`docs/SCALABILITY.md` §3). `TRUST_PROXY=true` is already set in
   `deploy/k8s/40-api-gateway.yaml` for a single-Ingress topology.
2. **Add PgBouncer** in front of Postgres and size pools so
   `Σ (replicas × connection_limit) < max_connections` before running near the HPA
   ceilings (`docs/SCALABILITY.md` §6).
3. **Provision managed/HA Postgres, Redis, NATS, and object storage** instead of the
   single-host demo containers (`docs/SCALABILITY.md` §7).
4. **Deploy the observability stack** (Prometheus/Grafana/Loki or managed) and set
   `LOKI_URL`, enable OTel (`OTEL_DISABLED=false` + a collector), and - optionally -
   upgrade the HPAs to RPS/queue-depth via the Prometheus Adapter / KEDA.
5. **Set a real Ingress host + TLS cert** and swap the demo secret placeholders for
   real values from a secrets manager.
6. **Validate the k8s manifests + HPAs against a real cluster** (`kubectl apply -k
   deploy/k8s/ --dry-run=server`, then a staging cluster) and load-test to tune the
   HPA targets and resource requests (`docs/LOAD_TESTING.md`) - the current numbers
   are estimates, not measured.
7. **Bring the `db push` services onto versioned migrations** so the whole schema
   history is version-controlled (§6).
8. **Enable a real virus scanner** (ClamAV compose profile) on the apply-ingest path
   if you accept public uploads at scale.

For the reasoning behind the as-built engineering choices (why NATS+BullMQ over
Kafka, why the honest-stub vendor posture, RLS as belt-and-suspenders tenancy, etc.)
see `DECISIONS.md`. For the integrations that are code-complete but need a vendor
credential to activate (OA vendors, job boards, ESP email, calendars, KYC, TURN) see
`DEFERRED.md`.
