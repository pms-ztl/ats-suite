# Run the whole app with ONLY Docker

A fresh machine needs nothing but **Docker Desktop**. No Node, no npm, no
database setup. One command builds and starts everything (all 14 backend
services, the frontend, Postgres, Redis, NATS, MinIO), runs the migrations and
the demo seed, and opens a free public tunnel.

## Steps

```bash
# 1. Get the code
git clone <this-repo> && cd <repo>

# 2. Create your env file and set ONE key
cp .env.example .env
#    open .env and set OPENROUTER_API_KEY=...   (needed for the AI features)

# 3. Bring it all up (first run builds images, ~20-30 min; later runs are instant)
docker compose -f docker-compose.demo.yml up -d --build

# 4. Get the public URL
docker compose -f docker-compose.demo.yml logs cloudflared | grep trycloudflare
```

On Windows you can instead double-click **`docker-demo.bat`** — it does steps 2 to
4 and prints the URL for you (and saves it to `CURRENT-DEMO-URL.txt`).

Login: `priya@pinnacle.demo` / `PinnacleDemo123!` (tenant admin) or
`super@cdc-ats.demo` / `DemoSuper-2026!` (platform admin).

## Stop / restart

```bash
docker compose -f docker-compose.demo.yml down       # stop (keeps data)
docker compose -f docker-compose.demo.yml down -v     # stop + wipe all data
docker compose -f docker-compose.demo.yml up -d       # start again (no rebuild)
```

## What happens on `up`

1. Postgres starts and creates all 13 service databases.
2. `migrator` runs every service's schema migrations, then exits.
3. The 14 backend services and the frontend start.
4. `seeder` waits for the gateway, loads the demo tenants/users/candidates, and
   unlocks AI by setting the demo tenants to the ENTERPRISE plan, then exits.
5. `cloudflared` opens the public tunnel and prints the URL in its logs.

## Notes

- **The tunnel URL changes on each `up`** (free Cloudflare tunnels are random).
  It is always in `docker compose logs cloudflared` and in `CURRENT-DEMO-URL.txt`.
- **Live only while the machine and containers run.** This is a tunnel, not
  cloud hosting; an always-on link still needs a paid host.
- **RLS (row-level tenant isolation) is off in this demo image** for simplicity.
  It is fully present in the codebase; the cloud deployment (`render.yaml`)
  turns it on. Fine for a demo, not for real multi-tenant production.
- **Resumes** are stored in the bundled MinIO (no external S3 needed).
- If the link will not open on the host PC, turn on your browser's Secure DNS
  (set to Cloudflare). Anyone else opens it normally.
