# search-service

Candidate and job search plus candidate/requisition match ranking
(`@cdc-ats/search-service`). Maintains an in-service index that it keeps warm
from resume-parsed events. Reached through the api-gateway under `/internal/search`.

Default port: **4010** (`PORT`).

## Key endpoints

Mounted in `src/app.ts` under `/internal/search` (`search.ts`):

- `POST /candidates` — search candidates.
- `POST /jobs` — search jobs.
- `POST /match/rank` — rank candidates against a requisition (or vice versa).
- `POST /index` — (re)index a document.

Also serves `/health`, `/healthz`, `/metrics`.

## Events

No `publishEvent` in this service.

**Consumes** (via subscribers started in `index.ts` / `lib/subscribers.ts`):
`tenant.*.resume.parsed` — when a resume finishes parsing, the search index is
updated so the candidate becomes searchable. Subscribers only start when
`NATS_URL` is set; otherwise the service still serves search but does not
event-index.

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `NATS_URL`, and `SEARCH_SCAN_LIMIT`
(max documents scanned per query before ranking; default 5000).

This service has no dedicated database in the dev setup (postgres-init only
provisions the nine DB-backed services), so no `*_DATABASE_URL` is read here.

## Run

```bash
npm run dev --workspace=@cdc-ats/search-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=search-service`, build = `tsc`);
code changes require an image rebuild and container recreate.
