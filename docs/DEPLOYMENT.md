# Deployment

How to deploy the CDC ATS. Four supported paths, from a laptop to a multi-node
Kubernetes cluster. Every path uses the SAME container images
(`infra/Dockerfile.service` per backend service, `infra/Dockerfile.frontend` for
the web app).

> Honest status: the Kubernetes and prod-compose artifacts are derived from
> `docker-compose.demo.yml` and have not been validated end to end against a live
> cluster/host. They are a grounded, working starting point. Load-test and tune
> before you rely on the numbers (`docs/SCALABILITY.md`, `load-tests/`).

## The stack (what you are deploying)

15 backend services + a Next.js frontend, backed by Postgres (DB-per-service),
Redis (BullMQ + rate limits), NATS JetStream (events), and MinIO/S3 (resumes).

| Service | Port | DB | Notes |
| --- | --- | --- | --- |
| api-gateway | 4000 | - | single public entrypoint, proxies `/api/*` |
| identity-service | 4001 | identity_db | auth, users |
| tenant-service | 4002 | tenant_db | tenant registry, branding |
| billing-service | 4003 | billing_db | plans, agent gating |
| job-service | 4004 | job_db | requisitions, public apply (hot path) |
| candidate-service | 4005 | candidate_db | candidates, applications |
| interview-service | 4006 | interview_db | interviews, rounds |
| resume-service | 4007 | resume_db | extract/parse/OCR (hot path) |
| screening-service | 4008 | screening_db | AI screening worker (hot path) |
| notification-service | 4009 | notification_db | email/SSE/in-app messaging |
| search-service | 4010 | search_db | search |
| agent-service | 4011 | agent_db | agent runtime |
| analytics-service | 4012 | analytics_db | rollups, reporting |
| compliance-service | 4013 | compliance_db | GDPR/EEOC |
| assessment-service | 4014 | assessment_db | online assessments (hot path) |
| frontend | 3000 | - | Next.js SSR + `/api` proxy |

Every backend mounts `GET /healthz`, `/livez`, `/readyz`, and `/metrics`
(`packages/common`). `collab-service` and `onboarding-service` exist under `apps/`
but are NOT part of the running stack (`docker-compose.demo.yml`) and are not
deployed by any path below.

## Required secrets (all paths)

Never commit real values. Generate with `openssl rand -base64 48`.

| Secret | Purpose |
| --- | --- |
| `JWT_SECRET` | token signing (min 32 chars) |
| `INTERNAL_SERVICE_TOKEN` | gateway → service trust |
| `EMBED_SECRET` | embed-token mint/verify (gateway) |
| `ATS_CONFIG_ENC_KEY` | AES-256-GCM for integration/OA secrets at rest (32 bytes) |
| `POSTGRES_PASSWORD` / DB URLs | database access |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | object storage |
| `OPENROUTER_API_KEY` (+ optional `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`) | LLM (AI degrades gracefully if unset) |

---

## Path 1 - Local demo (single host, everything on a laptop)

The full stack in one command. Not for production (single replica each, single
Postgres, a Cloudflare tunnel). See the honest caveat in `docs/SCALABILITY.md` §7.

```
cp .env.example .env         # put your OPENROUTER_API_KEY in it
make up                      # docker compose -f docker-compose.demo.yml up -d --build
make logs SVC=cloudflared    # see the public tunnel URL
```

Login: `priya@pinnacle.demo` / `PinnacleDemo123!`. Tear down with `make down`
(keep data) or `make clean` (wipe volumes).

## Path 2 - Scaled single-host (NGINX + PgBouncer + replicas)

A production-leaning single host without Kubernetes: multiple replicas of the
hot-path services behind NGINX, PgBouncer in front of a tuned Postgres. Full
detail in `deploy/compose/README.md`.

```
cp deploy/compose/.env.prod.example deploy/compose/.env   # fill in REAL secrets
make prod-up                                              # build + start
make prod-scale SCALE="job-service=6 resume-service=4"    # scale hot paths live
```

App is on `http://<host>/` (NGINX → frontend; `/api` → gateway). Still one host,
still no cross-host failover - good for staging, pilots, air-gapped, or Podman.

## Path 3 - Kubernetes via kustomize (raw manifests, all 15 services)

The `deploy/k8s/` manifests are a faithful translation of the compose stack
(Deployments/Services, Postgres/Redis/NATS/MinIO StatefulSets, migrator + seeder
Jobs, Ingress, and the HPAs in `55-autoscalers.yaml`). This is the path that
covers all 15 backend services.

