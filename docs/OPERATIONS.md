# Operations Runbook

How to run CDC ATS in production: deploy, scale, monitor, roll out, back up, and a
10k-load-test-day checklist. Grounded in the real deploy artifacts in this repo.

> Honest status: the monitoring + k8s + prod-compose artifacts are derived from
> `docker-compose.demo.yml` and have not been validated against a live cluster.
> Treat the runbook as the intended procedure; verify each step in your
> environment. Some alerts need extra exporters to fire (called out below).

## 1. Quick map - where things run

| What | Where |
| --- | --- |
| App (all deploy paths) | `docs/DEPLOYMENT.md` |
| Grafana dashboard | `deploy/k8s/observability` → `make grafana` (port-forward :3000) |
| Prometheus (metrics + alert state) | `make prometheus` (port-forward :9090) |
| Metrics endpoint (per service) | `GET /metrics` on each service port (prom-client) |
| Health probes | `GET /healthz` `/livez` `/readyz` on each service |
| Autoscalers | `deploy/k8s/55-autoscalers.yaml` (6 hot-path HPAs) |
| Alert rules | `deploy/k8s/observability/30-alert-rules.yaml` |

The `service` label on every metric identifies the emitting service; Prometheus
also derives an `app` label from the pod's `app.kubernetes.io/name`.

## 2. Deploy (summary - full detail in docs/DEPLOYMENT.md)

```
make up                       # local demo (single host)
make prod-up                  # scaled single-host (NGINX + PgBouncer + replicas)
make deploy-k8s               # kustomize, all 15 services
make deploy-helm              # Helm (extend chart for all 15 - see DEPLOYMENT.md)
```

## 3. Monitoring

### Install the monitoring stack

```
kubectl -n cdc-ats-monitoring create secret generic grafana-admin \
  --from-literal=admin-user=admin --from-literal=admin-password='<strong-pw>'
make observability            # kubectl apply -k deploy/k8s/observability
make grafana                  # open http://localhost:3000
```

Grafana auto-provisions the **CDC ATS - Overview** dashboard (throughput, error
rate, p50/p95/p99 latency, HPA replica count, CPU/memory). The BullMQ queue-depth
panel is a placeholder until a queue-depth exporter is wired (see §7 honest gaps).

### What to watch

- **Error rate** - per-service 5xx %. Alert `HighErrorRate` fires at >5% (5m),
  `ElevatedErrorRateWarning` at >1% (10m).
- **Latency p95** - SLO is p95 < 1.5s (the accept-fast apply target in
  `load-tests/stress-10k.js`). Alert `HighRequestLatencyP95` at >1.5s (5m).
- **Replica count vs HPA max** - the dashboard overlays current vs max. Alert
  `HPAMaxedOut` fires when a hot-path deployable is pinned at `maxReplicas` for
  15m: it has run out of headroom (raise the ceiling or add nodes).
- **Pod restarts** - `PodCrashLooping` at >3 restarts in 15m.
- **Postgres connections** - `PostgresConnectionsHigh` at >80% (needs
  postgres_exporter). Connections are the real scaling ceiling (§6).

### Alert severity

| Severity | Suggested route | Response |
| --- | --- | --- |
| critical | page (PagerDuty/Opsgenie) + ops channel | now |
| warning | ops channel | business hours |

Alertmanager is not shipped as a workload in the self-contained bundle - the
rules evaluate and show in the Prometheus UI regardless. To route/page, run
Alertmanager and uncomment the `alerting:` block in
`deploy/k8s/observability/configs/prometheus.yml` (or use the Prometheus Operator).

## 4. Scaling

### Horizontal (the hot path)

Six deployables autoscale on CPU via `deploy/k8s/55-autoscalers.yaml`:

| Deployable | Range | Why |
| --- | --- | --- |
| api-gateway | 2→12 | single ingress funnel |
| frontend | 2→8 | SSR + page-load surge |
| job-service | 2→16 | public apply accept path + ingest worker |
| resume-service | 2→12 | parse + OCR (CPU-heaviest) |
| screening-service | 2→8 | AI screener worker |
| assessment-service | 1→6 | OA invites + webhooks |

Adding a replica adds both HTTP capacity and in-process BullMQ worker concurrency
(competing consumers on the shared Redis). The control-plane services are not
autoscaled by default - scale manually if a specific one saturates:

```
kubectl -n cdc-ats scale deploy/notification-service --replicas=3
```

On the scaled single-host compose, scale live:

```
make prod-scale SCALE="job-service=6 resume-service=4"
```

### The database ceiling - connection pooling

Pods autoscale; **Postgres does not scale by pod count.** More replicas = more DB
connections against a hard `max_connections` (per logical DB, since the ATS is
DB-per-service). Two layers, both real:

