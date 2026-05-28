# Production Deployment

CDC ATS ships in two supported topologies:

| Topology | When to use it | Setup time |
|---|---|---|
| **Single-host Docker Compose** + nginx | Small / mid-tier tenants, demos, one prod environment per region | ~30 min |
| **Kubernetes (Helm)** + cert-manager + ArgoCD | Multi-region, autoscaling, blue/green | ~2 hrs first time |

Both run the same 11 service images (`api-gateway`, 9 backend services, `frontend`) and the same 6 infrastructure containers (Postgres, Redis, NATS, Jaeger, Prometheus, Grafana, Loki).

---

## Option A — Single-host Docker Compose (recommended for first prod)

You'll need a VM with:
- 4 vCPU, 8 GB RAM, 80 GB disk (smaller works for low-traffic)
- Docker 24+ and the `docker compose` v2 plugin
- Ports 80 + 443 open to the public; everything else stays local

### 1. DNS records to add at your registrar

Point both records at your VM's public IP:

```
A   app.your-domain.com   →  <VM_PUBLIC_IP>
A   api.your-domain.com   →  <VM_PUBLIC_IP>
```

DNS must propagate before TLS works (test with `dig app.your-domain.com +short`).

### 2. Issue TLS certificates

Two paths — use whichever fits your tooling:

**Option A — certbot (manual)** before first boot:
```bash
sudo certbot certonly --standalone -d app.your-domain.com -d api.your-domain.com \
  -m ops@your-domain.com --agree-tos
mkdir -p infra/certs/app infra/certs/api
cp /etc/letsencrypt/live/app.your-domain.com/fullchain.pem infra/certs/app/
cp /etc/letsencrypt/live/app.your-domain.com/privkey.pem   infra/certs/app/
cp /etc/letsencrypt/live/api.your-domain.com/fullchain.pem infra/certs/api/
cp /etc/letsencrypt/live/api.your-domain.com/privkey.pem   infra/certs/api/
```

**Option B — cloud LB** (DigitalOcean LB, AWS ALB, Cloudflare):
Terminate TLS at the LB and have it forward HTTP to the VM on port 80. In that case, comment out the `443` server blocks in `infra/nginx.conf` and skip the cert steps.

### 3. Edit `infra/nginx.conf`

