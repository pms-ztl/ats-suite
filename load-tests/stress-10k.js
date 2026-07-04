/**
 * stress-10k.js: 10,000-simultaneous-applicant scale test for the public
 * accept-fast apply path.
 *
 * WHY A SEPARATE PRESET (not just apply-custom.js with bigger env)
 * ----------------------------------------------------------------
 * apply-custom.js is the general public-apply harness and its DEFAULT targets
 * (300/s steady, 600/s spike) are the multi-replica staging SLO. This file is
 * purpose-built for the NCR Voyix "10,000 simultaneous users, no crash" ask: it
 * models a 10k-concurrent-applicant burst against the ADDITIVE accept-fast path
 * (APPLY_MODE=presigned equivalent), where the API's job is only to accept the
 * submission and return 202 while the heavy extract -> parse -> screen pipeline
 * runs ASYNCHRONOUSLY off a queue. That async design is exactly why 10k
 * applicants can be absorbed: the submit latency stays low because parsing does
 * NOT happen inline.
 *
 * WHAT "10k SIMULTANEOUS" MEANS HERE (arrival rate vs concurrent VUs)
 * ------------------------------------------------------------------
 * k6's open model (ramping-arrival-rate) offers a fixed number of NEW
 * iterations per second regardless of server speed. "10k simultaneous users"
 * does NOT mean 10k requests fired in the same millisecond forever; it means a
 * realistic burst where up to ~10k distinct applicants are mid-application in a
 * short window. Real apply sessions are short (a couple of API calls each), so a
 * SUSTAINED arrival rate of ~800-1000 completed applies/s, with up to 10k VUs
 * pre-allocated to cover the concurrency of the object-store upload + the 202,
 * represents a 10k-simultaneous-applicant load. maxVUs is the ceiling on how
 * many applicants can be genuinely in-flight at once; the arrival-rate stages
 * are how fast NEW ones show up. See README.md for the full explanation.
 *
 * THREE-STEP ACCEPT-FAST FLOW (per iteration), matching apply-custom.js:
 *   1. GET  /api/public/jobs/:slug/upload-ticket   -> presigned POST policy
 *   2. POST the resume straight to MinIO/S3 (postURL). The binary never
 *      transits the API, so the API stays CPU-light under the burst.
 *   3. POST /api/public/jobs/:slug/apply-fast (JSON, { ...fields, objectKey })
 *          -> 202 Accepted. The row + pipeline are enqueued async.
 * The 202 body carries a real applicationId + statusUrl. When POLL_STATUS=1 a
 * fraction of iterations follow up with GET /api/public/applications/:id/status
 * so the read path is exercised too (see the mixed scenario below).
 *
 * HARD RULES honored (identical discipline to apply-custom.js):
 *   - No fabricated success. A check passes ONLY on the real status code the
 *     server returns (202 apply-fast, 2xx object store, 200 status/list). If the
 *     build lacks the accept-fast endpoints, the harness warns ONCE and counts
 *     the iteration failed; it never invents a pass. There is no "handled 10k,
 *     zero crashes" claim baked in; the RESULT of the run is the claim.
 *   - Unique email per (__VU, __ITER, now) so every apply is a distinct real
 *     Candidate and never collapses into the (tenantId,email) dedupe path.
 *   - The PDF fixture carries real extractable text, so the async pipeline is
 *     genuinely fed (not an empty blob) even though submit is fast.
 *
 * THRESHOLDS are CI-failing (k6 exits non-zero if any is breached) and are set
 * to the HONEST accept-fast target: submit is a small JSON POST returning 202,
 * so its latency budget is TIGHT even though the end-to-end hire pipeline is
 * long. The heavy object-store upload is measured separately so it cannot mask
 * app latency.
 *   http_req_failed        rate < 0.01     (<1% of ALL HTTP calls error)
 *   apply_submit_duration  p95 < 800  p99 < 1500  (the apply-fast 202 call only)
 *   http_req_duration      p95 < 1500 p99 < 4000  (includes the object upload)
 *   dropped_iterations     rate < 0.05     (arrival-rate executor kept up with
 *                                           the offered load for >=95% of iters)
 *
 * NOTE on dropped_iterations: on a SINGLE dev host (one replica of each of the
 * 15 services + Postgres + the k6 generator all on one machine) you WILL see
 * dropped iterations and rising latency well below 10k; that is the host's real
 * ceiling, not a bug. See the "single-host caveat" in README.md and lane 3's
 * SCALABILITY.md: true production 10k is reached by HORIZONTAL scaling
 * (k8s HPA over the manifests in deploy/k8s/), not by one box.
 *
 * RUN (full Linux/WSL2 recipe with ulimit + gateway ceilings in README.md):
 *   k6 run \
 *     -e BASE_URL=http://localhost:4000 \
 *     -e SLUG=<published-job-slug> \
 *     -e TENANT=<tenant-id> \
 *     load-tests/stress-10k.js
 *
 * ENV KNOBS (all optional except SLUG):
 *   BASE_URL     gateway origin, no trailing /api   (default http://localhost:4000)
 *   SLUG         a PUBLISHED job posting slug        (REQUIRED)
 *   TENANT       tenant id (tagged on metrics; sent as ticket hint header) (opt)
 *   FIXTURE      path to the PDF fixture             (default ./fixtures/resume-sample.pdf)
 *   TARGET_RPS   sustained applies/s at the 10k plateau (default 900)
 *   PEAK_RPS     burst applies/s at the spike          (default 1200)
 *   PRE_VUS      preAllocatedVUs                        (default 4000)
 *   MAX_VUS      maxVUs (the 10k-concurrent ceiling)    (default 10000)
 *   RAMP         seconds to ramp 0 -> TARGET_RPS        (default 120)
 *   HOLD         seconds to hold TARGET_RPS             (default 300)
 *   SPIKE        seconds to hold PEAK_RPS               (default 60)
 *   POLL_STATUS  "1" adds a browse+status-poll read mix (default off)
 *   READ_RPS     status/list reads per second when POLL_STATUS=1 (default 200)
 *   MULTIPART    "1" forces the legacy multipart 201 path instead of accept-fast
 *                (heavier: the binary transits the API, so expect a LOWER ceiling)
 */
