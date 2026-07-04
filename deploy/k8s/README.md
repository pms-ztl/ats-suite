# CDC ATS - Kubernetes manifests (`deploy/k8s/`)

Plain Kubernetes manifests for the CDC ATS stack, **derived from
`docker-compose.demo.yml`**. They mirror that compose stack service-for-service:
one `Deployment` + `Service` per app service, `StatefulSet`s for the stateful
infra (Postgres, Redis, NATS, MinIO), the schema migration as a `Job`, and an
`Ingress` fronting the gateway + frontend.

## Honest status

- **These manifests have NOT been applied to, or tested against, a live
  Kubernetes cluster.** No cluster was available while authoring them. They are a
  faithful, best-effort translation of the compose stack - treat them as a
  starting point to `kubectl apply --dry-run` / `kubeval` and adjust for your
  cluster, not as a proven production deploy.
- Values transcribed from compose: image build recipes, container ports, the
  real non-secret env each container gets (`x-svc-env` + per-service overrides),
  and probe targets on the services' actual health endpoints
  (`packages/common/src/lib/health.ts` mounts `/healthz` `/livez` `/readyz`; the
  frontend has none and is probed on `/`, matching `infra/Dockerfile.frontend`).
- **Resource requests/limits are engineering estimates, not measured.** Compose
  sets none, so there is nothing to mirror; the values here are conservative
  defaults you should tune against real load.
- **The HorizontalPodAutoscalers (`55-autoscalers.yaml`) are derived, not
  measured.** They scale the pure-HTTP hot-path deployables on CPU (frontend,
  api-gateway, identity, tenant, billing, candidate, interview); the target
  percentages and min/max replica bounds are engineering estimates chosen to
  justify the 10k story in `docs/SCALABILITY.md`, untested on a live cluster. They
  need `autoscaling/v2` + `metrics-server` on the cluster. Load-test, then tune.
- **The KEDA ScaledObjects (`60-keda-scaledobjects.yaml`) scale the BullMQ queue
  workers on real Redis queue depth** (job/resume/screening/assessment/notification)
  - the signal a CPU HPA cannot see. They REQUIRE the KEDA operator + CRDs installed
  on the cluster and are UNTESTED against a live cluster. A KEDA ScaledObject and a
  plain HPA must not target the same Deployment, so the four queue-driven services
  were moved OUT of `55-autoscalers.yaml` and are KEDA-owned (KEDA folds a CPU
  trigger into each so they still cover their shared HTTP surface).
- **PgBouncer (`25-pgbouncer.yaml`), PodDisruptionBudgets (`56-pdb.yaml`), and
  NetworkPolicies (`57-networkpolicy.yaml`)** are additive hardening, also untested
  on a live cluster. PgBouncer is INERT until you repoint the DB URLs at it and has a
  hard RLS transaction-pooling caveat; NetworkPolicy enforces only on a policy-aware
  CNI; single-replica workloads get a drain-safe PDB, not a wedging one. See each
  file's header and the sections below.
- **Ingress host + TLS are placeholders** (`app.cdc-ats.example.com`,
  `cdc-ats-tls`). The demo uses a Cloudflare tunnel instead of an Ingress; this
  substitutes a normal Ingress and you must set your own host/cert.

## What is included (mirrors the demo compose)