Find/replace `example.com` with your actual domain in the two `server_name` directives. (The repo's `app.example.com` and `api.example.com` are placeholders.)

### 4. Create `.env.production`

```dotenv
# Public URLs — frontend uses these to build links to the API
PROD_APP_URL=https://app.your-domain.com
PROD_API_URL=https://api.your-domain.com

# JWT — generate one fresh secret, keep it out of git
JWT_SECRET=<64-char random hex>
JWT_ACCESS_EXPIRES=24h
JWT_REFRESH_EXPIRES=7d

# Database — strongly recommend a managed Postgres for prod (RDS, Cloud SQL,
# Crunchy Bridge, etc). Compose ships Postgres 16 as a fallback.
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<long random>

# AI — set whichever provider you use. OpenRouter covers all model families
# with one key.
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# SMTP — pointed at Resend / Postmark / SendGrid / your own SMTP
SMTP_URL=smtps://api:<token>@smtp.resend.com:465
SMTP_FROM=noreply@your-domain.com

# Observability — drop these if you don't run Sentry
SENTRY_DSN=
LOKI_URL=http://loki:3100
OTEL_DISABLED=false

# CORS — restrict to your prod domain
CORS_ORIGIN=https://app.your-domain.com
```

### 5. Harden Postgres (recommended)

Edit `infra/postgres-init-secure.sql` and replace every `CHANGE_ME_*` placeholder password with a strong unique one. Then point each service's `DATABASE_URL` env at its own user instead of the superuser.

Skip this step on first deploy if you want — the dev `postgres-init.sql` still works. Just don't ship a `superuser`-only deploy to production with real candidate PII in it long-term.

### 6. Boot

```bash
cd infra
docker compose \
  -f docker-compose.full.yml \
  -f docker-compose.prod.yml \
  --env-file ../.env.production \
  up -d

# Watch logs for ~60s — services need ~30s for Postgres to be ready
docker compose -f docker-compose.full.yml logs -f --tail=100
```

### 7. Run database migrations

```bash
# Once per service (do this from a host with network access to postgres:5432)
for svc in identity tenant billing job candidate interview resume screening notification; do
  docker compose -f docker-compose.full.yml exec ${svc}-service \
    npx prisma migrate deploy
done
```

### 8. Create the first super-admin user

```bash
docker compose -f docker-compose.full.yml exec identity-service \
  node -e "import('@cdc-ats/common').then(async ({ argon2Hash }) => { /* see seed-data app */ })"
```

Or just register a tenant via `/get-started` and `UPDATE \"User\" SET role='SUPER_ADMIN' WHERE email='you@your-domain.com'` on identity_db.

### 9. Verify

```bash
curl -I https://app.your-domain.com   # expect 200
curl https://api.your-domain.com/healthz  # expect {"status":"ok",...}
```

---

## Option B — Kubernetes (Helm + cert-manager + ArgoCD)

### Prereqs

- A cluster with **nginx-ingress** installed (1 LB per cluster)
- **cert-manager** installed (`kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.1/cert-manager.yaml`)
- DNS records pointing at the LB's IP/hostname
- An external Postgres (RDS/Cloud SQL), Redis (ElastiCache/MemoryStore), and NATS (NATS Cloud / self-hosted Operator)

### Configure

Edit `infra/k8s/charts/cdc-ats/values-production.yaml`:

```yaml
certManager:
  enabled: true
  email: ops@your-domain.com
  issuer: cdc-ats-letsencrypt-staging   # start on staging; switch to prod once green

services:
  api-gateway:
    ingress:
      host: api.your-domain.com
  frontend:
    ingress:
      host: app.your-domain.com
```

### Secrets

Create the cluster secret with your real values:

```bash
kubectl create namespace cdc-ats
kubectl create secret generic cdc-ats-secrets -n cdc-ats \
  --from-literal=JWT_SECRET="..." \
  --from-literal=OPENROUTER_API_KEY="..." \
  --from-literal=identity-database-url="postgresql://identity_user:..." \
  ...
```

(Use a secrets manager — Sealed Secrets, External Secrets, SOPS — for anything beyond a demo.)

### Deploy

```bash
helm upgrade --install cdc-ats infra/k8s/charts/cdc-ats \
  --namespace cdc-ats \
  --values infra/k8s/charts/cdc-ats/values-production.yaml \
  --wait
```

cert-manager will request certs from Let's Encrypt staging on first install (visible in `kubectl describe certificate -n cdc-ats`). Once green:

```yaml
certManager:
  issuer: cdc-ats-letsencrypt-prod
```

And rerun `helm upgrade` — new prod certs will issue and replace staging.

### ArgoCD (optional)

`infra/k8s/argocd/cdc-ats-application.yaml` defines auto-sync from `main`. Apply it once:

```bash
kubectl apply -f infra/k8s/argocd/cdc-ats-application.yaml -n argocd
```

CI on `main` builds + pushes `:sha-<commit>` images to GHCR. To roll a new version:

```bash
argocd app set cdc-ats -p services.api-gateway.image.tag=$GITHUB_SHA  # for each service
argocd app sync cdc-ats
```

(A future CI step can do this automatically.)

---

## Operational quick reference

| Task | Command |
|---|---|
| **View logs** | `docker compose -f infra/docker-compose.full.yml logs -f api-gateway` |
| **Restart a service** | `docker compose -f infra/docker-compose.full.yml restart job-service` |
| **Apply migrations after schema change** | `docker compose ... exec <svc>-service npx prisma migrate deploy` |
| **Connect to Grafana** | `https://your-domain.com:3001` (admin/admin — change immediately) |
| **Connect to Jaeger** | `http://localhost:16686` (port-forward; not exposed publicly) |
| **Kill an agent platform-wide** | `/admin/platform/agents` as super-admin |
| **Run isolation pen test** | `API_BASE=https://api.your-domain.com/api npx tsx apps/security-test/src/cross-tenant.ts` |

---

## What's NOT in this guide (production-grade, deferred)

- **Multi-region**: replicate Postgres + NATS across regions; geo-DNS
- **Backup**: pgBackRest or Cloud SQL automated backups + restore drills
- **Secret rotation**: integrate with Vault / AWS Secrets Manager
- **Image scanning**: Trivy in CI before pushing to GHCR
- **WAF**: Cloudflare or AWS WAF in front of nginx
- **SSO**: SAML / OIDC for tenant logins (only password + MFA today)
- **Audit log shipping**: forward `PlatformKillAudit` + `PromptOverride` to SIEM
- **Cert renewal automation for Compose**: certbot renew cron + nginx reload hook

Each of these is the kind of thing your security/ops team will want owned by them anyway. Add them as Phase 27+ work when you have a concrete production customer driving the requirement.
