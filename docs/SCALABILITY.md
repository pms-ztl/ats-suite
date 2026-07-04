# Scalability

How the CDC ATS scales to a 10,000+ concurrent-applicant spike, grounded in what
the code actually does today. Every mechanism below points at a real file. Where a
knob is required to reach the full number but is not wired in the demo, it is
called out as such rather than claimed as done.

The house discipline holds here too: this document describes the shipped
architecture and its honest limits, not an aspirational target. The single-host
demo does NOT serve 10k concurrent by itself; the production topology at the end,
built from the same images, is what reaches that number.

---

## 1. The load shape we scale for

The hard spike is a public-apply campaign: a job posting goes out and thousands of
candidates submit at once, each uploading a resume. The naive design streams every
resume through the gateway and job-service, parses it on the request thread, runs
an LLM screen, and only then returns. That pins a worker per applicant for
seconds and collapses under a few hundred concurrent submits.

The ATS is built the opposite way: **accept fast, do the heavy work off the request
path.** The submit returns the instant the durable row exists; parsing, screening,
and virus scanning happen asynchronously.

---

## 2. The accept-fast public apply path (the core of the 10k story)

The path a public application takes, end to end, and why each hop is cheap:

1. **Browser uploads the resume DIRECTLY to object storage, not through the API.**
   `apps/job-service/src/lib/incoming-storage.ts` mints a short-lived, server-signed
   S3/MinIO presigned POST policy (`createUploadTicket`) using Node's built-in
   `crypto` - no bytes transit the gateway or job-service on the way in. The signed
   policy pins the exact bucket, object key, a 1-byte..10MB content-length range,
   and a 5-minute expiry, so the browser cannot widen it. If storage is not
   configured the route returns 503 and the frontend falls back to the legacy
   multipart apply (`isIncomingStorageConfigured()` gates this - backward-compatible).

2. **The accept step does ONE minimal write, then returns 202.** The public
   apply-custom handler (`apps/job-service/src/routes/public.ts`) HEADs the uploaded
   object to confirm it exists and read its REAL byte size from the store
   (`statIncomingObject` - the client-supplied size is never trusted), creates the
   `Candidate` + `Application` rows, enqueues an ingest job, and responds. The
   applicant gets a 202 the moment the row is real - never a fabricated 201 before
   the rows exist.

3. **All heavy work runs async on a BullMQ queue.** `enqueueApplyIngest`
   (`apps/job-service/src/lib/apply-ingest-queue.ts`) adds one `apply-ingest` job;
   the in-process worker (`apps/job-service/src/workers/apply-ingest.worker.ts`)
   later runs the slow stages off the request path: optional virus scan, move the
   resume off the incoming bucket into the resume pipeline, then parse and screen.
   The heavy resume binary transits the API zero times inbound and exactly one
   internal hop on the way to extract/parse/screen (`getIncomingObject`).

4. **The pipeline continues over NATS + BullMQ, never on a web thread.** The resume
   is extracted and parsed by resume-service (`RESUME_PARSE_CONCURRENCY=8` per
   replica), which publishes `resume.parsed` on NATS; the screening worker picks
   that up and runs the candidate-screener LLM call (`SCREENING_CONCURRENCY=6` per
   replica). None of this blocks the applicant's request.

The net effect: a submit costs one presigned-policy signature (CPU-cheap, no
network), one HEAD to storage, one small DB insert, and one Redis `queue.add`. That
is a few milliseconds of gateway/service time per applicant - the profile that lets
a modest replica count absorb thousands of concurrent submits.

### Idempotency (safe to retry the whole path)

- **Application layer:** the `ApplicationIdempotency` ledger guarantees exactly one
  `Application` per `(tenantId, idempotencyKey)`, so a client retry or a replayed
  cached 202 does not create duplicate candidates.
- **Queue layer:** the BullMQ `jobId` is derived from the `applicationId`
  (`apply-ingest-${applicationId}`), so a re-enqueue - a process restart between the
  DB commit and the `queue.add`, a double-accept - coalesces onto the SAME job
  rather than ingesting the same resume twice.
