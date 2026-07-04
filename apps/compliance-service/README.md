# compliance-service

Audit logging, retention policy, EEOC-style bias audits, and GDPR data-subject
requests (`@cdc-ats/compliance-service`). Reached through the api-gateway at
`/api/audit`, which proxies to `/internal/compliance`.

Default port: **4013** (`PORT`).

## Key endpoints

Mounted in `src/app.ts` under `/internal/compliance` (`compliance.ts`):

- `POST /audit/log` — write an audit-log entry.
- `GET /audit` — list audit entries.
- `GET /audit/subject/:subjectId` — audit trail for a subject.
- `GET /retention/policy` — the effective retention policy.
- `POST /bias-audit/:requisitionId` — run a bias audit on a requisition.
- `POST /dsr/candidates/:candidateId/export` — GDPR data-subject export
  (fans out to other services' `/internal/gdpr` legs).
- `DELETE /dsr/candidates/:candidateId` — GDPR erasure.

Also serves `/health`, `/healthz`, `/metrics`.

## Events

No `publishEvent`/`subscribeToEvents` calls in this service. Compliance work is
request-driven; the DSR export/erasure legs call other services over HTTP.

## Environment variables

Read directly in `src/`: `PORT`, `NODE_ENV`, `INTERNAL_SERVICE_TOKEN`,
`ASSESSMENT_SERVICE_URL`, `SCREENING_SERVICE_URL` (for the DSR fan-out), and the
retention defaults `RETENTION_CANDIDATE_DAYS` (default 365) and
`RETENTION_AUDIT_DAYS` (default 2555, about seven years).

This service has no dedicated database in the dev setup, so no `*_DATABASE_URL`
is read here.

## Run

```bash
npm run dev --workspace=@cdc-ats/compliance-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=compliance-service`, build = `tsc`);
code changes require an image rebuild and container recreate.