| Compose service | k8s object(s) | Port | Notes |
|---|---|---|---|
| postgres | StatefulSet + headless Service + init ConfigMap | 5432 | tuning flags + per-service DB init copied verbatim |
| redis | StatefulSet + headless Service | 6379 | append-only |
| nats | StatefulSet + headless Service | 4222 / 8222 | JetStream (`-js`) |
| minio + minio-setup | StatefulSet + Service + setup Job | 9000 / 9001 | creates `resumes` + `ats-incoming` buckets |
| pgbouncer (`25-`) | Deployment + Service + ConfigMap + Secret | 6432 | transaction/session pooler in front of Postgres; INERT until DB URLs repoint at it |
| migrator | Job | - | `bash infra/migrate.sh` (tools image) |
| seeder | Job | - | `bash infra/seed.sh` (optional; demo data only) |
| api-gateway | Deployment + Service | 4000 | + `EMBED_SECRET` |
| identity-service | Deployment + Service | 4001 | |
| tenant-service | Deployment + Service | 4002 | |
| billing-service | Deployment + Service | 4003 | |
| job-service | Deployment + Service | 4004 | + `S3_INCOMING_BUCKET`, needs minio-setup |
| candidate-service | Deployment + Service | 4005 | |
| interview-service | Deployment + Service | 4006 | |
| resume-service | Deployment + Service | 4007 | + S3 + OCR + parse-concurrency, needs minio-setup |
| screening-service | Deployment + Service | 4008 | + screening-concurrency |
| notification-service | Deployment + Service | 4009 | + `ATS_CONFIG_ENC_KEY` |
| search-service | Deployment + Service | 4010 | |
| agent-service | Deployment + Service | 4011 | |
| analytics-service | Deployment + Service | 4012 | |
| compliance-service | Deployment + Service | 4013 | |
| assessment-service | Deployment + Service | 4014 | + `ATS_CONFIG_ENC_KEY`; gateway does not proxy to it yet |
| frontend | Deployment + Service | 3000 | probes on `/` |
| (autoscalers `55-`) | HorizontalPodAutoscaler x7 | n/a | CPU-based, for frontend + gateway + identity/tenant/billing/candidate/interview; needs metrics-server |
| (pdb `56-`) | PodDisruptionBudget (per app Deployment + pgbouncer) | n/a | keep >=1 replica through node drains; single-replica services use drain-safe `maxUnavailable: 1` |
| (netpol `57-`) | NetworkPolicy (default-deny + allow set) | n/a | ingress/egress isolation; enforced only on a policy-aware CNI |
| (keda `60-`) | KEDA ScaledObject x5 | n/a | queue-depth autoscaling for job/resume/screening/assessment/notification workers; needs the KEDA operator |
| (ingress) | Ingress | 80/443 | replaces cloudflared; TLS via `cdc-ats-tls` secret (placeholder host) |

That is the exact set the demo compose brings up (15 backend services +
frontend + 4 infra + 2 one-shot Jobs).

## What is deliberately NOT included

Kept out on purpose so these manifests stay faithful to the **demo** compose and
do not fabricate wiring:

- **cloudflared** - a demo public-tunnel convenience. Replaced by `70-ingress.yaml`.
- **judge0** - the OA code-execution sidecar is present in the demo compose but
  **unrouted**: its own internal network, no route to the app services,
  `ALLOW_ENABLE_NETWORK=false`, and assessment-service does not call it. Adding
  it to k8s would create a pod nothing consumes; wire it (with a `NetworkPolicy`
  isolating it) when the application actually calls it.
- **clamav** - behind the compose `clamav` profile, OFF by default; the demo stack
  runs without it. Add it as an optional extra once you have measured a need.
  (PgBouncer, also a compose profile in the demo, IS now included here as
  `25-pgbouncer.yaml` - inert until you route DB traffic through it.)
- **jaeger / prometheus / grafana / loki** - those live in `infra/docker-compose.full.yml`,
  not the demo stack. The Deployments carry `prometheus.io/scrape` annotations so
  a cluster Prometheus can discover them, but the observability stack itself is
  out of scope here.
- **collab-service (4016) and onboarding-service (4015)** - these services exist
  in the repo and in `infra/docker-compose.full.yml`, and `onboarding_db` is
  created by the init SQL, but **neither is in `docker-compose.demo.yml`**. To
  stay faithful to the demo stack (the canonical reference for this mission) they
  are not deployed here. Add them (Deployment + Service on their ports, plus a
  WebSocket-aware Ingress annotation for collab-service `/rt`) if you deploy the
  full stack. There is a separate Helm chart at `infra/k8s/` that is the older,
  actively-maintained k8s path for a subset of services.

## Images

Every backend image is built from `infra/Dockerfile.service` with a `SERVICE`
build arg; the frontend from `infra/Dockerfile.frontend`; the migrator/seeder
from `infra/Dockerfile.tools`. The manifests reference `ghcr.io/cdc-ats/<svc>:latest`
 -  retag to your registry / immutable tag. Example:

```bash
docker build -f infra/Dockerfile.service --build-arg SERVICE=api-gateway \
  -t ghcr.io/cdc-ats/api-gateway:latest .
# ...one per service...
docker build -f infra/Dockerfile.frontend \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  --build-arg GATEWAY_ORIGIN=http://api-gateway:4000 \
  -t ghcr.io/cdc-ats/frontend:latest .
docker build -f infra/Dockerfile.tools -t ghcr.io/cdc-ats/tools:latest .
```

## Secrets

`11-secrets.example.yaml` carries the SAME weak demo placeholders the compose
stack uses (they are NOT production secrets). Copy it, replace every value, and
apply it before the workloads:

```bash
cp deploy/k8s/11-secrets.example.yaml deploy/k8s/11-secrets.yaml
# edit 11-secrets.yaml: real JWT_SECRET, INTERNAL_SERVICE_TOKEN, EMBED_SECRET,
# ATS_CONFIG_ENC_KEY, DB URLs (managed Postgres?), S3 creds, LLM keys
kubectl apply -f deploy/k8s/11-secrets.yaml
```