- **Ingest stage ledger:** `ApplicationIdempotency.ingestStage` advances
  FORWARD-ONLY through `PENDING_INGEST → SCANNED → FORWARDED → PARSED → SCREENED`
  (`setIngestStage` / `isForwardStage` in `apply-ingest-queue.ts`), expressed as an
  atomic guard in the `updateMany` WHERE clause. A re-delivered NATS event or a slow
  worker can never regress the stage. Terminal `REJECTED`/`FAILED` are explicit.

---

## 3. The gateway throughput fix (WF-I / I5)

Two settings in `apps/api-gateway/src/app.ts` are what let the gateway serve a real
multi-thousand-client burst instead of throttling it into a single bucket:

### 3.1 `trust proxy` (the #1 throughput blocker fix)

Behind an ingress/tunnel/LB, every request arrives from ONE upstream socket. Without
`app.set("trust proxy", …)`, Express derives `req.ip` from that single peer, so the
per-IP rate limiters treat EVERY real client as the same IP and 429 the entire spike
instantly. The gateway sets `trust proxy` from the `TRUST_PROXY` env knob (before any
rate-limit middleware) so `req.ip` becomes the real client IP from `X-Forwarded-For`:

- unset / `"true"` → trust all hops (correct behind a single k8s Ingress/LB or the
  demo's Cloudflare tunnel)
- a number (`"1"`) → trust exactly N hops (LB chains)
- a CSV of CIDRs → trust only those proxy subnets
- `"false"` → trust none (direct-exposure deployments)

`deploy/k8s/40-api-gateway.yaml` sets `TRUST_PROXY=true` for the single-Ingress
topology. **Set it correctly for your ingress or the rate limiters misfire.**

### 3.2 Rate limiting across replicas

`express-rate-limit`'s default store is in-memory and PER-PROCESS. With N gateway
replicas that silently multiplies the effective ceiling by N. The gateway is wired
to use a **shared Redis limiter store** (`rate-limit-redis`, prefix `rl:gw:`) when
that package is present and `REDIS_URL` is set, making the ceilings cluster-correct
across replicas. The import is best-effort (`const spec = "rate-limit-redis"; await
import(spec).catch(() => null)`), so it compiles and runs whether or not the package
is installed.

**Honest gap:** `rate-limit-redis` is NOT yet declared in
`apps/api-gateway/package.json`, so today the limiter falls back to the per-process
in-memory store and logs a warning. To make the ceilings correct under an HPA that
runs many gateway replicas, add `rate-limit-redis` to the gateway's dependencies -
the wiring already consumes it. Until then, size the per-IP ceilings
(`GATEWAY_RATE_LIMIT_MAX`, default 5000/15min/IP; `AUTH_RATE_LIMIT_MAX`, default 20;
`PUBLIC_APPLY_BURST`, default 5/5s) with the replica count in mind, or set
`DISABLE_RATE_LIMIT=1` behind a trusted edge that does its own limiting.

The dedicated public-apply limiter is a token bucket keyed on client IP + job slug
(`PUBLIC_APPLY_BURST` / `PUBLIC_APPLY_WINDOW_MS`), so one hostile source is capped
without throttling a genuine wide burst of distinct applicants.

---

## 4. Why the services scale horizontally

Everything that makes a stateless replica safe to clone is in place:

- **Stateless request services.** No service holds request state in process memory
  that another replica would need. Session/auth state is a JWT verified per request;
  cross-service identity is stamped as verified headers by the gateway. Any replica
  can serve any request.
- **DB-per-service.** Each service owns its own Postgres database (`job_db`,
  `resume_db`, `screening_db`, `assessment_db`, …; the full 9-DB list is created by
  the postgres init SQL). There is no shared write-hotspot table across services;
  each service scales its own data path independently.
- **Async work is a competing-consumer queue.** The apply-ingest, provider-invite,
  grading, screening, and resume-parse workers are BullMQ consumers on a shared
  Redis. Adding a replica adds a consumer - throughput scales with replica count,
  and a crashed replica's in-flight jobs are retried by another (attempts + backoff
  are configured per queue).
- **Events fan out over NATS JetStream.** Pipeline stage transitions
  (`resume.parsed`, `assessment.completed`, `assessment.invited`, …) are durable
  NATS messages carrying `tenantId`, not in-process calls, so producers and
  consumers scale and restart independently.