import http from "k6/http";
import { check, fail } from "k6";
import { Trend, Counter } from "k6/metrics";

// ─── config ──────────────────────────────────────────────────────────────────
const BASE_URL = (__ENV.BASE_URL || "http://localhost:4000").replace(/\/+$/, "");
const API = `${BASE_URL}/api`;
const SLUG = __ENV.SLUG || "";
const TENANT = __ENV.TENANT || "";
const FIXTURE = __ENV.FIXTURE || "./fixtures/resume-sample.pdf";

const TARGET_RPS = Number(__ENV.TARGET_RPS || 900);
const PEAK_RPS = Number(__ENV.PEAK_RPS || 1200);
const PRE_VUS = Number(__ENV.PRE_VUS || 4000);
const MAX_VUS = Number(__ENV.MAX_VUS || 10000);
const RAMP = Number(__ENV.RAMP || 120);
const HOLD = Number(__ENV.HOLD || 300);
const SPIKE = Number(__ENV.SPIKE || 60);

const POLL_STATUS = __ENV.POLL_STATUS === "1";
const READ_RPS = Number(__ENV.READ_RPS || 200);
const MULTIPART = __ENV.MULTIPART === "1";

if (!SLUG) {
  // Fail in init context so the run never starts without a target job.
  throw new Error("SLUG env var is required; pass -e SLUG=<published-job-slug>");
}

// open() MUST run in init context. "b" => ArrayBuffer (binary), required for the
// resume upload to arrive byte-identical.
const PDF = open(FIXTURE, "b");

// ─── custom metrics ────────────────────────────────────────────────────────────
// apply_submit_duration: the apply call itself. For accept-fast it is the final
// apply-fast POST (the step that creates the row + enqueues the pipeline). For
// MULTIPART it is the single multipart POST. The heavy object-store upload is
// tracked separately (object_upload_duration) so it cannot mask app latency.
const applySubmit = new Trend("apply_submit_duration", true);
const objectUpload = new Trend("object_upload_duration", true);
const statusPoll = new Trend("status_poll_duration", true);
const listBrowse = new Trend("list_browse_duration", true);
const applyOk = new Counter("apply_ok");
const applyFail = new Counter("apply_fail");
const readOk = new Counter("read_ok");
const readFail = new Counter("read_fail");

// One-time skip notice when the accept-fast endpoints are absent on this build.
let warnedNoPresigned = false;

// ─── workload (OPEN model) ──────────────────────────────────────────────────────
// ramping-arrival-rate: iterations START at a fixed offered RATE regardless of
// how slow responses get. A closed VU model would just queue behind a slow
// server and UNDER-report the load offered, hiding real saturation. The apply
// scenario models the 10k-applicant burst; the optional read scenario runs a
// browse + status-poll mix in parallel so the test is not apply-only.
const scenarios = {
  apply_10k: {
    executor: "ramping-arrival-rate",
    startRate: 0,
    timeUnit: "1s",
    preAllocatedVUs: PRE_VUS,
    maxVUs: MAX_VUS,
    exec: "applyIteration",
    stages: [
      { duration: `${RAMP}s`, target: TARGET_RPS },  // ramp 0 -> ~900/s
      { duration: `${HOLD}s`, target: TARGET_RPS },  // hold the 10k plateau
      { duration: `${SPIKE}s`, target: PEAK_RPS },   // burst to ~1200/s
      { duration: "60s", target: TARGET_RPS },       // settle back to plateau
      { duration: "30s", target: 0 },                // drain
    ],
  },
};