## PgBouncer (`25-pgbouncer.yaml`) - connection pooling for high replica counts

Pods autoscale; **Postgres does not scale by pod count.** Each app replica opens a
Prisma pool, so total server connections grow as `Σ (replicas × connection_limit)`,
bounded by Postgres `max_connections` (the StatefulSet runs `max_connections=400`).
At the replica counts the HPAs/KEDA allow (job-service up to 16, plus every other
service), that sum can approach the ceiling. PgBouncer multiplexes many short-lived
app connections onto a small server-side pool so the backend count stays bounded.
`docs/SCALABILITY.md` §6 flags this as the honest TODO for high replica counts; this
manifest is that piece.

**It is INERT by default.** Applying `25-pgbouncer.yaml` just stands up an unused
pooler - nothing routes through it until you repoint each service's
`*_DATABASE_URL` in your `11-secrets.yaml` from `postgres:5432` to `pgbouncer:6432`.

**RLS transaction-pooling caveat (must read before transaction mode).** This stack
scopes RLS via `SET app.current_tenant_id` per request. In PgBouncer **transaction**
pooling a plain session-level `SET` leaks across pooled clients and **breaks tenant
isolation.** The manifest ships `pool_mode = session` (the SAFE default: preserves
per-connection session state, still a big win for connection churn). Switch to
`transaction` **only** after confirming the tenant scoping uses `SET LOCAL …` inside
an explicit transaction (the `@cdc-ats/common` `rlsExtend` / `tenantContext` path).
The same warning is in `docker-compose.demo.yml` and the file header. The demo
placeholder `userlist.txt` is NOT a real credential - generate a real SCRAM verifier
(or switch to `auth_query`) before production.

## KEDA queue-depth autoscaling (`60-keda-scaledobjects.yaml`)

The async pipeline that absorbs a 10k-apply burst is a set of BullMQ competing-
consumer workers. A deep backlog with workers idle-waiting on a rate limit or I/O
reads **low on CPU**, so a CPU HPA under-scales exactly when the queue is deepest.
KEDA scales on the real signal: BullMQ's Redis wait-list length
(`bull:<queue>:wait`). ScaledObjects are provided for the real queues:
`apply-ingest` (job-service), `resume-parse` + `bulk-archive-extract`
(resume-service), `ai-screening` (screening-service), `assessment-provider-invite` +
`assessment-grading` (assessment-service), and `notification-delivery`
(notification-service). Queue names are the actual code constants (see the file
header for the source path of each).

**Requires the KEDA operator + CRDs on the cluster** (`keda.sh/v1alpha1`):

```bash
helm repo add kedacore https://kedacore.github.io/charts
helm install keda kedacore/keda -n keda --create-namespace
```

If KEDA is not installed, **omit `60-keda-scaledobjects.yaml`** (the API server
rejects the unknown CRD kind). The CPU HPAs in `55-autoscalers.yaml` still scale the
HTTP surfaces; the queue workers fall back to their Deployment's static replica count.

**KEDA vs the plain HPAs - no double-targeting.** A ScaledObject and a plain HPA
must not target the same Deployment. The four queue-driven services
(job/resume/screening/assessment) are therefore **KEDA-owned** and were removed from
`55-autoscalers.yaml`; KEDA folds a `cpu` trigger into each ScaledObject so they
still cover the HTTP surface that shares the worker's process. `55-autoscalers.yaml`
now scales the pure-HTTP services (frontend, api-gateway, identity, tenant, billing,
candidate, interview).

## PodDisruptionBudgets (`56-pdb.yaml`) + NetworkPolicies (`57-networkpolicy.yaml`)

**PDBs** keep at least one replica serving through *voluntary* disruptions (node
drain, autoscaler compaction). Multi-replica app services get `minAvailable: 1`;
services whose baseline/`minReplicaCount` can be 1 (notification, assessment, search,
agent, analytics, compliance) get `maxUnavailable: 1` instead, so a single-replica
period stays **drainable** (a `minAvailable: 1` PDB on a single-replica workload
wedges node maintenance). The single-replica **StatefulSets** (postgres/redis/nats/
minio) are intentionally omitted - run them HA and add PDBs then.

