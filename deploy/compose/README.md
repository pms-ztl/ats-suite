# CDC ATS - Scaled single-host (Compose / Podman)

A production-leaning deployment of the full ATS stack on **one host**: multiple
replicas of the hot-path services behind an **NGINX** load balancer, with
**PgBouncer** in front of a **tuned Postgres**. For teams that want a scaled
deployment without Kubernetes - a beefy staging box, a pilot, an air-gapped or
Podman environment, or a cost-capped production pilot.

## Honest single-host caveat

One host is still one host. This is a big step up from `docker-compose.demo.yml`
(replicas spread across cores, a connection pooler, tuned Postgres, a real LB) but:

- It does **not** reach the 10,000-concurrent number the Kubernetes topology
  targets. That needs `deploy/k8s/` + the HPAs + managed/HA Postgres, Redis, and
  object storage. See `docs/SCALABILITY.md` §7.
- There is **no cross-host failover**. Postgres, Redis, NATS, and MinIO are single
  instances. If the host dies, everything dies.
- It is **not tested against a live production host** - it is derived from the
  demo stack and the k8s manifests.

Use `deploy/k8s/` for genuine 10k + HA. Use this for everything below that.

## What it adds over the demo (additive - the demo is untouched)

| Concern | Demo | This prod compose |
| --- | --- | --- |
| Edge | frontend + gateway on host ports | **NGINX** LB, single ingress on :80 |
| Hot-path services | 1 replica each, host ports | `deploy.replicas` (3/3/2/2/2), no host port, DNS-balanced |
| Postgres conns | direct, `connection_limit=8` on job only | **PgBouncer** pooler, small pool per service |
| Postgres tuning | fixed | env-tunable to the host size |
| Secrets | inline defaults | **required** from `.env` (compose refuses to start without) |
| Tunnel / judge0 | cloudflared + judge0 | removed (not for prod) |

## Quick start

```
cd deploy/compose
cp .env.prod.example .env          # fill in REAL secrets - never commit .env
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Watch it come up
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f nginx api-gateway

# App is on http://<host>/  (NGINX → frontend; /api → gateway)
```

Scale a hot-path service live (NGINX re-resolves DNS every 10s, no reload needed):

```
docker compose -f docker-compose.prod.yml up -d --scale job-service=6 --scale resume-service=4
```

Seeding is **opt-in** (behind the `seed` profile) so a plain `up` never seeds a
production database:

```
docker compose -f docker-compose.prod.yml --profile seed up seeder
```

## Sizing guidance

- **Replicas**: total service processes ≈ the sum of replica counts. Do not
  over-subscribe cores. On an 8-core / 16GB host, the defaults
  (gateway 3, job 3, resume 2, screening 2, frontend 2 + the singletons) are a
  reasonable start. Resume-service is the CPU-heaviest (parse + OCR).
- **PgBouncer**: `PGBOUNCER_MAX_CLIENT_CONN` must exceed
  `Σ (service replicas × connection_limit)`. With `DB_CONN_LIMIT=5`,
  `JOB_DB_CONN_LIMIT=8`, and the default replica counts, that sum is well under
  the default 2000. `DEFAULT_POOL_SIZE` is the backend connections per database -
  keep `pool_size × databases` under Postgres `max_connections`.
- **RLS + pool mode**: `POOL_MODE=session` is the **safe default**. Transaction
  pooling leaks the per-request `SET app.current_tenant_id` across clients and
  **breaks tenant isolation** unless the code uses `SET LOCAL` in an explicit
  transaction. Do the audit (see the `pgbouncer` block in the compose file and
  `docker-compose.demo.yml`) before switching to `transaction`.

## TLS

The shipped NGINX serves HTTP on :80. For production, terminate TLS: mount certs
into `deploy/compose/nginx/certs/` (`fullchain.pem` + `privkey.pem`), enable the
commented `443` server block in `nginx/nginx.conf`, and publish `HTTPS_PORT`. Or
put this whole stack behind a cloud LB / Cloudflare that terminates TLS. No real
certs are committed (`.gitignore` blocks `nginx/certs/*`).

## Podman

Most of this runs under `podman-compose -f docker-compose.prod.yml up -d`.
Caveats:

- Rootless Podman cannot bind `:80` - set `HTTP_PORT=8080` (or run the
  `nginx` container with a port mapping the rootless user owns) and front it with
  the host firewall / a rootful reverse proxy.
- Podman's embedded DNS differs from Docker's; the NGINX `resolver 127.0.0.11`
  line may need to be your Podman network's DNS. Verify with
  `podman network inspect`.
- For a systemd-native deployment, use **Quadlet** `.container` units instead of
  compose - a starter is in `podman/` and documented in `docs/DEPLOYMENT.md`.

## Files

| File | Purpose |
| --- | --- |
| `docker-compose.prod.yml` | The scaled single-host stack |
| `.env.prod.example` | Env template (copy to `.env`) |
| `nginx/nginx.conf` | Edge LB config (DNS round-robin over replicas) |
| `nginx/certs/` | Mount point for TLS certs (gitignored) |
| `podman/` | Quadlet `.container` unit starters for systemd/Podman |

## Cross-references

- Scaling story + limits: `docs/SCALABILITY.md`
- Deploy methods (Helm / kustomize / compose): `docs/DEPLOYMENT.md`
- Operations (monitor, scale, back up, roll out): `docs/OPERATIONS.md`
- Load-test day: `load-tests/README.md`, `load-tests/stress-10k.js`
