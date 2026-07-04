# ats-suite - CDC ATS Helm chart

A single, values-driven Helm chart that deploys the **whole** CDC ATS stack: the
15 Express microservices (api-gateway + 14 backends), the Next.js frontend, and
the stateful infra (Postgres, Redis, NATS, MinIO). One `helm upgrade --install`
brings up everything; one `values.yaml` is the control surface.

This is the "easy to manage" answer for the NCR Voyix ask: instead of 20-plus raw
manifests you `kubectl apply` in the right order, you get one release you can
install, upgrade, roll back, and re-parametrize per environment with a values
overlay.

## Honest status (read this first)

- **This chart is DERIVED from `docker-compose.demo.yml` and the raw manifests in
  `deploy/k8s/`. It has NOT been rendered or applied against a live Kubernetes
  cluster** (none was available while authoring it). Treat it as a faithful,
  best-effort translation: `helm lint` it, `helm template | kubectl apply
  --dry-run=server -f -` it, and adjust for your cluster before trusting it in
  production.
- **Resource requests/limits and HPA targets are engineering estimates, not
  measured.** The compose stack sets no resource limits, so there is nothing to
  mirror; the numbers here are conservative starting points tuned to justify the
  10k story in `docs/SCALABILITY.md`. Load-test, then tune.
- **The in-chart Postgres/Redis/NATS/MinIO are single-replica StatefulSets** -
  faithful to the demo, fine for staging, but single points of failure. For real
  production HA, externalize them (see "Externalizing the datastores").
- **Secrets default to the same WEAK demo placeholders the compose stack uses.**
  Never ship them. Use `secrets.existingSecret` (recommended) or a private,
  gitignored values file.

## What it deploys

Grounded in the real service list, ports, and env from `docker-compose.demo.yml`:

| Component | k8s object(s) | Port | Source |
|---|---|---|---|
| api-gateway | Deployment + Service (+HPA/PDB) | 4000 | compose `api-gateway` |
| identity-service | Deployment + Service | 4001 | compose `identity-service` |
| tenant-service | Deployment + Service | 4002 | compose `tenant-service` |
| billing-service | Deployment + Service | 4003 | compose `billing-service` |
| job-service | Deployment + Service (+HPA/PDB) | 4004 | compose `job-service` |
| candidate-service | Deployment + Service | 4005 | compose `candidate-service` |
| interview-service | Deployment + Service | 4006 | compose `interview-service` |
| resume-service | Deployment + Service (+HPA/PDB) | 4007 | compose `resume-service` |
| screening-service | Deployment + Service (+HPA/PDB) | 4008 | compose `screening-service` |
| notification-service | Deployment + Service | 4009 | compose `notification-service` |
| search-service | Deployment + Service | 4010 | compose `search-service` |
| agent-service | Deployment + Service | 4011 | compose `agent-service` |
| analytics-service | Deployment + Service | 4012 | compose `analytics-service` |
| compliance-service | Deployment + Service | 4013 | compose `compliance-service` |
| assessment-service | Deployment + Service (+HPA) | 4014 | compose `assessment-service` |
| frontend | Deployment + Service (+HPA/PDB) | 3000 | compose `frontend` |
| postgres | StatefulSet + headless Service + init ConfigMap | 5432 | compose `postgres` |
| redis | StatefulSet + headless Service | 6379 | compose `redis` |
| nats | StatefulSet + headless Service | 4222 / 8222 | compose `nats` |
| minio + minio-setup | StatefulSet + Service + setup hook Job | 9000 / 9001 | compose `minio` / `minio-setup` |
| migrator | pre-install/pre-upgrade hook Job | - | compose `migrator` |
| seeder | post-install hook Job (optional) | - | compose `seeder` |

Plus: a shared `ConfigMap` (non-secret env), a values-injected `Secret`, an
`Ingress` (/api -> gateway, / -> frontend), optional `ServiceMonitor`s, `PDB`s,
`HPA`s, and optional KEDA `ScaledObject`s for the worker queues.

### Not deployed (matches the demo compose, on purpose)

- **onboarding-service / collab-service** - the compose demo does not run these
  as their own containers (though `onboarding_db` is created for future use, and
  the chart creates it too). Add a `services.<name>` block if/when you split them out.
- **Judge0 code-execution sidecar** - the compose demo leaves it deliberately
  UNROUTED (own internal network, `ALLOW_ENABLE_NETWORK=false`, no service calls
  it). Wiring it needs a NetworkPolicy-isolated pod nothing consumes yet, so it is
  intentionally omitted. Same for the optional ClamAV / PgBouncer profiles.

## Prerequisites

- Kubernetes >= 1.23 (for `autoscaling/v2` HPAs).
- Helm 3.
- Images pushed to a registry your cluster can pull (defaults to
  `ghcr.io/cdc-ats/<service>:<tag>`). Build them from `infra/Dockerfile.service`
  (`--build-arg SERVICE=<name>`), `infra/Dockerfile.frontend`, and
  `infra/Dockerfile.tools` (the migrator/seeder image, default repo `cdc-ats/tools`).
