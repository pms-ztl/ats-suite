/**
 * WF-I / I8 — public-apply load & stress harness.
 *
 * Pounds the candidate-facing application intake — the single hottest
 * WRITE path in the system (every job-board click, every "Apply" press) —
 * under an OPEN workload model so we measure true server capacity, not a
 * closed-loop VU count that throttles itself when the server slows down.
 *
 * It exercises BOTH apply paths, selected with the APPLY_MODE env switch:
 *
 *   APPLY_MODE=multipart  (default) — the EXISTING, always-live path. One
 *     multipart POST to /api/public/jobs/:slug/apply-custom carrying the
 *     form fields + the resume binary. The gateway streams the body to
 *     job-service, which dedupes the Candidate, creates the Application, and
 *     forwards the resume to resume-service for extract -> parse -> screen.
 *     This is the path old frontends use and MUST stay backward-compatible.
 *
 *   APPLY_MODE=presigned — the ADDITIVE accept-fast path the new frontend
 *     uses (WF-I program). Three steps:
 *       1. GET  /api/public/jobs/:slug/upload-ticket?contentType=application/pdf
 *            -> { objectKey, postURL, fields } (presigned S3/MinIO POST policy)
 *       2. POST the file straight to the object store (postURL) — the heavy
 *          binary never transits the API at all.
 *       3. POST /api/public/jobs/:slug/apply-fast  (JSON, { ...fields, objectKey })
 *            -> 202 Accepted. The row + pipeline are kicked off async; the
 *            202 reflects the REAL pipeline stage (queued), not a fabricated
 *            201-before-the-row-exists.
 *     If this server build does not yet expose the ticket/fast endpoints the
 *     harness logs a one-time skip and the iteration is counted dropped, so
 *     running presigned against an older build fails loudly rather than
 *     silently passing.
 *
 * HARD RULES honored:
 *   - No fabricated success. A check passes ONLY on the real status code the
 *     server returns for that path (201 multipart, 202 presigned-fast).
 *   - Unique email per (__VU, __ITER) so we create real distinct Candidates
 *     and never trip the (tenantId,email) dedupe into a false "duplicate" win.
 *   - The PDF fixture carries real extractable text, so the downstream
 *     extract/parse/screen pipeline is genuinely loaded, not fed an empty blob.
 *
 * THRESHOLDS are CI-failing (k6 exits non-zero if any is breached):
 *   http_req_failed        < 0.01      (<1% of all HTTP calls error)
 *   http_req_duration      p95 < 800   p99 < 2000   (ms)
 *   apply_submit_duration  p95 < 1500  (the apply call itself, end to end)
 *   dropped_iterations     < 100       (the arrival-rate executor could not
 *                                       start fewer than 100 iters — i.e. the
 *                                       system kept up with the offered load)
 *
 * RUN (see load-tests/README.md for the full Linux/WSL2 recipe):
 *   k6 run \
 *     -e BASE_URL=http://localhost:4000 \
 *     -e SLUG=<published-job-slug> \
 *     -e TENANT=<tenant-id> \
 *     -e APPLY_MODE=multipart \
 *     load-tests/apply-custom.js
 *
 * ENV KNOBS:
 *   BASE_URL       gateway origin, no trailing /api   (default http://localhost:4000)
 *   SLUG           a PUBLISHED job posting slug        (REQUIRED)
 *   TENANT         tenant id (informational; tagged on metrics + sent as a
 *                  hint header on presigned ticket requests) (optional)
 *   APPLY_MODE     "multipart" (default) | "presigned"
 *   FIXTURE        path to the PDF fixture (default ./fixtures/resume-sample.pdf)
 *   RAMP_TARGET    peak steady arrival rate, iters/s   (default 300)
 *   SPIKE_TARGET   spike arrival rate, iters/s         (default 600)
 *   PRE_VUS        preAllocatedVUs                      (default 1000)
 *   MAX_VUS        maxVUs                               (default 6000)
 */
import http from "k6/http";
import { check, fail } from "k6";
import { Trend, Counter } from "k6/metrics";

// ─── config ────────────────────────────────────────────────────────────────
const BASE_URL = (__ENV.BASE_URL || "http://localhost:4000").replace(/\/+$/, "");
const API = `${BASE_URL}/api`;
const SLUG = __ENV.SLUG || "";
const TENANT = __ENV.TENANT || "";
const APPLY_MODE = (__ENV.APPLY_MODE || "multipart").toLowerCase();
const FIXTURE = __ENV.FIXTURE || "./fixtures/resume-sample.pdf";

const RAMP_TARGET = Number(__ENV.RAMP_TARGET || 300);
const SPIKE_TARGET = Number(__ENV.SPIKE_TARGET || 600);
const PRE_VUS = Number(__ENV.PRE_VUS || 1000);
const MAX_VUS = Number(__ENV.MAX_VUS || 6000);

if (!SLUG) {
  // Fail in init context so the run never starts without a target job.
  throw new Error("SLUG env var is required — pass -e SLUG=<published-job-slug>");
}
if (APPLY_MODE !== "multipart" && APPLY_MODE !== "presigned") {
  throw new Error(`APPLY_MODE must be "multipart" or "presigned" (got "${APPLY_MODE}")`);
}

// open() MUST run in init context. "b" => ArrayBuffer (binary), required for
// the resume upload to arrive byte-identical.
const PDF = open(FIXTURE, "b");

// ─── custom metrics ──────────────────────────────────────────────────────────
// apply_submit_duration: the apply call itself, end to end. For multipart that
// is the single POST; for presigned it is the final apply-fast POST (the step
// that actually creates the row + enqueues the pipeline) — the heavy binary
// upload to object storage is tracked separately so it cannot mask app latency.
const applySubmit = new Trend("apply_submit_duration", true);
const objectUpload = new Trend("object_upload_duration", true);
const applyOk = new Counter("apply_ok");
const applyFail = new Counter("apply_fail");