- **Bounded Prisma pools.** job-service caps its pool in the connection string
  (`?connection_limit=8`, `deploy/k8s/44-job-service.yaml`). Keep
  `Σ (replicas × connection_limit) < max_connections` for each DB.
- **PgBouncer.** At high replica counts, put PgBouncer transaction/session pooling
  in front. It is a compose profile in the demo, wired by default in the scaled
  single-host stack (`deploy/compose/docker-compose.prod.yml`), and an honest TODO
  in the k8s manifests. **RLS caveat:** transaction pooling leaks the per-request
  `SET app.current_tenant_id` and breaks tenant isolation unless the code uses
  `SET LOCAL` in a transaction - use SESSION pooling until you complete that audit
  (see the pgbouncer block comments). Full story: `docs/SCALABILITY.md` §6.

### Queue-depth / KEDA (better than CPU for the async workers)

A deep BullMQ backlog with idle-waiting workers under-reads on CPU. For the async
pipeline, a queue-depth metric scales better. This is not wired today (honest gap
§7). KEDA's Redis scaler reads the BullMQ list lengths directly and is the
recommended next step; the Prometheus Adapter can drive RPS-based HPAs from the
`/metrics` the services already expose.

## 5. Zero-downtime rolling updates

The images drain cleanly on SIGTERM (`packages/common/src/lib/shutdown.ts`: mark
unready → let the LB stop routing → finish in-flight → close Prisma/NATS/BullMQ).
So a standard Kubernetes `RollingUpdate` with the wired readiness probe is
lossless.

```
# Roll out a new tag (kustomize path)
make deploy-k8s-images REGISTRY=ghcr.io/acme VERSION=v1.4.1
kubectl -n cdc-ats rollout status deploy/job-service --timeout=10m

# Or a single service
kubectl -n cdc-ats set image deploy/job-service job-service=ghcr.io/acme/job-service:v1.4.1
kubectl -n cdc-ats rollout status deploy/job-service

# Roll back if it goes wrong
make k8s-rollback DEPLOY=job-service        # kubectl rollout undo
```

### Schema migrations during a rollout

Migrations run as the one-shot `migrator` Job (`deploy/k8s/30-migrator-job.yaml`),
which uses `prisma db push`/migrate against Postgres directly. Two gotchas from
experience:

- **Migrate BEFORE rolling the app** for additive changes; the new code must
  tolerate the old schema for the brief overlap (expand/contract).
- **`db push` drops empty columns.** A manually-added, data-less nullable column
  can be dropped by an older migrator image whose baked schema lacks it. Always
  rebuild the migrator image after a schema change so its `schema.prisma`
  includes the new column, then run the Job.

## 6. Backups

Postgres (DB-per-service) and MinIO (resumes) are the durable state. See
`docs/BACKUP.md` for the full procedure; quick reference:

```
# Demo/single-host: dump all databases
make backup-db                 # pg_dumpall → ./backups/cdc-ats-<ts>.sql

# Kubernetes: dump from the Postgres pod
kubectl -n cdc-ats exec -it postgres-0 -- pg_dumpall -U postgres > cdc-ats-$(date +%F).sql

# Restore a single database
psql -U postgres -d job_db < job_db.sql
```

- **Postgres**: schedule `pg_dumpall` (or per-DB `pg_dump`) nightly to object
  storage. For tight RPO, use continuous WAL archiving (WAL-G / pgBackRest) or a
  managed Postgres with PITR.
- **MinIO/S3**: the `resumes` and `ats-incoming` buckets. Use bucket
  replication/versioning (managed S3) or `mc mirror` to a second target.
- **Redis / NATS**: mostly transient (queues + events). BullMQ jobs are
  idempotent and retried; NATS JetStream is durable but replayable. Back up if you
  need in-flight state, otherwise treat as reconstructible.
- **Restore drill**: validate a restore into a scratch namespace quarterly.

## 7. Honest gaps (things NOT wired yet)

- **rate-limit-redis** not declared in `apps/api-gateway/package.json` → with many
  gateway replicas the per-IP ceilings are per-process (effectively N×). Declare
  it (the code already consumes it) or size ceilings with replica count in mind.
  `docs/SCALABILITY.md` §3.2.
- **PgBouncer in k8s** - wired in the single-host prod compose, an honest TODO in
  the k8s manifests. Add it before running near the HPA ceilings.
- **Queue-depth / RPS autoscaling** - CPU only today; needs KEDA (Redis) or the
  Prometheus Adapter. The `/metrics` exist; the adapter does not. §5.
- **postgres_exporter / kube-state-metrics** - some alerts + the replica panel
  need these standard add-ons installed. `deploy/k8s/observability/README.md`.

## 8. Common incidents