// Optional mixed read scenario (browse listings + poll a status). It runs
// concurrently with the apply burst so the read path is loaded at the same time
// a flood of writes is arriving, the realistic shape when a job goes viral.
if (POLL_STATUS) {
  scenarios.read_mix = {
    executor: "ramping-arrival-rate",
    startRate: 0,
    timeUnit: "1s",
    // Reads are cheap; a modest VU pool covers READ_RPS with headroom.
    preAllocatedVUs: Math.max(200, Math.ceil(READ_RPS * 2)),
    maxVUs: Math.max(500, READ_RPS * 5),
    exec: "readIteration",
    stages: [
      { duration: `${RAMP}s`, target: READ_RPS },
      { duration: `${HOLD + SPIKE + 60}s`, target: READ_RPS },
      { duration: "30s", target: 0 },
    ],
  };
}

export const options = {
  discardResponseBodies: true,
  scenarios,
  thresholds: {
    // ALL HTTP calls (apply + object upload + reads) must be <1% errored.
    http_req_failed: ["rate<0.01"],
    // Includes the heavy object-store upload leg -> looser than the submit-only budget.
    http_req_duration: ["p(95)<1500", "p(99)<4000"],
    // The apply-fast 202 (or multipart 201) submit call ONLY, the honest
    // accept-fast target: it is a small request, so the budget is tight.
    apply_submit_duration: MULTIPART ? ["p(95)<2500", "p(99)<5000"] : ["p(95)<800", "p(99)<1500"],
    // The arrival-rate executor kept up with the offered 10k load for >=95% of iters.
    dropped_iterations: ["rate<0.05"],
    // Read path budgets only assert when the mixed scenario is enabled.
    ...(POLL_STATUS
      ? {
          status_poll_duration: ["p(95)<600"],
          list_browse_duration: ["p(95)<800"],
        }
      : {}),
  },
  tags: {
    preset: "stress-10k",
    mode: MULTIPART ? "multipart" : "accept-fast",
    slug: SLUG,
    tenant: TENANT || "n/a",
  },
};

// ─── helpers ───────────────────────────────────────────────────────────────────
function uniqueEmail() {
  // Unique per VU+iter+time so each apply creates a distinct real Candidate and
  // never collapses into the (tenantId,email) dedupe path.
  return `loadtest10k+${__VU}-${__ITER}-${Date.now()}@loadtest.cdc-ats.local`;
}

function applicantFields(email) {
  return {
    firstName: "Load",
    lastName: `Ten-K-${__VU}-${__ITER}`,
    email,
    phone: "+15555550199",
    coverLetter: "Submitted by the stress-10k k6 accept-fast harness.",
  };
}

// ─── accept-fast path: ticket -> object store -> 202 ────────────────────────────
// Returns the applicationId from the 202 body (so an optional status poll can
// follow the real row), or null on any failure.
function applyAcceptFast() {
  const email = uniqueEmail();
  const fields = applicantFields(email);

  // 1. Presigned upload ticket (public, by slug). responseType:"text" overrides
  //    the global discardResponseBodies so we can read the POST policy out of
  //    this one response.
  const ticketRes = http.get(
    `${API}/public/jobs/${SLUG}/upload-ticket?contentType=application/pdf&fileName=resume-sample.pdf`,
    {
      headers: TENANT ? { "X-Tenant-Hint": TENANT } : {},
      responseType: "text",
      tags: { name: "upload-ticket" },
    },
  );

  // If the build predates the accept-fast endpoints, surface it loudly ONCE and
  // count the iteration failed; no fabricated success.
  if (ticketRes.status === 404 || ticketRes.status === 405) {
    if (!warnedNoPresigned) {
      warnedNoPresigned = true;
      // eslint-disable-next-line no-console
      console.warn(
        `upload-ticket returned ${ticketRes.status}; this build lacks the accept-fast ` +
          `endpoints. Run with -e MULTIPART=1 to hit the legacy 201 path instead.`,
      );
    }
    applyFail.add(1);
    return null;
  }
  if (!check(ticketRes, { "upload-ticket 200": (r) => r.status === 200 })) {
    applyFail.add(1);
    return null;
  }

  const ticket = ticketRes.json();
  const objectKey = ticket?.data?.objectKey ?? ticket?.objectKey;
  const postURL = ticket?.data?.postURL ?? ticket?.postURL;
  const postFields = ticket?.data?.fields ?? ticket?.fields ?? {};
  if (!objectKey || !postURL) {
    applyFail.add(1);
    return null;
  }

  // 2. POST the binary straight to the object store (S3/MinIO presigned POST).
  //    The file part MUST come last per the S3 POST policy contract.
  const storeRes = http.post(
    postURL,
    { ...postFields, file: http.file(PDF, "resume-sample.pdf", "application/pdf") },
    { tags: { name: "object-store-upload" } },
  );
  objectUpload.add(storeRes.timings.duration);
  // S3/MinIO answer 201 (or 204 with success_action_status) on a stored object.
  if (!check(storeRes, { "object stored 2xx": (r) => r.status >= 200 && r.status < 300 })) {
    applyFail.add(1);
    return null;
  }

  // 3. Submit the apply referencing the already-uploaded objectKey -> 202.
  //    responseType:"text" so we can read the real applicationId + statusUrl for
  //    an optional follow-up poll.
  const applyRes = http.post(
    `${API}/public/jobs/${SLUG}/apply-fast`,
    JSON.stringify({ ...fields, objectKey }),
    { headers: { "Content-Type": "application/json" }, responseType: "text", tags: { name: "apply-fast" } },
  );
  applySubmit.add(applyRes.timings.duration);
  const ok = check(applyRes, { "apply-fast 202": (r) => r.status === 202 });
  if (!ok) {
    applyFail.add(1);
    return null;
  }
  applyOk.add(1);
  const body = applyRes.json();
  return body?.data?.applicationId ?? null;
}

