import http from 'k6/http';
import { check, sleep } from 'k6';

// Specifically test agent endpoints under load
export const options = {
  vus: 5,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<15000'], // Agents can take up to 15s
    http_req_failed: ['rate<0.10'],     // <10% — agents may fail without API keys
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: 'admin@acme.com',
      password: 'Password123!',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  return { token: res.status === 200 ? JSON.parse(res.body).data?.token : '' };
}

export default function (data) {
  const h = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  // Test agent run listing (read-only, safe)
  const runsRes = http.get(`${BASE_URL}/api/agents/runs?page=1&pageSize=10`, { headers: h });
  check(runsRes, { 'agent runs: ok': (r) => r.status < 500 });

  // Test HITL queue listing
  const hitlRes = http.get(`${BASE_URL}/api/agents/hitl`, { headers: h });
  check(hitlRes, { 'hitl queue: ok': (r) => r.status < 500 });

  sleep(2);
}
