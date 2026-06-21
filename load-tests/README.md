# Load tests (k6)

k6 scripts that exercise the hottest paths in the platform. See
[`../docs/LOAD_TESTING.md`](../docs/LOAD_TESTING.md) for the SLOs, the
interpretation guide, and the capacity-planning baseline.

| Script | What it loads | Model |
|---|---|---|
| `baseline.js` | The 5 most-trafficked authed read flows | closed (ramping-vus) |
| `stress.js` | Reads + optional candidate writes + vector match | closed (ramping-vus) |
| `apply-custom.js` | The public candidate-apply WRITE path (WF-I / I8) | open (ramping-arrival-rate) |
| `fixtures/resume-sample.pdf` | A small real text-bearing PDF resume | n/a |

---

## apply-custom.js — public apply load/stress

The single hottest WRITE path: every job-board click and every "Apply"
press lands here. It uses an **open** workload model
(`ramping-arrival-rate`) so iterations start at a fixed offered rate
regardless of how slow the server gets — that is what surfaces true
saturation. A closed VU loop would just queue behind a slow server and
under-report the load it actually offered.

It drives BOTH apply paths via the `APPLY_MODE` switch:

- `multipart` (default) — the existing, always-live path. One multipart
  `POST /api/public/jobs/:slug/apply-custom` carrying the form fields plus
  the resume binary. Expects **201**.
- `presigned` — the additive accept-fast path: `GET upload-ticket` ->
  `POST` the file straight to MinIO/S3 -> `POST apply-fast` with the
  returned `objectKey`. Expects **202**. If the target build does not
  expose the ticket/fast endpoints, the harness warns once and counts the
  iteration as a failure (it never fabricates a pass).

### Env knobs

| Var | Default | Meaning |
|---|---|---|
| `BASE_URL` | `http://localhost:4000` | Gateway origin, **no** trailing `/api` |
| `SLUG` | — (**required**) | A **published** job-posting slug |
| `TENANT` | — | Tenant id; tagged on metrics, sent as a hint header on ticket reqs |
| `APPLY_MODE` | `multipart` | `multipart` or `presigned` |
| `FIXTURE` | `./fixtures/resume-sample.pdf` | Path to the resume PDF |
| `RAMP_TARGET` | `300` | Peak steady arrival rate (iters/s) |
| `SPIKE_TARGET` | `600` | Spike arrival rate (iters/s) |
| `PRE_VUS` | `1000` | `preAllocatedVUs` |
| `MAX_VUS` | `6000` | `maxVUs` |

### CI-failing thresholds

k6 exits non-zero (fails the job) if any of these is breached:

| Threshold | Limit |
|---|---|
| `http_req_failed` | `rate < 0.01` (under 1% errored HTTP calls) |
| `http_req_duration` | `p95 < 800ms`, `p99 < 2000ms` |
| `apply_submit_duration` | `p95 < 1500ms` (the apply call itself, end to end) |
| `dropped_iterations` | `count < 100` (the arrival-rate executor kept up with the offered load) |

`apply_submit_duration` is the apply call only. In `presigned` mode the
heavy binary upload to object storage is tracked separately as
`object_upload_duration` so it cannot mask application latency.

---

## Running it (Linux container or WSL2)

k6 needs a lot of sockets/file descriptors to drive an open model at
hundreds of iters/s. Run it on Linux (a container or WSL2), **not** raw
Windows — the descriptor and ephemeral-port limits there will cap you long
before the server saturates.

### 1. Raise the file-descriptor limit

```bash
ulimit -n 250000
```

(Per shell. To make it stick in a container, set it in the run command —
see below.)

### 2. Point the gateway at a load-test config

Rate limiting is **on by default in production** and will (correctly) throttle
a flood of applies. For a true capacity measurement, run the gateway with
limits off and the per-tenant ceiling raised. These are gateway env vars
(see `apps/api-gateway/src/app.ts`):

```bash
DISABLE_RATE_LIMIT=1            # turns off the auth + general limiters
TENANT_RATE_LIMIT_PER_MINUTE=1000000
```

> NEVER set `DISABLE_RATE_LIMIT=1` on a public/prod gateway — it is a
> load-test/internal-benchmark knob only.

You also want object storage reachable if you are testing `presigned` mode
(`S3_*` env on resume-service / the gateway's ticket issuer).

### 3. Run k6 in a container

```bash
docker run --rm -i \
  --ulimit nofile=250000:250000 \
  --network host \
  -v "$PWD/load-tests:/scripts" \
  grafana/k6 run \
    -e BASE_URL=http://localhost:4000 \
    -e SLUG=<published-job-slug> \
    -e TENANT=<tenant-id> \
    -e APPLY_MODE=multipart \
    /scripts/apply-custom.js
```

(`--network host` only works on Linux. On Docker Desktop/WSL2 use
`-e BASE_URL=http://host.docker.internal:4000` and drop `--network host`.)

### 4. Or run k6 directly under WSL2

```bash
ulimit -n 250000
cd load-tests
k6 run \
  -e BASE_URL=http://localhost:4000 \
  -e SLUG=<published-job-slug> \
  -e APPLY_MODE=multipart \
  apply-custom.js
```

### Spike-only / quick smoke

```bash
# Lower the targets for a fast local sanity run
k6 run -e SLUG=<slug> -e RAMP_TARGET=20 -e SPIKE_TARGET=40 \
  -e PRE_VUS=100 -e MAX_VUS=500 apply-custom.js
```

---

## The honest single-host caveat

These targets (300/s steady, 600/s spike) assume a **horizontally scaled**
deployment: multiple gateway + job-service + resume-service replicas behind a
load balancer, a connection pooler (PgBouncer) in front of Postgres, and
object storage handling the resume binaries.

**The demo/dev stack is a single host** running one replica of each service
via `docker-compose.demo.yml`. On a single host you will NOT hit these
numbers, and that is expected, not a bug:

- One Node process per service is CPU-bound well before 300 applies/s — each
  apply fans out to candidate-service (dedupe + Application create) and
  resume-service (store + enqueue extract/parse/screen).
- Without PgBouncer, a flood of concurrent applies exhausts the Postgres
  connection pool; you will see latency climb and `http_req_failed` rise as
  connections queue. PgBouncer is **optional and feature-flagged off** by
  default precisely so it cannot destabilize the single-host stack — turn it
  on only in a scaled environment.
- ClamAV resume scanning is likewise **optional and off by default** for the
  same reason; enabling it adds a scan hop per upload.

So: on a single host, treat `apply-custom.js` as a **relative** regression
gate (does a change make the hot path slower/flakier than the last run?) and
run it at reduced `RAMP_TARGET`/`SPIKE_TARGET`. The full 300/600 thresholds
are meant for a multi-replica staging environment that mirrors production
topology. Do not "fix" a single-host threshold breach by weakening the
threshold — fix it by running against the topology the SLO is written for.
