# CDC ATS — Kubernetes manifests (`deploy/k8s/`)

Plain Kubernetes manifests for the CDC ATS stack, **derived from
`docker-compose.demo.yml`**. They mirror that compose stack service-for-service:
one `Deployment` + `Service` per app service, `StatefulSet`s for the stateful
infra (Postgres, Redis, NATS, MinIO), the schema migration as a `Job`, and an
`Ingress` fronting the gateway + frontend.

## Honest status

- **These manifests have NOT been applied to, or tested against, a live
  Kubernetes cluster.** No cluster was available while authoring them. They are a
  faithful, best-effort translation of the compose stack — treat them as a
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
| migrator | Job | — | `bash infra/migrate.sh` (tools image) |
| seeder | Job | — | `bash infra/seed.sh` (optional; demo data only) |
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
| (ingress) | Ingress | 80/443 | replaces cloudflared |

That is the exact set the demo compose brings up (15 backend services +
frontend + 4 infra + 2 one-shot Jobs).

## What is deliberately NOT included

Kept out on purpose so these manifests stay faithful to the **demo** compose and
do not fabricate wiring:

- **cloudflared** — a demo public-tunnel convenience. Replaced by `70-ingress.yaml`.
- **judge0** — the OA code-execution sidecar is present in the demo compose but
  **unrouted**: its own internal network, no route to the app services,
  `ALLOW_ENABLE_NETWORK=false`, and assessment-service does not call it. Adding
  it to k8s would create a pod nothing consumes; wire it (with a `NetworkPolicy`
  isolating it) when the application actually calls it.
- **clamav / pgbouncer** — both are behind compose profiles (`clamav`,
  `pgbouncer`), OFF by default, and the demo stack runs without them. Add them as
  optional extras once you have measured a need.
- **jaeger / prometheus / grafana / loki** — those live in `infra/docker-compose.full.yml`,
  not the demo stack. The Deployments carry `prometheus.io/scrape` annotations so
  a cluster Prometheus can discover them, but the observability stack itself is
  out of scope here.
- **collab-service (4016) and onboarding-service (4015)** — these services exist
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
— retag to your registry / immutable tag. Example:

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
              -f deploy/k8s/23-minio.yaml
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

# 6. (Optional) demo seed AFTER the gateway is Ready
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
