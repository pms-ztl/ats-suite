# Load Testing & SLOs

How we measure performance under load and what "good enough" looks like.

## SLOs (Service Level Objectives)

What we commit to in steady-state production.

| SLO | Target | Measurement window | Error budget |
|---|---|---|---|
| **Availability** | 99.9% | 30 days | 43 minutes/month |
| **API p95 latency** | < 800ms | 5 minutes | n/a (latency, not error) |
| **API p99 latency** | < 2000ms | 5 minutes | n/a |
| **5xx error rate** | < 1% | 5 minutes | covered by availability SLO |
| **AI agent inference p95** | < 8s | 1 hour | n/a |
| **Email delivery success** | > 99% | 24 hours | 1% / day |

Tracked via Prometheus rules in `infra/alerts.yml` (Phase 31d).

## Anti-goals (what we explicitly don't promise)

Setting expectations honestly:

- We do NOT promise hard real-time guarantees — AI agent calls can take
  seconds and that's OK
- We do NOT promise zero-downtime for major version migrations (we'll
  schedule windows)
- We do NOT promise per-tenant performance isolation today — a single
  tenant doing 10× normal traffic can starve others until we add
  per-tenant rate limits (planned)

## Tooling

We use [k6](https://k6.io) for HTTP load testing. Scripts live in
`load-tests/`. k6 was chosen because:
- One binary, no JVM
- JavaScript test scripts (low learning curve)
- Built-in `thresholds` make pass/fail explicit
- Native Prometheus + Grafana integration

## Quick start

### Install k6

```bash
brew install k6              # macOS
choco install k6              # Windows
sudo apt install k6           # Debian/Ubuntu
```

### Seed a load-test user

You need a real account k6 can log in as. From the seed script
(`scripts/seed-demo.ts`), or manually:

```sql
-- in identity_db
INSERT INTO "User" (id, "tenantId", email, "passwordHash", "firstName", "lastName", role, "isActive", "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  '<existing-tenant-id>',
  'loadtest@cdc-ats.local',
  -- argon2 hash of "LoadTest123!Password" (see scripts/hash-password.ts)
  '$argon2id$v=19$m=65536,t=3,p=4$...',
  'Load', 'Test', 'ADMIN',
  true, true, NOW(), NOW()
);
```

### Run the baseline

```bash
# Local
k6 run load-tests/baseline.js

# Against staging
API_BASE=https://staging.cdc-ats.example/api \
  LOAD_TEST_EMAIL=loadtest@cdc-ats.local \
  LOAD_TEST_PASSWORD='LoadTest123!Password' \
  k6 run load-tests/baseline.js

# Higher load — override the built-in stages
k6 run --vus 200 --duration 10m load-tests/baseline.js
```

## Interpreting results

k6 prints a summary at the end. Key fields:

```
http_req_duration..........: avg=312ms  min=42ms   med=280ms  max=4.2s  p(95)=720ms  p(99)=1.8s
http_req_failed............: 0.12%
checks.....................: 99.85% ✓ 14872  ✗ 22
iterations.................: 14894
data_received..............: 234 MB  3.9 MB/s
```

| What you see | What it means | Action |
|---|---|---|
| p(95) < 800ms, p(99) < 2s, failed < 1% | All green — ship | ✅ |
| p(95) 800-1500ms | Yellow zone | Profile slowest endpoint with Jaeger |
| p(95) > 1500ms | Red — DB / N+1 / pool exhaustion | Don't ship; investigate |
| Spikes only on `candidate-list` | Likely a missing index | Check `EXPLAIN` |
| 5xx > 1% under low VUs | App bug, not capacity | Read service logs |
| 5xx surges as VUs ramp | Connection pool / file-descriptor limits | Bump pool size or replicas |
| `auth-me` slow | JWT verify hot path or `/me` aggregator | Cache it |

## Test profiles

`load-tests/baseline.js` is the "smoke before deploy" gate. Additional
profiles to add as needed:

| Profile | What | When |
|---|---|---|
| `baseline.js` | Realistic mix at 50 VUs / 5 min | Pre-deploy CI |
| `stress.js` (TODO) | Ramp to 500 VUs to find breaking point | Quarterly |
| `soak.js` (TODO) | 100 VUs / 4 hours to surface memory leaks | Quarterly |
| `bulk-upload.js` (TODO) | Concurrent 100-resume uploads to test BullMQ | Before adding new agent |
| `spike.js` (TODO) | 0→500 VUs in 30s to test autoscaling | Before promo / launch event |

## What gets profiled

The baseline covers the 5 most-trafficked customer flows. For each, we
track per-endpoint p95 (custom k6 Trend metric) so a regression on one
flow doesn't get masked by the others.

| Weight | Flow | Endpoint(s) |
|---|---|---|
| 60% | List candidates | `GET /api/candidates` |
| 20% | Open a requisition | `GET /api/requisitions` then `GET /api/requisitions/:id` |
| 10% | Page load → /me | `GET /api/auth/me` |
| 5% | List interviews | `GET /api/interviews` |
| 5% | Candidate search | `GET /api/candidates?search=` |

## CI integration

Add to `.github/workflows/load-test.yml`:

```yaml
name: Load test (nightly)
on:
  schedule:
    - cron: "0 4 * * *"    # 04:00 UTC nightly
  workflow_dispatch:

jobs:
  baseline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/setup-k6-action@v1
      - run: |
          k6 run load-tests/baseline.js
        env:
          API_BASE: ${{ secrets.STAGING_API_BASE }}
          LOAD_TEST_EMAIL: ${{ secrets.LOAD_TEST_EMAIL }}
          LOAD_TEST_PASSWORD: ${{ secrets.LOAD_TEST_PASSWORD }}
      - if: failure()
        uses: 8398a7/action-slack@v3
        with: { status: failure, channel: "#ops-warnings" }
```

## Honest limits

What this load test does NOT prove:

- **Tenant isolation**: covered separately by Phase 24 pen test
- **Long-tail latency** (p99.9): k6 needs millions of requests to be reliable
  at that quantile — we'd need a separate longer-running profile
- **Real LLM cost**: AI agent endpoints aren't in the baseline because
  each call costs $0.01-$0.05 and a 5-min run would burn through real
  budget. Test those separately with a single-shot benchmark.
- **Database failover**: k6 doesn't kill the DB. Use Chaos Monkey / litmus
  for that.

## Capacity planning baseline

Single-region deploy (1 replica of each service) targets:

| Tenants | Active users / hour | k6 VUs needed | Resource ask |
|---|---|---|---|
| 10 | 50 | 25 | 2 vCPU / 4 GB |
| 100 | 500 | 100 | 8 vCPU / 16 GB |
| 1,000 | 5,000 | 500 | 32 vCPU / 64 GB + 3 replicas |

These are rough — re-measure when you grow past each tier.