**NetworkPolicies** implement default-deny ingress + default-deny egress (with a
namespace-wide DNS allow), then reopen exactly the real flows: ingress-controller →
gateway/frontend, gateway/services → backend HTTP ports (east-west, in-namespace
only), app pods → infra (postgres/pgbouncer/redis/nats/minio), app pods → external
HTTPS (LLM vendors / boards / OA vendors - RFC1918 excepted), and KEDA (its
namespace) → redis. **Enforced only on a policy-aware CNI** (Calico/Cilium/Antrea/
Weave); on a CNI that ignores NetworkPolicy these apply but enforce nothing. The
`kube-system` / `ingress-nginx` / `keda` namespace selectors assume the standard
`kubernetes.io/metadata.name` label - adjust for your cluster. Validate with a smoke
test after applying, since a missed flow surfaces as a broken dependency.

## Ordered first bring-up

`kubectl apply -k` applies everything at once and does **not** wait for Jobs, so
compose's `depends_on ... service_completed_successfully` ordering is not
reproduced. For a clean first deploy, apply in stages:

```bash
# 1. Namespace + config + secrets
kubectl apply -f deploy/k8s/00-namespace.yaml
kubectl apply -f deploy/k8s/10-config.yaml
kubectl apply -f deploy/k8s/11-secrets.yaml         # your filled-in copy

# 2. Infra, wait until ready
kubectl apply -f deploy/k8s/20-postgres.yaml \
              -f deploy/k8s/21-redis.yaml \
              -f deploy/k8s/22-nats.yaml \
              -f deploy/k8s/23-minio.yaml \
              -f deploy/k8s/25-pgbouncer.yaml     # inert until DB URLs repoint at it
kubectl -n cdc-ats rollout status statefulset/postgres
kubectl -n cdc-ats wait --for=condition=complete job/minio-setup --timeout=300s

# 3. Schema migration, wait for completion (like compose's migrator gate)
kubectl apply -f deploy/k8s/30-migrator-job.yaml
kubectl -n cdc-ats wait --for=condition=complete job/migrator --timeout=600s

# 4. Backend services + frontend
kubectl apply -f deploy/k8s/40-api-gateway.yaml \
              -f deploy/k8s/41-identity-service.yaml \
              -f deploy/k8s/42-tenant-service.yaml \
              -f deploy/k8s/43-billing-service.yaml \
              -f deploy/k8s/44-job-service.yaml \
              -f deploy/k8s/45-candidate-service.yaml \
              -f deploy/k8s/46-interview-service.yaml \
              -f deploy/k8s/47-resume-service.yaml \
              -f deploy/k8s/48-screening-service.yaml \
              -f deploy/k8s/49-notification-service.yaml \
              -f deploy/k8s/50-search-service.yaml \
              -f deploy/k8s/51-agent-service.yaml \
              -f deploy/k8s/52-analytics-service.yaml \
              -f deploy/k8s/53-compliance-service.yaml \
              -f deploy/k8s/54-assessment-service.yaml \
              -f deploy/k8s/60-frontend.yaml

# 5. Ingress
kubectl apply -f deploy/k8s/70-ingress.yaml

# 6. Availability + isolation hardening (safe to apply any time after the workloads)
kubectl apply -f deploy/k8s/56-pdb.yaml \
              -f deploy/k8s/57-networkpolicy.yaml

# 7. Autoscaling - CPU HPAs need metrics-server; KEDA ScaledObjects need the KEDA
#    operator installed (skip 60- if KEDA is not installed).
kubectl apply -f deploy/k8s/55-autoscalers.yaml
kubectl apply -f deploy/k8s/60-keda-scaledobjects.yaml   # requires KEDA CRDs

# 8. (Optional) demo seed AFTER the gateway is Ready
kubectl -n cdc-ats rollout status deployment/api-gateway
kubectl apply -f deploy/k8s/31-seeder-job.yaml
```

`kustomization.yaml` lists every non-secret resource for the convenience of
`kubectl apply -k deploy/k8s/` (or `kubectl kustomize deploy/k8s/` to render),
once you accept it will not enforce the Job ordering above.

## Validate without a cluster

Since these are untested against a live cluster, at minimum run a client-side
render / dry-run:

```bash
kubectl kustomize deploy/k8s/ > /tmp/rendered.yaml
grep '^kind:' /tmp/rendered.yaml | sort | uniq -c
# server dry-run if you have a cluster/kubeconfig:
kubectl apply -k deploy/k8s/ --dry-run=server
```

## Relationship to `infra/k8s/`

`infra/k8s/` is a pre-existing Helm chart that templates a subset of services
(11 of the deployables). This `deploy/k8s/` tree is a separate, plain-manifest
translation of the **demo** compose that covers all 15 backend services +
frontend + infra explicitly. Use whichever fits your workflow; they are not
meant to be applied together.
