/**
 * Stress profile — pushes concurrency higher than baseline and adds the WRITE
 * path + the new ML vector-match endpoint.
 *
 * Safety: writes and vector-match are OFF by default (they mutate data / incur
 * embedding cost). Enable per dedicated load environment:
 *   WRITE_PATH=1   → exercise candidate creation (tags rows "loadtest")
 *   MATCH_PATH=1   → exercise POST /sourcing/match (needs an embeddings key)
 *
 * Usage:
 *   k6 run --vus 100 --duration 5m \
 *     -e API_BASE=... -e LOAD_TEST_EMAIL=... -e LOAD_TEST_PASSWORD=... \
 *     -e WRITE_PATH=1 -e MATCH_PATH=1 load-tests/stress.js
 *
 * Targets:  p95 < 1200ms under 100 VUs,  error rate < 2%.
 */
import http from "k6/http";
import { check, group, sleep, fail } from "k6";
import { Trend, Rate } from "k6/metrics";

const API_BASE = __ENV.API_BASE || "http://localhost:4000/api";
const EMAIL    = __ENV.LOAD_TEST_EMAIL    || "loadtest@cdc-ats.local";
const PASSWORD = __ENV.LOAD_TEST_PASSWORD || "LoadTest123!Password";
const WRITE_PATH = __ENV.WRITE_PATH === "1";
const MATCH_PATH = __ENV.MATCH_PATH === "1";

const matchTrend = new Trend("vector_match_duration", true);
const createTrend = new Trend("candidate_create_duration", true);
const errorRate = new Rate("errors");

export const options = {
  scenarios: {
    stress: {
      executor: "ramping-vus",
      stages: [
        { duration: "1m", target: 50 },
        { duration: "2m", target: 100 },   // peak
        { duration: "1m", target: 100 },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed:   ["rate<0.02"],
    http_req_duration: ["p(95)<1200", "p(99)<3000"],
    "vector_match_duration":     ["p(95)<1500"],
    "candidate_create_duration": ["p(95)<1500"],
  },
};

export function setup() {
  const res = http.post(`${API_BASE}/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { "Content-Type": "application/json" } },
  );
  if (res.status !== 200) fail(`Login failed (${res.status})`);
  const token = res.json()?.data?.token;
  if (!token) fail("Login response missing token");
  return { token };
}

export default function (data) {
  const headers = { Authorization: `Bearer ${data.token}`, "Content-Type": "application/json" };

  const dice = Math.random();
  if (dice < 0.55) {
    group("read-candidates", () => {
      const r = http.get(`${API_BASE}/candidates?page=1&limit=25`, { headers });
      check(r, { "candidates 200": (x) => x.status === 200 }) || errorRate.add(1);
    });
  } else if (dice < 0.80) {
    group("read-reqs", () => {
      const r = http.get(`${API_BASE}/requisitions?status=OPEN&limit=10`, { headers });
      check(r, { "reqs 200": (x) => x.status === 200 }) || errorRate.add(1);
    });
  } else if (dice < 0.90 && WRITE_PATH) {
    group("write-candidate", () => {
      const uniq = `${__VU}-${__ITER}-${Date.now()}`;
      const r = http.post(`${API_BASE}/candidates`, JSON.stringify({
        firstName: "Load", lastName: `Test ${uniq}`,
        email: `loadtest+${uniq}@example.com`, source: "loadtest", tags: ["loadtest"],
      }), { headers });
      createTrend.add(r.timings.duration);
      check(r, { "create 2xx": (x) => x.status >= 200 && x.status < 300 }) || errorRate.add(1);
    });
  } else if (dice < 0.97 && MATCH_PATH) {
    group("vector-match", () => {
      const r = http.post(`${API_BASE}/sourcing/match`, JSON.stringify({
        text: "senior backend engineer with distributed systems and cloud experience", limit: 25,
      }), { headers });
      matchTrend.add(r.timings.duration);
      // 503 = embeddings off; treat as skip, not error
      check(r, { "match ok/skip": (x) => x.status === 200 || x.status === 503 }) || errorRate.add(1);
    });
  } else {
    group("auth-me", () => {
      const r = http.get(`${API_BASE}/auth/me`, { headers });
      check(r, { "me 200": (x) => x.status === 200 }) || errorRate.add(1);
    });
  }

  sleep(Math.random() * 1.5 + 0.3);
}