```
# 1. Namespace + config
kubectl apply -f deploy/k8s/00-namespace.yaml
kubectl apply -f deploy/k8s/10-config.yaml

# 2. Secrets - copy the example, fill it in, apply (NEVER commit the real one)
cp deploy/k8s/11-secrets.example.yaml deploy/k8s/11-secrets.yaml
$EDITOR deploy/k8s/11-secrets.yaml
kubectl apply -f deploy/k8s/11-secrets.yaml

# 3. Infra, then wait for it
kubectl apply -f deploy/k8s/20-postgres.yaml -f deploy/k8s/21-redis.yaml \
              -f deploy/k8s/22-nats.yaml -f deploy/k8s/23-minio.yaml

# 4. Migrator Job (must COMPLETE before services start), then seeder
kubectl apply -f deploy/k8s/30-migrator-job.yaml
kubectl -n cdc-ats wait --for=condition=complete job/migrator --timeout=10m

# 5. Everything else (services + frontend + ingress + HPAs)
kubectl apply -k deploy/k8s/
```

`kubectl apply -k` does NOT order Jobs, so for a FIRST bring-up follow the ordered
recipe above (or in `deploy/k8s/README.md`). For steady-state redeploys of an
existing cluster, `make deploy-k8s` (a plain `apply -k`) is fine.

Pin images to a release tag: `make deploy-k8s-images REGISTRY=ghcr.io/acme
VERSION=v1.4.0`.

Requirements: `metrics-server` for the HPAs; an Ingress controller for
`70-ingress.yaml`. See `docs/SCALABILITY.md` §5-§7 for the honest gaps
(rate-limit-redis, PgBouncer, RPS/queue-depth scaling).

## Path 4 - Kubernetes via Helm

`infra/k8s/charts/cdc-ats` is an umbrella chart that templates a Deployment +
Service (+ optional Ingress/HPA) per entry in its `services` map.

```
make deploy-helm REGISTRY=ghcr.io/acme VERSION=v1.4.0 NAMESPACE=cdc-ats
# → helm upgrade --install cdc-ats ... --set global.imageRegistry=... global.imageTag=...
```

> HONEST GAP: the chart's `services:` map currently lists 11 of the 15 backend
> services (it predates search/agent/analytics/compliance/assessment). To deploy
> the FULL stack via Helm, extend the chart's `services` map with those five
> (copy an existing entry, set `port` + `image.repository`), or use the kustomize
> path (Path 3), which already covers all 15. Chart global keys are
> `global.imageRegistry` / `global.imageTag`; per-service override is
> `services.<app>.image.tag`.

Infrastructure (Postgres/Redis/NATS) is intentionally NOT in the app chart - use a
managed service (RDS/ElastiCache) or a separate chart (see `infra/k8s/README.md`).

---

## CI/CD

Two workflows:

- `.github/workflows/ci.yml` (pre-existing) - typecheck + build/push `:sha`/`:latest`
  to GHCR on push to `main`, plus helm-lint and an optional ArgoCD sync.
- `.github/workflows/deploy.yml` (this lane) - **tag-triggered release**. Pushing a
  `vX.Y.Z` tag typechecks, builds + pushes all 15 services + frontend at that tag,
  then deploys (Helm or kustomize, chosen by the `DEPLOY_METHOD` repo var). It
  self-skips the deploy job if `KUBE_CONFIG_B64` is not configured, so the images
  are still published. All registry/cluster credentials are repo secrets/vars -
  no real creds in the workflow. See the header of `deploy.yml` for the full list.

Cut a release:

```
git tag v1.4.0 && git push origin v1.4.0
# → Release & Deploy workflow builds, pushes, and (if configured) deploys.
```

## Zero-downtime rolling updates

The images support lossless rollouts: `packages/common/src/lib/shutdown.ts` marks
the pod unready on SIGTERM, drains in-flight requests, then closes Prisma/NATS/
BullMQ. On Kubernetes, a standard `RollingUpdate` (the default) with the
readiness probe already wired gives zero-downtime deploys - see
`docs/OPERATIONS.md` for the step-by-step and rollback.

## Where to look next

- Operate it (monitor, scale, back up, roll out, incident response): `docs/OPERATIONS.md`
- Scaling story + honest limits: `docs/SCALABILITY.md`
- Enterprise-readiness checklist: `docs/PRODUCTION_READINESS.md`
- Monitoring stack: `deploy/k8s/observability/README.md`
- Load-test day: `load-tests/README.md`
