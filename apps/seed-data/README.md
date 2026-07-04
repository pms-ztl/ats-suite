# seed-data

Demo-data seeding tool (`@cdc-ats/seed-data`). Not a service: it is a one-shot
script that drives the full stack **through the api-gateway APIs** to populate the
system with realistic demo data.

## What it does

Runs `src/seed.ts`. It is idempotent: it detects the marker tenant ("Pinnacle
Tech") and skips if already present. What a full run creates:

- 3 demo tenants (Pinnacle Tech, Apex Manufacturing, Wavelength Studios)
- users across those tenants (1 admin + staff each)
- requisitions across statuses
- candidates with realistic names + skills
- applications across pipeline stages
- optionally (with `--full`) a handful of real AI agent runs to populate the AI
  Ops dashboard (this makes real LLM calls and costs money via OpenRouter)

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