// One-time skip notice when presigned endpoints are absent on this build.
let warnedNoPresigned = false;

// ─── workload (OPEN model) ────────────────────────────────────────────────────
// ramping-arrival-rate: iterations START at a fixed offered RATE regardless of
// how slow responses get. This is what surfaces real saturation — a closed VU
// model would just queue up behind a slow server and under-report load.
export const options = {
  discardResponseBodies: true,
  scenarios: {
    apply: {
      executor: "ramping-arrival-rate",
      startRate: 0,
      timeUnit: "1s",
      preAllocatedVUs: PRE_VUS,
      maxVUs: MAX_VUS,
      stages: [
        { duration: "2m", target: RAMP_TARGET },   // ramp 0 -> 300/s
        { duration: "5m", target: RAMP_TARGET },   // hold steady
        { duration: "30s", target: SPIKE_TARGET }, // spike to 600/s
        { duration: "1m", target: SPIKE_TARGET },  // hold the spike
        { duration: "30s", target: 0 },            // drop / drain
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800", "p(99)<2000"],
    apply_submit_duration: ["p(95)<1500"],
    dropped_iterations: ["count<100"],
  },
  tags: { mode: APPLY_MODE, slug: SLUG, tenant: TENANT || "n/a" },
};

// ─── helpers ─────────────────────────────────────────────────────────────────
function uniqueEmail() {
  // Unique per VU+iter+time so each apply creates a distinct real Candidate and
  // never collapses into the (tenantId,email) dedupe path.
  return `loadtest+${__VU}-${__ITER}-${Date.now()}@loadtest.cdc-ats.local`;
}

function applicantFields(email) {
  return {
    firstName: "Load",
    lastName: `Test-${__VU}-${__ITER}`,
    email,
    phone: "+15555550123",
    coverLetter: "Submitted by the apply-custom k6 load harness.",
  };
}

// ─── multipart path (existing, always-live) ──────────────────────────────────
function applyMultipart() {
  const email = uniqueEmail();
  const fields = applicantFields(email);

  // http.file() builds the multipart resume part; plain string fields ride
  // alongside it. Field names mirror the real candidate-portal form so the
  // job-service handler treats firstName/lastName/email/coverLetter as standard
  // fields and "resume" as the binary it forwards to resume-service.
  const payload = {
    ...fields,
    resume: http.file(PDF, "resume-sample.pdf", "application/pdf"),
  };

  const res = http.post(`${API}/public/jobs/${SLUG}/apply-custom`, payload, {
    tags: { name: "apply-custom-multipart" },
  });

  applySubmit.add(res.timings.duration);
  const ok = check(res, { "multipart apply 201": (r) => r.status === 201 });
  ok ? applyOk.add(1) : applyFail.add(1);
}

// ─── presigned path (additive accept-fast: ticket -> object store -> 202) ─────
function applyPresigned() {
  const email = uniqueEmail();
  const fields = applicantFields(email);

  // 1. Get a presigned upload ticket from the gateway (public, by slug).
  //    responseType:"text" overrides the global discardResponseBodies so we can
  //    read the POST policy out of this one response (single GET, no re-fetch).
  const ticketRes = http.get(
    `${API}/public/jobs/${SLUG}/upload-ticket?contentType=application/pdf&fileName=resume-sample.pdf`,
    {
      headers: TENANT ? { "X-Tenant-Hint": TENANT } : {},
      responseType: "text",
      tags: { name: "upload-ticket" },
    },
  );

  // If the build predates the additive endpoints, surface it loudly: warn once
  // and let the iteration be counted dropped (no fabricated success).
  if (ticketRes.status === 404 || ticketRes.status === 405) {
    if (!warnedNoPresigned) {
      warnedNoPresigned = true;
      // eslint-disable-next-line no-console
      console.warn(
        `upload-ticket returned ${ticketRes.status} — this server build does not expose ` +
          `the presigned accept-fast endpoints. Use APPLY_MODE=multipart against it.`,
      );
    }
    applyFail.add(1);
    return;
  }
  if (!check(ticketRes, { "upload-ticket 200": (r) => r.status === 200 })) {
    applyFail.add(1);
    return;
  }

  const ticket = ticketRes.json();
  const objectKey = ticket?.data?.objectKey ?? ticket?.objectKey;
  const postURL = ticket?.data?.postURL ?? ticket?.postURL;
  const postFields = ticket?.data?.fields ?? ticket?.fields ?? {};
  if (!objectKey || !postURL) {
    applyFail.add(1);
    return;
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
    return;
  }

  // 3. Submit the apply referencing the already-uploaded objectKey -> 202.
  const applyRes = http.post(
    `${API}/public/jobs/${SLUG}/apply-fast`,
    JSON.stringify({ ...fields, objectKey }),
    { headers: { "Content-Type": "application/json" }, tags: { name: "apply-fast" } },
  );
  applySubmit.add(applyRes.timings.duration);
  const ok = check(applyRes, { "apply-fast 202": (r) => r.status === 202 });
  ok ? applyOk.add(1) : applyFail.add(1);
}

// ─── per-iteration entry point ────────────────────────────────────────────────
export default function () {
  if (APPLY_MODE === "presigned") applyPresigned();
  else applyMultipart();
}

// ─── setup: fail fast if the target job is not actually applyable ─────────────
export function setup() {
  const res = http.get(`${API}/public/jobs/${SLUG}`);
  if (res.status !== 200) {
    fail(
      `Target job not found / not published: GET ${API}/public/jobs/${SLUG} -> ${res.status}. ` +
        `Pass -e SLUG=<a published job slug>.`,
    );
  }
}