// ─── legacy multipart path (heavier: binary transits the API) ───────────────────
function applyMultipart() {
  const email = uniqueEmail();
  const fields = applicantFields(email);
  const payload = {
    ...fields,
    resume: http.file(PDF, "resume-sample.pdf", "application/pdf"),
  };
  const res = http.post(`${API}/public/jobs/${SLUG}/apply-custom`, payload, {
    responseType: "text",
    tags: { name: "apply-custom-multipart" },
  });
  applySubmit.add(res.timings.duration);
  const ok = check(res, { "multipart apply 201": (r) => r.status === 201 });
  if (!ok) {
    applyFail.add(1);
    return null;
  }
  applyOk.add(1);
  const body = res.json();
  // Multipart returns the created application; shape tolerant.
  return body?.data?.applicationId ?? body?.data?.application?.id ?? null;
}

// ─── apply scenario entry point ─────────────────────────────────────────────────
export function applyIteration() {
  const applicationId = MULTIPART ? applyMultipart() : applyAcceptFast();

  // When status polling is off, some accept-fast iterations still do a single
  // cheap status GET on their own real application to keep the read path warm
  // (1-in-20) without needing the separate read_mix scenario.
  if (!POLL_STATUS && applicationId && __ITER % 20 === 0) {
    pollStatus(applicationId);
  }
}

// ─── read scenario: browse listings + poll a real application status ────────────
export function readIteration() {
  // Half browse the public listings, half poll an application status. Browsing
  // needs no prior apply. Status polling here uses a synthetic id (this scenario
  // has no application of its own to reference), which the endpoint answers
  // honestly (found:false / RECEIVED): a real read hitting real DB work, no
  // fabricated 200. Real applications created by the apply scenario are polled
  // via the 1-in-20 hook in applyIteration.
  if (Math.random() < 0.5) {
    browseListings();
  } else {
    // Poll a plausible-but-unknown application id. The status route deliberately
    // returns 200 { found:false, status:"RECEIVED" } rather than 404 (it must not
    // leak whether an id exists), so this is a genuine indexed DB lookup under
    // load, not a 404 fast-path. Real applications created by the apply scenario
    // are also polled via the 1-in-20 hook above.
    pollStatus(`ld-${__VU}-${__ITER}-${Date.now()}`);
  }
}

function browseListings() {
  const res = http.get(`${API}/public/jobs`, { tags: { name: "public-jobs-list" } });
  listBrowse.add(res.timings.duration);
  const ok = check(res, { "public jobs 200": (r) => r.status === 200 });
  ok ? readOk.add(1) : readFail.add(1);
}

function pollStatus(applicationId) {
  const res = http.get(
    `${API}/public/applications/${encodeURIComponent(applicationId)}/status`,
    { tags: { name: "application-status" } },
  );
  statusPoll.add(res.timings.duration);
  const ok = check(res, { "status 200": (r) => r.status === 200 });
  ok ? readOk.add(1) : readFail.add(1);
}

// ─── setup: fail fast if the target job is not actually applyable ───────────────
export function setup() {
  const res = http.get(`${API}/public/jobs/${SLUG}`);
  if (res.status !== 200) {
    fail(
      `Target job not found / not published: GET ${API}/public/jobs/${SLUG} -> ${res.status}. ` +
        `Pass -e SLUG=<a published job slug>.`,
    );
  }
}
