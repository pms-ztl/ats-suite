# Deploy to Render (Blueprint)

`render.yaml` defines the full stack: gateway + frontend (public web), 9 internal
private services, managed Postgres, Key Value (Redis), and a private NATS. Object
storage (S3/R2) is **external**.

## 0. Prerequisites (decisions only you can make)
- **Rotate the OpenRouter key** that leaked earlier; have a fresh one ready.
- An **embeddings key** (`OPENAI_API_KEY`) — required for ML matching + semantic skills.
- An **S3-compatible bucket** (AWS S3, Cloudflare R2, Backblaze B2) + credentials.
- (Optional) SMTP creds, Stripe keys, Google/Microsoft OAuth app creds.

## 1. Create the Blueprint
1. Push this repo to GitHub.
2. Render → **New → Blueprint** → pick the repo. Render reads `render.yaml` and
   provisions Postgres, Redis, NATS, and all 11 services.
3. First build will succeed; services will be **unhealthy** until step 2–4 below
   (they need DATABASE_URL + secrets).

## 2. Create the 9 service databases
The managed Postgres starts with one database. Open its **PSQL shell** (Render
dashboard → the database → "Connect") and create the per-service DBs:

```sql
CREATE DATABASE identity_db;     CREATE DATABASE tenant_db;
CREATE DATABASE billing_db;      CREATE DATABASE job_db;
CREATE DATABASE candidate_db;    CREATE DATABASE interview_db;
CREATE DATABASE resume_db;       CREATE DATABASE screening_db;
CREATE DATABASE notification_db;
```

Then set each service's **`DATABASE_URL`** (marked `sync:false` in the Blueprint)
to the managed connection string with its db name swapped in, e.g.:
```
postgresql://USER:PASS@HOST:5432/candidate_db?sslmode=require
```

## 3. Paste secrets (the `sync:false` vars)
Per service, in the Render dashboard:
- **candidate / resume / interview / screening**: `OPENROUTER_API_KEY` (LLM),
  `OPENAI_API_KEY` (embeddings).
- **resume**: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`,
  `S3_SECRET_ACCESS_KEY`, `S3_REGION` (it hard-fails in prod without these).
- **billing**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (if using Stripe).
- **notification**: `SMTP_URL`, `SMTP_FROM`.
- **interview**: Google/Microsoft OAuth creds (optional — connectors no-op until set).
- **frontend**: set `NEXT_PUBLIC_API_URL` to `https://<gateway-host>/api`.

`JWT_SECRET` is generated once on the gateway and shared to services via the
Blueprint — don't override it.

## 4. Run migrations
From a shell with each `*_DATABASE_URL` (Render "Jobs" or locally):
```bash
for s in identity tenant billing job candidate interview resume screening notification; do
  (cd apps/$s-service && DATABASE_URL="$<S>_DATABASE_URL" npx prisma migrate deploy)
done
```
This applies all pending migrations incl. the candidate **embedding** column.

## 5. Post-deploy
- **Embed existing candidates** (one-time): `POST /api/sourcing/embed-backfill`
  (admin token). New candidates embed automatically on parse.
- **Health**: each service exposes `/health/ready`; the gateway aggregates.
- **Smoke**: log in, create a candidate, upload a resume, run a screening, open
  the candidate's AI Screening + Best-matches.

## Notes / honest caveats
- **NATS** runs as a private service (no managed NATS on Render). For HA, point
  `NATS_URL` at a managed NATS (e.g. Synadia) instead.
- **Object storage** is external by design (Render has no managed S3).
- Managed Postgres backups cover all 9 DBs (same instance).
