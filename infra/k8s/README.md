# CDC ATS — Kubernetes deployment

```
infra/k8s/
├── charts/cdc-ats/             # Application-only chart (10 services + frontend)
│   ├── Chart.yaml
│   ├── values.yaml             # Base values
│   ├── values-production.yaml  # Prod overrides (replicas + HPA + resources)
│   └── templates/
│       ├── _helpers.tpl
│       ├── common-configmap.yaml
│       └── services.yaml       # Ranges over .Values.services → 11 Deployments + Services + (HPA + Ingress)
└── argocd/cdc-ats-application.yaml
```

## Prerequisites

Install once per cluster:

```bash
# 1. Postgres (or use managed: RDS, Cloud SQL, Neon)
helm install cdc-postgres bitnami/postgresql -n cdc-ats --create-namespace \
  --set auth.postgresPassword=$(openssl rand -base64 32) \
  --set primary.initdb.scripts.create-dbs\\.sql="$(cat <<'SQL'
CREATE DATABASE identity_db;
CREATE DATABASE tenant_db;
CREATE DATABASE billing_db;
CREATE DATABASE job_db;
CREATE DATABASE candidate_db;
CREATE DATABASE interview_db;
CREATE DATABASE resume_db;
CREATE DATABASE screening_db;
CREATE DATABASE notification_db;
SQL
)"

# 2. Redis
helm install cdc-redis bitnami/redis -n cdc-ats --set auth.enabled=false

# 3. NATS Jetstream
helm install cdc-nats nats/nats -n cdc-ats --set config.jetstream.enabled=true
```

## First-time application deploy

```bash
# Create secrets (NOT committed)
kubectl create secret generic cdc-ats-secrets -n cdc-ats \
  --from-literal=JWT_SECRET="$(openssl rand -base64 48)" \
  --from-literal=INTERNAL_SERVICE_TOKEN="$(openssl rand -base64 32)" \
  --from-literal=ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}" \
  --from-literal=IDENTITY_DATABASE_URL="postgresql://postgres:$PGPASS@cdc-postgres-postgresql:5432/identity_db" \
  --from-literal=TENANT_DATABASE_URL="postgresql://postgres:$PGPASS@cdc-postgres-postgresql:5432/tenant_db" \
  --from-literal=BILLING_DATABASE_URL="postgresql://postgres:$PGPASS@cdc-postgres-postgresql:5432/billing_db" \
  --from-literal=JOB_DATABASE_URL="postgresql://postgres:$PGPASS@cdc-postgres-postgresql:5432/job_db" \
  --from-literal=CANDIDATE_DATABASE_URL="postgresql://postgres:$PGPASS@cdc-postgres-postgresql:5432/candidate_db" \
  --from-literal=INTERVIEW_DATABASE_URL="postgresql://postgres:$PGPASS@cdc-postgres-postgresql:5432/interview_db" \
  --from-literal=RESUME_DATABASE_URL="postgresql://postgres:$PGPASS@cdc-postgres-postgresql:5432/resume_db" \
  --from-literal=SCREENING_DATABASE_URL="postgresql://postgres:$PGPASS@cdc-postgres-postgresql:5432/screening_db" \
  --from-literal=NOTIFICATION_DATABASE_URL="postgresql://postgres:$PGPASS@cdc-postgres-postgresql:5432/notification_db"

# Install the app
helm upgrade --install cdc-ats infra/k8s/charts/cdc-ats -n cdc-ats \
  -f infra/k8s/charts/cdc-ats/values.yaml

# Watch
kubectl get pods -n cdc-ats -w
```

## Production deploy

Use managed Postgres/Redis. Update the DATABASE_URL secrets to point at them, then:

```bash
helm upgrade --install cdc-ats infra/k8s/charts/cdc-ats -n cdc-ats \
  -f infra/k8s/charts/cdc-ats/values.yaml \
  -f infra/k8s/charts/cdc-ats/values-production.yaml
```

## GitOps via ArgoCD (preferred for prod)

```bash
# Install ArgoCD once:
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Apply the Application manifest pointing at this repo:
kubectl apply -f infra/k8s/argocd/cdc-ats-application.yaml
```

After this, ArgoCD auto-syncs every commit to `main`. CI builds and pushes images on each merge; ArgoCD picks them up.

## Image tag flow

| When | Tag | Used by |
|---|---|---|
| PR opened | (no images pushed) | typecheck + helm lint only |
| Merge to `main` | `:sha-<long-sha>` AND `:latest` | argocd deploy via CI |
| Manual rollback | any prior `:sha-<long-sha>` | `argocd app set cdc-ats --helm-set services.<svc>.image.tag=sha-...` |

## Resource sizing

Production defaults (per `values-production.yaml`):

| Service | Replicas | CPU req | Mem req |
|---|---|---|---|
| api-gateway | 3-12 (HPA) | 500m | 512Mi |
| frontend | 3-8 (HPA) | 200m | 384Mi |
| notification-service | 3-6 (HPA) | 100m | 256Mi |
| other services | 2-6 (HPA) | 100m | 256Mi |

Floor: ~24 pods × 100-500m CPU = ~6 vCPU + 10GB RAM. Fits a small managed Kubernetes cluster.

## Render manifests locally without applying

```bash
helm template cdc-ats infra/k8s/charts/cdc-ats \
  -f infra/k8s/charts/cdc-ats/values.yaml \
  -f infra/k8s/charts/cdc-ats/values-production.yaml > /tmp/rendered.yaml

# Inspect what would deploy:
grep '^kind:' /tmp/rendered.yaml | sort | uniq -c
```
