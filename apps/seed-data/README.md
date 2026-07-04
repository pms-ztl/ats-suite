# seed-data

Demo-data seeding tool (`@cdc-ats/seed-data`). Not a service: it is a one-shot
script that drives the full stack **through the api-gateway APIs** to populate the
system with realistic demo data.

## What it does

Runs `src/seed.ts`. It is idempotent: it detects the marker tenant ("Pinnacle
Tech") and skips if already present. What a full run creates:

- 5 demo tenants: Pinnacle Tech, Apex Manufacturing, Wavelength Studios,
  Northwind Staffing (kept FREE as the plan-gating control), and NCR Voyix (the
  client-branded tenant)
- users across those tenants (1 admin + a 3-level hierarchy each)
- requisitions across statuses
- candidates with realistic names + skills
- applications across pipeline stages
- NCR Voyix specifics: its brand palette applied via `PUT /api/branding` (NCR
  Voyix purple chrome + dark mode), and a "Software Engineer II" technical
  requisition with an eligibility rule plus an honest, inert HackerRank online-
  assessment note. The HackerRank + HackerEarth integrations show as
  "Not connected" on Settings -> Integrations until NCR pastes its own vendor
  keys (nothing is fabricated; no keys are stored). Login:
  `admin@ncrvoyix.demo` / `NcrVoyixDemo123!`.
- optionally (with `--full`) a handful of real AI agent runs to populate the AI
  Ops dashboard (this makes real LLM calls and costs money via OpenRouter)

The `oa-assessments` module for NCR Voyix (and the ENTERPRISE plan upgrade for
every non-FREE-control tenant) is turned on by `infra/seed.sh` after this script
runs; the seeder itself sets branding + data through the gateway APIs.

Flags: `--reset` deletes and re-creates the demo tenants (DESTRUCTIVE);
`--full` also runs the real AI agents.

## Endpoints / events

None. This package exposes no HTTP endpoints and publishes/consumes no NATS
events; it only calls the gateway's public/authenticated APIs as a client.

## Environment variables

Read directly in `src/`: `API_URL` (the gateway API base; defaults to
`http://localhost:4000/api`).

## Run

```bash
npm run seed --workspace=@cdc-ats/seed-data        # base demo data
npm run seed:full --workspace=@cdc-ats/seed-data   # also run real AI agents
npm run seed:reset --workspace=@cdc-ats/seed-data  # destructive re-create
```

Each script runs `tsx` with `--env-file=../../.env`. The gateway and backend
services must already be running (locally or via the Docker demo stack) for the
seed to succeed.