- For HPAs: **metrics-server** installed (CPU utilization resolves against it).
- For `monitoring.enabled`: the **Prometheus Operator** CRDs.
- For KEDA `ScaledObject`s: **KEDA** installed.
- A `StorageClass` for the infra PVCs (or set `persistence.enabled: false` in dev).

## Install / upgrade

```sh
# Dev (single replica, ephemeral storage, HPA off) - closest to `compose up`:
helm upgrade --install ats ./deploy/helm/ats-suite \
  -n cdc-ats --create-namespace \
  -f ./deploy/helm/ats-suite/values-dev.yaml

# Production (HPA on, warm hot-path minimums, PDBs, ServiceMonitors):
helm upgrade --install ats ./deploy/helm/ats-suite \
  -n cdc-ats --create-namespace \
  -f ./deploy/helm/ats-suite/values-prod.yaml \
  --set ingress.host=ats.yourdomain.com \
  --set-string global.image.tag=1.4.2

# Roll back:
helm rollback ats -n cdc-ats

# Uninstall (leaves PVCs behind by design - delete them manually if intended):
helm uninstall ats -n cdc-ats
```

Because the migrator is a **pre-install/pre-upgrade hook**, Helm runs the schema
migration to completion before the service Deployments roll - the same ordering
the compose stack gets from `depends_on: { condition:
service_completed_successfully }`. The seeder is a **post-install hook** and is
optional (`seeder.enabled=false` in prod).

## The values knobs (control surface)

Everything is driven from `values.yaml`. The blocks you touch most:

