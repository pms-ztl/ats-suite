# Launch Readiness Checklist

## Infrastructure
- [ ] PostgreSQL 16 running with RLS enabled on all tenant tables
- [ ] Redis running (for future BullMQ queue)
- [ ] S3/MinIO configured for resume storage
- [ ] Docker images built and tested
- [ ] CI/CD pipeline green (all tests pass)
- [ ] Domain configured with SSL
- [ ] CORS set to production domain

## Security
- [ ] JWT_SECRET rotated to production value (min 64 chars)
- [ ] All API keys set in production env (ANTHROPIC_API_KEY, OPENAI_API_KEY)
- [ ] RLS policies applied via `prisma/rls_policies.sql`
- [ ] Rate limiting active (500/15min global, 20/15min auth)
- [ ] Security headers active (Helmet, HSTS, CSP)
- [ ] npm audit: 0 critical vulnerabilities
- [ ] Secrets not in git (verified .gitignore)
- [ ] Pen test scheduled

## Data
- [ ] Database migrations applied
- [ ] Seed data loaded (or clean start for production)
- [ ] Backup schedule configured
- [ ] PITR (Point-in-Time Recovery) enabled

## Agents
- [ ] ANTHROPIC_API_KEY set and verified
- [ ] OPENAI_API_KEY set and verified
- [ ] Per-tenant cost ceiling configured ($50/day default)
- [ ] All 5 agents tested with real API keys
- [ ] Eval suite passing (>80% on all agents)
- [ ] Langfuse configured (or disabled gracefully)
- [ ] HITL queue monitored (SLA alerts active)

## Compliance
- [ ] GDPR data access/erasure/rectify endpoints tested
- [ ] Vector embedding deletion tested (GDPR Art.17)
- [ ] EEOC adverse impact computation verified with test data
- [ ] Consent flow text reviewed by legal
- [ ] Audit log is append-only (no DELETE permission)
- [ ] PII redaction verified on all LLM calls

## Monitoring
- [ ] Prometheus metrics endpoint accessible
- [ ] Grafana dashboards configured (or Langfuse for agents)
- [ ] Alert rules created for top 12 alerts
- [ ] On-call rotation defined
- [ ] Runbooks reviewed for top 5 alerts

## Testing
- [ ] All backend tests passing (269+)
- [ ] All frontend tests passing (27+)
- [ ] E2E tests passing against staging
- [ ] Load test (k6 smoke) passing at 100 VUs
- [ ] Cross-tenant leakage test passing
- [ ] Eval gate passing for all 5 agents