### Service down / crash-looping
1. Confirm: Prometheus `up{app="<service>"}` or `kubectl -n cdc-ats get po`.
2. Logs: `kubectl -n cdc-ats logs -l app.kubernetes.io/name=<service> --tail=200`
   (or `make logs SVC=<service>` on compose).
3. Crash-loop with a Prisma error → a pending migration didn't run: re-run the
   migrator Job (see §5 migration gotchas).
4. OOMKilled → bump the container memory limit; check for a BullMQ queue that
   never drains (a common leak). Alert `PodMemoryNearLimit` warns before this.

### High error rate after a deploy
1. `HighErrorRate` firing + the spike lines up with a rollout → roll back:
   `make k8s-rollback DEPLOY=<service>`.
2. Check the readiness of the service's deps (DB via PgBouncer, Redis, NATS) -
   `/readyz` returns the failing dependency.

### Apply spike is 429ing legitimate applicants
1. The per-IP rate limiter is collapsing clients into one bucket → confirm
   `TRUST_PROXY=true` on the gateway (it must see the real client IP via
   `X-Forwarded-For`). `docs/SCALABILITY.md` §3.1.
2. With many gateway replicas, the in-memory limiter multiplies the ceiling -
   declare `rate-limit-redis` (§7) or raise `GATEWAY_RATE_LIMIT_MAX`.

### Postgres connection exhaustion
1. `PostgresConnectionsHigh` firing → count `Σ (replicas × connection_limit)` per
   DB against `max_connections`.
2. Lower per-service `connection_limit`, or put PgBouncer in front (§4). Do NOT
   just raise `max_connections` without headroom for the tooling/migrator.

### Async pipeline stalled (resumes not parsing/screening)
1. Check the workers are up: resume-service / screening-service pods Ready.
2. Redis reachable? BullMQ needs it. `kubectl -n cdc-ats logs -l
   app.kubernetes.io/name=resume-service | grep -i queue`.
3. Screening additionally bounded by the LLM vendor/plan rate limit + plan gating
   (a FREE tenant is 402'd) - verify the tenant's plan and the agent kill switch.

## 9. 10k-load-test-day checklist

Run against a real cluster (not the single-host demo - it cannot serve 10k, see
`docs/SCALABILITY.md` §7). Harness: `load-tests/stress-10k.js` (README:
`load-tests/README.md`).

**Before**
- [ ] Cluster has `metrics-server`; the 6 HPAs are applied and show a target
      (`kubectl -n cdc-ats get hpa` - no `<unknown>`).
- [ ] `TRUST_PROXY` matches the ingress; `rate-limit-redis` declared (or ceilings
      sized for the replica count).
- [ ] PgBouncer in front of Postgres; `Σ (replicas × connection_limit) <
      max_connections` per DB. Confirm SESSION pooling (RLS-safe) or a completed
      SET-LOCAL audit for transaction mode.
- [ ] Object storage (S3/HA MinIO) reachable; the `ats-incoming` +  `resumes`
      buckets exist (the presigned direct-upload path needs them).
- [ ] Monitoring up: Grafana overview dashboard open; alerts loaded.
- [ ] A real published job slug to apply to (`SLUG=<slug>`), on a tenant whose
      plan allows the AI pipeline.
- [ ] Baseline first: `make load-test-baseline` - confirm green before the spike.

**During** (watch the Grafana overview + `kubectl get hpa -w`)
- [ ] Run: `make load-test LOAD_TARGET=https://<gateway-or-ingress> SLUG=<slug>`.
- [ ] Accept-path p95 stays < 1.5s; `http_req_failed` < 1% (k6 thresholds fail the
      run otherwise - the result is the claim, not a baked-in success).
- [ ] job-service + api-gateway scale out; queue drains behind the spike (watch
      resume/screening replicas climb, then backlog fall).
- [ ] No `HPAMaxedOut` sustained - if pinned at max, raise the ceiling / add nodes.
- [ ] Postgres connections stay < 80% (`PostgresConnectionsHigh` quiet).

**After**
- [ ] Verify every accepted 202 produced a real Candidate + Application and the
      pipeline advanced (parse → screen). No fabricated successes.
- [ ] Capture the k6 summary + the Grafana window; record the sustained
      accept-rate and the pipeline drain time.
- [ ] File the tuning deltas (replica ceilings, connection_limit, pool sizes) back
      into `docs/SCALABILITY.md` so the next run starts from measured numbers.

## Cross-references

- Deploy paths + secrets: `docs/DEPLOYMENT.md`
- Scaling architecture + honest limits: `docs/SCALABILITY.md`
- Production-readiness checklist: `docs/PRODUCTION_READINESS.md`
- Monitoring stack: `deploy/k8s/observability/README.md`
- Backups: `docs/BACKUP.md`
- Load tests: `load-tests/README.md`, `load-tests/stress-10k.js`
