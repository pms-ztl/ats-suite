# Load tests (k6)

k6 scripts that exercise the hottest paths in the platform. See
[`../docs/LOAD_TESTING.md`](../docs/LOAD_TESTING.md) for the SLOs, the
interpretation guide, and the capacity-planning baseline.

| Script | What it loads | Model |
|---|---|---|
| `baseline.js` | The 5 most-trafficked authed read flows | closed (ramping-vus) |
| `stress.js` | Reads + optional candidate writes + vector match | closed (ramping-vus) |
| `apply-custom.js` | The public candidate-apply WRITE path (WF-I / I8) | open (ramping-arrival-rate) |
| `stress-10k.js` | The 10,000-simultaneous-applicant accept-fast burst (+ optional read mix) | open (ramping-arrival-rate) |
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

## stress-10k.js: the 10,000-simultaneous-applicant burst

`stress-10k.js` is the purpose-built preset for the NCR Voyix "10,000
simultaneous users, no crash" requirement. It drives the **additive
accept-fast** apply path at a 10k-concurrent-applicant scale and, optionally,
a browse + status-poll read mix at the same time.

It is a **separate file** rather than just `apply-custom.js` with bigger env
values because the two have different jobs:

- `apply-custom.js` is the general public-apply harness; its defaults
  (300/s steady, 600/s spike) are the multi-replica staging SLO and it can
  drive either apply path.
- `stress-10k.js` is tuned for the 10k burst and defaults to the **accept-fast**
  path, whose thresholds reflect that submit is a small JSON `POST` returning
  **202** while the heavy `extract -> parse -> screen` pipeline runs
  **asynchronously off a queue**. That async design is precisely why 10k
  applicants can be absorbed: submit latency stays low because parsing is not
  inline.

### What "arrival rate" means vs "concurrent VUs" (read this first)

k6's **open** model (`ramping-arrival-rate`) offers a fixed number of **new**
iterations per second, independent of how slow the server gets. This is the
right model for "10k simultaneous" because:

- **Arrival rate** (`target` in the stages, e.g. `TARGET_RPS=900`) = how many
  **new applicants start applying per second**. A closed VU loop would instead
  queue up behind a slow server and silently under-report the load it offered,
  hiding real saturation.
- **Concurrent VUs** (`maxVUs=10000`) = the **ceiling on applicants in-flight at
  once**. k6 grows the VU pool up to this cap to sustain the offered arrival
  rate; each in-flight apply holds a VU across its ticket -> object-upload -> 202
  steps.

"10,000 simultaneous users" therefore does **not** mean 10k requests fired in
the same millisecond forever. Apply sessions are short (a couple of API calls
each), so a **sustained ~900 completed applies/s with up to 10k VUs available**
represents a 10k-simultaneous-applicant load: at any instant up to ~10k distinct
applicants can be mid-application, and new ones keep arriving at the offered
rate. `dropped_iterations` rises the moment the host can no longer *start* the
offered iterations on time, which is the honest saturation signal.

### The flow it drives (accept-fast, 3 steps per apply)

Same three steps as `apply-custom.js` in `presigned` mode:

1. `GET /api/public/jobs/:slug/upload-ticket` -> presigned POST policy.
2. `POST` the resume straight to MinIO/S3 (`postURL`). The binary never
   transits the API, so the API stays CPU-light under the burst.
3. `POST /api/public/jobs/:slug/apply-fast` (JSON, `{ ...fields, objectKey }`)
   -> **202 Accepted**, with a real `applicationId` + `statusUrl` in the body.

If the target build lacks the accept-fast endpoints, the harness warns **once**
and counts the iteration failed (no fabricated pass). Run `-e MULTIPART=1` to
hit the legacy `apply-custom` **201** path instead (heavier: the binary transits
the API, so expect a lower ceiling and the thresholds loosen accordingly).

### Optional read/mixed scenario

Set `-e POLL_STATUS=1` to run a second scenario **concurrently** with the apply
burst: half the read iterations browse the public listings
(`GET /api/public/jobs`) and half poll an application status
(`GET /api/public/applications/:id/status`). This is the realistic shape when a
job goes viral: a flood of writes AND a flood of status checks at once. Tune
its rate with `-e READ_RPS=200` (default 200/s). When `POLL_STATUS` is off, a
1-in-20 accept-fast iteration still polls its own freshly created application id
to keep the read path warm without a separate scenario.

