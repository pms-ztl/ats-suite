/**
 * Phase 32e — baseline load test.
 *
 * Smoke tests the 5 most-trafficked endpoints under a realistic mix:
 *   60% list candidates (most common dashboard action)
 *   20% open a requisition
 *   10% load /auth/me (every page does this)
 *   5%  list interviews
 *   5%  bulk-search candidates
 *
 * Targets (see LOAD_TESTING.md for context):
 *   p95 < 800ms
 *   p99 < 2000ms
 *   error rate < 1%
 *
 * Usage:
 *   k6 run --vus 50 --duration 5m load-tests/baseline.js
 *
 * Requires:
 *   - API_BASE env (defaults to localhost:4000/api)
 *   - LOAD_TEST_EMAIL + LOAD_TEST_PASSWORD env (a seeded test tenant)
 *
 * Anti-feature: this DOES NOT replace soak testing, chaos testing, or
 * tenant-isolation testing. It's the "smoke test before deploy" gate.
 */
import http from "k6/http";
import { check, group, sleep, fail } from "k6";
import { Trend, Rate } from "k6/metrics";

// ─── config ──────────────────────────────────────────────────────────────
const API_BASE = __ENV.API_BASE || "http://localhost:4000/api";
const EMAIL    = __ENV.LOAD_TEST_EMAIL    || "loadtest@cdc-ats.local";
const PASSWORD = __ENV.LOAD_TEST_PASSWORD || "LoadTest123!Password";

// Custom metrics for per-endpoint tracking
const candidateListTrend = new Trend("candidate_list_duration", true);
const reqOpenTrend       = new Trend("requisition_open_duration", true);
const meTrend            = new Trend("auth_me_duration", true);
const errorRate          = new Rate("errors");

// Test profile — tuned for "realistic mid-size tenant traffic".
// Override at invocation with --vus / --duration / --stage flags.
export const options = {
  scenarios: {
    baseline: {
      executor: "ramping-vus",
      stages: [
        { duration: "1m", target: 25 },   // warm-up
        { duration: "3m", target: 50 },   // steady-state
        { duration: "1m", target: 0 },    // cool-down
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    // Globals — break the build if violated
    http_req_failed:   ["rate<0.01"],     // <1% errors
    http_req_duration: ["p(95)<800", "p(99)<2000"],
    // Per-endpoint
    "candidate_list_duration":  ["p(95)<800"],
    "requisition_open_duration": ["p(95)<600"],
    "auth_me_duration":          ["p(95)<200"],
  },
};

// ─── setup: log in once per VU and stash the token ───────────────────────
export function setup() {
  const res = http.post(`${API_BASE}/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { "Content-Type": "application/json" } },
  );
  if (res.status !== 200) {
    fail(`Login failed (${res.status}) — set LOAD_TEST_EMAIL/PASSWORD env vars to point at a seeded user`);
  }
  const body = res.json();
  // Login returns { data: { token, refreshToken, ... } } — `token`, not `accessToken`.
  const token = body?.data?.token || body?.data?.accessToken || body?.token;
  if (!token) fail("Login response missing token");
  return { token };
}

// ─── default VU function ─────────────────────────────────────────────────
export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    "Content-Type": "application/json",
  };

  // Weighted dispatch — k6 docs recommend a single function with random
  // dispatch for cleanest VU-level metrics.
  const dice = Math.random();
  if (dice < 0.60)      group("candidate-list",     () => candidateList(headers));
  else if (dice < 0.80) group("requisition-open",   () => requisitionOpen(headers));
  else if (dice < 0.90) group("auth-me",            () => authMe(headers));
  else if (dice < 0.95) group("interview-list",     () => interviewList(headers));
  else                  group("candidate-search",   () => candidateSearch(headers));

  // Real users don't pound the API — small pause keeps the load realistic.
  sleep(Math.random() * 2 + 0.5);
}

// ─── individual flows ────────────────────────────────────────────────────
function candidateList(headers) {
  const res = http.get(`${API_BASE}/candidates?page=1&limit=25`, { headers });
  candidateListTrend.add(res.timings.duration);
  check(res, { "candidate-list 200": (r) => r.status === 200 }) || errorRate.add(1);
}

function requisitionOpen(headers) {
  // List → pick the first → open it. Mirrors the actual user flow.
  const list = http.get(`${API_BASE}/requisitions?status=OPEN&limit=10`, { headers });
  if (list.status !== 200) { errorRate.add(1); return; }
  const items = (list.json()?.data?.data || list.json()?.data || []);
  if (items.length === 0) return;
  const id = items[0].id;
  const detail = http.get(`${API_BASE}/requisitions/${id}`, { headers });
  reqOpenTrend.add(detail.timings.duration);
  check(detail, { "requisition-open 200": (r) => r.status === 200 }) || errorRate.add(1);
}

function authMe(headers) {
  const res = http.get(`${API_BASE}/auth/me`, { headers });
  meTrend.add(res.timings.duration);
  check(res, { "auth-me 200": (r) => r.status === 200 }) || errorRate.add(1);
}

function interviewList(headers) {
  const res = http.get(`${API_BASE}/interviews?limit=25`, { headers });
  check(res, { "interview-list 200": (r) => r.status === 200 }) || errorRate.add(1);
}

function candidateSearch(headers) {
  const res = http.get(`${API_BASE}/candidates?search=engineer&limit=10`, { headers });
  check(res, { "candidate-search 200": (r) => r.status === 200 }) || errorRate.add(1);
}