| Knob | What it does |
|---|---|
| `global.image.{registry,repository,tag,pullPolicy}` | image coordinates for ALL services; per-service `services.<name>.image.*` overrides |
| `global.imagePullSecrets` | private-registry pull secrets |
| `commonEnv.*` | the non-secret shared env (compose `x-svc-env`); cross-service URLs are auto-generated |
| `secrets.*` / `secrets.existingSecret` | inline (demo) secrets, or a pre-existing Secret from your secrets manager |
| `secrets.databaseUrls.<KEY>` | override any single service DB URL (e.g. to point at managed Postgres) |
| `postgres/redis/nats/minio.internal` | `true` = in-chart StatefulSet; `false` = bring your own (managed) endpoint |
| `postgres.tuning.*` | the burst-tuning Postgres flags (verbatim from compose) |
| `<component>.persistence.*` | PVC size/class per infra component (or ephemeral in dev) |
| `services.<name>.replicaCount` | static replicas (ignored when that service's HPA is on) |
| `services.<name>.resources` | requests/limits per service |
| `services.<name>.autoscaling.*` | per-service HPA min/max/targetCPU |
| `services.<name>.extraEnv` / `extraSecretEnv` | service-unique env |
| `autoscaling.enabled` | master switch for all HPAs |
| `keda.enabled` + `services.<name>.keda.*` | queue-depth autoscaling for the worker services |
| `pdb.enabled` / `pdb.minAvailable` | PodDisruptionBudgets |
| `monitoring.enabled` | emit a ServiceMonitor per backend |
| `ingress.{enabled,className,host,tls,annotations}` | the public Ingress |
| `migrator.enabled` / `seeder.enabled` | the hook Jobs |

### Per-service env faithfulness

The chart reproduces the compose per-service env exactly, from values:

- **api-gateway**: `TRUST_PROXY=true` (so the per-IP rate limiters see the real
  client IP behind the ingress) + `EMBED_SECRET` from the Secret.
- **job-service**: `S3_INCOMING_BUCKET=ats-incoming`, S3 creds, and its Prisma
  schema reads `JOB_DATABASE_URL` (not the generic `DATABASE_URL`) - the chart
  stamps the SAME Secret value onto both keys (`aliasDbEnv`). The bounded Prisma
  pool params (`?connection_limit=8&pool_timeout=20`) are appended when the URL is
  built from `postgres.*` (`dbConnectionLimit`/`dbPoolTimeout`).
- **resume-service**: `S3_BUCKET=resumes`, `ENABLE_OCR=true`,
  `RESUME_PARSE_CONCURRENCY=8`, `RESUME_PARSE_RATE_MAX=60`, S3 creds.
- **screening-service**: `SCREENING_CONCURRENCY=6`, `SCREENING_RATE_MAX=30`.
- **notification-service** + **assessment-service**: `ATS_CONFIG_ENC_KEY` (the
  AES-256-GCM key for encrypted integration/OA-provider secrets at rest).

## The scaling story - how this reaches 10k+ concurrent

Grounded in `docs/SCALABILITY.md`. The chart makes the mechanisms that document
describes deployable:

1. **Accept-fast apply path.** The public apply returns a 202 the moment the
   durable row exists; parsing, screening, and scanning run async on BullMQ. A
   submit costs one presigned-policy signature, one storage HEAD, one small DB
   insert, and one Redis `queue.add` - a few milliseconds of service time. That
   profile is what lets a modest replica count absorb thousands of concurrent
   submits (the browser uploads the resume DIRECTLY to object storage, never
   through the API).

2. **Horizontal scaling of the hot path.** The six deployables a spike actually
   exercises - `frontend`, `api-gateway`, `job-service`, `resume-service`,
   `screening-service`, `assessment-service` - each get an HPA (`autoscaling.enabled`
   + their `autoscaling.*` block). `job-service`, `resume-service`, and
   `screening-service` each run their HTTP surface AND their in-process BullMQ
   worker in one process, so adding a replica adds HTTP capacity AND worker
   concurrency together (competing consumers on the shared Redis queue) - which is
   exactly why a CPU-driven HPA scales the async pipeline correctly.

3. **Warm minimums in prod.** `values-prod.yaml` sets higher HPA `minReplicas` on
   the hottest services (job-service 4->24, api-gateway 3->16, resume-service
   3->16, frontend 3->12) so a spike ramps from warm capacity, not a cold single
   replica. The scale-up `behavior` allows doubling every 30-60s.

4. **Queue-depth scaling (KEDA).** CPU under-represents a DEEP backlog. Flip
   `keda.enabled` + a worker's `keda.enabled` to scale `resume-service` /
   `screening-service` on the BullMQ Redis LIST length instead of CPU. (Run KEDA
   OR the CPU HPA on a given Deployment, not both - KEDA manages its own HPA.)

5. **Rate limiting across replicas.** `TRUST_PROXY=true` on the gateway is set so
   `req.ip` is the real client IP behind the ingress (without it the per-IP
   limiters collapse every client into one bucket and 429 the whole spike). With
   >1 gateway replica, enable the optional `rate-limit-redis` store so the ceilings
   are counted across replicas (see `docs/SCALABILITY.md` "Rate limiting across
   replicas").

6. **The database is the real ceiling.** Pod autoscaling does NOT scale Postgres.
   The demo runs a single tuned Postgres (`max_connections=400`, larger WAL) and
   caps `job-service`'s Prisma pool at 8 connections/replica. For genuine 10k+,
   externalize Postgres to a managed HA instance and put PgBouncer (transaction
   pooling, with the `SET LOCAL` RLS audit from SCALABILITY.md) in front - see the
   commented block at the bottom of `values-prod.yaml`.

## Externalizing the datastores

For production, point at managed backing stores and turn the in-chart singletons
off:

```yaml
postgres: { internal: false }
redis:    { internal: false }
nats:     { internal: false }
minio:    { internal: false }
commonEnv:
  REDIS_URL: "rediss://my-elasticache:6379"
  NATS_URL:  "nats://my-nats-cluster:4222"
  S3_ENDPOINT: "https://s3.us-east-1.amazonaws.com"
secrets:
  existingSecret: cdc-ats-secrets   # from external-secrets / vault
  # or inline the managed per-service URLs (with pool params + sslmode):
  databaseUrls:
    JOB_DATABASE_URL: "postgresql://u:p@pg:5432/job_db?connection_limit=8&pool_timeout=20&sslmode=require"
    # ... one per service
```

When `secrets.databaseUrls.<KEY>` is set, the chart uses it verbatim and does not
consult `postgres.*` for that service. When `<component>.internal: false`, the
chart deploys nothing for that component - you provide the endpoint.

## Secrets handling

- Default: the chart renders `cdc-ats-secrets` from `secrets.*` (WEAK demo
  placeholders - replace them).
- Recommended: set `secrets.existingSecret: <name>` and manage that Secret with
  external-secrets / sealed-secrets / vault. The chart then renders NO Secret and
  every service references yours. It must carry the same keys the chart expects
  (`JWT_SECRET`, `INTERNAL_SERVICE_TOKEN`, `EMBED_SECRET`, `ATS_CONFIG_ENC_KEY`,
  the LLM keys, `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY`, `POSTGRES_PASSWORD`,
  and the per-service `*_DATABASE_URL`s).
- Generate real values: `openssl rand -base64 48` (EMBED_SECRET / JWT_SECRET),
  `openssl rand -hex 32` (ATS_CONFIG_ENC_KEY).

## Validating before you trust it

```sh
helm lint ./deploy/helm/ats-suite -f ./deploy/helm/ats-suite/values-prod.yaml
helm template ats ./deploy/helm/ats-suite -f values-prod.yaml \
  | kubectl apply --dry-run=server -f -
```

Both are safe, read-only checks. They are the FIRST thing to run on a real cluster
before a live install, given the "not yet validated against a cluster" caveat above.