- **Graceful shutdown drains cleanly.** `packages/common/src/lib/shutdown.ts` marks
  the pod unready on SIGTERM (so the LB stops routing), waits a grace period, closes
  the HTTP server to finish in-flight requests, then runs cleanup hooks (Prisma
  disconnect, NATS drain, BullMQ close) with a hard-kill backstop. This is what
  makes an HPA scale-in or a rolling deploy lossless.

---

## 5. Horizontal scaling math

The per-replica cost of the accept-fast path is small and roughly constant. Call the
sustained accept throughput of one job-service replica **T** submits/sec (bounded by
its CPU request/limit - `150m` request, `1` core limit - and the tiny per-submit
work of §2). Then N replicas serve about **N × T** submits/sec, minus queue/DB
contention, which the design keeps low because the submit does not wait on parsing.

A 10k-concurrent spike is not 10k requests in one instant; it is a burst of submits
spread over the campaign window. What has to hold up:

- **Accept path (job-service):** sized by submit *rate*, not concurrent applicant
  *count*, because each submit completes in milliseconds. The HPA
  (`deploy/k8s/55-autoscalers.yaml`) scales job-service 2→16 on 65% CPU, adding up
  to 4 pods per 30s on a spike. Pick the replica ceiling so `maxReplicas × T`
  comfortably exceeds your peak submit rate.
- **Gateway:** scales 2→12 on 60% CPU (it is I/O-bound proxying), fronting all of
  the above. It is the funnel, so it scales earlier than the backends.
- **Async pipeline (resume-service / screening-service):** sized by *backlog drain
  time*, not the spike itself. The queue absorbs the spike; the workers drain it at
  `replicas × per-replica-concurrency` jobs in flight (resume parse 8/replica,
  screen 6/replica). More replicas = faster drain. resume-service scales 2→12,
  screening-service 2→8. Screening throughput is additionally bounded by the LLM
  vendor/plan rate limit, so CPU-scaling it past that point buys backlog headroom,
  not raw speed.
- **Frontend:** scales 2→8 on 65% CPU for the raw page-load surge of a campaign.

### The HPAs

`deploy/k8s/55-autoscalers.yaml` defines `autoscaling/v2` HorizontalPodAutoscalers
for the six hot-path deployables (frontend, api-gateway, job-service, resume-service,
screening-service, assessment-service) on CPU utilization, with `scaleUp`/`scaleDown`
behavior windows (fast out, slow in). CPU is the metric because it is the only signal
`metrics-server` provides out of the box.

**RPS / queue-depth scaling (honest TODO).** The mission asks for RPS scaling "if
available." It is NOT available in these manifests: an HTTP-RPS or BullMQ
queue-depth target needs a custom/external metrics adapter (Prometheus Adapter for
RPS from the `/metrics` the services already expose; KEDA for Redis queue depth),
which is a cluster add-on, not something these manifests provide. The Deployments do
carry `prometheus.io/scrape` annotations and every service mounts `createMetrics`
`/metrics`, so the data exists - wiring the adapter is the remaining step. For the
async workers, a queue-depth metric is genuinely better than CPU (a deep backlog
with idle-waiting workers under-reads on CPU); see the in-process-worker note in the
HPA file. Until then, CPU-based scaling plus a generous `maxReplicas` is the shipped
approach.

---

## 6. The database is the real ceiling - connection pooling

Pods autoscale; **Postgres does not scale by pod count.** More service replicas mean
more DB connections, and Postgres has a hard `max_connections`. This is the true
limit on horizontal scale and is handled at two layers:

- **Bounded per-service Prisma pools.** The hottest service caps its pool in the
  connection string: job-service's `JOB_DATABASE_URL` carries
  `?connection_limit=8&pool_timeout=20` (see `deploy/k8s/44-job-service.yaml`). A
  bounded pool per replica means total connections grow predictably as
  `replicas × connection_limit`, so you can keep `Σ (replicas × limit)` under
  Postgres `max_connections` per database.
