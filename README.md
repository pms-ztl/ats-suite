# CDC ATS — Microservices Architecture

10-service rewrite of the CDC ATS platform (Phase 7 from `stateless-hopping-cupcake.md`).

## Quick start

```bash
npm install
npm run infra:up        # boots postgres, redis, nats, jaeger, prometheus, grafana, loki
npm run dev             # boots all services + gateway in dev mode
```

## Layout

```
apps/
├── api-gateway          # port 4000  — JWT verify, route, forward headers
├── identity-service     # port 4001  — auth, users, invites
├── tenant-service       # port 4002  — tenants, super-admin, plan changes
├── billing-service      # port 4003  — plan limits, agent gating, cost tracking
├── job-service          # port 4004  — requisitions, postings, form schemas
├── candidate-service    # port 4005  — candidates, applications, attachments
├── interview-service    # port 4006  — interviews, rounds, feedback, scheduling
├── resume-service       # port 4007  — upload, bulk, parse worker
├── screening-service    # port 4008  — screening, decisions, screen worker
├── notification-service # port 4009  — in-app, SSE, email, webhook
└── frontend             # port 3000  — migrated Next.js app

packages/
├── common               # logger, response, error, auth headers, otel, metrics, health
├── contracts            # REST DTOs + NATS event payloads (shared types)
├── nats-client          # publish/subscribe helpers + idempotency
├── ai-engine            # agent runtime + all agent definitions
└── eslint-config        # shared lint config

infra/
├── docker-compose.yml   # local dev stack
└── k8s/                 # Helm charts (production)
```

## Architecture decisions

See [stateless-hopping-cupcake.md](file:///C:/Users/ASUS/.claude/plans/stateless-hopping-cupcake.md) Section A.

- DB-per-service (PostgreSQL × 10 databases on one cluster locally; can split to instances in prod)
- REST for sync inter-service, NATS Jetstream for async events
- API gateway = Express + http-proxy-middleware + jose (JWT)
- OpenTelemetry → Jaeger for distributed tracing
- Redis Pub/Sub for SSE notification fan-out

## License

Proprietary — CDC.