> The status endpoint deliberately answers `200 { found:false, status:"RECEIVED" }`
> for an unknown id rather than `404` (it must not leak whether an id exists), so
> a status poll is a genuine indexed DB lookup under load, not a 404 fast-path.

### Env knobs

| Var | Default | Meaning |
|---|---|---|
| `BASE_URL` | `http://localhost:4000` | Gateway origin, **no** trailing `/api` |
| `SLUG` | (**required**) | A **published** job-posting slug |
| `TENANT` | (none) | Tenant id; tagged on metrics, sent as a ticket hint header |
| `FIXTURE` | `./fixtures/resume-sample.pdf` | Path to the resume PDF |
| `TARGET_RPS` | `900` | Sustained applies/s at the 10k plateau |
| `PEAK_RPS` | `1200` | Burst applies/s at the spike |
| `PRE_VUS` | `4000` | `preAllocatedVUs` (pre-warmed VU pool) |
| `MAX_VUS` | `10000` | `maxVUs`, the 10k-concurrent ceiling |
| `RAMP` | `120` | Seconds to ramp `0 -> TARGET_RPS` |
| `HOLD` | `300` | Seconds to hold `TARGET_RPS` (the plateau) |
| `SPIKE` | `60` | Seconds to hold `PEAK_RPS` |
| `POLL_STATUS` | off | `1` enables the concurrent browse + status-poll read mix |
| `READ_RPS` | `200` | Reads/s when `POLL_STATUS=1` |
| `MULTIPART` | off | `1` forces the legacy multipart **201** path instead of accept-fast |

### CI-failing thresholds

Set to the **honest accept-fast target**: submit is a small 202-returning call,
so its budget is tight even though the end-to-end hire pipeline is long. The
heavy object-store upload is measured separately (`object_upload_duration`) so it
cannot mask app latency.

| Threshold | Limit (accept-fast) | Limit with `MULTIPART=1` |
|---|---|---|
| `http_req_failed` | `rate < 0.01` (all HTTP calls) | same |
| `apply_submit_duration` | `p95 < 800ms`, `p99 < 1500ms` (the 202 call only) | `p95 < 2500ms`, `p99 < 5000ms` |
| `http_req_duration` | `p95 < 1500ms`, `p99 < 4000ms` (includes object upload) | same |
| `dropped_iterations` | `rate < 0.05` (kept up with >=95% of offered iters) | same |
| `status_poll_duration` | `p95 < 600ms` (only when `POLL_STATUS=1`) | same |
| `list_browse_duration` | `p95 < 800ms` (only when `POLL_STATUS=1`) | same |

There is **no** "handled 10k, zero crashes" claim baked in. Whether the target
sustained 10k is met is the OUTPUT of the run, read off the summary. On a single
dev host it will not be met (see the caveat at the bottom); on a horizontally
scaled cluster it is.

### Run it (10k preset)

The exact command the orchestrator runs after Docker is up, inside WSL2/Linux
(see the ulimit + gateway-ceiling steps below; they are mandatory at this
scale):

```bash
# in WSL2 / a Linux shell, from the repo root
ulimit -n 1048576     # 10k concurrent VUs need a very high fd limit

docker run --rm -i \
  --ulimit nofile=1048576:1048576 \
  -v "$PWD/load-tests:/scripts" \
  grafana/k6 run \
    -e BASE_URL=http://host.docker.internal:4000 \
    -e SLUG=<published-job-slug> \
    -e TENANT=<tenant-id> \
    -e POLL_STATUS=1 \
    /scripts/stress-10k.js
```

Or directly under WSL2 with a native k6 binary:

```bash
ulimit -n 1048576
cd load-tests
k6 run \
  -e BASE_URL=http://localhost:4000 \
  -e SLUG=<published-job-slug> \
  -e TENANT=<tenant-id> \
  -e POLL_STATUS=1 \
  stress-10k.js
```

Reduced-scale sanity run before committing to the full burst:

