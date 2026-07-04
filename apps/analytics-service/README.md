# analytics-service

Metric ingestion and reporting: funnel, summary, and pipeline metrics
(`@cdc-ats/analytics-service`). Reached through the api-gateway at `/api/reporting`
and `/api/analytics`, which proxy to `/internal/analytics`.

Default port: **4012** (`PORT`).

## Key endpoints

Mounted in `src/app.ts` under `/internal/analytics` (`analytics.ts`):

- `POST /ingest` — ingest a metric event.
- `GET /summary` — summary metrics.
- `GET /funnel` — hiring funnel metrics.
- `GET /metrics` — pipeline / rollup metrics.

Also serves `/health`, `/healthz`, and the Prometheus `/metrics` scrape endpoint
(distinct from the analytics `GET /internal/analytics/metrics` above).

## Events

No `publishEvent`/`subscribeToEvents` calls in this service. Metric data arrives
over HTTP via `POST /ingest`, not over NATS.

## Environment variables

Read directly in `src/`: `PORT` and `NODE_ENV`.

The Prisma datasource reads its database URL from `prisma/schema.prisma`.

## Run

```bash
npm run dev --workspace=@cdc-ats/analytics-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=analytics-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
