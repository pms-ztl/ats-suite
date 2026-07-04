# agent-service

The AI agent registry and run store (`@cdc-ats/agent-service`). Exposes the
catalog of available agents and a generic run endpoint plus run history. Reached
through the api-gateway under `/internal/agents`.

Default port: **4011** (`PORT`).

## Key endpoints

Mounted in `src/app.ts` under `/internal/agents` (`agents.ts`):

- `GET /registry` — the agent registry (available agent types + metadata).
- `POST /run` — run an agent.
- `GET /runs` — list agent runs.
- `GET /runs/:id` — a single agent run.

Also serves `/health`, `/healthz`, `/metrics`.

## Events

No `publishEvent`/`subscribeToEvents` calls in this service. It does not
publish or consume NATS events.

## Environment variables

Read directly in `src/`: `PORT` and `NODE_ENV`.

The Prisma datasource reads its database URL from `prisma/schema.prisma`. LLM
provider configuration (OpenRouter / OpenAI / Anthropic keys, model overrides) is
read by the shared `@cdc-ats/common` LLM client, not by this service directly, so
those variables do not appear in a `process.env` grep of `src/`.

## Run

```bash
npm run dev --workspace=@cdc-ats/agent-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=agent-service`, build = `tsc`);
schema/code changes require an image rebuild and container recreate.