```bash
k6 run -e SLUG=<slug> \
  -e TARGET_RPS=100 -e PEAK_RPS=150 \
  -e PRE_VUS=500 -e MAX_VUS=1500 \
  -e HOLD=60 -e RAMP=30 -e SPIKE=20 \
  stress-10k.js
```

---

## Running it (Linux container or WSL2)

k6 needs a lot of sockets/file descriptors to drive an open model at
hundreds of iters/s. Run it on Linux (a container or WSL2), **not** raw
Windows — the descriptor and ephemeral-port limits there will cap you long
before the server saturates.

### 1. Raise the file-descriptor limit

```bash
ulimit -n 250000        # enough for the apply-custom.js 300/600 preset
# For stress-10k.js (up to 10,000 concurrent VUs) go higher:
ulimit -n 1048576
```

Each in-flight VU holds sockets across its ticket -> object-upload -> 202 legs,
so a 10k-concurrent run needs a very high descriptor ceiling (and matching
ephemeral-port range). If `ulimit -n` cannot be raised in your shell, raise it
in the container run command with `--ulimit nofile=1048576:1048576` (see the
10k run recipe above).

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

### The 10k caveat (stress-10k.js): read before quoting a number

The same physics apply, harder, to `stress-10k.js`. **One dev host cannot
sustain a true 10,000-simultaneous-applicant load, and this preset does not
pretend it can.** On the demo box the k6 generator, all 15 services, Postgres,
Redis, NATS and MinIO share the same CPU and memory, so:

- The k6 generator itself competes with the very services it is measuring. At
  10k VUs, k6 alone wants multiple cores and a lot of memory; co-locating it
  with the stack depresses the number the stack could otherwise post.
- The accept-fast path is deliberately light (a small 202 + an object-store
  PUT), which is what lets it absorb a burst, but a single job-service +
  single gateway replica is still CPU-bound well before 900 applies/s, and the
  bounded Prisma pool (`?connection_limit=8`) on job-service serializes the
  ledger writes.
- You will therefore see `dropped_iterations` climb and latency rise **below**
  the 10k plateau. **That is the measurement, not a failure of the code**: the
  test is reporting the single host's real ceiling.

**What the preset actually gives you on one host:** an honest measurement of
*this host's* accept-fast ceiling and a **relative regression gate**. Did a
change make the hot path saturate sooner than the last run? Record the sustained
applies/s at which `dropped_iterations` starts rising; that number, plus the
run's summary, is the honest result. Never restate it as "handled 10k, zero
crashes."

**How true production 10k is actually reached: horizontal scaling.** The path
to a genuine 10k is more replicas, not a bigger box:

- **k8s Horizontal Pod Autoscaling (HPA).** The manifests in
  [`../deploy/k8s/`](../deploy/k8s/) run one gateway (2 replicas) + one
  job-service + one resume-service today with **static** `replicas` and **no**
  HPA object yet. To reach 10k you add a `HorizontalPodAutoscaler` per hot-path
  Deployment (`api-gateway`, `job-service`, `resume-service`, `screening-service`)
  keyed on CPU / a custom apply-rate metric, and let the scheduler fan the burst
  across nodes. See `deploy/k8s/README.md` for the current (honestly
  un-autoscaled) state, and lane 3's `SCALABILITY.md` (repo root) for the full
  horizontal-scaling architecture and the HPA target settings that back the
  10k figure.
- **A connection pooler in front of Postgres** (PgBouncer, compose profile
  `pgbouncer`, OFF by default) so hundreds of concurrent job-service/candidate
  writes multiplex onto a bounded server-side pool instead of exhausting it.
- **Object storage doing the binary lifting** (already true on the accept-fast
  path, where the resume never transits the API), plus more resume-service +
  screening-service workers so the async pipeline keeps draining the queue at
  burst arrival rates.

Run `stress-10k.js` against **that** topology (a scaled staging cluster with HPA
enabled) to validate the production 10k target. Run it against the single dev
host only as a relative gate, and quote the host's measured ceiling (not the
target) as the result. Do not "fix" a single-host breach by weakening a
threshold; fix it by running against the topology the SLO is written for.
