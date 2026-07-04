# resume-service

Resume ingestion, text extraction (PDF/DOCX/TXT, optional OCR), parsing into
structured fields, bulk-archive (ZIP) intake, and download URLs
(`@cdc-ats/resume-service`). Feeds the AI screening pipeline. Reached through the
api-gateway under `/internal/resume`.

Default port: **4007** (`PORT`).

## Key endpoints

Mounted in `src/app.ts` under `/internal/resume` (`resume.ts`):

- `POST /upload` — single resume upload (multipart; extract → parse pipeline).
- `POST /bulk` — bulk resume upload.
- `POST /bulk-archive` — ZIP archive of mixed resumes/images for async
  unzip + extract + OCR staging.
- `GET /bulk/:id`, `GET /bulk/:id/items`, `PATCH /bulk/:id/items/:itemId`,
  `POST /bulk/:id/review-all`, `POST /bulk/:id/commit` — bulk staging review + commit.
- `GET /:candidateId` — parsed resume for a candidate.
- `GET /:resumeId/download-url` — signed download URL.
- `POST /reparse/:candidateId` — re-run parse (ADMIN / RECRUITER).

Also serves `/health`, `/healthz`, `/metrics`.

## Events

**Produces**: `resume.parsed` (published from `lib/parse-pipeline.ts` after a
resume is parsed; consumed by candidate-service, screening-service, and
search-service) and `agent.completed` (AI resume-verification run cost).

No event subscriptions in this service (work is queued from HTTP uploads).

## Background workers (BullMQ, require `REDIS_URL`)

`resume-parse.worker` (extract + parse a queued resume) and
`bulk-archive-extract.worker` (async unzip/extract/OCR of an uploaded archive).

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `NATS_URL`, `REDIS_URL`,
`RESUME_APP_DATABASE_URL` (RLS app-role), `INTERNAL_SERVICE_TOKEN`,
`CANDIDATE_SERVICE_URL`, `SCREENING_SERVICE_URL`, `BILLING_SERVICE_URL`,
`AGENTIC_RESUME_VERIFY`, `RESUME_GITHUB_CORROBORATE`.

- Parsing/OCR tuning: `ENABLE_OCR`, `RESUME_OCR_MAX_PAGES`, `RESUME_OCR_MAX_MS`,
  `RESUME_PARSE_CONCURRENCY`, `RESUME_PARSE_RATE_MAX`, `BULK_ARCHIVE_CONCURRENCY`.
- S3 storage: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`,
  `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`.

The Prisma datasource reads `RESUME_DATABASE_URL` (superuser) from
`prisma/schema.prisma`; request routes use the RLS client via
`RESUME_APP_DATABASE_URL`. Note: `tenantContext` is re-applied after multer on
the multipart `/upload` and `/bulk` routes so the RLS tenant context survives
stream processing.

## Run

```bash
npm run dev --workspace=@cdc-ats/resume-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=resume-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