- **PgBouncer for high replica counts (optional, honest TODO).** At the replica
  counts the HPAs allow (job-service up to 16), a transaction-pooling PgBouncer in
  front of Postgres is the standard way to multiplex many short-lived app
  connections onto few backend connections. It exists as a compose profile
  (`pgbouncer`, OFF by default) and is intentionally NOT in the k8s manifests yet
  (see `deploy/k8s/README.md`). Add it (and point the app DB URLs at it) before you
  run near the HPA ceilings, or Postgres connection exhaustion becomes the failure
  mode, not CPU.
- **Read paths.** Heavy read surfaces (analytics rollups, search) are separate
  services on their own data paths, so they do not contend with the write-hot apply
  path. A managed Postgres read replica for the reporting/analytics reads is the
  natural next step if read volume grows; it is not wired today.

Redis (BullMQ + the shared rate-limit store) and NATS JetStream are each a single
logical endpoint the replicas share; for the 10k spike a single well-resourced Redis
and a NATS cluster are sufficient, but they ARE shared infrastructure to size and
monitor, not things a pod HPA scales.

---

## 7. Production topology vs the single-host dev caveat

**Honest single-host caveat.** `docker-compose.demo.yml` runs the entire stack -
every service, Postgres, Redis, NATS, MinIO - as single containers on ONE host.
That host's CPU, its single Postgres, and single-replica services are the bottleneck;
the demo does NOT serve 10k concurrent applicants and is not meant to. It exists to
run the whole system end to end on a laptop. Under real load on one host, services
contend for the same cores and the same Postgres, and there is no replica to fail
over to.

**The production topology that reaches 10k** uses the SAME images
(`infra/Dockerfile.service`, `infra/Dockerfile.frontend`) with the `deploy/k8s`
manifests, plus:

1. A multi-node Kubernetes cluster with `metrics-server` and the HPAs in
   `55-autoscalers.yaml` (frontend/gateway/job/resume/screening/assessment
   autoscaling on CPU).
2. `TRUST_PROXY` set to match the ingress, and `rate-limit-redis` declared so the
   gateway's rate-limit ceilings are correct across replicas (§3).
3. A managed/HA Postgres per service (or per logical DB) with PgBouncer transaction
   pooling in front, sized so `Σ (replicas × connection_limit) < max_connections`
   (§6).
4. Object storage (S3 or an HA MinIO) for the presigned direct-upload apply path, so
   resume bytes never transit the API (§2) and storage is not a single-host disk.
5. An HA Redis (BullMQ + rate-limit store) and a clustered NATS JetStream for the
   async pipeline and events.
6. Prometheus scraping the `/metrics` each service exposes, so the HPAs can later be
   upgraded to RPS/queue-depth via the Prometheus Adapter / KEDA (§5).

With that topology, the accept-fast path (§2), the stateless replicas + competing-
consumer workers (§4), and the horizontal math (§5) combine to absorb a 10k spike:
the gateway and job-service scale out to accept submits at rate, the queue absorbs
the burst, and resume/screening replicas drain the pipeline behind it - bounded, in
the end, by how much Postgres/PgBouncer capacity and LLM-vendor rate you provision,
not by the request path.

---

## Referenced files

- `apps/job-service/src/lib/incoming-storage.ts` - presigned direct-upload + signed HEAD/GET
- `apps/job-service/src/routes/public.ts` - accept-fast 202 apply handler
- `apps/job-service/src/lib/apply-ingest-queue.ts` - ingest queue, idempotency, forward-only stage ledger
- `apps/job-service/src/workers/apply-ingest.worker.ts` - async ingest worker
- `apps/api-gateway/src/app.ts` - `trust proxy` (I5) + shared-Redis rate limiters
- `packages/common/src/lib/shutdown.ts` - graceful drain for lossless scale-in
- `deploy/k8s/55-autoscalers.yaml` - the HPAs
- `deploy/k8s/44-job-service.yaml` - bounded Prisma pool (`connection_limit`)
- `deploy/k8s/40-api-gateway.yaml` - `TRUST_PROXY` env
- `docker-compose.demo.yml` - the single-host dev stack (the caveat)

See also `docs/PRODUCTION_READINESS.md` for the enterprise-readiness checklist and
`docs/LOAD_TESTING.md` for how to actually measure the numbers above.
